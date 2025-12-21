"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.myInfoMenu = myInfoMenu;
const grammy_1 = require("grammy");
const redis_1 = require("../utils/redis");
const cleanup_1 = require("../utils/cleanup");
function myInfoMenu(bot) {
    bot.callbackQuery('myinfo', async (ctx) => {
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
        await (0, cleanup_1.deleteCachedMessages)(ctx, `start_menu_${telegramId}`);
        await (0, cleanup_1.deleteCachedMessages)(ctx, `back_${telegramId}`);
        function escapeMarkdownV2(text) {
            return text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');
        }
        const keyboard = new grammy_1.InlineKeyboard()
            .text('🏠 Main Menu', 'back_to_menu')
            .row();
        const languageCode = ctx.from?.language_code ?? 'unknown';
        const msgEN = `*ℹ️ My Information*\n\n*🆔 ID:* \`${telegramId}\`\n\n💬 For help, contact support: @GlobalProxy_support`;
        const msgRU = `*ℹ️ Моя информация*\n\n*🆔 ID:* \`${telegramId}\`\n\n💬 Если возникли вопросы — обращайтесь в поддержку: @GlobalProxy_support`;
        const displayMSG = escapeMarkdownV2(languageCode === 'ru' ? msgRU : msgEN);
        const redisKey = `myinfomenu${telegramId}`;
        const msg = await ctx.reply(displayMSG, {
            reply_markup: keyboard,
            parse_mode: 'MarkdownV2'
        });
        await redis_1.redis.pushList(redisKey, [String(msg.message_id)]);
    });
}
;
