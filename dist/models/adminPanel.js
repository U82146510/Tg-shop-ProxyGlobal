"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth = void 0;
const mongoose_1 = require("mongoose");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
;
const authSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30,
        match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores']
    },
    password: {
        type: String,
        minlength: 12,
        select: false,
        validate: {
            validator: function (v) {
                return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{12,}$/.test(v);
            },
            message: 'Password must contain uppercase, lowercase, number, and special character'
        }
    }
});
authSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    try {
        const genSalt = await bcryptjs_1.default.genSalt(10);
        const hashPassword = await bcryptjs_1.default.hash(this.password, genSalt);
        this.password = hashPassword;
        next();
    }
    catch (error) {
        next(error);
    }
});
authSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        if (!this.password)
            return false;
        return bcryptjs_1.default.compare(candidatePassword, this.password);
    }
    catch (error) {
        return false;
    }
};
exports.Auth = (0, mongoose_1.model)('Auth', authSchema);
