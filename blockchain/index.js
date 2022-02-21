//TESTE 1
// const Block = require("./Block");
// const bloco1 = new Block();
// console.log(bloco1);

//TESTE 2
// const Blockchain = require("./Blockchain");
// const blockchain = new Blockchain();
// blockchain.addBlock([{ from: 'a', to: 'b', amount: 10 }]);
// console.log(blockchain);

//TESTE 3
// const Blockchain = require("./Blockchain");
// const blockchain = new Blockchain();
// blockchain.addBlock([{ from: 'a', to: 'b', amount: 10 }]);
// blockchain.addBlock([{ from: 'b', to: 'c', amount: 15 }]);
// console.log(blockchain);
// blockchain.blocks[1].data = { from: 'a', to: 'b', amount: 1000 };
// console.log(JSON.stringify(blockchain));

//TESTE 4
// const Blockchain = require("./Blockchain");

// const blockchain = new Blockchain();
// blockchain.addBlock([{ from: 'a', to: 'b', amount: 10 }]);
// blockchain.addBlock([{ from: 'b', to: 'c', amount: 15 }]);
// console.log(blockchain);
// console.log(blockchain.isValid());

// blockchain.blocks[1].data = { from: 'a', to: 'b', amount: 1000 };
// console.log(blockchain);
// console.log(blockchain.isValid());

//TESTE 5
const Blockchain = require("./Blockchain");

const blockchain = new Blockchain();
blockchain.addBlock([{ from: 'a', to: 'b', amount: 10 }], 4);
blockchain.addBlock([{ from: 'b', to: 'c', amount: 15 }], 4);
console.log(blockchain);
console.log(blockchain.isValid());