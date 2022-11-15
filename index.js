const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const token = '5794538331:AAHyVZguwFR93dZzhhEhCiWBMKhdHUvvPlA';
const appUrl = 'https://voluble-sorbet-30a305.netlify.app/';

const bot = new TelegramBot(token, {polling: true});
const app = express();

app.use(express.json());
app.use(cors());

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

   if (text === '/start') {
      await bot.sendMessage(chatId, 'Заполни форму', {
         reply_markup: {
            keyboard: [
               [{text: 'Заполнить форму', web_app: {url: appUrl + 'form'}}]
            ]
         }
      })

      await bot.sendMessage(chatId, 'Интернет магазин', {
         reply_markup: {
            inline_keyboard: [
               [{text: 'Сделать заказ', web_app: {url: appUrl}}]
            ]
         }
      })
   }

   // данные с веб приложения
   if (msg?.web_app_data?.data) {
      try {
         const data = JSON.parse(msg?.web_app_data?.data);

         await bot.sendMessage(chatId, 'Спасибо за обратную связь');
         await bot.sendMessage(chatId, 'Ваша страна: ' + data?.country);
         await bot.sendMessage(chatId, 'Ваш город: ' + data?.city);

         setTimeout(async () => {
            await bot.sendMessage(chatId, 'Всю информацию получите в этом чате');
         }, 3000);
      } catch (e) {
         console.log(e);
      }
   }
});

app.post('/web-data', async (req, res) => {
   // данные с фронтенда
   const {queryId, products, totalPrice} = req.body;

   try {
      await bot.answerWebAppQuery(queryId, {
         type: 'article',
         id: queryId,
         title: 'Успешная покупка',
         input_message_content: {message_text: `Покупка на сумму + ${totalPrice}`}
      });
      return res.status(200).json({});
   } catch(e) {
      await bot.answerWebAppQuery(queryId, {
         type: 'article',
         id: queryId,
         title: 'Не удалось приобрести товар',
         input_message_content: {message_text: `Не удалось приобрести товар`}
      });
      return res.status(500).json({});
   }
});

const PORT = 8000;

app.listen(PORT, () => console.log(`server started on PORT ${PORT}`));