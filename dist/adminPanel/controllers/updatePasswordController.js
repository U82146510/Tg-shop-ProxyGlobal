"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = exports.updateGet = void 0;
const zod_1 = require("zod");
const adminPanel_1 = require("../../models/adminPanel");
const userSchema = zod_1.z.object({
    username: zod_1.z.string(),
    password: zod_1.z.string().min(14)
        .regex(/[A-Z]/)
        .regex(/[a-z]/, 'Must contain lowercase letter')
        .regex(/[0-9]/, 'Must contain a digit')
        .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
});
const updateGet = async (req, res, next) => {
    try {
        res.render('updatepassword', {
            error: null,
            message: null
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateGet = updateGet;
const update = async (req, res, next) => {
    const parsed = userSchema.safeParse(req.body);
    try {
        if (!parsed.success) {
            res.status(400).render('updatepassword', {
                error: 'Invalid input format. Must include 14+ characters with uppercase, lowercase, number, and special character.',
                message: null
            });
            return;
        }
        const { username, password, } = parsed.data;
        const user = await adminPanel_1.Auth.findOne({ username });
        if (!user) {
            res.status(404).render('updatepassword', { error: null, message: 'There is no such user' });
            return;
        }
        user.password = password;
        await user.save();
        res.status(200).render('updatepassword', { error: null, message: 'Password updated successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.update = update;
