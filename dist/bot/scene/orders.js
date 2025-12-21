"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderHandler = orderHandler;
const grammy_1 = require("grammy");
const redis_1 = require("../utils/redis");
const cleanup_1 = require("../utils/cleanup");
const Orders_1 = require("../../models/Orders");
const date_fns_1 = require("date-fns");
const User_1 = require("../../models/User");
const Products_1 = require("../../models/Products");
const decimal_js_1 = require("decimal.js");
const extendProxy_1 = require("../utils/extendProxy");
const mongoose_1 = __importDefault(require("mongoose"));
const Decimal128 = mongoose_1.default.Types.Decimal128;
function orderHandler(bot) {
    bot.callbackQuery('my_orders', async (ctx) => {
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
        try {
            await (0, cleanup_1.deleteCachedMessages)(ctx, `start_menu_${telegramId}`);
            await (0, cleanup_1.deleteCachedMessages)(ctx, `back_${telegramId}`);
            await (0, cleanup_1.deleteCachedMessages)(ctx, `extend_${telegramId}`);
            await (0, cleanup_1.deleteCachedMessages)(ctx, `order_deleted_already${telegramId}`);
            await (0, cleanup_1.deleteCachedMessages)(ctx, `order_extended_success_${telegramId}`);
            const orders = await Orders_1.Order.find({ userId: telegramId });
            if (orders.length === 0) {
                const keyboard = new grammy_1.InlineKeyboard().text('🏠 Main Menu', 'back_to_menu').row();
                const redisKey = `no_orders${telegramId}`;
                const msg = await ctx.reply("📭 You don't have any orders yet.", {
                    reply_markup: keyboard
                });
                await redis_1.redis.pushList(redisKey, [String(msg.message_id)]);
                return;
            }
            const redisKey = `order_list${telegramId}`;
            for (const [index, order] of orders.entries()) {
                const msgText = `📦 <b>Order #${index + 1}</b>\n\n` +
                    `🌍 Country: <b>${order.country}</b>\n` +
                    `📡 ISP: <b>${order.isp}</b>\n` +
                    `🗓️ Expires on: <b>${order.expireAt}</b>\n` +
                    `💰 Price: <b>$${order.price}</b>\n` +
                    `🆔 EID: <code>${order.eid}</code>\n\n` +
                    `🔐 <b>Credentials</b>\n` +
                    `👤 User: <code>${order.user}</code>\n` +
                    `🔑 Pass: <code>${order.pass}</code>\n\n` +
                    `🌐 <b>Proxy Hostnames</b>\n` +
                    `HTTP: <code>${order.proxy_independent_http_hostname}</code>\n` +
                    `SOCKS5: <code>${order.proxy_independent_socks5_hostname}</code>\n\n` +
                    `📦 <b>Ports</b>\n` +
                    `HTTP Port: <code>${order.proxy_independent_port}</code>\n` +
                    `SOCKS5 Port: <code>${order.proxy_independent_port}</code>\n\n` +
                    `🔄 Change IP URL: <code>${order.proxy_change_ip_url}</code>\n\n` +
                    `🔗 <b>Direct Connection</b>\n` +
                    `📶 HTTP: <code>${order.proxy_hostname}:${order.proxy_http_port}</code>\n` +
                    `🧦 SOCKS5: <code>${order.proxy_hostname}:${order.proxy_socks5_port}</code>\n\n`;
                const keyboard = new grammy_1.InlineKeyboard()
                    .text("⏳ Extend", `extend_order_${order._id}`)
                    .row();
                const msg = await ctx.reply(msgText, {
                    parse_mode: "HTML",
                    reply_markup: keyboard,
                });
                await redis_1.redis.pushList(redisKey, [String(msg.message_id)]);
            }
            const keyboard = new grammy_1.InlineKeyboard().text('🏠 Main Menu', 'back_to_menu').row();
            const menuMsg = await ctx.reply('⬅️ Return to main menu', { reply_markup: keyboard });
            await redis_1.redis.pushList(`order_menu_back_${telegramId}`, [String(menuMsg.message_id)]);
        }
        catch (error) {
            console.error("❌ Failed to fetch orders:", error);
            await ctx.reply("⚠️ Failed to fetch your orders. Please try again later.");
        }
    });
    bot.callbackQuery(/extend_order_(.+)/, async (ctx) => {
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
        const [_, orderId] = ctx.match ?? [];
        try {
            await (0, cleanup_1.deleteCachedMessages)(ctx, `order_list${telegramId}`);
            await (0, cleanup_1.deleteCachedMessages)(ctx, `order_menu_back_${telegramId}`);
            const keyboard = new grammy_1.InlineKeyboard();
            keyboard.text('1 day', `period_${orderId}_1`).row();
            keyboard.text('7 days', `period_${orderId}_7`).row();
            keyboard.text('14 days', `period_${orderId}_14`).row();
            keyboard.text('30 days', `period_${orderId}_30`).row();
            keyboard.text('Back', `my_orders`).row();
            keyboard.text('Main Menu', 'back_to_menu').row();
            const redisKey = `extend_${telegramId}`;
            const msg = await ctx.reply(`Choose period:`, {
                reply_markup: keyboard
            });
            await redis_1.redis.pushList(redisKey, [String(msg.message_id)]);
        }
        catch (error) {
            console.error(error);
        }
    });
    bot.callbackQuery(/period_(.+)_(.+)/, async (ctx) => {
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
        const [_, orderId, period] = ctx.match ?? [];
        try {
            await (0, cleanup_1.deleteCachedMessages)(ctx, `extend_${telegramId}`);
            const order = await Orders_1.Order.findById(orderId);
            if (!order) {
                const keyboard = new grammy_1.InlineKeyboard().text('Back', `my_orders`).row();
                const redisKey = `order_deleted_already${telegramId}`;
                const msg = await ctx.reply('Order does not exist', {
                    reply_markup: keyboard
                });
                await redis_1.redis.pushList(redisKey, [String(msg.message_id)]);
                return;
            }
            const currentDate = order.expireAt ?? new Date();
            const addedDays = parseInt(period, 10);
            if (isNaN(addedDays)) {
                await ctx.reply('Invalid period format.');
                return;
            }
            const newExpireAt = (0, date_fns_1.addDays)(currentDate, addedDays);
            const formattedDate = (0, date_fns_1.format)(newExpireAt, 'yyyy-MM-dd HH:mm:ss');
            const product = await Products_1.Product.findOne({ period: period, isp: order.isp });
            if (!product) {
                await ctx.reply('No matching product found.');
                return;
            }
            const user = await User_1.User.findOne({ userId: telegramId });
            if (!user) {
                await ctx.reply('No such user');
                return;
            }
            const productPrice = new decimal_js_1.Decimal(product.price);
            const userBalance = new decimal_js_1.Decimal(user.balance.toString());
            if (userBalance.lessThan(productPrice)) {
                const keyboard = new grammy_1.InlineKeyboard().text('🏠 Main Menu', 'back_to_menu').row();
                const redisKey = `insufficient_balance_when_extending${telegramId}`;
                const msg = await ctx.reply("🚫 Insufficient balance.", {
                    reply_markup: keyboard
                });
                await redis_1.redis.pushList(redisKey, [String(msg.message_id)]);
                return;
            }
            const total = userBalance.minus(productPrice);
            user.balance = Decimal128.fromString(total.toString());
            order.expireAt = newExpireAt;
            await (0, extendProxy_1.extendProxy)(formattedDate, order.proxy_id);
            await user.save();
            await order.save();
            const keyboard = new grammy_1.InlineKeyboard().text('📦 My Orders', 'my_orders').row();
            keyboard.text('🏠 Main Menu', 'back_to_menu').row();
            const msg = await ctx.reply(`✅ Order extended by ${addedDays} day(s).\n🕒 New expiration: ${formattedDate.toLocaleString()}`, {
                reply_markup: keyboard
            });
            const redisKey = `order_extended_success_${telegramId}`;
            await redis_1.redis.pushList(redisKey, [String(msg.message_id)]);
        }
        catch (error) {
            console.log(error);
        }
    });
}
;
