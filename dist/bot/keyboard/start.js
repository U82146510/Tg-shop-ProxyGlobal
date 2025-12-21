"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerMainMenu = registerMainMenu;
exports.mainMenu = mainMenu;
const grammy_1 = require("grammy");
const redis_1 = require("../utils/redis");
const User_1 = require("../../models/User");
function registerMainMenu(bot) {
    bot.command("start", async (ctx) => {
        const telegramId = ctx.from?.id;
        const firstName = ctx.from?.first_name ?? 'Anonymous';
        if (!telegramId)
            return;
        const languageCode = ctx.from?.language_code ?? 'unknown';
        const msgRU = `Добро пожаловать в GlobalProxyShop!
Наш сервис предлагает одни из самых доступных 4G мобильных прокси и гибкие тарифы под любые задачи.
⚠️ Мы не предоставляем прокси под чёрные цели!
Вы несёте полную ответственность за использование сервиса и свои действия.`;
        const msgEN = `Welcome to GlobalProxyShop!
We offer some of the most affordable 4G mobile proxies and flexible pricing plans for any need.
⚠️ We do not provide proxies for illegal or black-hat purposes!
You are fully responsible for how you use this service.`;
        const displayMSG = languageCode === 'ru' ? msgRU : msgEN;
        const checkIfUserExists = await User_1.User.findOne({ userId: telegramId });
        if (!checkIfUserExists) {
            await User_1.User.create({ userId: telegramId });
        }
        const redisKey = `start_menu_${telegramId}`;
        const msg = await ctx.reply(`Welcome ${firstName} (${languageCode})\n\n${displayMSG}`, {
            reply_markup: mainMenu()
        });
        await redis_1.redis.pushList(redisKey, [String(msg.message_id)]);
    });
}
function mainMenu() {
    return new grammy_1.InlineKeyboard()
        .text('👉 Buy Proxy', 'buy_proxy').row()
        .text('💰 My Balance', 'my_balance')
        .text('🛒 Orders', 'my_orders').row()
        .text('🗣️ About', 'about')
        .text('👤 My ID', 'myinfo').row()
        .url('☎️ Contact Us', 'https://t.me/GlobalProxy_support')
        .text('🆘 Help', 'my_help').row();
}
