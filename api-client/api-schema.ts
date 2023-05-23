/* eslint-disable @typescript-eslint/naming-convention */

import { z } from "zod"
import { Endpoint, GenericApiSchema } from "./api-endpoint-types"

const payloadSchema = z.object({
  id: z.number()
})

const responseSchema = z.any()

const typecheckApiSchema = <T extends Endpoint>(
  schema: T
): GenericApiSchema<T> => {
  return schema
}

export const ApiSchema = typecheckApiSchema({
  "/lambdaSQLRoute/user": {
    GET: {
      responseType: responseSchema
    }
  }
})
