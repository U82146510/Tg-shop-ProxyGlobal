import { paymentHistory } from '../../models/paymentHistory.js';
import { orderHistory } from '../../models/orderHistory.js';

export const logService = async (req,res,next)=>{
    const { userId, historyType } = req.body;

    
    try {
        let payments = null;
        let orders = null;
        let allOrders = null;
        let error = null;
        
        switch (historyType) {
            case 'payments':
                console.log('Fetching payments history for user:', userId);
                console.log('historyType:', historyType);
                payments = await paymentHistory.find({ userId }).sort({ createdAt: -1 }).lean();
                if (payments.length === 0) error = 'No payment logs found for this user';
                break;
            case 'orders':
                console.log('Fetching orders history for user:', userId);
                console.log('historyType:', historyType);
                orders = await orderHistory.find({ userId }).sort({ createdAt: -1 }).lean();
                if (orders.length === 0) error = 'No order logs found for this user';
                break;
            case 'all':
                console.log('Fetching all orders history');
                console.log('historyType:', historyType);
                allOrders = await orderHistory.find().sort({ createdAt: -1 }).lean();
                if (allOrders.length === 0) error = 'No logs found';
                break;
            case 'bycountry': 
                console.log('Fetching orders by country:', userId);
                console.log('historyType:', historyType);
                allOrders = await orderHistory.find({ country: userId.trim().toLowerCase() }).sort({ createdAt: -1 }).lean();
                if (allOrders.length === 0) error = 'No logs found for this country';
                break;
        }

        res.render('logs', { payments, orders, historyType, allOrders, error });

    } catch (error) {
        next(error);
    }
};

export const logGet = async (req,res)=>{
    res.render('logs', { payments: null, orders:null, historyType: null, allOrders:null, error: null });
};
