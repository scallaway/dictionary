// We need access to the information within the config file
const config = require("./config.json");
const https = require("https");

const discord = {
  getOnlineUsers: users => {
    let onlineUsers = [];
    users.forEach(user => {
      if (user.presence.status === "online" && !user.bot) {
        onlineUsers.push(user);
      }
    });

    return onlineUsers.length;
  },

  getAllArgs: message => {
    return message.content
      .slice(config.prefix.length)
      .trim()
      .split(/ +/g);
  },

  getCommand: args => {
    return args.shift().toLowerCase();
  },

  getVoiceChannels: channels => {
    let voiceChannels = [];

    channels.forEach(channel => {
      if (channel.type === "voice") {
        voiceChannels.push(channel);
      }
    });

    return voiceChannels.length;
  },

  getTextChannels: channels => {
    let textChannels = [];

    channels.forEach(channel => {
      if (channel.type === "text") {
        textChannels.push(channel);
      }
    });

    return textChannels.length;
  }
};

const helpers = {
  convertTime: time => {
    return new Date(time).toString();
  }
};

const http = {
  getDefinition: (word, callback) => {
    const options = {
      hostname: "od-api.oxforddictionaries.com",
      path: `/api/v1/entries/en/${word}/definitions`,
      headers: {
        app_id: config.app_id,
        app_key: config.app_key
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

  generateDefinition: data => {
    return JSON.parse(data).results[0].lexicalEntries[0].entries[0].senses[0]
      .definitions[0];
  }
};

module.exports = {
  discord,
  helpers,
  http
};
