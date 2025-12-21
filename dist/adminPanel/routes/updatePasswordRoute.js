"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRouter = void 0;
const express_1 = require("express");
const updatePasswordController_1 = require("../controllers/updatePasswordController");
const protectRoute_1 = require("../middleware/protectRoute");
exports.updateRouter = (0, express_1.Router)();
exports.updateRouter.get('/update', protectRoute_1.protectRoute, updatePasswordController_1.updateGet);
exports.updateRouter.post('/update', protectRoute_1.protectRoute, updatePasswordController_1.update);
