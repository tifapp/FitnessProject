import { Subtitle } from "@components/Text"
import { AppStyles } from "@lib/AppColorStyle"
import { dayjs } from "TiFShared/lib/Dayjs"
import { Image } from "expo-image"
import { useEffect, useState } from "react"
import { ViewStyle, StyleProp, View, StyleSheet } from "react-native"
import Animated, { FadeIn } from "react-native-reanimated"

export type PragmaQuoteProps = {
  quote: () => string
  animationInterval: number
  initialDelay?: number
  style?: StyleProp<ViewStyle>
}

const usePragmaQuote = (
  quote: () => string,
  intervalMillis: number,
  initialDelay: number
) => {
  const [text, setText] = useState<string | undefined>()
  useEffect(() => {
    const quoteText = quote()
    let index = 0
    let interval: NodeJS.Timeout
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        const nextText = quoteText.substring(0, index++)
        setText(nextText)
        if (index > quoteText.length) clearInterval(interval)
      }, intervalMillis)
    }, initialDelay)
    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [quote, intervalMillis, initialDelay])
  return text
}

export const PragmaQuoteView = ({
  quote,
  animationInterval,
  initialDelay = 300,
  style
}: PragmaQuoteProps) => {
  const text = usePragmaQuote(quote, animationInterval, initialDelay)
  return (
    <View style={style}>
      <View style={styles.row}>
        <View style={styles.pragmaContainer}>
          <Image
            source={
              "https://static.wikia.nocookie.net/xenoblade/images/c/cd/XC3FR_Alpha_portrait.png/revision/latest?cb=20230419030915"
            }
            style={styles.pragmaImage}
          />
        </View>
        {text && (
          <Animated.View entering={FadeIn} style={styles.quote}>
            <Subtitle style={styles.quote}>{text}</Subtitle>
          </Animated.View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    columnGap: 16
  },
  pragmaContainer: {
    borderRadius: 12,
    backgroundColor: AppStyles.cardColor,
    padding: 8
  },
  pragmaImage: {
    width: 48,
    height: 48
  },
  quote: {
    flex: 1
  },
  invisibleText: {
    opacity: 0
  }
})

/**
 * Returns Pragma's Quote when the user is editing an existing event through the edit form.
 */
export const editEventQuote = () => EDIT_EVENT_QUOTES.ext.randomElement()

const EDIT_EVENT_QUOTES = [
  "What would you like to change?",
  "What will you change this time?",
  "How will you change this event?"
]

/**
 * Returns Pragma's Quote when the user is creating a new event through the edit form.
 *
 * @param date The current date.
 */
export const createEventQuote = (date: Date = new Date()) => {
  const type = createEventQuoteType(date)
  if (type.key === "upcomingHoliday") {
    return CREATE_EVENT_QUOTES[type.key].ext.randomElement()(type.name)
  } else if (type.key === "holiday") {
    return CREATE_EVENT_QUOTES[type.key].ext.randomElement()(type.greeting)
  }
  return CREATE_EVENT_QUOTES[type.key].ext.randomElement()
}

const CREATE_EVENT_QUOTES = {
  weekday: [
    "What event is on your mind this week?",
    "What event will you create this week?",
    "How will you progress with this new event?"
  ],
  weekend: [
    "What event is on you mind this weekend?",
    "What event will you create this weekend?",
    "Ready to gear up for this weekend's event?"
  ],
  upcomingHoliday: [
    (name: string) => `Planning an event for ${name}?`,
    (name: string) => `Will you make an event for ${name}?`,
    (name: string) => `Want to make an event for ${name}?`
  ],
  holiday: [
    (greeting: string) => `${greeting} Ready to make an event?`,
    (greeting: string) => `${greeting} Want to celebrate with an event?`,
    (greeting: string) => `${greeting} What event do you have in mind?`
  ]
}

export type CreateEventQuoteType =
  | { key: "weekday" | "weekend" }
  | { key: "upcomingHoliday"; name: string }
  | { key: "holiday"; greeting: string }

/**
 * Returns the type of Pragma's Quote when the user is creating a new event through the edit form.
 *
 * @param date The current date.
 */
export const createEventQuoteType = (
  currentDate: Date
): CreateEventQuoteType => {
  const date = dayjs(currentDate)
  const holidays = datedHolidays(date.year())
  const upcomingHoliday = holidays.find((holiday) => {
    const days = holiday.date.diff(date, "days")
    return days >= 0 && days < 3
  })
  const todaysHoliday = holidays.find((holiday) => {
    return holiday.date.isSame(date, "day")
  })
  if (todaysHoliday) {
    return { key: "holiday", greeting: todaysHoliday.greeting }
  }
  if (upcomingHoliday) {
    return { key: "upcomingHoliday", name: upcomingHoliday.name }
  }
  return { key: date.day() < WeekDayIndex.Thursday ? "weekday" : "weekend" }
}

enum WeekDayIndex {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6
}

type USHoliday = {
  dayOfYear:
    | { month: number; dayOfMonth: number }
    | { month: number; weekdayIndex: WeekDayIndex; weekdayOccurence: number }
  name: string
  greeting: string
}

const datedHolidays = (year: number) => {
  const upcomingNewYearsDay = {
    date: dayjs(`${year + 1}-01-01`),
    ...NEW_YEARS_DAY_HOLIDAY
  }
  return US_HOLIDAYS.map((holiday) => {
    if ("weekdayIndex" in holiday.dayOfYear) {
      return {
        date: recurrencePatternDate(year, holiday.dayOfYear),
        ...holiday
      }
    } else {
      return {
        date: dayjs(
          `${year}-${holiday.dayOfYear.month}-${holiday.dayOfYear.dayOfMonth}`
        ),
        ...holiday
      }
    }
  }).concat(upcomingNewYearsDay)
}

const recurrencePatternDate = (
  year: number,
  dayOfYear: {
    month: number
    weekdayIndex: WeekDayIndex
    weekdayOccurence: number
  }
) => {
  const isFindingNthLastOccurence = dayOfYear.weekdayOccurence < 0
  let date = dayjs(`${year}-${dayOfYear.month}-01`)
  if (isFindingNthLastOccurence) {
    date = date.endOf("month")
  }
  const dateMovementOffset = isFindingNthLastOccurence ? -1 : 1
  while (date.day() !== dayOfYear.weekdayIndex) {
    date = date.add(dateMovementOffset, "day")
  }
  return date.add(dayOfYear.weekdayOccurence - dateMovementOffset, "week")
}

const NEW_YEARS_DAY_HOLIDAY = {
  dayOfYear: { month: 1, dayOfMonth: 1 },
  name: "New Year's Day",
  greeting: "Happy New Year!"
}

const US_HOLIDAYS = [
  NEW_YEARS_DAY_HOLIDAY,
  {
    dayOfYear: {
      month: 1,
      weekdayIndex: WeekDayIndex.Monday,
      weekdayOccurence: 3
    },
    name: "Martin Luther King, Jr. Day",
    greeting: "Happy Martin Luther King, Jr Day!"
  },
  {
    dayOfYear: {
      month: 2,
      weekdayIndex: WeekDayIndex.Monday,
      weekdayOccurence: 3
    },
    name: "Presidents Day",
    greeting: "Happy Presidents Day!"
  },
  {
    dayOfYear: { month: 2, dayOfMonth: 14 },
    name: "Valentine's Day",
    greeting: "Happy Valentine's Day!"
  },
  {
    dayOfYear: { month: 3, dayOfMonth: 17 },
    name: "St. Patrick's Day",
    greeting: "Happy St. Patrick's Day!"
  },
  {
    dayOfYear: { month: 5, dayOfMonth: 5 },
    name: "Cinco de Mayo",
    greeting: "Happy Cinco de Mayo!"
  },
  {
    dayOfYear: {
      month: 5,
      weekdayIndex: WeekDayIndex.Monday,
      weekdayOccurence: -1
    },
    name: "Memorial Day",
    greeting: "Happy Memorial Day!"
  },
  {
    dayOfYear: { month: 6, dayOfMonth: 19 },
    name: "Juneteenth",
    greeting: "Happy Juneteenth!"
  },
  {
    dayOfYear: { month: 7, dayOfMonth: 4 },
    name: "Independence Day",
    greeting: "Happy Independence Day!"
  },
  {
    dayOfYear: {
      month: 9,
      weekdayIndex: WeekDayIndex.Monday,
      weekdayOccurence: 1
    },
    name: "Labor Day",
    greeting: "Happy Labor Day!"
  },
  {
    dayOfYear: {
      month: 10,
      weekdayIndex: WeekDayIndex.Monday,
      weekdayOccurence: 2
    },
    name: "Indigenous Peoples' Day",
    greeting: "Happy Indigenous Peoples' Day!"
  },
  {
    dayOfYear: { month: 10, dayOfMonth: 31 },
    name: "Halloween",
    greeting: "Happy Halloween!"
  },
  {
    dayOfYear: { month: 11, dayOfMonth: 11 },
    name: "Veterans Day",
    greeting: "Happy Veterans Day!"
  },
  {
    dayOfYear: {
      month: 11,
      weekdayIndex: WeekDayIndex.Thursday,
      weekdayOccurence: 4
    },
    name: "Thanksgiving",
    greeting: "Happy Thanksgiving!"
  },
  {
    dayOfYear: { month: 12, dayOfMonth: 25 },
    name: "Christmas",
    greeting: "Merry Christmas!"
  }
] as USHoliday[]
