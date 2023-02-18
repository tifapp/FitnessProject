import { Analytics } from "aws-amplify"

export const amplifyRecordAnalytics = (
  eventName: string,
  data?: Record<string, string | number>
) => {
  Analytics.record({
    name: eventName,
    attributes: compactMapAnaylticsData(data ?? {}, (value) => {
      if (typeof value === "string") return value
      return null
    }),
    metrics: compactMapAnaylticsData(data ?? {}, (value) => {
      if (typeof value === "number") return value
      return null
    })
  })
}

const compactMapAnaylticsData = <T extends Record<string, string | number>, V>(
  object: T,
  mapper: (value: string | number) => V | null
) => {
  const map = new Map<string, V>()
  Object.entries(object).forEach(([key, value]) => {
    const mapped = mapper(value)
    if (mapped) map.set(key, mapped)
  })
  return Object.fromEntries(map)
}
