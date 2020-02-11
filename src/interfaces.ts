interface IConfig {
  token: string;
  prefix: string;
  app_id: string;
  app_key: string;
}

interface ISimpleOxfordResponse {
  results: [
    {
      lexicalEntries: [{}];
    }
  ];
}

interface IFirstDefinitionEntry {
  entries: [
    {
      senses: [{ definitions: string[] }];
    }
  ];
  lexicalCategory: { text: string };
}

interface IDefinitionObject {
  data: {
    definition?: string;
    lexicalCategory?: string;
  };
  message: string;
  status: number;
}
