import { paymentHistory } from '../../models/paymentHistory.js';
import { orderHistory } from '../../models/orderHistory.js';
import {z} from 'zod';

const logsSchema = z.discriminatedUnion('historyType', [
  z.object({ historyType: z.literal('payments'), userId: z.string() }),
  z.object({ historyType: z.literal('orders'), userId: z.string() }),
  z.object({ historyType: z.literal('all'), userId: z.string().optional() }),
  z.object({ historyType: z.literal('bycountry'), userId: z.string() }),
  z.object({ historyType: z.literal('byperiod'), userId: z.string() }),
]);



export const logService = async (req,res,next)=>{
    const result = logsSchema.safeParse(req.body);

    if(!result.success){
        res.render('logs', {
            payments: null,
            orders: null,
            allOrders: null,
            ordersByCountry: null,
            ordersByPeriod: null,
            historyType: null,
            error: 'Please fill the input data correctly'
        });
        return;
    }
    const input = result.data;
    try {
        let payments = null;
        let orders = null;
        let allOrders = null;
        let ordersByCountry = null;
        let ordersByPeriod = null;
        let error = null;

        
        switch (input.historyType) {
            case 'payments':
                console.log('Fetching payments history for user:',input.userId);
                console.log('historyType:', input.historyType);
                payments = await paymentHistory.find({ userId:input.userId }).sort({ createdAt: -1 }).lean();
                if (payments.length === 0) error = 'No payment logs found for this user';
                break;
            case 'orders':
                console.log('Fetching orders history for user:', input.userId);
                console.log('historyType:', input.historyType);
                orders = await orderHistory.find({ userId:input.userId }).sort({ createdAt: -1 }).lean();
                if (orders.length === 0) error = 'No order logs found for this user';
                break;
            case 'all':
                console.log('Fetching all orders history');
                console.log('historyType:',input.historyType);
                allOrders = await orderHistory.find().sort({ createdAt: -1 }).lean();
                if (allOrders.length === 0) error = 'No logs found';
                break;
            case 'bycountry': 
                console.log('Fetching orders by country:',input.userId);
                console.log('historyType:',input.historyType);
                ordersByCountry = await orderHistory.find({ country: input.userId.trim().toLowerCase() }).sort({ createdAt: -1 }).lean();
                if (ordersByCountry.length === 0) error = 'No logs found for this country';
                break;
            case 'byperiod': 
                console.log('Fetching orders by period:', input.userId);
                console.log('historyType:', input.historyType);
                const fromDate = new Date(`${input.userId}T00:00:00.000Z`);
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


        res.render('logs', {payments,orders,historyType:input.historyType,allOrders,ordersByCountry,ordersByPeriod,error});

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
