// We need access to the information within the config file
const config = require("./config.json");
import { get } from 'https';
import { Collection, Snowflake, User, Channel } from 'discord.js';

export const discord = {
  /**
   * Gets the number of users currently online
   *
   * @param {Collection<Snowflake, User>} users A collection of users in the Guild
   * @returns {Number} The number of online users
   */
  getOnlineUsers: (users: Collection<Snowflake, User>): Number =>
    users.filter(user => user.presence.status !== "offline" && !user.bot).size,

  getAllArgs: message =>
    message.content
      .slice(config.prefix.length)
      .trim()
      .split(/ +/g),

  getCommand: args => args.shift().toLowerCase(),

  /**
   * Gets the number of Voice Channels in a Server
   *
   * @param {Collection<Snowflake, Channel>} channels A collection of channels
   * @returns {Number} The number of channels
   */
  getVoiceChannels: (channels: Collection<Snowflake, Channel>): Number =>
    channels.filter(channel => channel.type === "voice").size,

  /**
   * Gets the number of Text Channels in a Server
   *
   * @param {Collection<Snowflake, Channel>} channels A collection of channels
   * @returns {Number} The number of channels
   */
  getTextChannels: (channels: Collection<Snowflake, Channel>): Number =>
    channels.filter(channel => channel.type === "text").size
};

export const helpers = {
  convertTime: time => new Date(time).toString()
};

export const http = {
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

    get(options, res => {
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
        const entry = http._getFirstEntry(data);

        callback({
          status: statusCode,
          message: "",
          data: {
            definition: http._capitaliseDefinition(
              http._parseDefinition(entry)
            ),
            lexicalCategory: http._parseLexicalCategory(entry)
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

  _getFirstEntry: data => JSON.parse(data).results[0].lexicalEntries[0],

  _parseDefinition: data => data.entries[0].senses[0].definitions[0],

  _parseLexicalCategory: data => data.lexicalCategory.text,

  _capitaliseDefinition: data => data.charAt(0).toUpperCase() + data.slice(1)
};
