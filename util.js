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
  getDefinition: word => {}
};

module.exports = {
  discord,
  helpers,
  http
};
