"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutRoute = void 0;
const logoutController_1 = require("../controllers/logoutController");
const express_1 = require("express");
const protectRoute_1 = require("../middleware/protectRoute");
exports.logoutRoute = (0, express_1.Router)();
exports.logoutRoute.get('/logout', protectRoute_1.protectRoute, logoutController_1.logout);
