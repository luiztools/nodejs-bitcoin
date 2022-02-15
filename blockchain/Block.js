const sha256 = require('crypto-js/sha256');

module.exports = class Block {
    constructor(index = 0, previousHash = null, data = 'Genesis Block') {
        this.index = index;
        this.previousHash = previousHash;
        this.data = data;
        this.timestamp = new Date();
        this.hash = this.generateHash();
    }

    generateHash() {
        return sha256(this.index + this.previousHash + JSON.stringify(this.data) + this.timestamp).toString();
    }
}