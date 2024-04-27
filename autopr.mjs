// new feature here
// @ts-nocheck
import { exec } from "child_process"
import dotenv from "dotenv"
import fetch from "node-fetch"
import open from "open"
import { promisify } from "util"
import { z } from "zod"

dotenv.config({ path: ".env.infra" })

const envVars = z
  .object({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    TRELLO_API_KEY: z.string(),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    TRELLO_API_TOKEN: z.string()
  })
  .passthrough()
  .parse(process.env)

const execAsync = promisify(exec)

const args = process.argv.slice(2)
const arg = args[0]

if (arg && !/^TASK_\w+$/i.test(arg)) {
  console.error("Invalid arg format. Expected format is 'TASK_xxx'.")
  process.exit(1)
}

const realCardId = arg ? arg.replace(/^TASK_/i, "") : null

const getGitRemoteUrl = async () => {
  try {
    const { stdout } = await execAsync("git config --get remote.origin.url")
    return stdout.trim()
  } catch (error) {
    console.error("Error getting Git remote URL:", error)
    return null
  }
}

const getCardDetails = async (cardId) => {
  const url = `https://api.trello.com/1/cards/${cardId}?key=${envVars.TRELLO_API_KEY}&token=${envVars.TRELLO_API_TOKEN}`

  try {
    const response = await fetch(url)
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch task details.")
    }
    console.log("Found task details.")
    return { title: data.name, description: data.desc }
  } catch (error) {
    console.error(error.message)
    return { title: "", description: "" }
  }
}

const getCurrentBranch = async () => {
  try {
    const { stdout } = await execAsync("git rev-parse --abbrev-ref HEAD")
    return stdout.trim()
  } catch (error) {
    console.error("Error getting current git branch:", error)
    return null
  }
}

const openPR = async () => {
  const remoteUrl = await getGitRemoteUrl()
  const currentBranch = await getCurrentBranch()

  if (!currentBranch) {
    console.log("Could not determine the current branch.")
    return
  }

  let prTitle = currentBranch
  let prBody = ""

  if (realCardId) {
    const details = await getCardDetails(realCardId)
    prTitle = encodeURIComponent(`${arg} ${details.title}`)
    prBody = encodeURIComponent(details.description)
  } else {
    console.log("Could not find task name.")
  }

  const prUrl = `${remoteUrl}/compare/development...${currentBranch}?expand=1&title=${prTitle}&body=${prBody}`
  console.log("Opening PR form...")
  open(prUrl)
}

openPR()
