import { Filesystem } from "@lib/Filesystem"
import fs from "fs"
import path from "path"

const TEST_DIRECTORY = "test-fs/"

/**
 * A file system to use for tests.
 *
 * Under the hood, this uses the standard node filesystem apis, so at the very
 * least "a" file system can be used for tests.
 *
 * You can only create an instance of this class via the `create` method, as that
 * will cleanup the file system inbetween tests.
 * ```ts
 * const fs = TestFilesystem.create()
 * ```
 */
export class TestFilesystem implements Filesystem {
  // eslint-disable-next-line no-useless-constructor
  private constructor () {}

  async appendString (filepath: string, data: string) {
    const dirname = path.dirname(TEST_DIRECTORY + filepath)
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true })
    }
    fs.appendFileSync(TEST_DIRECTORY + filepath, data)
  }

  /**
   * Reads the contents of a given file at the path.
   */
  readString (filepath: string) {
    try {
      return fs.readFileSync(TEST_DIRECTORY + filepath, "utf-8")
    } catch {
      return undefined
    }
  }

  private setup () {
    fs.mkdirSync(TEST_DIRECTORY)
  }

  private cleanup () {
    fs.rmSync(TEST_DIRECTORY, { recursive: true })
  }

  static create () {
    const fs = new TestFilesystem()
    beforeEach(() => fs.setup())
    afterEach(() => fs.cleanup())
    return fs
  }
}
