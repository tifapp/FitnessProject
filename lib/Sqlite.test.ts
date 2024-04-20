import { testSQLite } from "@test-helpers/SQLite"
import {
  SQLITE_IN_MEMORY_PATH,
  TiFSQLite,
  openExpoSQLExecutable
} from "./SQLite"

describe("SQLite tests", () => {
  beforeEach(async () => {
    await testSQLite.withTransaction(async (db) => {
      await db.run`CREATE TABLE test (id BIGINT NOT NULL PRIMARY KEY)`
    })
  })
  afterEach(async () => {
    await testSQLite.withTransaction(async (db) => {
      await db.run`DROP TABLE IF EXISTS test`
    })
  })

  test("basic query", async () => {
    const result = await testSQLite.withTransaction(async (db) => {
      return await db.queryFirst<{
        value: number
      }>`SELECT TRUE AS value`
    })
    expect(result).toEqual({ value: 1 })
  })

  test("basic insertion", async () => {
    const result = await testSQLite.withTransaction(async (db) => {
      return await db.run`INSERT INTO test (id) VALUES (1)`
    })
    expect(result).toEqual({ rowsAffected: 1, lastInsertId: 1 })
  })

  it("should serialize consecutive transactions", async () => {
    let resolvePromise: (() => void) | undefined
    const promise = new Promise<void>((resolve) => {
      resolvePromise = resolve
    })
    const promise1 = testSQLite.withTransaction(async (db) => {
      await promise
      await db.run`INSERT INTO test (id) VALUES (3)`
    })
    const transaction2 = jest.fn().mockImplementationOnce(async (db) => {
      await db.run`DELETE FROM test WHERE id = 3`
    })
    const promise2 = testSQLite.withTransaction(transaction2)
    resolvePromise?.()

    await promise1
    expect(transaction2).not.toHaveBeenCalled()

    await promise2
    const ids = await testSQLite.withTransaction(async (db) => {
      return await db.queryAll<{ id: number }>`SELECT * FROM test`
    })
    expect(ids).toEqual([])
  })

  it("should handle transaction errors properly", async () => {
    const error = new Error("test")
    const promise = testSQLite.withTransaction(async (db) => {
      await db.run`INSERT INTO test (id) VALUES (2)`
      throw error
    })
    await expect(promise).rejects.toEqual(error)
    const id = await testSQLite.withTransaction(async (db) => {
      return await db.queryFirst`SELECT * FROM test`
    })
    expect(id).toBeUndefined()
  })

  it("should fallback to an in memory database if opening at the path fails", async () => {
    const open = jest.fn().mockImplementation(async (path: string) => {
      if (path === SQLITE_IN_MEMORY_PATH) {
        return await openExpoSQLExecutable(path)
      }
      throw new Error()
    })
    const sqlite = new TiFSQLite("hello/world", open)
    const result = await sqlite.withTransaction(async (db) => {
      return await db.queryFirst<{ value: number }>`SELECT TRUE AS value`
    })
    expect(result).toEqual({ value: 1 })
  })
})
