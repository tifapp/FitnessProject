import { setupServer } from "msw/node"

/**
 * The msw server to use for mocking API responses.
 */
export const mswServer = setupServer()

beforeAll(() => mswServer.listen())
afterEach(() => mswServer.resetHandlers())
afterAll(() => mswServer.close())
