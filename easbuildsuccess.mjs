import dotenv from "dotenv"
import nodeFetch from "node-fetch"

dotenv.config()
console.log(JSON.stringify(process.env, null, 4))
;(async () => {
  console.log(JSON.stringify(process.env, null, 4))
  const token = process.env.GH_TOKEN
  const repoFullName = process.env.GITHUB_REPOSITORY
  const apiUrl = `https://api.github.com/repos/${repoFullName}/check-runs/${process.env.CHECK_RUN_ID}`

  const response = await nodeFetch(apiUrl, {
    method: "PATCH",
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28"
    },
    body: JSON.stringify({
      name: "EAS Build",
      head_sha: process.env.GITHUB_SHA,
      status: "completed",
      conclusion: "success",
      completed_at: new Date().toISOString(),
      output: {
        title: "EAS Build Completed",
        summary: "The build has completed.",
        text: "Build completed with conclusion: success."
      }
    })
  })

  if (!response.ok) {
    const errorDetails = await response.text()
    throw new Error(
      `GitHub API responded with ${response.status}: ${errorDetails}`
    )
  }

  const data = await response.json()
  return data
})()
