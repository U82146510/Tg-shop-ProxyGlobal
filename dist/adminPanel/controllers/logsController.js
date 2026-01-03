import { paymentHistory } from '../../models/paymentHistory.js';
import { orderHistory } from '../../models/orderHistory.js';

export const logService = async (req,res,next)=>{
    const { userId, historyType } = req.body;

    
    try {
        let payments = null;
        let orders = null;
        let allOrders = null;
        let ordersByCountry = null;
        let ordersByPeriod = null;
        let error = null;

        
        switch (historyType) {
            case 'payments':
                console.log('Fetching payments history for user:', userId);
                console.log('historyType:', historyType);
                if (!userId) {
                    error = 'User ID is required';
                    break;
                }
                payments = await paymentHistory.find({ userId }).sort({ createdAt: -1 }).lean();
                if (payments.length === 0) error = 'No payment logs found for this user';
                break;
            case 'orders':
                console.log('Fetching orders history for user:', userId);
                console.log('historyType:', historyType);
                if (!userId) {
                    error = 'User ID is required';
                    break;
                }
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
                if (!userId) {
                    error = 'Country is required';
                    break;
                }
                ordersByCountry = await orderHistory.find({ country: userId.trim().toLowerCase() }).sort({ createdAt: -1 }).lean();
                if (ordersByCountry.length === 0) error = 'No logs found for this country';
                break;
            case 'byperiod': 
                console.log('Fetching orders by country:', userId);
                console.log('historyType:', historyType);
                if (!userId) {
                    error = 'Period is required';
                    break;
                }
                const fromDate = new Date(`${userId}T00:00:00.000Z`);
                if (isNaN(fromDate.getTime())) {
                    error = 'Invalid date format. Use YYYY-MM-DD';
                    break;
                }
                ordersByPeriod = await orderHistory.find({createdAt: { $gte: fromDate }}).sort({ createdAt: -1 }).lean();
                if (ordersByPeriod.length === 0) error = 'No logs found from this date';
                break;
            default:
                error = 'Invalid history type';

        }


        res.render('logs', {payments,orders,historyType,allOrders,ordersByCountry,ordersByPeriod,error});

    } catch (error) {
        next(error);
    }
};

export const logGet = async (req, res) => {
  res.render('logs', {
    payments: null,
    orders: null,
    allOrders: null,
    ordersByCountry: null,
    ordersByPeriod: null,
    historyType: null,
    error: null
  });
};
