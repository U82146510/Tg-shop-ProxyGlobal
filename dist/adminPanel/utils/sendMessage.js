"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMsg = sendMsg;
async function sendMsg(bot, id, message) {
    try {
        await bot.api.sendMessage(id, message);
        return null;
    }
    catch (error) {
        console.error(`Error at sending message to telegram id:${id}`, error);
        return error;
    }
}
;
