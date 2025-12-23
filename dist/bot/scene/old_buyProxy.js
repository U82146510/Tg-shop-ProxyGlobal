"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerBuyProxyHandler = registerBuyProxyHandler;
const grammy_1 = require("grammy");
const redis_1 = require("../utils/redis");
const cleanup_1 = require("../utils/cleanup");
const Products_1 = require("../../models/Products");
const fetch_1 = require("../fetch");
const User_1 = require("../../models/User");
const Orders_1 = require("../../models/Orders");
const decimal_js_1 = require("decimal.js");
const date_fns_1 = require("date-fns");
const buyProxy_1 = require("../utils/buyProxy");
const mongoose_1 = __importDefault(require("mongoose"));
const Decimal128 = mongoose_1.default.Types.Decimal128;
function registerBuyProxyHandler(bot) {
    bot.callbackQuery('buy_proxy', async (ctx) => {
        try {
            await ctx.answerCallbackQuery();
        }
        catch (error) {
            if (error?.response?.description?.includes("query is too old")) {
                console.log("⚠️ Callback query already answered, skipping...");
            }
            else {
                throw error;
            }
        }
        const telegramId = ctx.from?.id;
        if (!telegramId) {
            return;
        }
        await (0, cleanup_1.deleteCachedMessages)(ctx, `start_menu_${telegramId}`);
        await (0, cleanup_1.deleteCachedMessages)(ctx, `isp_${telegramId}`);
        await (0, cleanup_1.deleteCachedMessages)(ctx, `back_${telegramId}`);
        try {
            const keyboard = new grammy_1.InlineKeyboard();
            const product = await Products_1.Product.find();
            if (product.length === 0) {
                const redisKey = `no_products${telegramId}`;
                const msg = await ctx.reply('There are not products added yet', {
                    reply_markup: keyboard.text('Back', 'back_to_menu').row()
                });
                await redis_1.redis.pushList(redisKey, [String(msg.message_id)]);
                return;
            }
            const countries = new Set();
            for (const arg of product) {
                countries.add(arg.country);
            }
            for (const arg of countries) {
                keyboard.text(`${arg}`, `country_${arg}`).row();
            }
            keyboard.text('Back', 'back_to_menu').row();
            const redisKey = `buy_proxy${telegramId}`;
            const msg = await ctx.reply('Choose country:', { reply_markup: keyboard });
            await redis_1.redis.pushList(redisKey, [String(msg.message_id)]);
        }
        catch (error) {
            console.error(error);
        }
    });
    bot.callbackQuery(/^country_(.+)/, async (ctx) => {
        try {
            await ctx.answerCallbackQuery();
        }
        catch (error) {
            if (error?.response?.description?.includes("query is too old")) {
                console.log("⚠️ Callback query already answered, skipping...");
            }
            else {
                throw error;
            }
        }
        const telegramId = ctx.from?.id;
        if (!telegramId) {
            return;
        }
        await (0, cleanup_1.deleteCachedMessages)(ctx, `buy_proxy${telegramId}`);
        await (0, cleanup_1.deleteCachedMessages)(ctx, `operator_${telegramId}`);
        const [_, countryName] = ctx.match ?? [];
        if (!countryName) {
            return;
        }
        try {
            const product = await Products_1.Product.find({ country: countryName });
            let authorization = new Set();
            for (const arg of product) {
                authorization.add(arg.apikey);
            }
            const isps = [];
            for (const arg of authorization) {
                console.log(arg);
                const getProxyPerSeller = await (0, fetch_1.getProxy)(arg);
                if (!getProxyPerSeller) {
                    return;
                }
                isps.push(...getProxyPerSeller);
            }
            if (isps.length === 0) {
                return;
            }
            const keyboard = new grammy_1.InlineKeyboard();
            await redis_1.redis.set('availableProxy', JSON.stringify(isps));
            const countTotalIsp = new Map();
            for (const isp of isps) {
                const total = countTotalIsp.get(isp.operator) || 0;
                countTotalIsp.set(isp.operator, total + 1);
            }
            for (const isp of countTotalIsp) {
                keyboard.text(`${isp[0]}(${isp[1]})`, `operator_${countryName}_${isp[0]}`).row();
            }
            keyboard.text('Back', 'buy_proxy').row();
            keyboard.text('Main Menu', 'back_to_menu').row();
            const redisKey = `isp_${telegramId}`;
            const msg = await ctx.reply(`Available operators:`, {
                reply_markup: keyboard
            });
            redis_1.redis.pushList(redisKey, [String(msg.message_id)]);
        }
        catch (error) {
            console.log(error);
        }
    });
    bot.callbackQuery(/operator_(.+)_(.+)/, async (ctx) => {
        try {
            await ctx.answerCallbackQuery();
        }
        catch (error) {
            if (error?.response?.description?.includes("query is too old")) {
                console.log("⚠️ Callback query already answered, skipping...");
            }
            else {
                throw error;
            }
        }
        const telegramId = ctx.from?.id;
        if (!telegramId) {
            return;
        }
        const [_, countryName, ispName] = ctx.match ?? [];
        try {
            await (0, cleanup_1.deleteCachedMessages)(ctx, `isp_${telegramId}`);
            await (0, cleanup_1.deleteCachedMessages)(ctx, `period_${telegramId}`);
            const isps = await redis_1.redis.get('availableProxy');
            if (!isps) {
                return;
            }
            const arrayofISP = JSON.parse(isps);
            const selectedIsp = arrayofISP.find(value => value.operator.toLowerCase() === ispName.toLocaleLowerCase());
            if (!selectedIsp)
                return;
            const eid = selectedIsp.eid;
            const keyboard = new grammy_1.InlineKeyboard();
            console.log(countryName, ispName, eid);
            keyboard.text('1 day', `period_${countryName}_${ispName}_${eid}_1`).row();
            keyboard.text('7 days', `period_${countryName}_${ispName}_${eid}_7`).row();
            keyboard.text('14 days', `period_${countryName}_${ispName}_${eid}_14`).row();
            keyboard.text('30 days', `period_${countryName}_${ispName}_${eid}_30`).row();
            keyboard.text('Back', `country_${countryName}`).row();
            keyboard.text('Main Menu', 'back_to_menu').row();
            const redisKey = `operator_${telegramId}`;
            const msg = await ctx.reply(`Select rent period:`, {
                reply_markup: keyboard
            });
            await redis_1.redis.pushList(redisKey, [String(msg.message_id)]);
        }
        catch (error) {
            console.error(error);
        }
    });
    bot.callbackQuery(/period_(.+)_(.+)_(.+)_(.+)/, async (ctx) => {
        try {
            await ctx.answerCallbackQuery();
        }
        catch (error) {
            if (error?.response?.description?.includes("query is too old")) {
                console.log("⚠️ Callback query already answered, skipping...");
            }
            else {
                throw error;
            }
        }
        const telegramId = ctx.from?.id;
        if (!telegramId)
            return;
        const [_, countryName, ispName, eid, period] = ctx.match ?? [];
        try {
            await (0, cleanup_1.deleteCachedMessages)(ctx, `operator_${telegramId}`);
            const findProduct = await Products_1.Product.findOne({ isp: ispName.toLowerCase(), period: period });
            if (!findProduct) {
                await ctx.reply('Product wasnt found');
                return;
            }
            const keyboard = new grammy_1.InlineKeyboard()
                .text('🧾 Checkout', `checkout_${eid}_${period}_${ispName}`).row()
                .text('🔙 Back', `operator_${countryName}_${ispName}`)
                .text('🏠 Main Menu', 'back_to_menu').row();
            const messageText = [
                `🛒 <b>Order Summary</b>`,
                ``,
                `🌍 <b>Country:</b> ${findProduct.country}`,
                `🏢 <b>Operator:</b> ${findProduct.isp}`,
                `🆔 <b>EID:</b> <code>${eid}</code>`,
                `⏳ <b>Period:</b> ${findProduct.period} day(s)`,
                `💰 <b>Price:</b> $${findProduct.price}`,
                ``,
                `💳 Choose an action below:`
            ].join('\n');
            const msg = await ctx.reply(messageText, {
                reply_markup: keyboard,
                parse_mode: 'HTML'
            });
            const redisKey = `period_${telegramId}`;
            await redis_1.redis.pushList(redisKey, [String(msg.message_id)]);
        }
        catch (error) {
            console.log(error);
        }
    });
    bot.callbackQuery(/checkout_(.+)_(.+)_(.+)/, async (ctx) => {
        try {
            await ctx.answerCallbackQuery();
        }
        catch (error) {
            if (error?.response?.description?.includes("query is too old")) {
                console.log("⚠️ Callback query already answered, skipping...");
            }
            else {
                throw error;
            }
        }
        const telegramId = ctx.from?.id;
        const [_, eid, period, ispName] = ctx.match ?? [];
        if (!telegramId) {
            return;
        }
        try {
            await (0, cleanup_1.deleteCachedMessages)(ctx, `period_${telegramId}`);
            const product = await Products_1.Product.findOne({ isp: ispName.toLowerCase(), period: period });
            if (!product) {
                return;
            }
            const user = await User_1.User.findOne({ userId: telegramId });
            if (!user) {
                return;
            }
            const periodDays = parseInt(period, 10);
            if (isNaN(periodDays) || periodDays <= 0) {
                throw new Error('Invalid period value');
            }
            const expireAt = (0, date_fns_1.addDays)(new Date(), periodDays);
            const productPrice = new decimal_js_1.Decimal(product.price);
            const userBalance = new decimal_js_1.Decimal(user.balance.toString());
            if (userBalance.lessThan(productPrice)) {
                const keyboard = new grammy_1.InlineKeyboard().text('🏠 Main Menu', 'back_to_menu').row();
                const redisKey = `inssuficent_balance_${telegramId}`;
                const msg = await ctx.reply("🚫 Insufficient balance.", {
                    reply_markup: keyboard
                });
                await redis_1.redis.pushList(redisKey, [String(msg.message_id)]);
                return;
            }
            const total = userBalance.minus(productPrice);
            await User_1.User.findOneAndUpdate({ userId: telegramId }, {
                $set: {
                    balance: Decimal128.fromString(total.toString())
                }
            });
            const comment = telegramId;
            const expireProxy = (0, date_fns_1.format)(expireAt, 'yyyy-MM-dd HH:mm:ss');
            console.log(eid,comment,expireProxy)
            const proxyLoginDetails = await (0, buyProxy_1.fetchProxy)(eid, comment, expireProxy,product.apikey);
            console.log(proxyLoginDetails)
            const apiKeyForOrders = product.apikey.toString(); 
            const addOrder = await Orders_1.Order.create({
                userId: telegramId,
                country: product.country,
                isp: ispName.toLowerCase(),
                price: productPrice,
                period: period,
                eid: proxyLoginDetails?.eid,
                proxy_id: proxyLoginDetails?.proxy_id,
                proxy_independent_http_hostname: proxyLoginDetails?.proxy_independent_http_hostname,
                proxy_independent_socks5_hostname: proxyLoginDetails?.proxy_independent_socks5_hostname,
                proxy_independent_port: proxyLoginDetails?.proxy_independent_port,
                proxy_http_port: proxyLoginDetails?.proxy_http_port,
                proxy_socks5_port: proxyLoginDetails?.proxy_socks5_port,
                proxy_hostname: proxyLoginDetails?.proxy_hostname,
                proxy_change_ip_url: proxyLoginDetails?.proxy_change_ip_url,
                user: proxyLoginDetails?.proxy_login,
                pass: proxyLoginDetails?.proxy_pass,
                expireAt: proxyLoginDetails?.proxy_exp,
	        apikey:apiKeyForOrders,
            });
            user.orders.push(addOrder._id);
            await user.save();
            const keyboard = new grammy_1.InlineKeyboard().text('🏠 Main Menu', 'back_to_menu').row();
            const redisKey = `balance_added${telegramId}`;
            const msg = await ctx.reply(`✅ Order placed successfully.\nNew balance: ${total.toFixed(2)} USDT`, {
                reply_markup: keyboard
            });
            await redis_1.redis.pushList(redisKey, [String(msg.message_id)]);
        }
        catch (error) {
            console.error(error);
            await ctx.reply("❌ Something went wrong during checkout.");
        }
    });
}
;
