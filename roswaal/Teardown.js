import { roswaalClient } from "./Client"
import detoxTeardown from "detox/runners/jest/globalTeardown"

module.exports = async () => {
  await detoxTeardown()
  await roswaalClient.upload()
}
