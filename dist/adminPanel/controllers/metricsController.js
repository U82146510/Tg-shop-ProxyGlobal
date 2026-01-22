const { Metrics } = require('../../models/metrics.js');

exports.metricsGet = async(req,res,next)=>{
    try {
        // Total documents
        const totalVisits = await Metrics.countDocuments();

        // Today's visits (from today 00:00:00 to now)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayVisits = await Metrics.countDocuments({ timestamp: { $gte: today } });

        // Device counts all time
        const deviceCounts = await Metrics.aggregate([
            { $group: { _id: '$device', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $project: { _id: 0, device: '$_id', totalVisits: '$count' } }
        ]);

        // Browser counts all time
        const browserCounts = await Metrics.aggregate([
            { $group: { _id: '$browser', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $project: { _id: 0, browser: '$_id', totalVisits: '$count' } }
        ]);

        // Country counts all time
        const countryCounts = await Metrics.aggregate([
            { $group: { _id: '$country', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $project: { _id: 0, country: '$_id', totalVisits: '$count' } }
        ]);

        // Last 30 IPs visited today
        const lastIPs = await Metrics.find(
            { timestamp: { $gte: today } },
            { ipAddress: 1, timestamp: 1, _id: 0 }
        ).sort({ timestamp: -1 }).limit(30).lean();

        res.status(200).render('metrics', {
            error: null,
            totalVisits,
            todayVisits,
            deviceBreakdown: deviceCounts,
            browserBreakdown: browserCounts,
            countryBreakdown: countryCounts,
            last30IPsToday: lastIPs
        });
    } catch (error) {
        next(error)
    }
};
