const Discord = require("discord.js");
const config = require("./config.json");
const util = require("./util");
const http = require("http");

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

    http.get({});

    const m = await message.channel.send("Pong!");
  }
});

bot.login(config.token);
