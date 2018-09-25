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

      const options = {
        hostname: "od-api.oxforddictionaries.com",
        path: `/api/v1/entries/en/${word}/definitions`,
        headers: {
          app_id: config.app_id,
          app_key: config.app_key
        }
      };

      let definition;

      https
        .get(options, res => {
          if (res.statusCode === 404) {
            message.channel.send(
              "I couldn't find the word you were looking for :cry:"
            );
            return;
          }

          if (res.statusCode === 200) {
            let data = "";

            res.on("data", chunk => {
              data += chunk;
            });

            res.on("end", () => {
              definition = JSON.parse(data).results[0].lexicalEntries[0]
                .entries[0].senses[0].definitions[0];

              // Capitalise the first letter
              definition =
                definition.charAt(0).toUpperCase() + definition.slice(1);

              let field = {
                name: word,
                value: definition
              };

              botEmbed.title = "Definition";
              botEmbed.fields = [field];
              // message.channel.send(`${word} is defined as: "${definition}"`);
              message.channel.send({ embed: botEmbed });
            });

            return;
          } else {
            message.channel.send(
              "There was an error with your request :thinking:"
            );
          }
        })
        .on("error", err => {
          console.log("Error: ", err);
        });
    } else {
      message.channel.send(
        "Please specify the word you would like to define! :smile:"
      );
    }
  }
});

bot.login(config.token);
