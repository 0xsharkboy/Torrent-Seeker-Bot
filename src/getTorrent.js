const axios = require('axios');

module.exports = (bot) => {
  const userData = new Map(); // Map to store user-specific items

  async function sendResult(chatId, msgId, itemIndex, items) {
    const item = items[itemIndex];
    const messageText = `📄 **${item.Name}**\n\n` +
                        `👤 Uploaded by: ${item.UploadedBy ?? 'N/A'}\n` +
                        `🌍 Source: [${item.Url.split('/')[2]}](${item.Url})\n` +
                        `📁 Size: ${item.Size ?? 'N/A'}\n` +
                        `📉 Leechers: ${item.Leechers ?? 'N/A'}\n` +
                        `📈 Seeders: ${item.Seeders ?? 'N/A'}\n\n` +
                        `Result ${itemIndex + 1}/${items.length}`;

    await bot.editMessageText(messageText, {
      chat_id: chatId,
      message_id: msgId,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: "Get magnet", callback_data: 'get_magnet' }],
          [
            { text: "⬅️ Previous", callback_data: 'prev' },
            { text: "Next ➡️", callback_data: 'next' }
          ]
        ]
      }
    }).then(sentMessage => {
      userData.set(chatId, { msgId: sentMessage.message_id, items, itemIndex });
    });
  }

  bot.onText(/\/search (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const query = match[1];
    const msgId = (await bot.sendMessage(chatId, `Searching for: "${query}"...`)).message_id;

    try {
      // Clear previous search results if they exist
      const existingData = userData.get(chatId);
      if (existingData) {
        await bot.deleteMessage(chatId, existingData.msgId);
      }

      // Get searches and sort by seeders
      const response = await axios.get(`https://torrentseeker.vercel.app/api/all/${query}`);
      const items = response.data.sort((a, b) => parseInt(b.Seeders) - parseInt(a.Seeders));

      if (items.length === 0) {
        return bot.sendMessage(chatId, "No result found");
      }

      // Store new search results
      userData.set(chatId, { msgId, items, itemIndex: 0 });

      sendResult(chatId, msgId, 0, items);
    } catch (error) {
      console.error('An error occurred:', error);
      bot.sendMessage(chatId, 'API error');
    }
  });

  bot.on('callback_query', async (callbackQuery) => {
    const msg = callbackQuery.message;
    const chatId = msg.chat.id;
    const data = callbackQuery.data;

    const savedData = userData.get(chatId);
    if (!savedData) return;

    const items = savedData.items;
    let itemIndex = savedData.itemIndex;

    if (data === 'next' && itemIndex < items.length - 1) {
      await sendResult(chatId, savedData.msgId, itemIndex + 1, items);
    } else if (data === 'prev' && itemIndex > 0) {
      await sendResult(chatId, savedData.msgId, itemIndex - 1, items);
    } else if (data === 'get_magnet') {
      bot.sendMessage(chatId, items[itemIndex].Magnet)
    } else {
      bot.answerCallbackQuery(callbackQuery.id);
      return;
    }

    bot.answerCallbackQuery(callbackQuery.id);
  });

  // Optional: Cleanup old search results after a timeout (e.g., 10 minutes)
  setInterval(() => {
    const now = Date.now();
    for (const [chatId, items] of userData.entries()) {
      // Here you can implement a condition to clear stale items if needed
      // For example, you could use a timestamp to check if the data is too old
      // userData.delete(chatId); // Uncomment to clear all after a timeout
    }
  }, 600000); // Check every 10 minutes
};
