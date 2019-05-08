// We need access to the information within the config file
const config = require("./config.json");
const https = require("https");

const discord = {
  getOnlineUsers: users =>
    users.filter(user => user.presence.status !== "offline" && !user.bot).size,

  getAllArgs: message =>
    message.content
      .slice(config.prefix.length)
      .trim()
      .split(/ +/g),

  getCommand: args => args.shift().toLowerCase(),

  getVoiceChannels: channels =>
    channels.filter(channel => channel.type === "voice").size,

  getTextChannels: channels =>
    channels.filter(channel => channel.type === "text").size
};

const helpers = {
  convertTime: time => new Date(time).toString()
};

const http = {
  getDefinition: (word, callback) => {
    const { app_id, app_key } = config;
    const options = {
      hostname: "od-api.oxforddictionaries.com",
      path: `/api/v2/entries/en-gb/${word}?fields=definitions`,
      headers: {
        app_id,
        app_key
      }
    };

    https.get(options, res => {
      let data = "";

      res.on("data", chunk => {
        data += chunk;
      });

      res.on("end", () => {
        http.handleResponse(res.statusCode, data, callback);
      });

      res.on("error", e => {
        callback({
          status: res.statusCode,
          message: "There was an error with your request :thinking:",
          data: {}
        });
      });
    });
  },

  handleResponse: (statusCode, data, callback) => {
    switch (statusCode) {
      case 404:
        callback({
          status: statusCode,
          message: "I couldn't find the word you were looking for :cry:",
          data: {}
        });
        break;

      case 200:
        callback({
          status: statusCode,
          message: "",
          data: {
            definition: http.capitaliseDefinition(http.parseDefinition(data))
          }
        });
        break;

      default:
        callback({
          status: 403,
          message: "There was an error with your request :thinking:",
          data: {}
        });
    }
  },

  parseDefinition: data =>
    JSON.parse(data).results[0].lexicalEntries[0].entries[0].senses[0]
      .definitions[0],

  capitaliseDefinition: data => data.charAt(0).toUpperCase() + data.slice(1)
};

module.exports = {
  discord,
  helpers,
  http
};
