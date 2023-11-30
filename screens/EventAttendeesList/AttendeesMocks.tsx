import { EventAttendee } from "@lib/events"
import { uuidString } from "@lib/UUID"

const namesAndHandles = [
  { name: "Sophia Wilson", handle: "sophisophia" },
  { name: "Benjamin Clark", handle: "benjamincred" },
  { name: "Ava Thompson", handle: "avantgardeava" },
  { name: "Elijah Rodriguez", handle: "electricelijah" },
  { name: "Mia Anderson", handle: "mysticalmia" },
  { name: "James Martinez", handle: "jovialjames" },
  { name: "Isabella Scott", handle: "bellaenchant" },
  { name: "William Cooper", handle: "wittywilliam" },
  { name: "Charlotte Taylor", handle: "charismaticchar" },
  { name: "Ethan Adams", handle: "energeticethan" },
  { name: "Amelia Mitchell", handle: "amiableamelia" },
  { name: "Oliver Wright", handle: "outspokenoliver" },
  { name: "Harper Turner", handle: "harmaciousharp" },
  { name: "Elijah Walker", handle: "etherealelijah" },
  { name: "Evelyn Green", handle: "evergreenevelyn" },
  { name: "Henry Hill", handle: "happyhenry" },
  { name: "Elizabeth Phillips", handle: "luminouslizzy" },
  { name: "Michael Campbell", handle: "musicalmichael" },
  { name: "Sofía Bailey", handle: "sparklingsofía" },
  { name: "Alexander Reed", handle: "artisticalex" }
]

export namespace AttendeeListMocks {
  export const List1: EventAttendee[] = namesAndHandles.map(
    ({ name, handle }) => ({
      id: uuidString(),
      username: name,
      handle: "@" + handle
    })
  )
}
