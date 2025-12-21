import { paymentHistory } from '../../models/paymentHistory.js';
import { orderHistory } from '../../models/orderHistory.js';

export const logService = async (req,res,next)=>{
    const { userId, historyType } = req.body;

    let logs = null;
    let orders = null;

    try {
        if(!userId){
            return res.render('logs', { payments:null, orders:null, historyType:null, error: 'User ID is required' });
        }

        if(historyType === 'payments') {
            logs = await paymentHistory.find({ userId }).sort({ createdAt: -1 }).lean();
            if(logs.length===0) {
                return res.render('logs', { payments:null, orders:null, historyType, error: 'No logs found for this user' });
            }
        }

        if(historyType === 'orders') {
            orders = await orderHistory.find({ userId }).sort({ createdAt: -1 }).lean();
            if(orders.length===0) {
                return res.render('logs', { payments:null, orders:null, historyType, error: 'No logs found for this user' });
            }
        }

 

        res.render('logs', { payments: logs, orders, historyType, error: null });

    } catch (error) {
        next(error);
    }
};

export const logGet = async (req,res)=>{
    res.render('logs', { payments: null, orders:null, historyType: null, error: null });
};
