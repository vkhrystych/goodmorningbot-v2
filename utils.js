const fetch = require("node-fetch");

const monthesLocale = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

module.exports = {
  getWeather: async (location) => {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&units=metric&appid=${process.env.OPEN_WEATHER_TOKEN}`
    );
    const result = await response.json();

    const message =
      "🧐 *Погода* " +
      result.weather[0].description +
      "\n🌡 Температура: " +
      Math.floor(result.main.temp) +
      "\n🤖 Ощущается как: " +
      Math.floor(result.main.feels_like) +
      "\n🐳 Влажность: " +
      result.main.humidity +
      "%\n";

    return message;
  },
  getNews: async () => {
    const response = await fetch(
      `https://api.dtf.ru/v1.9/timeline/index/popular?count=3`,
      {
        headers: { "X-Device-Token": process.env.DTF_TOKEN },
      }
    );

    const resJson = await response.json();

    return resJson.result;
  },
  prepareMessage: async (city) => {
    const date = new Date();

    let result = `*Доброе утро, кожаный мешок* 👾 \nСегодня ${date.getDate()} ${
      monthesLocale[date.getMonth()]
    } \n\n`;

    const weather = await module.exports.getWeather(city);
    const news = await module.exports.getNews();

    result += weather;

    let newsStr = "\nА вот и лучшие материалы с ДТФ на утро:";

    news.forEach((item) => {
      newsStr += `\n\n🔹️[${item.title || "Нет тайтла"}](${item.url})`;
    });

    result += newsStr;

    return result;
  },
};
