import AsyncStorage from "@react-native-async-storage/async-storage"
import { ZodType, ZodTypeDef } from "zod"

export namespace AsyncStorageUtils {
  /**
   * Loads multiple items from AsyncStorage and attempts to parse them
   * with the given zod schema assuming it is parseable with `JSON.parse`.
   * @returns a tuple array with each entry containing its key and parsed value (or undefined)
   */
  export const parseJSONItems = async <
    Output,
    Def extends ZodTypeDef = ZodTypeDef,
    Input = Output
  >(
    schema: ZodType<Output, Def, Input>,
    keys: string[]
  ) => {
    return await AsyncStorage.multiGet(keys).then((results) =>
      results.map(([key, json]) => {
        try {
          if (!json) return [key, undefined] as const
          return [key, schema.parse(JSON.parse(json))] as const
        } catch {
          return [key, undefined] as const
        }
      })
    )
  }

  /**
   * Loads an item from AsyncStorage against a zod schema assuming it is
   * parseable with `JSON.parse`.
   */
  export const parseJSONItem = async <
    Output,
    Def extends ZodTypeDef = ZodTypeDef,
    Input = Output
  >(
    schema: ZodType<Output, Def, Input>,
    key: string
  ) => {
    return await parseJSONItems(schema, [key]).then((results) => {
      const [, value] = results[0]
      return value
    })
  }
}
