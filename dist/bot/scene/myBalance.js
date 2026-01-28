"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerBalanceMenu = registerBalanceMenu;
const grammy_1 = require("grammy");
const redis_1 = require("../utils/redis");
const cleanup_1 = require("../utils/cleanup");
const User_1 = require("../../models/User");


function generateUniqueUsdtAmount(baseAmount) {
  const base = String(parseInt(baseAmount, 10));

  const randomFive = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0");


    return `${base}.0${randomFive}`;
}

exports.generateUniqueUsdtAmount = generateUniqueUsdtAmount;

function registerBalanceMenu(bot) {
    bot.callbackQuery('my_balance', async (ctx) => {
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
            const user = await User_1.User.findOne({ userId: telegramId });
            if (!user) {
                await ctx.reply('❌ No such user found.');
                return;
            }
            const keyboard = new grammy_1.InlineKeyboard()
                .text('➕ Add Balance', 'deposit_crypto').row()
                .text('➕ Add Promocode', 'promocode').row()
                .text('🏠 Main Menu', 'back_to_menu').row();
            const formattedBalance = new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(Number(user.balance));
            const message = `👤 *Account Details*\n\n💰 *Balance:* \`${formattedBalance}\` USDT`;
            const redisKey = `user_balance${telegramId}`;
            const msg = await ctx.reply(message, {
                reply_markup: keyboard,
                parse_mode: 'MarkdownV2',
            });
            await redis_1.redis.pushList(redisKey, [String(msg.message_id)]);
        }
        catch (error) {
            console.error(error);
            await ctx.reply('⚠️ Error showing balance.');
        }
    });

    bot.callbackQuery("promocode",async(ctx)=>{
        
        try {
            await ctx.answerCallbackQuery();
        } catch (error) {
            if (error?.response?.description?.includes("query is too old")) {
                console.log("⚠️ Callback query already answered, skipping...");
            }else {
                throw error;
            }
        }
        const telegramId = ctx.from?.id;
        if(!telegramId) return;
        try {
            await (0, cleanup_1.deleteCachedMessages)(ctx, `user_balance${telegramId}`);
            // Clear review comment state if present
            await redis_1.redis.delete(`leave_comment_pending_${telegramId}`);
            const keyboard = new grammy_1.InlineKeyboard().text('🏠 Main Menu', 'back_to_menu').row();
            const redisKey = `promocode${telegramId}`;

            const menuText = "Enter your promocode"

            const msg = await ctx.reply(menuText, {
                reply_markup: keyboard,
                parse_mode: 'Markdown',
            });

            await redis_1.redis.pushList(redisKey, [String(msg.message_id)]);
            await redis_1.redis.set(`state:${telegramId}`, `awaiting_promocode`);
        } catch (error) {
            console.error(error);
        }
    });
    
    bot.callbackQuery("deposit_crypto", async (ctx) => {
        try {
            await ctx.answerCallbackQuery();
        }
        catch (error) {
            if (error?.response?.description?.includes("query is too old")) {
                console.log("⚠️ Callback query already answered, skipping...");
            }else {
                throw error;
            }
        }
        const telegramId = ctx.from?.id;
        if (!telegramId) return;

        try {
            await (0, cleanup_1.deleteCachedMessages)(ctx, `user_balance${telegramId}`);
            // Clear review comment state if present
            await redis_1.redis.delete(`leave_comment_pending_${telegramId}`);

            const keyboard = new grammy_1.InlineKeyboard().text('🏠 Main Menu', 'back_to_menu').row();
            const redisKey = `input_balance${telegramId}`;

            // Language-sensitive menu text
            const isRussian = ctx.from.language_code === 'ru';
            const menuText = isRussian
                ? '💰 Введите сумму USDT для пополнения\n\n' +
                '⚠️ Важно:\n' +
                '• Принимается только USDT (сеть TRC20)\n' +
                '• Будет обработан только последний сгенерированный запрос на пополнение\n' +
                '• Если вы создадите новый запрос до оплаты предыдущего, предыдущий будет проигнорирован\n\n' +
                '✅ После отправки точной суммы USDT (TRC20) дождитесь подтверждения.\n\n' +
                '💬 Хотите оплатить другой криптовалютой?\n' +
                'Свяжитесь с нашей службой поддержки для организации альтернативного способа оплаты.'
                : '💰 Enter the amount of USDT you want to deposit\n\n' +
                '⚠️ Important:\n' +
                '• Only USDT (TRC20 network) is accepted\n' +
                '• Only the last generated deposit request will be processed\n' +
                '• If you create a new request before paying the previous one, the earlier one will be ignored\n\n' +
                '✅ After sending the exact amount of USDT (TRC20), please wait for confirmation.\n\n' +
                '💬 Want to pay with another cryptocurrency?\n' +
                'Contact our support team to arrange an alternative payment method.';

            const msg = await ctx.reply(menuText, {
                reply_markup: keyboard,
                parse_mode: 'Markdown',
            });

            await redis_1.redis.pushList(redisKey, [String(msg.message_id)]);
            await redis_1.redis.set(`state:${telegramId}`, `awaiting_deposit_amount`);
        }
        catch (error) {
            console.error(error);
        }
    });


};
