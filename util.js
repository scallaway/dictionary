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

    let definition;

    https.get(options, res => {
      // Capture the error
      if (res.statusCode === 404) {
        callback({
          status: res.statusCode,
          message: "I couldn't find the word you were looking for :cry:",
          data: {}
        });

        return;
      }

      // If the request is successful
      if (res.statusCode === 200) {
        let data = "";

        res.on("data", chunk => {
          data += chunk;
        });

        res.on("end", () => {
          definition = http.generateDefinition(data);

          // Capitalise the first letter
          definition = definition.charAt(0).toUpperCase() + definition.slice(1);

          callback({
            status: res.statusCode,
            message: "",
            data: {
              definition
            }
          });

          return;
        });
      } else {
        callback({
          status: res.statusCode,
          message: "There was an error with your request :thinking:",
          data: {}
        });
      }
    });
  },

  generateDefinition: data =>
    JSON.parse(data).results[0].lexicalEntries[0].entries[0].senses[0]
      .definitions[0]
};

module.exports = {
  discord,
  helpers,
  http
};
