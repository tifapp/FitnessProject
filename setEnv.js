/* eslint-disable @typescript-eslint/naming-convention */
const fs = require("fs")
const path = require("path")

const envVariable = process.argv[2] ?? "PROD_API_URL"

const envInfraPath = path.join(__dirname, ".env.infra")
const envPath = path.join(__dirname, ".env")

const envInfra = fs.readFileSync(envInfraPath, "utf8")
const regex = new RegExp(`^${envVariable}=(.*)$`, "m")
const match = envInfra.match(regex)
if (!match) {
  console.error(`Variable ${envVariable} not found in .env.infra`)
  process.exit(1)
}
const apiUrl = match[1]

let env = fs.readFileSync(envPath, "utf8")
env = env.replace(/^API_URL=.*$/m, `API_URL=${apiUrl}`)

fs.writeFileSync(envPath, env)

console.log(`API_URL updated to ${envVariable} from .env.infra.`)
