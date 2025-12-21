"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protectRoute = void 0;
const protectRoute = (req, res, next) => {
    try {
        if (!req.session || !req.session.userId) {
            res.status(401).json({ message: 'Unauthorized: Please login first.' });
            return;
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.protectRoute = protectRoute;
