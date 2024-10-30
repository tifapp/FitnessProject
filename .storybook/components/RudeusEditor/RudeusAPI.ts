import { RudeusUserTokenStorage } from "./UserTokenStorage"
import { RUDEUS_API_URL } from "@env"
import {
  APIClientCreator,
  APISchema,
  ClientExtensions,
  endpointSchema,
  jwtMiddleware,
  tifAPITransport
} from "TiFShared/api"
import {
  APIValidationError,
  validateAPICall
} from "TiFShared/api/APIValidation"
import { chainMiddleware } from "TiFShared/lib/Middleware"
import { logger } from "TiFShared/logging"
import { z } from "zod"
import {
  HapticPatternSchema,
  RudeusPatternSchema,
  RudeusPlatformSchema,
  RudeusUserSchema
} from "./Models"

const log = logger("rudeus.api")

export const RudeusAPI = (
  tokenStorage: RudeusUserTokenStorage,
  baseURL?: URL
) => {
  const middleware = chainMiddleware(
    validateRudeusAPICall,
    jwtMiddleware(async () => await tokenStorage.token()),
    tifAPITransport(new URL(baseURL ?? RUDEUS_API_URL))
  )
  return APIClientCreator(RudeusAPISchema, middleware)
}

export const TEST_RUDEUS_URL = new URL("http://localhost:8080")

export type RudeusAPI = ReturnType<typeof RudeusAPI>

export const RudeusAPISchema = {
  register: endpointSchema({
    input: { body: z.object({ name: z.string() }) },
    outputs: {
      status201: RudeusUserSchema.extend({ token: z.string() })
    },
    httpRequest: { method: "POST", endpoint: "/api/register" }
  }),
  savePattern: endpointSchema({
    input: {
      body: z.object({
        id: z.string().uuid().optional(),
        name: z.string(),
        ahapPattern: HapticPatternSchema,
        platform: RudeusPlatformSchema
      })
    },
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

const validateRudeusAPICall = validateAPICall<ClientExtensions>((result) => {
  if (result.validationStatus === "passed") {
    return result.response
  } else if (result.validationStatus === "invalid-request") {
    log.error(
      `Request to Rudeus API endpoint ${result.requestContext.endpointName} is not valid`,
      result.requestContext
    )
  } else if (result.validationStatus === "unexpected-response") {
    log.error(
      `Rudeus API endpoint ${result.requestContext.endpointName} responded unexpectedly`,
      result.response
    )
  } else if (result.validationStatus === "invalid-response") {
    log.error(
      `Response from Rudeus API endpoint ${result.requestContext.endpointName} does not match the expected schema`,
      result.response
    )
  }
  throw new APIValidationError(result.validationStatus)
})
