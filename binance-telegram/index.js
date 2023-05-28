//index.js
require('dotenv').config();

const { Telegraf } = require('telegraf');
const { message } = require('telegraf/filters');

const bot = new Telegraf(process.env.BOT_TOKEN);

const { newOrder } = require("./api");

bot.on(message('text'), async (ctx) => {
  if (ctx.from.username !== "luiztools") return;

  console.log(ctx.message.text);

  const symbol = ctx.message.text.split("#")[1].split(" ")[0].trim();
  const quantity = "0.01";
  const price = ctx.message.text.split("Target 1: ")[1].split("\n")[0].trim();

  let result;
  if (ctx.message.text.indexOf("BUY") !== -1 || ctx.message.text.indexOf("LONG") !== -1) {
    ctx.reply("Bora Comprar");
    result = await newOrder(symbol, quantity, "BUY", price);
  }
  else if (ctx.message.text.indexOf("SELL") !== -1 || ctx.message.text.indexOf("SHORT") !== -1) {
    ctx.reply("Bora Vender");
    result = await newOrder(symbol, quantity, "SELL", price);
  }

  console.log(result);
});

bot.launch();