"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bot = void 0;
const grammy_1 = require("grammy");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const start_1 = require("./keyboard/start");
const buyProxy_1 = require("./scene/buyProxy");
const redis_1 = require("./utils/redis");
const backMenu_1 = require("./common/backMenu");
const connectDB_1 = require("../config/connectDB");
const orders_1 = require("../bot/scene/orders");
const myBalance_1 = require("./scene/myBalance");
const depositChecker_1 = require("./job/depositChecker");
const aboutMenu_1 = require("./scene/aboutMenu");
const helpMenu_1 = require("./scene/helpMenu");
const app_1 = require("../adminPanel/app");
const resetMontlyBalance_1 = require("../adminPanel/utils/resetMontlyBalance");
const deleteOrderChecker_1 = require("./job/deleteOrderChecker");
const myInfo_1 = require("./scene/myInfo");
dotenv_1.default.config({
    path: path_1.default.resolve(__dirname, '../../.env')
});
const bot_token = process.env.bot_token;
if (!bot_token) {
    throw new Error('missing telegram token');
}
;
exports.bot = new grammy_1.Bot(bot_token);
const start = async () => {
    try {
        await (0, connectDB_1.connect_db)();
        await redis_1.redis.connect();
        await (0, app_1.startAdminPanel)();
        (0, buyProxy_1.registerBuyProxyHandler)(exports.bot);
        (0, start_1.registerMainMenu)(exports.bot);
        (0, backMenu_1.backToMainMenu)(exports.bot);
        (0, orders_1.orderHandler)(exports.bot);
        (0, myBalance_1.registerBalanceMenu)(exports.bot);
        (0, aboutMenu_1.registerAboutMenu)(exports.bot);
        (0, depositChecker_1.startDepositChecker)(exports.bot);
        (0, helpMenu_1.helpMenu)(exports.bot);
        (0, myInfo_1.myInfoMenu)(exports.bot);
        (0, resetMontlyBalance_1.resetBalanceEveryMonth)();
        (0, deleteOrderChecker_1.deleteOrderAndReturnBackToSaleProxy)();
        await exports.bot.start();
    }
    catch (error) {
        console.error(error);
    }
};
exports.bot.catch((err) => {
    console.error("💥 Bot error:", err);
    if ("ctx" in err) {
        console.error("Context update:", err.ctx.update);
    }
});
start();
