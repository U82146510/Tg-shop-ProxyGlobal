"use strict";
const grammy_1 = require("grammy");
const redis_1 = require("../utils/redis");
const cleanup_1 = require("../utils/cleanup");
const {Review} = require("../../models/review");


function myReview(bot) {
    bot.callbackQuery('leave_comment', async (ctx) => {
        const telegramId = ctx.from?.id;
        if (!telegramId) return;
        console.log(`[leave_comment] Callback triggered for user: ${telegramId}`);
        await (0, cleanup_1.deleteCachedMessages)(ctx, `myreviewmenu${telegramId}`);
        await ctx.answerCallbackQuery();
        // Set Redis state for awaiting comment
        await redis_1.redis.set(`leave_comment_pending_${telegramId}`, '1');
        const msg = await ctx.reply('📝 <b>Share your experience!</b>\n\nPlease write your comment below.\nYour feedback helps us improve! 😊', {
            parse_mode: 'HTML'
        });
        await redis_1.redis.pushList(`leave_comment_${telegramId}`, [String(msg.message_id)]);
    });
    // Global message handler for comment input (text only)
   

    bot.callbackQuery('view_comments', async (ctx) => {
        const telegramId = ctx.from?.id;
        const redisKey = telegramId ? `view_comments_${telegramId}` : undefined;
        if (telegramId) {
            await (0, cleanup_1.deleteCachedMessages)(ctx, `myreviewmenu${telegramId}`);
        }
        let msgIds = [];
        try {
            await ctx.answerCallbackQuery();
        } catch (error) {
            if (error?.response?.description?.includes("query is too old")) {
                console.log("⚠️ Callback query already answered, skipping...");
            } else {
                if (redisKey) await redis_1.redis.pushList(redisKey, [JSON.stringify({ error: error.message })]);
                throw error;
            }
        }
        // Fetch last 5 comments from Review DB
        let comments = [];
        try {
            comments = await Review.find({})
                .sort({ createdAt: -1 })
                .limit(5)
                .lean();
        } catch (err) {
            console.error('Error fetching comments:', err);
            if (redisKey) await redis_1.redis.pushList(redisKey, [JSON.stringify({ error: err.message })]);
            const errorMsg = await ctx.reply('Failed to fetch comments.');
            if (redisKey) await redis_1.redis.pushList(redisKey, [String(errorMsg.message_id)]);
            // Add back button to return to myreview
            const backKeyboard = new grammy_1.InlineKeyboard().text('⬅️ Back', 'myreview');
            const backMsg = await ctx.reply('Back to menu:', { reply_markup: backKeyboard });
            if (redisKey) await redis_1.redis.pushList(redisKey, [String(backMsg.message_id)]);
            return;
        }
        if (!comments.length) {
            const noMsg = await ctx.reply('No comments found.');
            if (redisKey) await redis_1.redis.pushList(redisKey, [String(noMsg.message_id)]);
            // Add back button to return to myreview
            const backKeyboard = new grammy_1.InlineKeyboard().text('⬅️ Back', 'myreview');
            const backMsg = await ctx.reply('Back to menu:', { reply_markup: backKeyboard });
            if (redisKey) await redis_1.redis.pushList(redisKey, [String(backMsg.message_id)]);
            return;
        }
        // Beautify the comments display
        const formatted = `<b>🗣️ Latest Reviews</b>\n\n` +
            comments.map((c, i) =>
                `<b>${i + 1}.</b> <i>${c.comment || c.text || 'No text'}</i>\n<code>${c.user ? c.user : ''}</code>`
            ).join('\n\n');
        const keyboard = new grammy_1.InlineKeyboard().text('⬅️ Back', 'myreview');
        const msg = await ctx.reply(formatted, { reply_markup: keyboard, parse_mode: 'HTML' });
        if (redisKey) await redis_1.redis.pushList(redisKey, [String(msg.message_id)]);
    });



    bot.callbackQuery('myreview', async (ctx) => {
        const telegramId = ctx.from?.id;
        if (!telegramId) return;
        // Clean up view_comments, myreviewmenu, and leave_comment messages every time myreview is called
        await (0, cleanup_1.deleteCachedMessages)(ctx, `view_comments_${telegramId}`);
        await (0, cleanup_1.deleteCachedMessages)(ctx, `myreviewmenu${telegramId}`);
        await (0, cleanup_1.deleteCachedMessages)(ctx, `leave_comment_${telegramId}`);
        try {
            await ctx.answerCallbackQuery();
        }catch (error) {
            if (error?.response?.description?.includes("query is too old")) {
                console.log("⚠️ Callback query already answered, skipping...");
            }
            else {
                throw error;
            }
        }
        const keyboard = new grammy_1.InlineKeyboard()
            .text('👀 View Comments', 'view_comments')
            .row()
            .text('✍️ Leave a Comment', 'leave_comment')
            .row()
            .text('⬅️ Back to Menu', 'back_to_menu');

        await (0, cleanup_1.deleteCachedMessages)(ctx, `start_menu_${telegramId}`);
        await (0, cleanup_1.deleteCachedMessages)(ctx, `back_${telegramId}`);

        const redisKey = `myreviewmenu${telegramId}`;
        const msg = await ctx.reply('Choose an action:', {
            reply_markup: keyboard
        });
        await redis_1.redis.pushList(redisKey, [String(msg.message_id)]);
    });
}

module.exports = { myReview };

