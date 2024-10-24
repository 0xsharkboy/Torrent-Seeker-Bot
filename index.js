require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_API_KEY;
const bot = new TelegramBot(token, {polling: true});

console.log('Bot started...');

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});

bot.onText(/\/ping/, (msg) => {
  const chatId = msg.chat.id;
  const start = Date.now();

  bot.sendMessage(chatId, 'Pong...').then((sentMessage) => {
    const messageId = sentMessage.message_id ;
    const diff = Date.now() - start;

    bot.editMessageText(diff + 'ms', {
      chat_id: chatId,
      message_id: messageId,
    });
  });
});
