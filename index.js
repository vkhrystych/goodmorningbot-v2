const { Telegraf } = require("telegraf");
const cron = require("node-cron");
const fetch = require("node-fetch");
const dotenv = require("dotenv");
var firebase = require("firebase/app");
require("firebase/firestore");
dotenv.config();

const { getCityFromGoogleResponse } = require("./utils");

const geocodeUrl = "https://maps.googleapis.com/maps/api/geocode/json";

const getUserLocation = async (location) => {
  const getCityReq = await fetch(
    `${geocodeUrl}?key=${process.env.GOOGLE_API_KEY}&latlng=${location.latitude},${location.longitude}`
  );

  const resultsJson = await getCityReq.json();

  const locationObj = getCityFromGoogleResponse(resultsJson.results);

  return locationObj;
};

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
  const userLocation = await getUserLocation(message.location);

  db.collection("chats")
    .get()
    .then((querySnapshot) => {
      const chats = {};

      querySnapshot.forEach((doc) => {
        const chat = doc.data();

        chats[chat.chatId] = chat;
      });

      if (!chats[currentChat.id]) {
        db.collection("chats").add({
          chatId: currentChat.id,
          name: currentChat.username,
          location: userLocation,
        });

        reply("Спасибо! Завтра в 8 утра тебе прийдёт первый месседж <3");
      }
    });
});

bot.launch();
