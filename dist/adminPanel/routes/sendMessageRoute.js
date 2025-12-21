"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMsgRoute = void 0;
const express_1 = require("express");
const sendMessageController_1 = require("../controllers/sendMessageController");
const protectRoute_1 = require("../middleware/protectRoute");
exports.sendMsgRoute = (0, express_1.Router)();
exports.sendMsgRoute.get('/sendmessage', protectRoute_1.protectRoute, sendMessageController_1.sendmessageGet);
exports.sendMsgRoute.post('/sendmessage', protectRoute_1.protectRoute, sendMessageController_1.sendmessagePost);
