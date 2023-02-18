import { Analytics } from "aws-amplify"

export const amplifyRecordAnalytics = (
  eventName: string,
  data?: Record<string, string | number>
) => {
  Analytics.record({
    name: eventName,
    attributes: compactMap(data ?? {}, ([_, value]) => {
      if (typeof value === "string") return value
      return null
    }),
    metrics: compactMap(data ?? {}, ([_, value]) => {
      if (typeof value === "number") return value
      return null
    })
  })
}

const compactMap = <T extends Record<string, string | number>, V>(
  object: T,
  mapper: (pair: [string, string | number]) => V | null
) => {
  const map = new Map<string, V>()

  for (const [key, value] of Object.entries(object)) {
    const mapped = mapper([key, value])
    if (mapped) map.set(key, mapped)
  }

  return Object.fromEntries(map)
}
