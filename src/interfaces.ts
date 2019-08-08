interface Config {
  token: string,
  prefix: string,
  app_id: string,
  app_key: string
}


interface SimpleOxfordResponse {
  results: [
    {
      lexicalEntries: [
        {

        }
      ]
    }
  ]
}

interface FirstDefinitionEntry {
  entries: [
    {
      senses: [{ definitions: string[] }]
    }
  ],
  lexicalCategory: { text: string }
}

interface DefinitionObject {
  data: {
    definition?: string,
    lexicalCategory?: string
  },
  message: string,
  status: number
}
