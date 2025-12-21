"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrderAndReturnBackToSaleProxy = deleteOrderAndReturnBackToSaleProxy;
const node_cron_1 = __importDefault(require("node-cron"));
const returnProxybackToSale_1 = require("../utils/returnProxybackToSale");
function deleteOrderAndReturnBackToSaleProxy() {
    node_cron_1.default.schedule('*/10 * * * *', async () => {
        try {
            await (0, returnProxybackToSale_1.deleteExpiredOrders)();
            console.log('[Cron] Delete order and return proxy back to sale');
        }
        catch (error) {
            console.error('[Cron] Failed to delete order and return proxy back to sale');
        }
    });
}
;
