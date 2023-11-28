import dotenv from "dotenv"
import fs from "fs"
import https from "https"
import jwt from "jsonwebtoken"

const sendSlackMessage = (webhookUrl, message) => {
  const data = JSON.stringify(message)

  const url = new URL(webhookUrl)
  const options = {
    hostname: url.hostname,
    path: url.pathname,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length
    }
  }

  const req = https.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`)

    res.on("data", (d) => {
      process.stdout.write(d)
    })
  })

  req.on("error", (error) => {
    console.error(error)
  })

  req.write(data)
  req.end()
}

const getPredictedBuildTime = () => {
  const now = new Date()

  now.setMinutes(now.getMinutes() + 15)

  return now.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  })
}

dotenv.config()

const jwtToken = jwt.sign(
  {
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 5 * 60,
    iss: process.env.GITHUB_APP_ID
  },
  process.env.GITHUB_APP_PRIVATE_KEY ?? "",
  { algorithm: "RS256" }
)

const fetchInstallationId = async () => {
  const options = {
    hostname: "api.github.com",
    path: "/app/installations",
    method: "GET",
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "NodeJS-Http-Request"
    }
  }

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = ""
      res.on("data", (chunk) => {
        data += chunk
      })
      res.on("end", () => {
        const installations = JSON.parse(data)
        const installationId = installations[0]?.id
        resolve(installationId)
      })
    })

    req.on("error", (error) => {
      console.error("Error fetching installations:", error)
      reject(error)
    })

    req.end()
  })
}

const fetchInstallationAccessToken = async (
  /** @type {string} */ installationId
) => {
  const options = {
    hostname: "api.github.com",
    path: `/app/installations/${installationId}/access_tokens`,
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "NodeJS-Http-Request"
    }
  }

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = ""
      res.on("data", (chunk) => {
        data += chunk
      })
      res.on("end", () => {
        const response = JSON.parse(data)
        const accessToken = response.token
        resolve(accessToken)
      })
    })

    req.on("error", (error) => {
      console.error("Error fetching installation access token:", error)
      reject(error)
    })

    req.end()
  })
}

const manageCheckRun = async (action = "create") => {
  console.log(JSON.stringify(process.env, null, 4))
  let checkRunParams = {}
  let checkRunId = ""
  if (action !== "create") {
    checkRunId = fs.readFileSync("checkRunId.txt", "utf8")
    checkRunParams = {
      checkRunId,
      name: "EAS Build",
      status: "completed",
      completed_at: new Date().toISOString(),
      conclusion: action
    }
  }
  const checkRunIdPath = action !== "create" ? `/${checkRunId}` : ""
  let checkRunData

  switch (action) {
  case "success":
    checkRunData = {
      ...checkRunParams,
      output: {
        title: "Build Completed",
        summary: `https://expo.dev/accounts/tifapp/projects/FitnessApp/builds/${process.env.EAS_BUILD_ID}`
      }
    }
    break
  case "failure":
    checkRunData = {
      ...checkRunParams,
      output: {
        title: "Build Failed",
        summary: "Build failed with an error.",
        text: `https://expo.dev/accounts/tifapp/projects/FitnessApp/builds/${process.env.EAS_BUILD_ID}`
      }
    }
    break
  case "cancelled":
    checkRunData = {
      ...checkRunParams,
      output: {
        title: "Build Cancelled",
        summary: "Build was cancelled."
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
        summary: `Build will be finished at approximately ${getPredictedBuildTime()}`
      }
    }
  }

  const postData = JSON.stringify(checkRunData)
  const installationId = await fetchInstallationId()
  const accessToken = await fetchInstallationAccessToken(installationId)

  const method = action === "create" ? "POST" : "PATCH"
  const options = {
    hostname: "api.github.com",
    path: `/repos/${process.env.GITHUB_REPOSITORY}/check-runs${checkRunIdPath}`,
    method,
    headers: {
      Authorization: `token ${accessToken}`,
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
      try {
        console.log(data)
        const responseObj = JSON.parse(data)
        const checkRunId = responseObj.id
        console.log("Check Run ID:", checkRunId)

        fs.writeFileSync("checkRunId.txt", checkRunId.toString())
      } catch (error) {
        console.error("Error parsing response data:", error)
      }
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

sendSlackMessage("YOUR_SLACK_WEBHOOK_URL", {
  text: "Hello, this is a test message from Node.js!"
})
