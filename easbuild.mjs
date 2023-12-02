import dotenv from "dotenv"
import fs from "fs"
import https from "https"
import jwt from "jsonwebtoken"
import qrcode from "qrcode"

const outputChannel = "C01B7FFKDCP"

const sendMessageToSlack = (
  /** @type {string} */ message,
  channelId = outputChannel
) => {
  const postData = JSON.stringify({
    channel: channelId,
    text: message
  })

  const options = {
    hostname: "slack.com",
    port: 443,
    path: "/api/chat.postMessage",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
      Authorization: `Bearer ${process.env.SLACK_APP_ID}`
    }
  }

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = ""
      res.on("data", (chunk) => (body += chunk))
      res.on("end", () => resolve(JSON.parse(body)))
    })

    req.on("error", (e) => {
      console.error(e)
      reject(e)
    })
    req.write(postData)
    req.end()
  })
}

const sendImageToSlack = async (
  /** @type {string} */ imageData,
  /** @type {string} */ message,
  channelId = outputChannel
) => {
  const imageBuffer = Buffer.from(imageData.split(",")[1], "base64")
  const boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
  const data = [
    "--" + boundary + "\r\n",
    "Content-Disposition: form-data; name=\"token\"\r\n\r\n",
    process.env.SLACK_BOT_TOKEN + "\r\n",
    "--" + boundary + "\r\n",
    "Content-Disposition: form-data; name=\"channels\"\r\n\r\n",
    channelId + "\r\n",
    "--" + boundary + "\r\n",
    "Content-Disposition: form-data; name=\"initial_comment\"\r\n\r\n",
    message + "\r\n",
    "--" + boundary + "\r\n",
    "Content-Disposition: form-data; name=\"file\"; filename=\"qrcode.png\"\r\n",
    "Content-Type: image/png\r\n\r\n",
    imageBuffer,
    "\r\n--" + boundary + "--"
  ]

  const options = {
    hostname: "slack.com",
    port: 443,
    path: "/api/files.upload",
    method: "POST",
    headers: {
      "Content-Type": "multipart/form-data; boundary=" + boundary
    }
  }

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = ""
      res.on("data", (chunk) => (body += chunk))
      res.on("end", () => resolve(JSON.parse(body)))
    })

    req.on("error", (e) => {
      console.error(e)
      reject(e)
    })
    for (const part of data) {
      if (Buffer.isBuffer(part)) {
        req.write(part)
      } else {
        req.write(part)
      }
    }
    req.end()
  })
}

const getPredictedBuildTime = (timeZone = "America/Los_Angeles") => {
  const now = new Date()

  now.setMinutes(now.getMinutes() + 15)

  return now.toLocaleString("en-US", {
    timeZone,
    timeZoneName: "short",
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

  const buildLink = `https://expo.dev/accounts/tifapp/projects/FitnessApp/builds/${process.env.EAS_BUILD_ID}`

  switch (action) {
  case "success":
    checkRunData = {
      ...checkRunParams,
      output: {
        title: "Build Completed",
        summary: buildLink
      }
    }
    break
  case "failure":
    checkRunData = {
      ...checkRunParams,
      output: {
        title: "Build Failed",
        summary: "Build failed with an error.",
        text: buildLink
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
        const responseObj = JSON.parse(data)
        const checkRunId = responseObj.id

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

  if (action === "success") {
    const buildqr = await qrcode.toDataURL(buildLink)
    await sendImageToSlack(buildqr, `Build is ready:\n${buildLink}`)
  }
  if (action === "failure") {
    await sendMessageToSlack(`Build failed. See details at\n${buildLink}`)
  }
  if (action === "create") {
    await sendMessageToSlack(
      `A new build has started. Build will be finished at approximately *${getPredictedBuildTime()}*. See details at\n${buildLink}`
    )
  }
}

const action = process.argv[2] || "create"
manageCheckRun(action)
