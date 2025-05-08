require('dotenv-safe').config();
const api = require('./api');

const nodeSchedule = require('node-schedule');

let order;

const dt = new Date(2022, 1, 20, 8, 59, 59, 82);
const job = nodeSchedule.scheduleJob(dt, async () => {
    order = await api.newQuoteOrder('LOKABNB', 0.1);
    let order2;
    if (order.status === 'FILLED') {
        order2 = await api.newOrder('LOKABNB', order.executedQty, 0, 'SELL', 'LIMIT');
    }

    console.log(order);
    console.log(order2);
})