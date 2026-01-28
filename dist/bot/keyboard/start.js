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
        const msgEN = `Welcome to \nGlobalProxyStore🌐\n\nWe offer some of the most affordable 4G mobile proxies and flexible pricing plans for any need.\n\n🆘 Need help? \n24/7 @GlobalProxy_support\n\n⚠️ DISCLAIMER \nBy using this service, you agree that you are fully responsible for how the proxies are used.\nGlobal Proxy Store - is not responsible for any activity performed through this service.\n\n👇Choose an option below to continue`;
        const msgRU = `Добро пожаловать в \nGlobalProxyStore🌐\n\nМы предлагаем одни из самых доступных 4G мобильных прокси и гибкие тарифные планы для любых задач.\n\n🆘 Нужна помощь? \n24/7 @GlobalProxy_support\n\n⚠️ ОТКАЗ ОТ ОТВЕТСТВЕННОСТИ \nИспользуя этот сервис, вы соглашаетесь с тем, что полностью отвечаете за то, как используются прокси.\nGlobal Proxy Store не несёт ответственности за любые действия, совершённые через этот сервис.\n\n👇Выберите опцию ниже, чтобы продолжить`;
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
        .text('🆘 Help', 'my_help').row()
        .text('📝 Review', 'myreview').row();
}
