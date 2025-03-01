import { RUDEUS_API_URL } from "@env"
import {
  APIClientCreator,
  APISchema,
  apiTransport,
  endpointSchema,
  jwtMiddleware,
  requestIdMiddleware,
  requestLoggingMiddleware
} from "TiFShared/api"
import { validateAPIClientCall } from "TiFShared/api/APIValidation"
import { chainMiddleware } from "TiFShared/lib/Middleware"
import { logger } from "TiFShared/logging"
import { z } from "zod"
import {
  RudeusPatternSchema,
  RudeusSharePatternRequestSchema,
  RudeusUserSchema
} from "./Models"
import { RudeusUserStorage } from "./UserStorage"

const log = logger("rudeus.api")

export const RudeusAPISchema = {
  register: endpointSchema({
    input: { body: z.object({ name: z.string() }) },
    outputs: {
      status201: RudeusUserSchema.extend({ token: z.string() })
    },
    httpRequest: { method: "POST", endpoint: "/api/register" }
  }),
  sharePattern: endpointSchema({
    input: { body: RudeusSharePatternRequestSchema },
    outputs: {
      status200: RudeusPatternSchema,
      status201: RudeusPatternSchema
    },
    httpRequest: { method: "POST", endpoint: "/api/pattern" }
  }),
  patterns: endpointSchema({
    input: {},
    outputs: {
      status200: z.object({ patterns: z.array(RudeusPatternSchema) })
    },
    httpRequest: { method: "GET", endpoint: "/api/pattern" }
  })
} satisfies APISchema

export const RudeusAPI = (tokenStorage: RudeusUserStorage, baseURL?: URL) => {
  const middleware = chainMiddleware(
    validateAPIClientCall("Rudeus", log),
    requestIdMiddleware(),
    requestLoggingMiddleware("rudeus"),
    jwtMiddleware(async () => await tokenStorage.token()),
    apiTransport("Rudeus", new URL(baseURL ?? RUDEUS_API_URL), log)
  )
  return APIClientCreator(RudeusAPISchema, middleware)
}

export const TEST_RUDEUS_URL = new URL("http://localhost:8080")

export type RudeusAPI = ReturnType<typeof RudeusAPI>
