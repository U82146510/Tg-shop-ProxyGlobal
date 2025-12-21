"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCachedMessages = deleteCachedMessages;
const redis_1 = require("./redis");
async function deleteCachedMessages(ctx, redisKey) {
    try {
        const messageIds = await redis_1.redis.getList(redisKey);
        for (const id of messageIds) {
            try {
                await ctx.api.deleteMessage(ctx.chat.id, Number(id));
            }
            catch (e) {
                console.info(`Failed to delete message ${id} from ${redisKey}`);
            }
        }
        await redis_1.redis.delete(redisKey);
    }
    catch (e) {
        console.warn(`Failed to clean messages for ${redisKey}`);
    }
}
