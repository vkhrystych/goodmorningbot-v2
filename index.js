const { Telegraf } = require("telegraf");
const cron = require("node-cron");
const fetch = require("node-fetch");
const dotenv = require("dotenv");
var firebase = require("firebase/app");
require("firebase/firestore");
dotenv.config();

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

bot.start(async (ctx) => {
  const currentChat = await ctx.getChat();
  console.log("new user: ", currentChat);

  db.collection("chats")
    .get()
    .then((querySnapshot) => {
      const chats = {};

      querySnapshot.forEach((doc) => {
        const chat = doc.data();

        chats[chat.chatId] = chat;
      });

      if (!chats[currentChat.id])
        db.collection("chats").add({
          chatId: currentChat.id,
          name: currentChat.username,
        });
    });

  // ctx.reply("Welcome");
});

bot.launch();
