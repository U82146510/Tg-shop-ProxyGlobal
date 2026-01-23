"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.updateUserGet = exports.user = exports.userGet = exports.users = void 0;
const User_1 = require("../../models/User");
const zod_1 = require("zod");
const schemaUser = zod_1.z.object({
    userId: zod_1.z.string()
});
const users = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        const totalUsers = await User_1.User.countDocuments();
        const totalPages = Math.ceil(totalUsers / limit);
        const users = await User_1.User.find()
            .select('userId balance')
            .skip(skip)
            .limit(limit);

        res.render('dashboard', {
            users,
            currentPage: page,
            totalPages
        });
    } catch (error) {
        next(error);
    }
};
exports.users = users;
const userGet = async (req, res, next) => {
    try {
        res.render('user', {
            error: null, user: null
        });
    }
    catch (error) {
        next(error);
    }
};
exports.userGet = userGet;
const user = async (req, res, next) => {
    const parsed = schemaUser.safeParse(req.body);
    try {
        if (!parsed.success) {
            res.render('user', {
                user: null,
                error: 'Not found'
            });
            return;
        }
        const { userId } = parsed.data;
        const user = await User_1.User.findOne({ userId: userId }).populate('orders');
        if (!user) {
            res.render('user', {
                error: 'User not found',
                user: null
            });
            return;
        }
        res.render('user', {
            user: user,
            error: null
        });
    }
    catch (error) {
        next(error);
    }
};
exports.user = user;
const schemaUserUpdate = zod_1.z.object({
    userId: zod_1.z.string(),
    balance: zod_1.z.string()
});
const updateUserGet = async (req, res, next) => {
    try {
        res.render('userupdate', {
            message: null,
            error: null
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateUserGet = updateUserGet;
const updateUser = async (req, res, next) => {
    const parsed = schemaUserUpdate.safeParse(req.body);
    try {
        if (!parsed.success) {
            res.render('userupdate', {
                message: null,
                error: 'Wrong input'
            });
            return;
        }
        const { userId, balance } = parsed.data;
        const userUpdate = await User_1.User.findOneAndUpdate({ userId: userId }, {
            $set: {
                balance: balance
            }
        }, { new: true });
        if (!userUpdate) {
            res.render('userupdate', {
                message: 'Not found',
                error: null
            });
            return;
        }
        res.render('userupdate', {
            message: `Balance ${balance} for ${userId} was update`,
            error: null
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateUser = updateUser;
