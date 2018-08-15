const Discord = require("discord.js");
const config = require("./config.json");
const util = require("./util");
const https = require("https");

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

  if (command === "dictionary") {
    if (args.length > 0) {
      console.log(
        `Command [${config.prefix + command}] Received from ${
          message.author.username
        } at ${util.helpers.convertTime(message.createdTimestamp)}`
      );

      const word = args[0];

      const options = {
        hostname: "od-api.oxforddictionaries.com",
        path: `/api/v1/entries/en/${word}`,
        headers: {
          app_id: config.app_id,
          app_key: config.app_key
        }
      };

      let definition;

      https
        .get(options, res => {
          let data = "";

          res.on("data", chunk => {
            data += chunk;
          });

          res.on("end", () => {
            definition = JSON.parse(data).results[0].lexicalEntries[0]
              .entries[0].senses[0].definitions[0];
            message.channel.send(`${word} is defined as: "${definition}"`);
          });
        })
        .on("error", err => {
          console.log("Error: ", err);
        });
    }
  }
});

bot.login(config.token);
