// @ts-nocheck
// Copied from: https://github.com/expo/expo/blob/main/packages/expo-sqlite/src/next/__mocks__/ExpoSQLiteNext.ts

jest.mock("../node_modules/expo-sqlite/build/next/ExpoSQLiteNext", () => {
  const assert = require("assert")
  const sqlite3 = require("better-sqlite3")

  /**
   * A sqlite3.Database wrapper with async methods and conforming to the NativeDatabase interface.
   */
  class NativeDatabase {
    sqlite3Db

    constructor(databaseName) {
      // eslint-disable-next-line new-cap
      this.sqlite3Db = new sqlite3(databaseName)
    }

    // #region Asynchronous API

    initAsync = jest.fn().mockResolvedValue(null)
    isInTransactionAsync = jest.fn().mockImplementation(async () => {
      return this.sqlite3Db.inTransaction
    })

    closeAsync = jest.fn().mockImplementation(async () => {
      return this.sqlite3Db.close()
    })

    execAsync = jest.fn().mockImplementation(async (source) => {
      return this.sqlite3Db.exec(source)
    })

    prepareAsync = jest
      .fn()
      .mockImplementation(async (nativeStatement, source) => {
        nativeStatement.sqlite3Stmt = this.sqlite3Db.prepare(source)
      })

    // #endregion

    // #region Synchronous API

    initSync = jest.fn()
    isInTransactionSync = jest
      .fn()
      .mockImplementation(() => this.sqlite3Db.inTransaction)

    closeSync = jest.fn().mockImplementation(() => this.sqlite3Db.close())
    execSync = jest
      .fn()
      .mockImplementation((source) => this.sqlite3Db.exec(source))

    prepareSync = jest.fn().mockImplementation((nativeStatement, source) => {
      nativeStatement.sqlite3Stmt = this.sqlite3Db.prepare(source)
    })

    // #endregion
  }

  /**
   * A sqlite3.Statement wrapper with async methods and conforming to the NativeStatement interface.
   */
  class NativeStatement {
    sqlite3Stmt = null
    iterator = null

    // #region Asynchronous API

    runAsync = jest
      .fn()
      .mockImplementation(
        (database, bindParams, bindBlobParams, shouldPassAsArray) =>
          Promise.resolve(
            this._run(
              normalizeSQLite3Args(
                bindParams,
                bindBlobParams,
                shouldPassAsArray
              )
            )
          )
      )

    stepAsync = jest.fn().mockImplementation((database) => {
      assert(this.sqlite3Stmt)
      if (this.iterator == null) {
        this.iterator = this.sqlite3Stmt.iterate()
        // Since the first row is retrieved by `_run()`, we need to skip the first row here.
        this.iterator.next()
      }
      const result = this.iterator.next()
      const columnValues =
        result.done === false ? Object.values(result.value) : null
      return Promise.resolve(columnValues)
    })

    getAllAsync = jest
      .fn()
      .mockImplementation((database) => Promise.resolve(this._allValues()))

    getColumnNamesAsync = jest.fn().mockImplementation(async (database) => {
      assert(this.sqlite3Stmt)
      return this.sqlite3Stmt.columns().map((column) => column.name)
    })

    resetAsync = jest.fn().mockImplementation(async (database) => {
      this._reset()
    })

    finalizeAsync = jest.fn().mockImplementation(async (database) => {
      this._finalize()
    })

    // #endregion

    // #region Synchronous API

    runSync = jest
      .fn()
      .mockImplementation(
        (database, bindParams, bindBlobParams, shouldPassAsArray) =>
          this._run(
            normalizeSQLite3Args(bindParams, bindBlobParams, shouldPassAsArray)
          )
      )

    stepSync = jest.fn().mockImplementation((database) => {
      assert(this.sqlite3Stmt)
      if (this.iterator == null) {
        this.iterator = this.sqlite3Stmt.iterate()
        // Since the first row is retrieved by `_run()`, we need to skip the first row here.
        this.iterator.next()
      }

      const result = this.iterator.next()
      const columnValues =
        result.done === false ? Object.values(result.value) : null
      return columnValues
    })

    getAllSync = jest.fn().mockImplementation((database) => this._allValues())

    getColumnNamesSync = jest.fn().mockImplementation((database) => {
      assert(this.sqlite3Stmt)
      return this.sqlite3Stmt.columns().map((column) => column.name)
    })

    resetSync = jest.fn().mockImplementation((database) => {
      this._reset()
    })

    finalizeSync = jest.fn().mockImplementation((database) => {
      this._finalize()
    })

    // #endregion

    _run = (...params) => {
      assert(this.sqlite3Stmt)
      this.sqlite3Stmt.bind(...params)
      const result = this.sqlite3Stmt.run()

      // better-sqlite3 does not support run() returning the first row, use get() instead.
      let firstRow
      try {
        firstRow = this.sqlite3Stmt.get()
      } catch {
        // better-sqlite3 may throw `TypeError: This statement does not return data. Use run() instead`
        firstRow = null
      }
      return {
        lastInsertRowId: Number(result.lastInsertRowid),
        changes: result.changes,
        firstRowValues: firstRow ? Object.values(firstRow) : []
      }
    }

    _allValues = () => {
      assert(this.sqlite3Stmt)
      const sqlite3Stmt = this.sqlite3Stmt
      // Since the first row is retrieved by `_run()`, we need to skip the first row here.
      return sqlite3Stmt
        .all()
        .slice(1)
        .map((row) => Object.values(row))
    }

    _reset = () => {
      assert(this.sqlite3Stmt)
      this.iterator?.return?.()
      this.iterator = this.sqlite3Stmt.iterate()
    }

    _finalize = () => {
      this.iterator?.return?.()
      this.iterator = null
    }
  }

  // #endregion

  function normalizeSQLite3Args(bindParams, bindBlobParams, shouldPassAsArray) {
    if (shouldPassAsArray) {
      const result = []
      for (const [key, value] of Object.entries(bindParams)) {
        result[Number(key)] = value
      }
      for (const [key, value] of Object.entries(bindBlobParams)) {
        result[Number(key)] = value
      }
      return result
    }

    const replaceRegexp = /^[:@$]/
    const result = {}
    for (const [key, value] of Object.entries(bindParams)) {
      const normalizedKey = key.replace(replaceRegexp, "")
      result[normalizedKey] = value
    }
    for (const [key, value] of Object.entries(bindBlobParams)) {
      const normalizedKey = key.replace(replaceRegexp, "")
      result[normalizedKey] = value
    }
    return result
  }

  return {
    get name() {
      return "ExpoSQLiteNext"
    },

    deleteDatebaseAsync: jest.fn(),

    NativeDatabase: jest
      .fn()
      .mockImplementation(
        (databaseName, options) => new NativeDatabase(databaseName)
      ),

    NativeStatement: jest.fn().mockImplementation(() => new NativeStatement())
  }
})
