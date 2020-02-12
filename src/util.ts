import { get, RequestOptions } from "https";
import { Collection, Snowflake, User, Channel, Message } from "discord.js";

require("dotenv").config();

import {
  IConfig,
  IFirstDefinitionEntry,
  IDefinitionObject
} from "./interfaces";

const prefix = process.env["COMMAND_PREFIX"];
const app_id = process.env["APP_ID"];
const app_key = process.env["APP_KEY"];

if (!prefix) {
  console.error("Prefix must be provided");
  process.exit(1);
}

export const discord = {
  /**
   * Gets the number of users currently online
   *
   * @param {Collection<Snowflake, User>} users A collection of users in the Guild
   * @returns {number} The number of online users
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
      .slice(prefix.length)
      .trim()
      .split(/ +/g),

  /**
   * Returns just the command that was passed in by the user.
   *
   * @param {string[]} args A collection of arguments from the user input.
   * @returns {string} The command itself.
   */
  getCommand: (args: string[]): string | undefined =>
    // TypeScript can't infer that even though we're using .shift() here, the
    // value that we return will always be a string given we're checking the
    // length of the array. Hence the need for the Non-Null Assertion Operator.
    args.length > 0 ? args.shift()!.toLowerCase() : "",

  /**
   * Gets the number of Voice Channels in a Server
   *
   * @param {Collection<Snowflake, Channel>} channels A collection of channels
   * @returns {number} The number of channels
   */
  getVoiceChannels: (channels: Collection<Snowflake, Channel>): number =>
    channels.filter(channel => channel.type === "voice").size,

  /**
   * Gets the number of Text Channels in a Server
   *
   * @param {Collection<Snowflake, Channel>} channels A collection of channels
   * @returns {number} The number of channels
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
   * @param {(definitionObject: DefinitionObject) => void} callback Callback
   * function.
   */
  getDefinition: (
    word: string,
    callback: (definitionObject: IDefinitionObject) => void
  ): void => {
    const options: RequestOptions = {
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
        http.handleResponse(res.statusCode!, data, callback);
      });

      res.on("error", (): void => {
        callback({
          data: { definition: "", lexicalCategory: "" },
          message: "There was an error with your request :thinking:",
          status: res.statusCode!
        });
      });
    });
  },

  handleResponse: (
    statusCode: number,
    data: string,
    callback: (definitionObject: IDefinitionObject) => void
  ): void => {
    switch (statusCode) {
      case 404:
        callback({
          data: { definition: "", lexicalCategory: "" },
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
          data: { definition: "", lexicalCategory: "" },
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
  _getFirstEntry: (data: string): IFirstDefinitionEntry =>
    JSON.parse(data).results[0].lexicalEntries.find(lex =>
      lex.hasOwnProperty("entries")
    ),

  /**
   * Gets the definition out of the first entry object.
   *
   * @param {FirstDefinitionEntry} data First entry data.
   * @returns {string} The definition
   */
  _parseDefinition: (data: IFirstDefinitionEntry): string =>
    data.entries[0].senses[0].definitions[0],

  /**
   * Gets the Lexical Category of the word (noun, verb, etc.).
   *
   * @param {FirstDefinitionEntry} data The first entry object.
   * @returns {string} The Lexical Cateory.
   */
  _parseLexicalCategory: (data: IFirstDefinitionEntry): string =>
    data.lexicalCategory.text,

  /**
   * Capitalises the first letter of the definition.
   *
   * @param {string} data The definition.
   * @returns {string} The definition with the first letter capitalised.
   */
  _capitaliseDefinition: (data: string): string =>
    data.charAt(0).toUpperCase() + data.slice(1)
};
