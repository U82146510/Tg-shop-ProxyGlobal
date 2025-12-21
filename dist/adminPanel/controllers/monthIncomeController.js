"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incomeStatistics = void 0;
const shopBalance_1 = require("../../models/shopBalance");
const incomeStatistics = async (req, res, next) => {
    try {
        const moneyStatistics = await shopBalance_1.shopBalance.findOne({ key: 'shop-status' });
        if (!moneyStatistics) {
            res.render('statistics', {
                Month: null,
                Total: null,
                shop: null,
                error: 'Balance record not found'
            });
            return;
        }
        const { Month, Total, shop } = moneyStatistics;
        res.render('statistics', {
            Month,
            Total,
            shop,
            error: null
        });
    }
    catch (error) {
        next(error);
    }
};
exports.incomeStatistics = incomeStatistics;
