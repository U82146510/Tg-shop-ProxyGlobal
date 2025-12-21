"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendmessagePost = exports.sendmessageGet = void 0;
const zod_1 = require("zod");
const User_1 = require("../../models/User");
const sendMessage_1 = require("../utils/sendMessage");
const bot_1 = require("../../bot/bot");
const sendMessageSchema = zod_1.z.object({
    message: zod_1.z.string()
});
const sendmessageGet = (req, res, next) => {
    try {
        res.render('sendmessagestousers', {
            error: null,
            message: null
        });
    }
    catch (error) {
        next(error);
    }
};
exports.sendmessageGet = sendmessageGet;
const sendmessagePost = async (req, res, next) => {
    const parsed = sendMessageSchema.safeParse(req.body);
    try {
        if (!parsed.success) {
            res.status(400).render('sendmessagestousers', {
                error: 'Incorrect data',
                message: null
            });
            return;
        }
        const { message } = parsed.data;
        const allUsers = await User_1.User.find().select('userId');
        if (allUsers.length === 0) {
            return;
        }
        const failed = [];
        for (const arg of allUsers) {
            const err = await (0, sendMessage_1.sendMsg)(bot_1.bot, arg.userId, message);
            if (err) {
                failed.push(arg.userId);
            }
        }
        res.status(201).render('sendmessagestousers', {
            error: failed.length ? `Failed for users: ${failed.join(', ')}` : null,
            message: failed.length ? null : 'Message sent to all users'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.sendmessagePost = sendmessagePost;
