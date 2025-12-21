"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = void 0;
const logout = async (req, res, next) => {
    try {
        req.session.destroy((error) => {
            if (error) {
                next(error);
                return;
            }
            res.clearCookie('admin.sid');
            res.redirect('/auth/login');
        });
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
