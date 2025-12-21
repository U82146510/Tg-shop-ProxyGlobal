
import {getUSDTtransactions} from './udtPayment.js';
import { shopBalance } from '../../models/shopBalance.js';
import { UsdtAccount } from '../../models/udtAccount.js';
import { User } from '../../models/User.js';
import Decimal from "decimal.js";
import mongoose from 'mongoose';
import { redis } from "../utils/redis.js";
import {paymentHistory} from "../../models/paymentHistory.js";

export async function checkForDeposits(bot) {

    console.log("🔍 Checking for deposits...");
    const now = new Date();

    const users = await User.find({ hasPendingDeposit: true });
    if (!users.length) return;


    const usdtAccount = await UsdtAccount.findOne();
    if (!usdtAccount) throw new Error("USDT account not configured");

    const transactions = await getUSDTtransactions(usdtAccount.address);
    console.log(transactions)
    if (!transactions) return;
    if (transactions.length === 0) return;

    for (const user of users) {
        if (!user.expectedAmountExpiresAt || user.expectedAmountExpiresAt <= now) continue;

        const expected = new Decimal(user.expectedAmount.toString());

        const successfulPayment = transactions.find(tx =>
            new Decimal(tx).equals(expected)
        );

        if (!successfulPayment) continue;

        const session = await mongoose.startSession();

        try {
            await session.withTransaction(async () => {
            const result = await User.updateOne(
                {
                _id: user._id,
                hasPendingDeposit: true,
                expectedAmountExpiresAt: { $gt: now }
                },
                {
                $inc: {
                    balance: mongoose.Types.Decimal128.fromString(expected.toString())
                },
                $set: {
                    hasPendingDeposit: false,
                    expectedAmount: mongoose.Types.Decimal128.fromString("0"),
                    expectedAmountExpiresAt: null
                }
                },
                { session }
            );


            if (result.modifiedCount !== 1) {
                throw new Error("Deposit already processed or expired");
            }

            const commission = expected.mul(new Decimal("0.2"));

            await shopBalance.findOneAndUpdate(
                { key: "shop-status" },
                {
                $inc: {
                    Month: mongoose.Types.Decimal128.fromString(expected.toString()),
                    Total: mongoose.Types.Decimal128.fromString(expected.toString()),
                    shop: mongoose.Types.Decimal128.fromString(commission.toString())
                }
                },
                { upsert: true, session }
            );
            });
		
	    try {
                await paymentHistory.create({
                    userId: user.userId,
                    amount: mongoose.Types.Decimal128.fromString(expected.toString())
                });    
            } catch (error) {
                console.error(`❌ Failed to log payment history for user ${user.userId}:`, error.message);
            }

            console.log(
                `✅ Deposit confirmed (transaction) for user ${user.userId}, amount: ${expected.toString()}`
            );
            const sentMsg = await bot.api.sendMessage(
                                user.userId,
                                `💰 Deposit of ${current.toFixed(6)} USDT received!\n🆕 Balance: ${expected.toString()} USDT`
                            );
            await redis.pushList(`deposit_confirm_${user.userId}`, [String(sentMsg.message_id)]);
        } catch (err) {
            console.error(`❌ Transaction failed for user ${user.userId}:`, err.message);
        } finally {
            session.endSession(); // ✅ correct place
        }
    }
    /// handle expired deposits
    try {
        const expiredUsers = await User.find({
        hasPendingDeposit: true,
        expectedAmountExpiresAt: { $lte: now }
    });
        for (const user of expiredUsers) {
            if (!user.hasPendingDeposit) continue;
            if (!user.expectedAmountExpiresAt || user.expectedAmountExpiresAt > now) continue;
            user.hasPendingDeposit = false;
            user.expectedAmount = mongoose.Types.Decimal128.fromString("0");
            user.expectedAmountExpiresAt = undefined;
            await user.save();
            console.log(`ℹ️  Cleared expired deposit expectation for user ${user.userId}`);
            const expiredMsg = await bot.api.sendMessage(
                        user.userId,
                        '⚠️ Your deposit window expired. Please create a new deposit if you want to add balance.'
                    );
            await redis.pushList(`deposit_expired_${user.userId}`, [String(expiredMsg.message_id)]);
        }
    } catch (error) {
        console.error('Error at removing expired payment orders', error);
    }
}
