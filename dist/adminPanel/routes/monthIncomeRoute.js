"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incomeStatistic = void 0;
const monthIncomeController_1 = require("../controllers/monthIncomeController");
const express_1 = require("express");
const protectRoute_1 = require("../middleware/protectRoute");
exports.incomeStatistic = (0, express_1.Router)();
exports.incomeStatistic.get('/statistics', protectRoute_1.protectRoute, monthIncomeController_1.incomeStatistics);
