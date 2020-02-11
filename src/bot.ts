import { Client, Message } from "discord.js";
const config: IConfig = require("./config.json");
import { discord, helpers, http } from "./util";

const bot = new Client();

bot.on("ready", (): void => {
  console.log(
    `Bot is up and running, with ${discord.getOnlineUsers(
      bot.users
    )} online users, in ${discord.getTextChannels(
      bot.channels
    )} text channels and ${discord.getVoiceChannels(
      bot.channels
    )} voice channels.`
  );

  bot.user.setActivity("Defining Words");
});

bot.on("message", (message: Message): void => {
  if (message.author.bot || message.content.indexOf(config.prefix) !== 0)
    return;

  const { author, createdTimestamp, channel } = message;
  const args = discord.getAllArgs(message);
  const command = discord.getCommand(args);
  const botEmbed = {
    color: 0,
    title: "",
    fields: []
  };

  if (command === "define") {
    if (args.length > 0) {
      console.log(
        `Command [${config.prefix + command}] Received from ${
          author.username
        } at ${helpers.convertTime(createdTimestamp)}`
      );

      const word = args[0];

      http.getDefinition(word, ({ data, message, status }) => {
        if (status === 404) {
          channel.send(message);

          return;
        }

        if (status === 200) {
          let field = {
            name: `${word} - ${data.lexicalCategory}`,
            value: data.definition
          };

          botEmbed.title = "Definition";
          botEmbed.fields = [field];
          channel.send({ embed: botEmbed });
        } else {
          channel.send(message);
        }
      });
    } else {
      channel.send("Please specify the word you would like to define! :smile:");
    }
  }
});

bot.login(config.token);
