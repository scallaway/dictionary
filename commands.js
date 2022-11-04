import { SlashCommandBuilder } from "discord.js";
import got from "got";

const define = {
  data: new SlashCommandBuilder()
    .setName("define")
    .setDescription(
      "Returns the definition of a file from the Oxford Dictionary"
    )
    .addStringOption((option) =>
      option
        .setName("word")
        .setDescription("The word to define")
        .setRequired(true)
    ),

  async execute(interaction) {
    const word = interaction.options.getString("word");
    const { definition, error } = await getDefinition(word);

    if (error) {
      await interaction.reply(error);
      return;
    }

    await interaction.reply(`Definition: ${definition}`);
  },
};

async function getDefinition(word) {
  const { response, error } = await fetchFromOxford(word);

  if (error) {
    if (error.statusCode !== 404) {
      return { error: "Couldn't find the word you were looking to define" };
    }

    return {
      error: "Internal Sever Error, check the console.",
    };
  }

  return { definition: parseDefinition(response) };
}

function parseDefinition(response) {
  return response.results[0].lexicalEntries[0].entries[0].senses[0]
    .definitions[0];
}

async function fetchFromOxford(word) {
  const url = `https://od-api.oxforddictionaries.com/api/v2/entries/en-gb/${word}?fields=definitions`;

  const options = {
    headers: {
      app_id: process.env.OXFORD_APP_ID,
      app_key: process.env.OXFORD_APP_KEY,
    },
  };

  return got(url, options)
    .then((response) => {
      return { response: JSON.parse(response.body) };
    })
    .catch((error) => {
      return { error: error.response };
    });
}

export const commands = [define];
