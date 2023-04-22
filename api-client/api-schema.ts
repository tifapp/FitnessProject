import { z } from "zod"

const payloadSchema = z.object({
  id: z.number()
})

const responseSchema = z.object({
  id: z.number(),
  username: z.string(),
  password: z.string()
})

export const ApiSchema = {
  "/user": {
    GET: {
      payloadType: z.object({
        id: z.number()
      }),
      responseType: z.object({
        id: z.number(),
        username: z.string(),
        password: z.string()
      })
    }
  }
}
