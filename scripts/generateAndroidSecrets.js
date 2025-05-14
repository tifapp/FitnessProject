const { writeFileSync } = require("fs")
const { join } = require("path")
const dotenv = require("dotenv")

dotenv.config({ path: ".env" })
dotenv.config({ path: ".env.infra" })

const ensureMapsApiKey = () => {
  const key = process.env.MAPS_API_KEY
  if (!key) {
    throw new Error(`
No Google Maps API Key was found in the environment. Make sure to set MAPS_API_KEY
in your EAS Build environment variables or .env before building.
`)
  }
  return key
}

const key = ensureMapsApiKey()
const secretsFilePath = join(__dirname, "..", "android", "secrets.properties")
writeFileSync(secretsFilePath, `MAPS_API_KEY=${key}\n`, "utf8")
console.log(`✅ Wrote secrets.properties with MAPS_API_KEY to: ${secretsFilePath}`)
