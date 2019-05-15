const Discord = require("discord.js");
const config = require("./config.json");
const util = require("./util");

const bot = new Discord.Client();

bot.on("ready", () => {
  const { discord } = util;

  console.log(
    `Bot is up and running, with ${discord.getOnlineUsers(
      bot.users
    )} online users, in ${discord.getTextChannels(
      bot.channels
    )} text channels and ${discord.getVoiceChannels(
      bot.channels
    )} voice channels.`
  );

  bot.user.setActivity(`Defining Words`);
});

bot.on("message", message => {
  if (message.author.bot || message.content.indexOf(config.prefix) !== 0)
    return;

  const { author, createdTimestamp, channel } = message;
  const { discord, helpers, http } = util;
  const args = discord.getAllArgs(message);
  const command = discord.getCommand(args);
  const botEmbed = {
    color: 000000
  };

  if (command === "define") {
    if (args.length > 0) {
      console.log(
        `Command [${config.prefix + command}] Received from ${
          author.username
        } at ${helpers.convertTime(createdTimestamp)}`
      );

      const word = args[0];

      http.getDefinition(word, ({ data = {}, message = "", status }) => {
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
