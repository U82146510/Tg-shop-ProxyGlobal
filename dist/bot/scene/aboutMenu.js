"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAboutMenu = registerAboutMenu;
const grammy_1 = require("grammy");
const redis_1 = require("../utils/redis");
const cleanup_1 = require("../utils/cleanup");
function registerAboutMenu(bot) {
    bot.callbackQuery('about', async (ctx) => {
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
        try {
            await (0, cleanup_1.deleteCachedMessages)(ctx, `back_${telegramId}`);
            await (0, cleanup_1.deleteCachedMessages)(ctx, `start_menu_${telegramId}`);
            const keyboard = new grammy_1.InlineKeyboard().text('🏠 Main Menu', 'back_to_menu').row();
            const languageCode = ctx.from?.language_code ?? 'unknown';
            const aboutRU = `Добро пожаловать в @GlobalProxy__bot!
Мы подберём идеальный тариф под ваши задачи. Более 5 лет в сфере мобильных 4G-прокси. Проконсультируем по всем вопросам — @GlobalProxy_support`;
            const aboutEN = `Welcome to @GlobalProxy__bot!
We'll help you find the perfect plan for your needs. Over 5 years in the mobile 4G proxy industry. Contact support for a free consultation — @GlobalProxy_support`;
            const displayText = languageCode === 'ru' ? aboutRU : aboutEN;
            const msg = await ctx.reply(displayText, {
                reply_markup: keyboard
            });
            await redis_1.redis.pushList(`about_${telegramId}`, [String(msg.message_id)]);
        }
        catch (error) {
            console.error(error);
        }
    });
}
