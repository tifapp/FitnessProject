/* eslint-disable @typescript-eslint/naming-convention */
import dotenv from "dotenv"
import fs from "fs"
import https from "https"
import jwt from "jsonwebtoken"
import fetch from "node-fetch"
import qrcode from "qrcode"

dotenv.config({ path: ".env.infra" })

const outputChannel = "C01BRGR9SHM"

const action = process.argv[2]
const checkRunName = "EAS Build"

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

  try {
    // Step 1: Get the upload URL
    const getUploadURLResponse = await fetch("https://slack.com/api/files.getUploadURLExternal", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SLACK_APP_ID}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        filename: "qrcode.png",
        length: imageBuffer.length,
        snippet_type: "png"
      })
    })

    const uploadURLData = await getUploadURLResponse.json()

    if (!uploadURLData.ok) {
      throw new Error(`Failed to get upload URL: ${uploadURLData.error}`)
    }

    // Step 2: Upload the file to the provided URL
    const uploadResponse = await fetch(uploadURLData.upload_url, {
      method: "PUT",
      headers: {
        "Content-Type": "image/png"
      },
      body: imageBuffer
    })

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload file: ${uploadResponse.statusText}`)
    }

    // Step 3: Complete the upload
    const completeUploadResponse = await fetch("https://slack.com/api/files.completeUploadExternal", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SLACK_APP_ID}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        files: [{
          id: uploadURLData.file_id,
          title: "QR Code",
          initial_comment: message,
          channels: channelId
        }]
      })
    })

    const completeUploadData = await completeUploadResponse.json()

    if (!completeUploadData.ok) {
      throw new Error(`Failed to complete upload: ${completeUploadData.error}`)
    }

    return completeUploadData
  } catch (error) {
    console.error("Error uploading file to Slack:", error)
    throw error
  }
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

const fetchInstallationId = async (/** @type {string} */ jwtToken) => {
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
  /** @type {string} */ installationId,
  /** @type {string} */ jwtToken
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

const githubJWT = () => {
  return jwt.sign(
    {
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 5 * 60,
      iss: process.env.BUILD_LISTENER_ID
    },
    process.env.BUILD_LISTENER_PRIVATE_KEY ?? "",
    { algorithm: "RS256" }
  )
}

const checkGithubActionRuns = async (
  /** @type {{ output: { title: string; summary: string; text?: undefined; }; name?: undefined; status?: undefined; started_at?: undefined; head_sha?: undefined; } | { output: { title: string; summary: string; text: string; }; name?: undefined; status?: undefined; started_at?: undefined; head_sha?: undefined; } | { name: string; status: string; started_at: string; head_sha: string | undefined; output: { title: string; summary: string; text?: undefined; }; }} */ checkRunData,
  /** @type {string} */ idPath
) => {
  const jwtToken = githubJWT()
  const installationId = await fetchInstallationId(jwtToken)
  const accessToken = await fetchInstallationAccessToken(
    installationId,
    jwtToken
  )

  const resp = await fetch(
    `https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/check-runs${idPath}`,
    {
      method: action === "create" ? "POST" : "PATCH",
      headers: {
        Authorization: `token ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "NodeJS-Http-Request",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(checkRunData)
    }
  )
    .then((resp) => resp.json())
    .catch((err) => {
      console.error("Error managing check run:", err)
    })

  console.log("Updated github check run")

  // @ts-ignore
  fs.writeFileSync("checkRunId.txt", resp.id.toString())
}

const manageCheckRun = async (/** @type {string} */ action) => {
  let checkRunParams = {}
  let checkRunId = ""
  if (action !== "create") {
    checkRunId = fs.readFileSync("checkRunId.txt", "utf8")
    checkRunParams = {
      checkRunId,
      name: checkRunName,
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
        title: `${checkRunName} Completed`,
        summary: buildLink
      }
    }
    break
  case "failure":
    checkRunData = {
      ...checkRunParams,
      output: {
        title: `${checkRunName} Failed`,
        summary: "Build failed with an error.",
        text: buildLink
      }
    }
    break
  case "cancelled":
    checkRunData = {
      ...checkRunParams,
      output: {
        title: `${checkRunName} Cancelled`,
        summary: "Build was cancelled."
      }
    }
    break
  default:
    checkRunData = {
      name: checkRunName,
      status: "in_progress",
      started_at: new Date().toISOString(),
      head_sha: process.env.GITHUB_SHA,
      output: {
        title: `${checkRunName} Started`,
        summary: `Build will be finished at approximately ${getPredictedBuildTime()}`
      }
    }
  }

  await checkGithubActionRuns(checkRunData, checkRunIdPath)

  if (action === "success") {
    const buildqr = await qrcode.toDataURL(buildLink)
    await sendImageToSlack(buildqr, `${checkRunName} is ready:\n${buildLink}`)
  }
  if (action === "failure") {
    await sendMessageToSlack(
      `${checkRunName} failed. See details at\n${buildLink}`
    )
  }
  if (action === "create") {
    await sendMessageToSlack(
      `A new development build has started. ${checkRunName} will be finished at approximately *${getPredictedBuildTime()}*. See details at\n${buildLink}\nCommit: ${process.env.GITHUB_SHA}`
    )
  }

  console.log("Sent build status to slack")
}

if (process.env.RUN_EAS_BUILD_HOOKS === "1") {
  manageCheckRun(action)
}
