import { MessageEmbedField } from "discord.js";

export interface IConfig {
  token: string;
  prefix: string;
  app_id: string;
  app_key: string;
}

export interface IEmbedField {
  name: string;
  value: string;
}

export interface IBotEmbed {
  color: number;
  title: string;
  fields: Array<IEmbedField>;
}

export interface IFirstDefinitionEntry {
  entries: [
    {
      senses: [{ definitions: string[] }];
    }
  ];
  lexicalCategory: { text: string };
}

export interface IDefinitionObject {
  data: {
    definition: string;
    lexicalCategory: string;
  };
  message: string;
  status: number;
}
