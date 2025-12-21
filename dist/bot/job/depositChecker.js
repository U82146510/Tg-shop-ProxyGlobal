"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startDepositChecker = startDepositChecker;
const node_cron_1 = __importDefault(require("node-cron"));
const depositChecker_1 = require("../services/depositChecker");
function startDepositChecker(bot) {
    node_cron_1.default.schedule('*/30 * * * * *', async () => {
        console.log('⏰ Checking for USDT deposits...');
        await (0, depositChecker_1.checkForDeposits)(bot);
    });
}
