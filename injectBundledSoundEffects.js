const { spawnSync } = require("child_process")
const fs = require("fs")
const path = require("path")

const inFiles = fs.readdirSync("./bundled-sound-effects")
const outFiles = inFiles
  .map((file) => file.replace(".mp3", ".caf"))
  .map((file) => path.join(__dirname, "ios", "FitnessApp", file))
for (let i = 0; i < inFiles.length; i++) {
  spawnSync("afconvert", [
    path.join(__dirname, "bundled-sound-effects", inFiles[i]),
    outFiles[i],
    "-d",
    "ima4",
    "-f",
    "caff",
    "-v"
  ])
}
console.log("Converted Bundled Sound Effects")
