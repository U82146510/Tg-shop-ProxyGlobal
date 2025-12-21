"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginRouter = void 0;
const express_1 = require("express");
const loginController_1 = require("../controllers/loginController");
exports.loginRouter = (0, express_1.Router)();
exports.loginRouter.get('/login', loginController_1.showLoginForm);
exports.loginRouter.post('/login', loginController_1.login);
