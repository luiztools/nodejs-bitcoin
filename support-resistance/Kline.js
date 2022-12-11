module.exports = class Kline {
    constructor(arr){
        this.time = arr[0];
        this.open = parseFloat(arr[1]);
        this.high = parseFloat(arr[2]);
        this.low = parseFloat(arr[3]);
        this.close = parseFloat(arr[4]);
    }
}