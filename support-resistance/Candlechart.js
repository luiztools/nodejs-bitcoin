const Kline = require("./Kline");
module.exports = class Candlechart {
    constructor(arr, tickSize) {
        this.klines = arr.map(k => new Kline(k));
        this.TICK_SIZE = tickSize;
    }

    highestPrice() {
        const orderedKlines = this.klines.sort((a, b) => a.high - b.high);
        return orderedKlines[orderedKlines.length - 1].high;
    }

    lowestPrice() {
        const orderedKlines = this.klines.sort((a, b) => a.low - b.low);
        return orderedKlines[0].low;
    }

    getMedium(support, resistance) {
        if (support === undefined)
            support = this.lowestPrice();

        if (resistance === undefined)
            resistance = this.highestPrice();

        return ((resistance - support) / 2) + support;
    }

    getTrendTick(grouped, total) {
        let tickArr = Object.keys(grouped).map(k => {
            return { tick: k, count: grouped[k] }
        });
        tickArr = tickArr.sort((a, b) => a.count - b.count);
        return {...tickArr[tickArr.length - 1], total };
    }

    getTicks(kline) {
        const priceOsc = kline.high - kline.low;
        return priceOsc * (1 / this.TICK_SIZE);
    }

    getGroupedTicks(grouped, kline) {
        const ticks = this.getTicks(kline);
        for (let i = 0; i < ticks; i++) {
            const tick = kline.low + (this.TICK_SIZE * i);
            if (grouped[tick])
                grouped[tick]++;
            else
                grouped[tick] = 1;
        }
        return grouped;
    }

    findSupport(medium) {
        const candles = this.klines.filter(k => k.low < medium);
        let grouped = {};
        candles.map(kline => grouped = this.getGroupedTicks(grouped, kline));

        return this.getTrendTick(grouped, candles.length);
    }

    findResistance(medium) {
        const candles = this.klines.filter(k => k.high > medium);
        let grouped = {};
        candles.map(kline => grouped = this.getGroupedTicks(grouped, kline));

        return this.getTrendTick(grouped, candles.length);
    }
}