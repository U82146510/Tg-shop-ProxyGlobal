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
const udtPayment_1 = require("../services/udtPayment");
const crypto_1 = __importDefault(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const Decimal128 = mongoose_1.default.Types.Decimal128;
const envPath = path_1.default.resolve(__dirname, '../../../.env');
const envResult = dotenv_1.default.config({ path: envPath });
const { UsdtAccount } = require('../../models/udtAccount.js');


function generateUniqueUsdtAmount(baseAmount) {
  const base = String(parseInt(baseAmount, 10));

  const randomFive = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0");

  return `${base}.0${randomFive}`;
}


    
if (envResult.error) {
    throw new Error('missing key encription');
}
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
    bot.callbackQuery("deposit_crypto", async (ctx) => {
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
            await (0, cleanup_1.deleteCachedMessages)(ctx, `user_balance${telegramId}`);
            const keyboard = new grammy_1.InlineKeyboard().text('🏠 Main Menu', 'back_to_menu').row();
            const redisKey = `input_balance${telegramId}`;
            const msg = await ctx.reply('💰 *Enter the amount of USDT you want to deposit:*\n\n' +
                '⚠️ *Important:* Only the *last generated deposit request* will be accepted.\n' +
                'If you create a new one before paying the previous one, the earlier one will be ignored.\n\n' +
                '✅ After sending the exact amount, please *wait for confirmation*.\n\n' +
                '⏳ Deposit window is valid for 15 minutes.', {
                reply_markup: keyboard, parse_mode: 'Markdown',
            });
            await redis_1.redis.pushList(redisKey, [String(msg.message_id)]);
            await redis_1.redis.set(`state:${telegramId}`, `awaiting_deposit_amount`);
        }
        catch (error) {
            console.error(error);
        }
    });
    bot.on('message:text', async (ctx2) => {
        const telegramId = ctx2.from?.id;
        if (!telegramId)
            return;
        await (0, cleanup_1.deleteCachedMessages)(ctx2, `input_balance${telegramId}`);
        const state = await redis_1.redis.get(`state:${telegramId}`);
        if (state !== "awaiting_deposit_amount") {
            return;
        }
        const input = ctx2.message?.text?.trim();
        if (!input) {
            return;
        }
        const amount = Number(input);
        if (isNaN(amount) || amount <= 0) {
            const keyboard = new grammy_1.InlineKeyboard().text('🏠 Main Menu', 'back_to_menu').row();
            const redisKey = `incorrect_amount${telegramId}`; // do not forget it
            const msg = await ctx2.reply('❌ Incorrect amount', {
                reply_markup: keyboard
            });
            await redis_1.redis.pushList(redisKey, [String(msg.message_id)]);
            return;
        }
        await (0, cleanup_1.deleteCachedMessages)(ctx2, `inpurt_balance${telegramId}`);
        const user = await User_1.User.findOne({ userId: telegramId });
        if (!user) {
            const keyboard = new grammy_1.InlineKeyboard().text('🏠 Main Menu', 'back_to_menu').row();
            const redisKey = `user_not_found${telegramId}`; // do not forget it
            const msg = await ctx2.reply('❌ User not found.', {
                reply_markup: keyboard
            });
            await redis_1.redis.pushList(redisKey, [String(msg.message_id)]);
            return;
        }

        if (user.hasPendingDeposit) {
            user.hasPendingDeposit = false;
            user.expectedAmount = Decimal128.fromString("0");
            user.expectedAmountExpiresAt = undefined;
            await user.save();
        }
        
        const wallet = await UsdtAccount.findOne();
        if (!wallet) {
            //await UsdtAccount.create({ address:"Tv1uwzCzhLG9MP1SnGdswEGraGnD1xQj2"});
            const keyboard = new grammy_1.InlineKeyboard().text('🏠 Main Menu', 'back_to_menu').row();
            const msg = await ctx2.reply('⚠️ Failed to generate wallet.', {
                reply_markup: keyboard
            });
            await redis_1.redis.pushList(`failed_to_generate${telegramId}`, [String(msg.message_id)]);
            return;
        }

         
        const uniqueAmountStr = generateUniqueUsdtAmount(amount);
        const expectedAmount = Decimal128.fromString(uniqueAmountStr);
        user.expectedAmount = expectedAmount;
        user.expectedAmountExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
        user.hasPendingDeposit = true;
        await user.save();

        const keyboard = new grammy_1.InlineKeyboard().text('🏠 Main Menu', 'back_to_menu').row();
        const redisKey1 = `generating_address${telegramId}`;
        const msg1 = await ctx2.reply(`✅ Please send *${uniqueAmountStr} USDT* to the following TRC20 address:\n\`\`\`${wallet.address}\`\`\`\n\nOnce received, your balance will be updated automatically.`, { reply_markup: keyboard, parse_mode: 'Markdown' });
        await redis_1.redis.pushList(redisKey1, [String(msg1.message_id)]);
        await redis_1.redis.delete(`state:${telegramId}`);
    });
}
;
