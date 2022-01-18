require('dotenv-safe').config();
const api = require('./api');

const nodeSchedule = require('node-schedule');

let order;

const dt = new Date(2022, 1, 17, 21);
const job = nodeSchedule.scheduleJob(dt, () => {
    order = await api.newQuoteOrder('LOKAUSDT', 10);
    if (order.status !== 'FILLED')
        console.log(order);
})

console.log(job.nextInvocation());