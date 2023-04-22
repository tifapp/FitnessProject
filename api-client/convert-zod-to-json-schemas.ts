const fs = require("fs")
const path = require("path")
const zodToJsonSchema = require("zod-to-json-schema")
const schemaDirectory = "./schemas"

function convertAllSchemas () {
  const files = fs.readdirSync(schemaDirectory)

  for (const file of files) {
    const filePath = path.join(schemaDirectory, file)
    const schemaModule = require(filePath)

    for (const schemaName in schemaModule) {
      const zodSchema = schemaModule[schemaName]
      const jsonSchema = zodToJsonSchema(zodSchema)

      const outputFilename = path.join(
        schemaDirectory,
        "json-schemas",
        `${schemaName}.json`
      )
      fs.writeFileSync(outputFilename, JSON.stringify(jsonSchema, null, 2))
    }
  }
}

convertAllSchemas()
