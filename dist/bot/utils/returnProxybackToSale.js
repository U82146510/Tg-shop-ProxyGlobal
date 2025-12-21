"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExpiredOrders = deleteExpiredOrders;
const Orders_1 = require("../../models/Orders");
const buyProxy_1 = require("../utils/buyProxy");
async function deleteExpiredOrders() {
    try {
        const timeNow = new Date();
        const expiredOrders = await Orders_1.Order.find({ expireAt: {
                $lte: timeNow
            } });
        if (expiredOrders.length === 0) {
            console.log('No expired orders to be deleted');
            return;
        }
        for (const order of expiredOrders) {
            const apikey = order.apikey.toString();
            console.log(`Deleting expired order: ${order.id}`);
            await (0, buyProxy_1.canBuyOff)(order.eid, "1", apikey);
            await order.deleteOne();
        }
    }
    catch (error) {
        console.error('Error at deleteing orders and returning proxy back to sale');
    }
}
;
