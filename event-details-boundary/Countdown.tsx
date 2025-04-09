import { BodyText, Caption, CaptionTitle, Subtitle } from "@components/Text"
import { ClientSideEvent } from "@event/ClientSideEvent"
import React from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import {
  dateRange,
  FixedDateRange
} from "TiFShared/domain-models/FixedDateRange"
import { dayjs } from "TiFShared/lib/Dayjs"

export type EventCountdownTime = ClientSideEvent["time"]

export type EventCountdown = {
  kind: "starts-in" | "ends-in" | "done"
  formatted: EventFormattedCountdown
}

export type EventFormattedCountdown = {
  seconds: number
  shouldDisplayFomoEffect: boolean
}

export const eventCountdown = (
  secondsToStart: number,
  countdownDateRange: FixedDateRange
): EventCountdown => {
  if (secondsToStart > 0) {
    return {
      kind: "starts-in",
      formatted: eventFormattedCountdown(secondsToStart)
    }
  }
  const { seconds } = countdownDateRange.diff
  const secondsToEnd = seconds - Math.abs(secondsToStart)
  return secondsToEnd <= 0 && countdownDateRange.endDateTime < new Date()
    ? {
        kind: "done",
        formatted: eventFormattedCountdown(
          dateRange(countdownDateRange.endDateTime, new Date())!.diff.seconds
        )
      }
    : { kind: "ends-in", formatted: eventFormattedCountdown(secondsToEnd) }
}

const eventFormattedCountdown = (seconds: number): EventFormattedCountdown => {
  const duration = dayjs.duration(seconds, "second")
  const shouldDisplayFomoEffect = duration.asMinutes() <= 15
  return { seconds: duration.asSeconds(), shouldDisplayFomoEffect }
}

export type EventCountdownProps = {
  countdown: EventCountdown
  style?: StyleProp<ViewStyle>
}

export const EventCountdownView = ({
  countdown,
  style
}: EventCountdownProps) => {
  return (
    <View style={style}>
      {countdown.kind === "starts-in" && (
        <CountdownLabel
          title="Starts in"
          formattedCountdown={countdown.formatted}
        />
      )}
      {countdown.kind === "ends-in" && (
        <CountdownLabel
          title="Ends in"
          formattedCountdown={countdown.formatted}
        />
      )}
      {countdown.kind === "done" && (
        <CountdownLabel title="Done" formattedCountdown={countdown.formatted} />
      )}
    </View>
  )
}

type CountdownCardProps = {
  title: string
  shouldFOMO: boolean
  children?: React.JSX.Element
}

const CountdownCard = ({ title, shouldFOMO, children }: CountdownCardProps) => {
  return (
    <View style={styles.labelContainer}>
      <View style={[styles.card, shouldFOMO && { borderColor: "#B91C1C" }]}>
        <View
          style={[styles.header, shouldFOMO && { backgroundColor: "#B91C1C" }]}
        >
          <View style={styles.headerTextContainer}>
            <CaptionTitle style={styles.headerText}>{title}</CaptionTitle>
          </View>
        </View>
        {children}
      </View>
    </View>
  )
}

type CountdownLabelProps = {
  title: string
  formattedCountdown: EventFormattedCountdown
}

const CountdownLabel = ({ title, formattedCountdown }: CountdownLabelProps) => {
  const duration = dayjs.duration(formattedCountdown.seconds)
  return (
    <CountdownCard
      title={title}
      shouldFOMO={formattedCountdown.shouldDisplayFomoEffect}
    >
      <View style={styles.content}>
        {formattedCountdown ? (
          <View style={styles.dateContainer}>
            <View style={styles.timeValues}>
              <DisplayTime
                timeUnit={duration.asDays()}
                unitType={"days"}
                shouldFOMO={formattedCountdown.shouldDisplayFomoEffect}
              />
              <BodyText style={styles.colonText}>:</BodyText>

              <DisplayTime
                timeUnit={duration.asHours()}
                unitType={"hours"}
                shouldFOMO={formattedCountdown.shouldDisplayFomoEffect}
              />
              <BodyText style={styles.colonText}>:</BodyText>

              <DisplayTime
                timeUnit={duration.asMinutes()}
                unitType={"minutes"}
                shouldFOMO={formattedCountdown.shouldDisplayFomoEffect}
              />
            </View>
          </View>
        ) : (
          <CaptionTitle style={styles.headerText}>{title}</CaptionTitle>
        )}
      </View>
    </CountdownCard>
  )
}

type DisplayTimeProps = {
  timeUnit: number
  unitType: string
  shouldFOMO: boolean
}

const DisplayTime = ({ timeUnit, unitType, shouldFOMO }: DisplayTimeProps) => {
  return (
    <View style={styles.timeUnit}>
      <View style={styles.digitContainer}>
        <Subtitle
          style={[styles.timeValue, shouldFOMO && { color: "#B91C1C" }]}
        >
          {String(timeUnit).padStart(2, "0")}
        </Subtitle>
      </View>
      <Caption style={styles.unitLabel}>{unitType[0]}</Caption>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    rowGap: 4
  },
  countdownTextContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "white"
  },
  countdownText: {
    paddingHorizontal: 16,
    textAlign: "center"
  },
  titleText: {
    paddingLeft: 8
  },
  countdownTextContainerContainer: {
    display: "flex",
    flexDirection: "row"
  },
  countdownTextSpacer: {
    flex: 1
  },
  labelContainer: {
    position: "absolute",
    bottom: 0,
    left: 24,
    zIndex: 50
  },
  card: {
    backgroundColor: "#FFFBEB", // amber-50
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#4F7942"
  },
  header: {
    backgroundColor: "#4F7942",
    paddingHorizontal: 12,
    paddingVertical: 4,
    flexDirection: "row",
    justifyContent: "center", // Center the text
    alignItems: "center"
  },
  headerTextContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  headerText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold"
  },
  content: {
    padding: 8, // Reduced padding
    borderTopWidth: 1,
    borderTopColor: "#4F7942"
  },
  dateContainer: {
    alignItems: "center"
  },
  timeValues: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  // Wrapper for digit and its label
  timeUnit: {
    flexDirection: "row",
    alignItems: "flex-end"
  },
  // Container for digit to ensure fixed width
  digitContainer: {
    minWidth: 34,
    justifyContent: "center",
    alignItems: "center"
  },
  timeValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4F7942",
    fontFamily: "monospace"
  },
  // Style for the D/H/M/S labels
  unitLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#4F7942",
    marginRight: 2
  },
  colonText: {
    // Additional styling for the blinking colons
    fontWeight: "900",
    fontSize: 20,
    color: "#4F7942",
    marginHorizontal: 1
  }
})
