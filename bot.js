const Discord = require("discord.js");
const config = require("./config.json");
const util = require("./util");

const bot = new Discord.Client();

bot.on("ready", () => {
  console.log(
    `Bot is up and running, with ${util.discord.getOnlineUsers(
      bot.users
    )} online users, in ${util.discord.getTextChannels(
      bot.channels
    )} text channels and ${util.discord.getVoiceChannels(
      bot.channels
    )} voice channels.`
  );
  bot.user.setActivity(`Defining Words`);
});

bot.on("message", async message => {
  if (message.author.bot || message.content.indexOf(config.prefix) !== 0)
    return;

  let args = util.discord.getAllArgs(message);
  const command = util.discord.getCommand(args);

  let botEmbed = {
    color: 000000
  };

  if (command === "define") {
    if (args.length > 0) {
      console.log(
        `Command [${config.prefix + command}] Received from ${
          message.author.username
        } at ${util.helpers.convertTime(message.createdTimestamp)}`
      );

      const word = args[0];

      util.http.getDefinition(word, response => {
        if (response.status === 404) {
          message.channel.send(response.message);

          return;
        }

        if (response.status === 200) {
          let field = {
            name: word,
            value: response.data.definition
          };

          botEmbed.title = "Definition";
          botEmbed.fields = [field];
          message.channel.send({ embed: botEmbed });
        } else {
          message.channel.send(response.message);
        }
      });
    } else {
      message.channel.send(
        "Please specify the word you would like to define! :smile:"
      );
    }
  }
});

bot.login(config.token);
