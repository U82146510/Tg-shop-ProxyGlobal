"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.backToMainMenu = backToMainMenu;
const start_1 = require("../keyboard/start");
const cleanup_1 = require("../utils/cleanup");
const redis_1 = require("../utils/redis");
function backToMainMenu(bot) {
    bot.callbackQuery('back_to_menu', async (ctx) => {
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
        const firstName = ctx.from?.first_name ?? 'Anonymous';
        const languageCode = ctx.from?.language_code ?? 'unknown';
        await (0, cleanup_1.deleteCachedMessages)(ctx, `buy_proxy${telegramId}`);
        await (0, cleanup_1.deleteCachedMessages)(ctx, `isp_${telegramId}`);
        await (0, cleanup_1.deleteCachedMessages)(ctx, `operator_${telegramId}`);
        await (0, cleanup_1.deleteCachedMessages)(ctx, `period_${telegramId}`);
        await (0, cleanup_1.deleteCachedMessages)(ctx, `balance_added${telegramId}`);
        await (0, cleanup_1.deleteCachedMessages)(ctx, `order_list${telegramId}`);
        await (0, cleanup_1.deleteCachedMessages)(ctx, `no_orders${telegramId}`);
        await (0, cleanup_1.deleteCachedMessages)(ctx, `order_list${telegramId}`);
        await (0, cleanup_1.deleteCachedMessages)(ctx, `order_menu_back_${telegramId}`);
        await (0, cleanup_1.deleteCachedMessages)(ctx, `inssuficent_balance_${telegramId}`);
        await (0, cleanup_1.deleteCachedMessages)(ctx, `extend_${telegramId}`);
        await (0, cleanup_1.deleteCachedMessages)(ctx, `inssuficent_balance_when_extending${telegramId}`);
        await (0, cleanup_1.deleteCachedMessages)(ctx, `order_extended_success_${telegramId}`);
        await (0, cleanup_1.deleteCachedMessages)(ctx, `user_balance${telegramId}`);
        await (0, cleanup_1.deleteCachedMessages)(ctx, `generating_address${telegramId}`);
        await (0, cleanup_1.deleteCachedMessages)(ctx, `deposit_confirm_${telegramId}`);
        await (0, cleanup_1.deleteCachedMessages)(ctx, `deposit_expired_${telegramId}`);
        await (0, cleanup_1.deleteCachedMessages)(ctx, `failed_to_generate${telegramId}`);
        await (0, cleanup_1.deleteCachedMessages)(ctx, `about_${telegramId}`);
        await (0, cleanup_1.deleteCachedMessages)(ctx, `help_menu${telegramId}`);
        await (0, cleanup_1.deleteCachedMessages)(ctx, `inpurt_balance${telegramId}`);
        await (0, cleanup_1.deleteCachedMessages)(ctx, `no_products${telegramId}`);
        await (0, cleanup_1.deleteCachedMessages)(ctx, `user_not_found${telegramId}`);
        await (0, cleanup_1.deleteCachedMessages)(ctx, `incorrect_amount${telegramId}`);
        await (0, cleanup_1.deleteCachedMessages)(ctx, `myinfomenu${telegramId}`);
        await (0, cleanup_1.deleteCachedMessages)(ctx, `deposit_crypto${telegramId}`);
        const msgRU = `Добро пожаловать в GlobalProxyShop!
Наш сервис предлагает одни из самых доступных 4G мобильных прокси и гибкие тарифы под любые задачи.
⚠️ Мы не предоставляем прокси под чёрные цели!
Вы несёте полную ответственность за использование сервиса и свои действия.`;
        const msgEN = `Welcome to GlobalProxyShop!
We offer some of the most affordable 4G mobile proxies and flexible pricing plans for any need.
⚠️ We do not provide proxies for illegal or black-hat purposes!
You are fully responsible for how you use this service.`;
        const displayMSG = languageCode === 'ru' ? msgRU : msgEN;
        const redisKey = `back_${telegramId}`;
        const msg = await ctx.reply(`Welcome ${firstName} (${languageCode})\n\n${displayMSG}`, { reply_markup: (0, start_1.mainMenu)() });
        await redis_1.redis.pushList(redisKey, [String(msg.message_id)]);
    });
}
