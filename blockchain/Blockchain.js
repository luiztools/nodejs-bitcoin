const Block = require('./block')

module.exports = class Blockchain {
    constructor() {
        this.blocks = [new Block()];
        this.nextIndex = 1;
    }

    getLastHash() {
        return this.blocks[this.blocks.length - 1].hash;
    }

    addBlock(data) {
        const hash = this.getLastHash();
        const block = new Block(this.nextIndex++, hash, data);
        this.blocks.push(block);
    }
}
