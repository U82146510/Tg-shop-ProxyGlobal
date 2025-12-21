"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.helpMenu = helpMenu;
const grammy_1 = require("grammy");
const redis_1 = require("../utils/redis");
const cleanup_1 = require("../utils/cleanup");
function helpMenu(bot) {
    bot.callbackQuery('my_help', async (ctx) => {
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
            const msgRU = `⚠️ Политика возврата
При покупке прокси на месяц возврат средств осуществляется по формуле:
1$ (фиксированная комиссия) + стоимость использованных дней.

⚠️ *Важно!*
Если вы сгенерировали транзакцию, но не произвели оплату, система будет считать последнюю созданную транзакцию актуальной.
Перед оплатой убедитесь, что используете актуальные реквизиты.

Если возникли вопросы — обращайтесь в поддержку: @GlobalProxy\\_support`;
            const msgEN = `⚠️ Refund Policy
When purchasing a monthly proxy, refunds are calculated using the formula:
\$1 (fixed fee) + cost of used days.

⚠️ *Important!*
If you generate a transaction but do not complete the payment, the system will treat the last created transaction as the valid one.
Make sure to use the most recent payment details when sending funds.

For help, contact support: @GlobalProxy\\_support`;
            const displayMsg = languageCode === 'ru' ? msgRU : msgEN;
            const msg = await ctx.reply(displayMsg, {
                reply_markup: keyboard,
                parse_mode: 'Markdown'
            });
            await redis_1.redis.pushList(`help_menu${telegramId}`, [String(msg.message_id)]);
        }
        catch (error) {
            console.error(error);
        }
    });
}
;
