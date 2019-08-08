// We need access to the information within the config file
const config: Config = require("./config.json");
import { get } from 'https';
import { Collection, Snowflake, User, Channel, Message } from 'discord.js';

export const discord = {
  /**
   * Gets the number of users currently online
   *
   * @param {Collection<Snowflake, User>} users A collection of users in the Guild
   * @returns {Number} The number of online users
   */
  getOnlineUsers: (users: Collection<Snowflake, User>): number =>
    users.filter(user => user.presence.status !== "offline" && !user.bot).size,

  /**
   * Returns all the arguments that were appended to the command.
   *
   * @param {Message} message The input from the user.
   * @returns {string[]} An array of strings containing the arguments passed.
   */
  getAllArgs: (message: Message): string[] =>
    message.content
      .slice(config.prefix.length)
      .trim()
      .split(/ +/g),

  /**
   * Returns just the command that was passed in by the user.
   *
   * @param {string[]} args A collection of arguments from the user input.
   * @returns {string} The command itself.
   */
  getCommand: (args: string[]): string => args.shift().toLowerCase(),

  /**
   * Gets the number of Voice Channels in a Server
   *
   * @param {Collection<Snowflake, Channel>} channels A collection of channels
   * @returns {Number} The number of channels
   */
  getVoiceChannels: (channels: Collection<Snowflake, Channel>): number =>
    channels.filter(channel => channel.type === "voice").size,

  /**
   * Gets the number of Text Channels in a Server
   *
   * @param {Collection<Snowflake, Channel>} channels A collection of channels
   * @returns {Number} The number of channels
   */
  getTextChannels: (channels: Collection<Snowflake, Channel>): number =>
    channels.filter(channel => channel.type === "text").size
};

export const helpers = {
  /**
   * Returns a string representation of Date from the timestamp.
   *
   * @param {number} time The timestamp
   * @returns {string} The time and date as a string
   */
  convertTime: (time: number): string => new Date(time).toString()
};


export const http = {
  /**
   * Gets the definition of a word.
   *
   * @param {string} word The word passed in from the user.
   * @param {({}: DefinitionObject) => void} callback Callback function.
   */
  getDefinition: (
    word: string,
    callback: ({}: DefinitionObject) => void
  ): void => {
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

      res.on("end", (): void => {
        http.handleResponse(res.statusCode, data, callback);
      });

      res.on("error", (): void => {
        callback({
          data: {},
          message: "There was an error with your request :thinking:",
          status: res.statusCode
        });
      });
    });
  },

  handleResponse: (
    statusCode: number,
    data: string,
    callback: ({}: DefinitionObject) => void
  ): void => {
    switch (statusCode) {
      case 404:
        callback({
          data: {},
          message: "I couldn't find the word you were looking for :cry:",
          status: statusCode
        });
        break;

      case 200:
        const entry = http._getFirstEntry(data);

        callback({
          data: {
            definition: http._capitaliseDefinition(
              http._parseDefinition(entry)
            ),
            lexicalCategory: http._parseLexicalCategory(entry)
          },
          message: "",
          status: statusCode
        });
        break;

      default:
        callback({
          data: {},
          message: "There was an error with your request :thinking:",
          status: 403
        });
    }
  },

  /**
   * Gets the first definition entry in the response.
   *
   * @param {string} data Unparsed response data.
   * @returns {FirstDefinitionEntry} The first entry object.
   */
  _getFirstEntry: (data: string): FirstDefinitionEntry => JSON.parse(data).results[0].lexicalEntries[0],

  /**
   * Gets the definition out of the first entry object.
   *
   * @param {FirstDefinitionEntry} data First entry data.
   * @returns {string} The definition
   */
  _parseDefinition: (data: FirstDefinitionEntry): string => data.entries[0].senses[0].definitions[0],

  /**
   * Gets the Lexical Category of the word (noun, verb, etc.).
   *
   * @param {FirstDefinitionEntry} data The first entry object.
   * @returns {string} The Lexical Cateory.
   */
  _parseLexicalCategory: (data: FirstDefinitionEntry): string => data.lexicalCategory.text,

  /**
   * Capitalises the first letter of the definition.
   *
   * @param {string} data The definition.
   * @returns {string} The definition with the first letter capitalised.
   */
  _capitaliseDefinition: (data: string): string => data.charAt(0).toUpperCase() + data.slice(1)
};