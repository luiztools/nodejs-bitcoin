require("dotenv").config();
const express = require('express');
const app = express();

app.use(express.json());

app.use('/buy', async (req, res, next) => {
    console.log(req.originalUrl);
    console.log(req.body);
    //res.send(`Received a request:\nURL: ${req.originalUrl}\nBody: ${JSON.stringify(req.body)}`);
    const order = await newOrder("0.01", "BUY");
    return res.json(order);
})

app.use('/sell', async (req, res, next) => {
    console.log(req.originalUrl);
    console.log(req.body);
    //res.send(`Received a request:\nURL: ${req.originalUrl}\nBody: ${JSON.stringify(req.body)}`);
    const order = await newOrder("0.01", "SELL");
    return res.json(order);
})

app.use("/", (req, res, next) => {
    return res.send("Health Check!");
})

const axios = require('axios');
const crypto = require('crypto');

async function newOrder(quantity, side) {
    const data = {
        symbol: "BTCUSDT",
        side,
        type: 'MARKET',
        quantity,
        timestamp: Date.now(),
        recvWindow: 60000//máximo permitido, default 5000
    };

    const signature = crypto
        .createHmac('sha256', process.env.SECRET_KEY)
        .update(`${new URLSearchParams(data)}`)
        .digest('hex');

    const newData = { ...data, signature };
    const qs = `?${new URLSearchParams(newData)}`;

    try {
        const result = await axios({
            method: 'POST',
            url: `${process.env.API_URL}/v3/order${qs}`,
            headers: { 'X-MBX-APIKEY': process.env.API_KEY }
        });
        console.log(result.data);
    } catch (err) {
        console.error(err);
    }
}


app.listen(process.env.PORT, () => {
    console.log(`Running at ${process.env.PORT}`)
})