"use strict";

const { InlineKeyboard } = require("grammy");
const { redis } = require("../utils/redis");
const { deleteCachedMessages } = require("../utils/cleanup");
const { Product } = require("../../models/Products");
const { getProxy } = require("../fetch");
const { User } = require("../../models/User");
const { Order } = require("../../models/Orders");
const Decimal = require("decimal.js");
const { addDays, format } = require("date-fns");
const { fetchProxy } = require("../utils/buyProxy");
const {orderHistory} = require("../../models/orderHistory");
const mongoose = require("mongoose");

const Decimal128 = mongoose.Types.Decimal128;

function registerBuyProxyHandler(bot) {

    bot.callbackQuery("buy_proxy", async (ctx) => {
        try {
            await ctx.answerCallbackQuery();
        } catch (error) {
            if (error?.response?.description?.includes("query is too old")) {
                console.log("Callback query already answered");
            } else {
                throw error;
            }
        }

        const telegramId = ctx.from?.id;
        if (!telegramId) return;

        await deleteCachedMessages(ctx, `start_menu_${telegramId}`);
        await deleteCachedMessages(ctx, `isp_${telegramId}`);
        await deleteCachedMessages(ctx, `back_${telegramId}`);

        try {
            const keyboard = new InlineKeyboard();
            const products = await Product.find();

            if (products.length === 0) {
                const msg = await ctx.reply("There are no products added yet", {
                    reply_markup: keyboard.text("Back", "back_to_menu").row()
                });
                await redis.pushList(`no_products${telegramId}`, [String(msg.message_id)]);
                return;
            }

            const countries = new Set(products.map(p => p.country));
            for (const country of countries) {
                keyboard.text(country, `country_${country}`).row();
            }

            keyboard.text("Back", "back_to_menu").row();

            const msg = await ctx.reply("Choose country:", { reply_markup: keyboard });
            await redis.pushList(`buy_proxy${telegramId}`, [String(msg.message_id)]);

        } catch (error) {
            console.error(error);
        }
    });

    bot.callbackQuery(/^country_(.+)/, async (ctx) => {
        try {
            await ctx.answerCallbackQuery();
        } catch (error) {
            if (!error?.response?.description?.includes("query is too old")) {
                throw error;
            }
        }

        const telegramId = ctx.from?.id;
        if (!telegramId) return;

        await deleteCachedMessages(ctx, `buy_proxy${telegramId}`);
        await deleteCachedMessages(ctx, `operator_${telegramId}`);

        const [, countryName] = ctx.match || [];
        if (!countryName) return;

        try {
            const products = await Product.find({ country: countryName });
            const apiKeys = new Set(products.map(p => p.apikey));

            let isps = [];
            for (const key of apiKeys) {
                const proxies = await getProxy(key);
                if (proxies) isps.push(...proxies);
            }

            if (!isps.length) return;

            await redis.set("availableProxy", JSON.stringify(isps));

            const ispCount = new Map();
            for (const isp of isps) {
                ispCount.set(isp.operator, (ispCount.get(isp.operator) || 0) + 1);
            }

            const keyboard = new InlineKeyboard();
            for (const [name, count] of ispCount) {
                keyboard.text(`${name} (${count})`, `operator_${countryName}_${name}`).row();
            }

            keyboard.text("Back", "buy_proxy").row();
            keyboard.text("Main Menu", "back_to_menu").row();

            const msg = await ctx.reply("Available operators:", { reply_markup: keyboard });
            await redis.pushList(`isp_${telegramId}`, [String(msg.message_id)]);

        } catch (error) {
            console.error(error);
        }
    });

    bot.callbackQuery(/operator_(.+)_(.+)/, async (ctx) => {
        try {
            await ctx.answerCallbackQuery();
        } catch {}

        const telegramId = ctx.from?.id;
        if (!telegramId) return;

        const [, countryName, ispName] = ctx.match || [];

        await deleteCachedMessages(ctx, `isp_${telegramId}`);
        await deleteCachedMessages(ctx, `period_${telegramId}`);

        const isps = JSON.parse(await redis.get("availableProxy") || "[]");
        const selected = isps.find(i => i.operator.toLowerCase() === ispName.toLowerCase());
        if (!selected) return;

        const eid = selected.eid;
        const keyboard = new InlineKeyboard()
            .text("1 day", `period_${countryName}_${ispName}_${eid}_1`).row()
            .text("7 days", `period_${countryName}_${ispName}_${eid}_7`).row()
            .text("14 days", `period_${countryName}_${ispName}_${eid}_14`).row()
            .text("30 days", `period_${countryName}_${ispName}_${eid}_30`).row()
            .text("Back", `country_${countryName}`).row()
            .text("Main Menu", "back_to_menu").row();

        const msg = await ctx.reply("Select rent period:", { reply_markup: keyboard });
        await redis.pushList(`operator_${telegramId}`, [String(msg.message_id)]);
    });

    bot.callbackQuery(/period_(.+)_(.+)_(.+)_(.+)/, async (ctx) => {
        try {
            await ctx.answerCallbackQuery();
        } catch {}

        const telegramId = ctx.from?.id;
        if (!telegramId) return;

        const [, country, isp, eid, period] = ctx.match || [];

        await deleteCachedMessages(ctx, `operator_${telegramId}`);

        const product = await Product.findOne({ isp: isp.toLowerCase(), period });
        if (!product) return ctx.reply("Product not found");

        const keyboard = new InlineKeyboard()
            .text("Checkout", `checkout_${eid}_${period}_${isp}`).row()
            .text("Back", `operator_${country}_${isp}`)
            .text("Main Menu", "back_to_menu").row();

        const msg = await ctx.reply(
            `Order summary\nCountry: ${product.country}\nOperator: ${product.isp}\nPeriod: ${product.period} day(s)\nPrice: $${product.price}`,
            { reply_markup: keyboard }
        );

        await redis.pushList(`period_${telegramId}`, [String(msg.message_id)]);
    });

    bot.callbackQuery(/checkout_(.+)_(.+)_(.+)/, async (ctx) => {
        try {
            await ctx.answerCallbackQuery();
        } catch {}

        const telegramId = ctx.from?.id;
        if (!telegramId) return;

        const [, eid, period, isp] = ctx.match || [];

        await deleteCachedMessages(ctx, `period_${telegramId}`);

        const product = await Product.findOne({ isp: isp.toLowerCase(), period });
        const user = await User.findOne({ userId: telegramId });
        if (!product || !user) return;

        const price = new Decimal(product.price);
        const balance = new Decimal(user.balance.toString());

        if (balance.lessThan(price)) {
            return ctx.reply("Insufficient balance");
        }

        const newBalance = balance.minus(price);
        user.balance = Decimal128.fromString(newBalance.toString());

        const expireAt = addDays(new Date(), parseInt(period));
        const proxy = await fetchProxy(
            eid,
            telegramId,
            format(expireAt, "yyyy-MM-dd HH:mm:ss"),
            product.apikey
        );

        console.log(proxy);

        const order = await Order.create({
            userId: telegramId,
            country: product.country,
            isp: isp.toLowerCase(),
            price,
            period,
            eid: proxy.eid,
            proxy_id: proxy.proxy_id,
            proxy_independent_http_hostname: proxy.proxy_independent_http_hostname,
            proxy_independent_socks5_hostname: proxy.proxy_independent_socks5_hostname,
            proxy_independent_port: proxy.proxy_independent_port,
            proxy_http_port: proxy.proxy_http_port,
            proxy_socks5_port: proxy.proxy_socks5_port,
            proxy_hostname: proxy.proxy_hostname,
            proxy_change_ip_url: proxy.proxy_change_ip_url,
            user: proxy.proxy_login,                 // required
            pass: proxy.proxy_pass,                 // required
            expireAt: new Date(proxy.proxy_exp),
            apikey: product.apikey
        });

        const orderHistoryEntry = await orderHistory.create({
            userId: telegramId,
            country: product.country,  
            isp: isp.toLowerCase(),
            price,
            period,
            eid: proxy.eid,
            proxy_id: proxy.proxy_id,
            proxy_independent_http_hostname: proxy.proxy_independent_http_hostname,
            proxy_independent_socks5_hostname: proxy.proxy_independent_socks5_hostname,
            proxy_independent_port: proxy.proxy_independent_port,
            proxy_http_port: proxy.proxy_http_port,
            proxy_socks5_port: proxy.proxy_socks5_port,
            proxy_hostname: proxy.proxy_hostname,
            proxy_change_ip_url: proxy.proxy_change_ip_url,
            user: proxy.proxy_login,                 // required
            pass: proxy.proxy_pass,                 // required
            expireAt: new Date(proxy.proxy_exp),
            apikey: product.apikey
        });

        user.orders.push(order._id);
 
        await user.save();
        await orderHistoryEntry.save();

        await ctx.reply(`Order placed successfully\nNew balance: ${newBalance.toFixed(2)} USDT`);
    });
}

module.exports = { registerBuyProxyHandler };
