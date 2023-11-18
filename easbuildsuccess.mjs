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

const updateCheckRun = async () => {
  try {
    const apiUrl = `/repos/${process.env.GITHUB_REPOSITORY}/check-runs/${process.env.CHECK_RUN_ID}`
    const response = await octokit.request(`PATCH ${apiUrl}`, {
      owner: "tifapp",
      repo: "FitnessProject",
      check_run_id: process.env.CHECK_RUN_ID,
      name: "EAS Build",
      status: "completed",
      conclusion: "success",
      completed_at: new Date().toISOString(),
      output: {
        title: "Build Result",
        summary: "Build completed successfully.",
        text: "Detailed build information here."
      }
    })
  } catch (error) {
    console.error("Error updating check run:", error)
  }
}

updateCheckRun()
