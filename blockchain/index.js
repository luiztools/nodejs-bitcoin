//TESTE 1
// const Block = require("./Block");
// const bloco1 = new Block();
// console.log(bloco1);

//TESTE 2
const Blockchain = require("./Blockchain");
const blockchain = new Blockchain();
blockchain.addBlock([{ from: 'a', to: 'b', amount: 10 }]);
console.log(blockchain);