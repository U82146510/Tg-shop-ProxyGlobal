"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetBalanceEveryMonth = resetBalanceEveryMonth;
const node_cron_1 = __importDefault(require("node-cron"));
const shopBalance_1 = require("../../models/shopBalance");
function resetBalanceEveryMonth() {
    node_cron_1.default.schedule('0 0 1 * *', async () => {
        try {
            await shopBalance_1.shopBalance.findOneAndUpdate({ key: 'shop-status' }, {
                $set: {
                    Month: 0
                }
            }, {
                new: true,
                upsert: true
            });
            console.log('[Cron] Monthly balance reset.');
        }
        catch (error) {
            console.error('[Cron] Failed to reset balance:', error);
        }
    });
}
;
