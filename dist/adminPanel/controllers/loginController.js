"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.showLoginForm = void 0;
const zod_1 = require("zod");
const adminPanel_1 = require("../../models/adminPanel");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const DUMMY_HASH = '$2a$12$C6UzMDM.H6dfI/f/IKcEeO5KfUdiW.SiV3X2XnFk4Ltp0jJX61ZxW';
const userSchema = zod_1.z.object({
    username: zod_1.z.string(),
    password: zod_1.z.string()
        .min(14)
        .regex(/[A-Z]/)
        .regex(/[a-z]/, 'Must contain lowercase letter')
        .regex(/[0-9]/, 'Must contain a digit')
        .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
});
const showLoginForm = (req, res, next) => {
    res.render('index', { error: null });
};
exports.showLoginForm = showLoginForm;
const login = async (req, res, next) => {
    const parsed = userSchema.safeParse(req.body);
    try {
        if (!parsed.success) {
            res.status(400).render('index', {
                error: 'Incorrect password'
            });
            return;
        }
        const { username, password } = parsed.data;
        const user = await adminPanel_1.Auth.findOne({ username }).select('+password');
        if (!user || !(user instanceof adminPanel_1.Auth)) {
            res.status(404).render('index', {
                error: 'Incorrect password'
            });
            return;
        }
        const isMatchPassword = await user.comparePassword(password);
        if (!isMatchPassword) {
            await bcryptjs_1.default.compare(password, DUMMY_HASH);
            res.status(401).render('index', {
                error: 'Incorrect password'
            });
            return;
        }
        req.session.userId = user._id.toString();
        req.session.save((err) => {
            if (err) {
                console.error(err);
                return next(err);
            }
            res.redirect('/admin/users');
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
