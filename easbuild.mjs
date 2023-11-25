import dotenv from "dotenv"
import https from "https"
import jwt from "jsonwebtoken"

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

const manageCheckRun = (action = "create") => {
  let checkRunData

  switch (action) {
  case "update":
    checkRunData = {
      check_run_id: process.env.CHECK_RUN_ID,
      name: "EAS Build",
      status: "completed",
      conclusion: "success",
      completed_at: new Date().toISOString(),
      output: {
        title: "Build Completed",
        summary: "Build completed successfully.",
        text: "Detailed build information here."
      }
    }
    break
  case "error":
    checkRunData = {
      check_run_id: process.env.CHECK_RUN_ID,
      name: "EAS Build",
      status: "completed",
      conclusion: "failure",
      completed_at: new Date().toISOString(),
      output: {
        title: "Build Failed",
        summary: "Build failed with an error.",
        text: "Error details here."
      }
    }
    break
  case "cancel":
    checkRunData = {
      check_run_id: process.env.CHECK_RUN_ID,
      name: "EAS Build",
      status: "completed",
      conclusion: "cancelled",
      completed_at: new Date().toISOString(),
      output: {
        title: "Build Cancelled",
        summary: "Build was cancelled.",
        text: "Cancellation details here."
      }
    }
    break
  default:
    checkRunData = {
      name: "EAS Build",
      status: "in_progress",
      started_at: new Date().toISOString(),
      head_sha: process.env.GITHUB_SHA,
      output: {
        title: "Build Started",
        summary: "Build started successfully.",
        text: "Detailed build information here."
      }
    }
  }

  const postData = JSON.stringify(checkRunData)

  const method = action === "create" ? "PATCH" : "POST"
  const checkRunIdPath =
    action !== "create" ? `/${process.env.CHECK_RUN_ID}` : ""
  const options = {
    hostname: "api.github.com",
    path: `/repos/${process.env.GITHUB_REPOSITORY}/check-runs${checkRunIdPath}`,
    method,
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "NodeJS-Http-Request",
      "Content-Type": "application/json",
      "Content-Length": postData.length
    }
  }

  const req = https.request(options, (res) => {
    let data = ""
    res.on("data", (chunk) => {
      data += chunk
    })
    res.on("end", () => {
      console.log(data)
    })
  })

  req.on("error", (error) => {
    console.error("Error managing check run:", error)
  })

  req.write(postData)
  req.end()
}

const action = process.argv[2] || "create"
manageCheckRun(action)
