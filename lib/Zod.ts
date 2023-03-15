import { z, ZodSchema } from "zod"

export namespace ZodUtils {
  /**
   * Infers the type of a zod schema as a readonly type.
   */
  export type ReadonlyInferred<T extends ZodSchema> = Readonly<z.infer<T>>
}
