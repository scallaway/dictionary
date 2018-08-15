const Discord = require("discord.js");
const config = require("./config.json");
const util = require("./util");
const https = require("https");

const bot = new Discord.Client();

bot.on("ready", () => {
  console.log(
    `Bot is up and running, with ${util.discord.getOnlineUsers(
      bot.users
    )} online users, in ${bot.channels.size} channels.`
  );
});

bot.on("message", async message => {
  if (message.author.bot) return;

  if (message.content.indexOf(config.prefix) !== 0) return;

  const command = util.discord.getCommand(message);

  if (command === "dictionary") {
    console.log(
      `Command [${config.prefix + command}] Received from ${
        message.author.username
      } at ${util.helpers.convertTime(message.createdTimestamp)}`
    );

    const word = "test";

    const options = {
      hostname: "od-api.oxforddictionaries.com",
      path: `/api/v1/entries/en/${word}`,
      headers: {
        app_id: "9e0315b8",
        app_key: "59cccf9d0c734fd1c5a1f46030375ac5"
      }
    };

    https
      .get(options, res => {
        let data = "";

        res.on("data", chunk => {
          data += chunk;
        });

        res.on("end", () => {
          console.log(
            JSON.parse(data).results[0].lexicalEntries[0].entries[0].senses[0]
              .definitions[0]
          );
        });
      })
      .on("error", err => {
        console.log("Error: ", err);
      });

    const m = await message.channel.send("Pong!");
  }
});

bot.login(config.token);
