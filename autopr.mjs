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

const getCardDetails = async (cardId) => {
  const url = `https://api.trello.com/1/cards/${cardId.replace(/^TASK_/i, "")}?key=${envVars.TRELLO_API_KEY}&token=${envVars.TRELLO_API_TOKEN}`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(response.statusText || "Failed to fetch task details.")
    }
    const data = await response.json()
    console.log("Found task details.")
    return { title: data.name, description: data.desc }
  } catch (error) {
    console.error(error.message)
    return { title: "", description: "" }
  }
}

const execAsync = promisify(exec)

let givenCardId = process.argv.slice(2)[0]

if (givenCardId) {
  if (/^TASK_\w+$/i.test(givenCardId)) {
    console.log("Card ID found in args")
  } else {
    console.error("Invalid card ID format. Expected format is 'TASK_xxx'.")
    process.exit(1)
  }
}

const getGitRemoteUrl = async () => {
  try {
    const { stdout } = await execAsync("git config --get remote.origin.url")
    return stdout.trim()
  } catch (error) {
    console.error("Error getting Git remote URL:", error)
    return null
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

  if (!givenCardId) {
    const match = currentBranch.match(/task_\w+/i)
    if (match) {
      givenCardId = match[0].replace(/^task_/i, "")
      console.log("Card ID found in branch name")
    }
  }

  let prTitle = currentBranch
  let prBody = ""

  if (givenCardId) {
    const details = await getCardDetails(givenCardId)
    prTitle = encodeURIComponent(`${givenCardId} ${details.title}`)
    prBody = encodeURIComponent(
      `${details.description}\n\nTrello Card ID: ${givenCardId}`
    )
  } else {
    console.log("No linked card ID found.")
  }

  const prUrl = `${remoteUrl}/compare/development...${currentBranch}?expand=1&title=${prTitle}&body=${prBody}`
  console.log("Opening PR form...")
  open(prUrl)
}

openPR()
