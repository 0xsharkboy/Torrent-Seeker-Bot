require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_API_KEY;
const bot = new TelegramBot(token, {polling: true});

console.log('Bot started...');

require("./loader.js")(bot)
