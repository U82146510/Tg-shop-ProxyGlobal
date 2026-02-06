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
            const msgRU = `⚠️ Политика возврата средств

Мы стараемся быть максимально гибкими и прозрачными в вопросе возвратов 🤝

Если прокси приобретены на 1 месяц, возврат рассчитывается по простой формуле:

💰 1$ (фиксированная комиссия) + стоимость использованных дней

То есть вы оплачиваете только фактически использованный период + комиссию за обработку возврата. Остаток средств возвращается.

Если прокси были приобретены на 1 день или 1 неделю, при возврате также удерживается фиксированная комиссия 1$.

📌 Обратите внимание:

• Возврат возможен только при соблюдении правил сервиса
• При отсутствии нарушений ToS / abuse-активности
• За неиспользованный период

Спасибо за понимание 💙`;
            const msgEN = `⚠️ Refund Policy

We aim to keep our refund process fair and transparent 🤝

If proxies are purchased for a 1-month period, the refund is calculated using a simple formula:

💰 \$1 (fixed fee) + cost of used days

You only pay for the time actually used + the processing fee. The remaining balance is refunded.

If proxies were purchased for 1 day or 1 week, a fixed \$1 fee also applies in case of a refund request.

📌 Please note:

• Refunds are available only if service rules were followed
• No ToS violations or abuse activity
• Refund applies to the unused period only

Thank you for your understanding 💙`;
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
