import { HttpResponse } from "msw"
import { setupServer } from "msw/node"

/**
 * The msw server to use for mocking API responses.
 */
export const mswServer = setupServer()

beforeAll(() => mswServer.listen())
afterEach(() => mswServer.resetHandlers())
afterAll(() => mswServer.close())

/**
 * Mocks a 204 response with no body.
 */
export const noContentResponse = () => new HttpResponse(null, { status: 204 })
