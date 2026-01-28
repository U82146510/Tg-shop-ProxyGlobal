const { InlineKeyboard } = require('grammy');
const { redis } = require('../utils/redis');
const { Review } = require('../../models/review');
const { deleteCachedMessages } = require('../utils/cleanup');
const { User } = require('../../models/User');
const { UsdtAccount } = require('../../models/udtAccount');
const mongoose = require('mongoose');
const Decimal128 = mongoose.Types.Decimal128;

async function sharedMessageHandler(ctx) {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;
    // Check for review comment state
    const reviewPending = await redis.get(`leave_comment_pending_${telegramId}`);
    if (reviewPending) {
        // --- Review logic ---
        if (!ctx.message || typeof ctx.message.text !== 'string') {
            const errMsg = await ctx.reply('Please send your comment as plain text.');
            await redis.pushList(`leave_comment_${telegramId}`, [String(errMsg.message_id)]);
            await redis.delete(`leave_comment_pending_${telegramId}`);
            return;
        }
        let text = ctx.message.text.trim();
        if (text) {
            text = text.replace(/[$.]/g, '').substring(0, 500);
        }
        if (!text) {
            const errMsg = await ctx.reply('Comment cannot be empty or contain unsafe characters.');
            await redis.pushList(`leave_comment_${telegramId}`, [String(errMsg.message_id)]);
            await redis.delete(`leave_comment_pending_${telegramId}`);
            return;
        }
        try {
            let displayName = ctx.from?.username
                ? `@${ctx.from.username}`
                : [ctx.from?.first_name, ctx.from?.last_name].filter(Boolean).join(' ');
            if (!displayName) displayName = 'Anonymous';
            await Review.create({
                user: displayName,
                comment: text
            });
            await deleteCachedMessages(ctx, `leave_comment_${telegramId}`);
            const okMsg = await ctx.reply('✅ <b>Thank you for your feedback!</b>\n\nYour comment has been added and will help others. 🙏', {
                reply_markup: new InlineKeyboard().text('⬅️ Back', 'myreview'),
                parse_mode: 'HTML'
            });
            await redis.pushList(`leave_comment_${telegramId}`, [String(okMsg.message_id)]);
        } catch (err) {
            const errMsg = await ctx.reply('Failed to save your comment.', {
                reply_markup: new InlineKeyboard().text('⬅️ Back', 'myreview')
            });
            await redis.pushList(`leave_comment_${telegramId}`, [String(errMsg.message_id)]);
        }
        await redis.delete(`leave_comment_pending_${telegramId}`);
        return;
    }
    // Check for balance/promocode state
    const state = await redis.get(`state:${telegramId}`);
    if (state === 'awaiting_promocode') {
        const input = ctx.message?.text?.trim();
        // Hardened: Only allow alphanumeric promocodes, exact length 8
        const isValidPromocode = input && input.length === 8 && /^[A-Za-z0-9]+$/.test(input);
        if (!isValidPromocode) {
            const keyboard = new InlineKeyboard().text('🏠 Main Menu', 'back_to_menu').row();
            const redisKey1 = `promocodeIncorrect${telegramId}`;
            const msg1 = await ctx.reply(
                `❌ **Promocode Not Accepted!** ❌\n⚠️ Promocode must be 8 alphanumeric characters.`,
                {
                    reply_markup: keyboard,
                    parse_mode: 'Markdown'
                }
            );
            await redis.pushList(redisKey1, [String(msg1.message_id)]);
            await redis.delete(`state:${telegramId}`);
            return;
        }
        try {
            const { Promocode } = require('../../models/promoCode');
            const userId = String(telegramId);
            const promocode = await Promocode.findOneAndUpdate(
                {
                    promoCodeName: input,
                    expire: { $gt: new Date() },
                    users: { $ne: userId },
                    $expr: { $lt: [{ $size: "$users" }, "$numberOfUse"] }
                },
                {
                    $push: { users: userId }
                },
                { new: true }
            );
            if (!promocode) {
                const keyboard = new InlineKeyboard().text('🏠 Main Menu', 'back_to_menu').row();
                const redisKey1 = `promocodeIncorrect${telegramId}`;
                const msg1 = await ctx.reply(
                    `❌ **Promocode Not Accepted!** ❌\n⚠️ Please check the code or contact support for assistance 📞`,
                    {
                        reply_markup: keyboard,
                        parse_mode: 'Markdown'
                    }
                );
                await redis.pushList(redisKey1, [String(msg1.message_id)]);
                await redis.delete(`state:${telegramId}`);
                return;
            }
            const user = await User.findOneAndUpdate(
                { userId: telegramId },
                { $inc: { balance: promocode.discount } },
                { new: true }
            );
            const keyboard = new InlineKeyboard().text('🏠 Main Menu', 'back_to_menu').row();
            const redisKey1 = `promocode${telegramId}`;
            const msg1 = await ctx.reply(
                `🎉 **Promocode Accepted!**\n\n✅ Your promocode has been successfully verified.\n💰 The bonus amount of ${promocode.discount.toString()} USDT has been **credited to your balance**.\nIf you have any questions or want to continue, use the menu below.`,
                {
                    reply_markup: keyboard,
                    parse_mode: 'Markdown'
                }
            );
            await redis.pushList(redisKey1, [String(msg1.message_id)]);
            await redis.delete(`state:${telegramId}`);
        } catch (error) {
            console.log('Error at fetching the Promocode collection', error);
        }
        return;
    }
    if (state === 'awaiting_deposit_amount') {
        const input = ctx.message?.text?.trim();
        if (!input) {
            return;
        }
        const amount = Number(input);
        // Hardened: Only allow positive numbers, max $10,000
        if (isNaN(amount) || amount <= 0 || amount > 10000) {
            const keyboard = new InlineKeyboard().text('🏠 Main Menu', 'back_to_menu').row();
            const redisKey = `incorrect_amount${telegramId}`;
            const msg = await ctx.reply('❌ Incorrect amount (must be between 0 and 10,000)', {
                reply_markup: keyboard
            });
            await redis.pushList(redisKey, [String(msg.message_id)]);
            return;
        }
        await deleteCachedMessages(ctx, `input_balance${telegramId}`);
        const user = await User.findOne({ userId: telegramId });
        if (!user) {
            const keyboard = new InlineKeyboard().text('🏠 Main Menu', 'back_to_menu').row();
            const redisKey = `user_not_found${telegramId}`;
            const msg = await ctx.reply('❌ User not found.', {
                reply_markup: keyboard
            });
            await redis.pushList(redisKey, [String(msg.message_id)]);
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
            const keyboard = new InlineKeyboard().text('🏠 Main Menu', 'back_to_menu').row();
            const msg = await ctx.reply('⚠️ Failed to generate wallet.', {
                reply_markup: keyboard
            });
            await redis.pushList(`failed_to_generate${telegramId}`, [String(msg.message_id)]);
            return;
        }
        const uniqueAmountStr = require('./myBalance').generateUniqueUsdtAmount(amount);
        const expectedAmount = Decimal128.fromString(uniqueAmountStr);
        user.expectedAmount = expectedAmount;
        user.expectedAmountExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
        user.hasPendingDeposit = true;
        await user.save();
        const keyboard = new InlineKeyboard().text('🏠 Main Menu', 'back_to_menu').row();
        const redisKey1 = `generating_address${telegramId}`;
        const msg1 = await ctx.reply(
            `✅ Please send the following amount USDT:\n\${uniqueAmountStr}\nTRC20 address:\n${wallet.address}\n\nOnce received, your balance will be updated automatically.`,
            { reply_markup: keyboard, parse_mode: 'Markdown' }
        );
        await redis.pushList(redisKey1, [String(msg1.message_id)]);
        await redis.delete(`state:${telegramId}`);
        return;
    }
    // Add more state checks as needed
}

module.exports = { sharedMessageHandler };
