import dotenv from "dotenv"
import jwt from "jsonwebtoken"
import { Octokit } from "octokit"

dotenv.config()
const jwtToken = jwt.sign(
  {
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 10 * 60,
    iss: process.env.GITHUB_APP_ID
  },
  process.env.GITHUB_APP_PRIVATE_KEY ?? "",
  { algorithm: "RS256" }
)

const octokit = new Octokit({ auth: jwtToken })

const createCheckRun = async () => {
  try {
    const apiUrl = `/repos/${process.env.GITHUB_REPOSITORY}/check-runs`
    const response = await octokit.request(`POST ${apiUrl}`, {
      owner: "tifapp",
      repo: "FitnessProject",
      name: "EAS Build",
      status: "in_progress",
      started_at: new Date().toISOString(),
      head_sha: process.env.GITHUB_SHA,
      output: {
        title: "Build Started",
        summary: "Build started successfully.",
        text: "Detailed build information here."
      },
      headers: {
        "X-GitHub-Api-Version": "2022-11-28"
      }
    })
  } catch (error) {
    console.error("Error updating check run:", error)
  }
}

createCheckRun()
