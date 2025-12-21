"use strict";

const express = require("express");
const session = require("express-session");
const rateLimit = require("express-rate-limit");
const MongoStore = require("connect-mongo");
const dotenv = require("dotenv");
const path = require("path");
const helmet = require("helmet");
const methodOverride = require("method-override");
const https = require("https");
const fs = require("fs");

// Routes
const { loginRouter } = require("./routes/loginRoute");
const { updateRouter } = require("./routes/updatePasswordRoute");
const { productRouter } = require("./routes/productRoute");
const { userRouter } = require("./routes/userRoute");
const { incomeStatistic } = require("./routes/monthIncomeRoute");
const { logoutRoute } = require("./routes/logoutRoute");
const { sendMsgRoute } = require("./routes/sendMessageRoute");
const { logsRoute } = require("./routes/logsRoute");

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const connect_db = process.env.atlas;
if (!connect_db) {
    throw new Error("missing atlas connection in the app.js");
}

const secretKey = process.env.encryptionKey;
if (!secretKey) {
    throw new Error("missing secret key");
}

const app = express();
const port = 3000;

app.set('trust proxy',1)

// Security middleware
app.use(
    helmet({
        hsts: false,
    })
);

app.disable("x-powered-by");
app.disable("etag");

// Body parsing
app.use(express.urlencoded({ extended: false }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests, try again later.",
});
app.use(limiter);

// Session configuration
app.use(
    session({
        name: "admin.sid",
        secret: secretKey,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: connect_db,
            ttl: 60 * 60,
        }),
        cookie: {
            httpOnly: true,
            secure: true, // set true if behind HTTPS proxy
            sameSite: "lax",
            maxAge: 1000 * 60 * 60,
        },
    })
);

// Static files
app.use(express.static(path.join(__dirname, "../../", "public")));

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../../", "views"));

// Method override
app.use(methodOverride("_method"));

// Routes
app.use("/auth", loginRouter);
app.use("/admin", updateRouter);
app.use("/admin", productRouter);
app.use("/admin", userRouter);
app.use("/admin", incomeStatistic);
app.use("/admin", logoutRoute);
app.use("/admin", sendMsgRoute);
app.use("/admin", logsRoute)

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong on the server." });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found.` });
});

// Server start
const startAdminPanel = async () => {
    try {
        app.listen(port,'127.0.0.1', () => {
            console.log(`Admin Panel running with HTTP on port ${port}`);
        });
    } catch (error) {
        console.error(error);
    }
};

module.exports = {
    startAdminPanel,
};
