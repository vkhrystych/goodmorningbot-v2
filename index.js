const { Telegraf } = require("telegraf");
const cron = require("node-cron");
const dotenv = require("dotenv");
var firebase = require("firebase/app");
require("firebase/firestore");

dotenv.config();

const { prepareMessage } = require("./utils");

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

firebase.initializeApp({
  appId: process.env.FIREBASE_APPID,
  apiKey: process.env.FIREBASE_APIKEY,
  projectId: process.env.FIREBASE_PROJECTID,
  authDomain: process.env.FIREBASE_AUTHDOMAIN,
  databaseURL: process.env.FIREBASE_DATABASEURL,
  storageBucket: process.env.FIREBASE_STORAGEBUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGINGSENDERID,
});

const db = firebase.firestore();

bot.start((ctx) => {
  ctx.reply(
    "Привет, каждый день в 8 утра я буду присылать тебе три главных новости c DTF.ru и прогноз погоды на сегодня."
  );

  ctx.reply("Пришли мне свою локацию, чтобы я смог присылать тебе погоду.");
});

bot.on("location", async ({ reply, message, getChat }) => {
  const currentChat = await getChat();

  db.collection("chats")
    .get()
    .then((querySnapshot) => {
      const chats = {};

      querySnapshot.forEach((doc) => {
        const chat = doc.data();

        chats[chat.chatId] = chat;
      });

      const newUserData = {
        chatId: currentChat.id,
        location: {
          lat: message.location.latitude,
          lon: message.location.longitude,
        },
      };

      if (currentChat.username) newUserData["name"] = currentChat.username;

      if (!chats[currentChat.id]) {
        db.collection("chats").add(newUserData);

        reply("Спасибо! Завтра в 8 утра тебе прийдёт первый месседж <3");
      }
    });
});

bot.launch();

// send every 8am 0:                        0 8 * * *
// send message every 10 seconds:           */10 * * * * *
// send message every 1 hour at 00 minutes: 0 0-23 * * *

const cronTiming = process.env.MODE === "dev" ? "*/10 * * * * *" : "0 8 * * *";

cron.schedule(cronTiming, () => {
  if (process.env.MODE === "dev") {
    const subscriber = {
      chatId: 161065379,
      location: {
        lat: 50.412399,
        lon: 30.528374,
      },
    };

    const spamMessages = async () => {
      const message = await prepareMessage(subscriber.location);

      bot.telegram.sendMessage(subscriber.chatId, message, {
        parse_mode: "Markdown",
      });
    };

    spamMessages();
  } else {
    db.collection("chats")
      .get()
      .then((querySnapshot) => {
        const subscribers = [];

        querySnapshot.forEach((doc) => {
          const chat = doc.data();

          subscribers.push(chat);
        });

        subscribers.forEach(async (subscriber) => {
          const message = await prepareMessage(subscriber.location);

          bot.telegram.sendMessage(subscriber.chatId, message, {
            parse_mode: "Markdown",
          });
        });
      });
  }
});
