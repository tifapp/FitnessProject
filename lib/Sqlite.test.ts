import { openDatabaseAsync } from "expo-sqlite/next"

describe("SQLite tests", () => {
  test("sqlite", async () => {
    const db = await openDatabaseAsync(":memory:")
    const result = await db.getFirstAsync("SELECT TRUE")
    console.log(result)
  })
})
