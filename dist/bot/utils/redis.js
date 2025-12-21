"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const redis_1 = require("redis");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
const connect_db = process.env.atlas;
if (!connect_db) {
    throw new Error('missing atlas connection in the app.ts');
}
const redisPass = process.env.redisPassword;
if (!redisPass) {
    throw new Error('missing redis password');
}
class RedisClient {
    client;
    config;
    constructor(config = {}) {
        this.config = {
            host: 'localhost',
            port: 6379,
            maxRetries: 5,
            retryDelays: 5000,
            password: redisPass,
            ...config
        };
        this.client = (0, redis_1.createClient)({
            socket: {
                host: this.config.host,
                port: this.config.port,
                reconnectStrategy: (retries) => {
                    if (retries >= 5) {
                        return new Error('Max retries reached');
                    }
                    return this.config.retryDelays;
                }
            },
            password: this.config.password
        });
        this.setupEventListener();
    }
    setupEventListener() {
        this.client.on('connect', () => {
            console.log('Redis connecting...');
        });
        this.client.on('ready', () => {
            console.log('Redis connected and ready');
        });
        this.client.on('error', (error) => {
            console.error('Redis error', error);
        });
        this.client.on('end', () => {
            console.log('Redis disconnected');
        });
        this.client.on('reconnecting', () => {
            console.log('Redis reconnecting...');
        });
    }
    async connect() {
        try {
            await this.client.connect();
        }
        catch (error) {
            if (error instanceof Error) {
                console.error('Redis connection failed', { message: error.message, stack: error.stack });
            }
            else {
                console.error('Redis connection failed with unknown error:', error);
            }
            throw error;
        }
    }
    async disconnect() {
        try {
            await this.client.quit();
        }
        catch (error) {
            if (error instanceof Error) {
                console.error('Redis disconnection failed', { message: error.message, stack: error.stack });
            }
            else {
                console.error('Redis disconnection failed with unknown error:', error);
            }
            throw error;
        }
    }
    async set(key, value, options) {
        if (options?.ttl) {
            await this.client.setEx(key, options.ttl, value);
        }
        else {
            await this.client.set(key, value);
        }
    }
    async get(key) {
        return await this.client.get(key);
    }
    async delete(key) {
        const result = await this.client.del(key);
        return result > 0;
    }
    async exists(key) {
        const result = await this.client.exists(key);
        return result === 1;
    }
    async getList(key) {
        return await this.client.lRange(key, 0, -1);
    }
    async pushList(key, values, ttlSeconds) {
        await this.client.rPush(key, values);
        if (ttlSeconds)
            await this.client.expire(key, ttlSeconds);
    }
    getClient() {
        return this.client;
    }
}
;
exports.redis = new RedisClient();
