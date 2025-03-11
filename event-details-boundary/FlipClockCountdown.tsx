// useCountdown.ts
import { useEffect, useMemo, useRef, useState } from "react";
import { AppState, AppStateStatus, StyleSheet, Text, View } from "react-native";
import { calcTimeDelta, parseTimeDelta } from "./utils";

import FlipClockDigit from "./FlipClockDigit";

type CountdownState = {
  timeDelta: {
    total: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  completed: boolean;
};

type CountdownOptions = {
  targetDate: Date | string | number;
  onTick?: (state: CountdownState) => void;
  onComplete?: () => void;
  stopOnInactiveApp?: boolean;
};

export function useCountdown({
  targetDate,
  onTick = () => {},
  onComplete = () => {},
  stopOnInactiveApp = false
}: CountdownOptions) {
  // Calculate the initial time delta
  const calculateTimeDelta = (target: Date | string | number): CountdownState => {
    const timeDelta = calcTimeDelta(target)
    return {
      timeDelta,
      completed: timeDelta.total === 0
    }
  }

  // Initialize state
  const [state, setState] = useState(() => calculateTimeDelta(targetDate))

  // Refs for timer and app state
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const appStateRef = useRef(AppState.currentState)

  // Clear the timer
  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  // Update state on each tick
  const tick = () => {
    const newState = calculateTimeDelta(targetDate)
    setState(newState)
    onTick(newState)

    if (newState.completed) {
      clearTimer()
      onComplete()
    }
  }

  // Start the timer
  const startTimer = () => {
    clearTimer()
    tick()
    timerRef.current = setInterval(tick, 1000)
  }

  // Handle app state changes and cleanup
  useEffect(() => {
    if (stopOnInactiveApp) {
      const handleAppStateChange = (nextAppState: AppStateStatus) => {
        if (appStateRef.current.match(/inactive|background/) && nextAppState === "active") {
          // App has come to the foreground
          tick()
          startTimer()
        } else if (nextAppState.match(/inactive|background/) && appStateRef.current === "active") {
          // App has gone to the background
          clearTimer()
        }
        appStateRef.current = nextAppState
      }

      const subscription = AppState.addEventListener("change", handleAppStateChange)
      startTimer()

      return () => {
        subscription.remove()
        clearTimer()
      }
    } else {
      startTimer()
      return () => clearTimer()
    }
  }, [targetDate, stopOnInactiveApp])

  // Parse the time delta for rendering
  const formattedTime = parseTimeDelta(state.timeDelta)

  return {
    days: formattedTime.days,
    hours: formattedTime.hours,
    minutes: formattedTime.minutes,
    seconds: formattedTime.seconds,
    isCompleted: state.completed,
    timeDelta: state.timeDelta
  }
}

type CountdownProps = {
  to: Date | string | number;
  onComplete?: () => void;
  onTick?: (state: any) => void;
  showLabels?: boolean;
  showSeparators?: boolean;
  labels?: string[];
  labelStyle?: any;
  digitBlockStyle?: any;
  separatorStyle?: any;
  dividerStyle?: any;
  duration?: number;
  renderMap?: boolean[];
  hideOnComplete?: boolean;
  stopOnInactiveApp?: boolean;
  spacing?: {
    clock?: number;
    digitBlock?: number;
  };
  style?: any;
};

// These are defined outside the component to avoid recreation
const defaultRenderMap = [true, true, true, true]
const defaultLabels = ["Days", "Hours", "Minutes", "Seconds"]

export default function FlipClockCountdown({
  to,
  style,
  onComplete = () => {},
  onTick = () => {},
  showLabels = true,
  showSeparators = true,
  labels = defaultLabels,
  labelStyle,
  digitBlockStyle,
  separatorStyle,
  dividerStyle,
  duration = 0.7,
  renderMap = defaultRenderMap,
  hideOnComplete = true,
  stopOnInactiveApp = false,
  spacing
}: CountdownProps) {
  // Use the countdown hook
  const countdown = useCountdown({
    targetDate: to,
    onTick,
    onComplete,
    stopOnInactiveApp
  })

  // Create memoized sections array - moved outside conditional to follow React rules
  const sectionsData = useMemo(() => {
    const _renderMap = renderMap.length >= 4 ? renderMap.slice(0, 4) : defaultRenderMap
    const _labels = labels.length >= 4 ? labels.slice(0, 4) : defaultLabels

    const times = [
      countdown.days,
      countdown.hours,
      countdown.minutes,
      countdown.seconds
    ]

    const keys = ["day", "hour", "minute", "second"]

    return _renderMap
      .map((show, i) => ({
        show,
        key: keys[i],
        time: times[i],
        label: _labels[i]
      }))
      .filter(item => item.show)
  }, [
    renderMap,
    labels,
    countdown.days,
    countdown.hours,
    countdown.minutes,
    countdown.seconds
  ])

  // If countdown is complete and we should hide
  if (countdown.isCompleted && hideOnComplete) {
    return null
  }

  return (
    <View style={[styles.container, style]}>
      {sectionsData.map((section, idx) => (
        <View key={section.key} style={styles.unitTimeContainer}>
          {showLabels && (
            <Text style={[styles.label, labelStyle]}>
              {section.label}
            </Text>
          )}
          <View style={styles.digitsRow}>
            {section.time.current.map((digit, digitIdx) => (
              <FlipClockDigit
                key={`${section.key}-${digitIdx}-${digit}`}
                current={digit}
                next={section.time.next[digitIdx]}
                style={[
                  digitIdx > 0 && spacing?.digitBlock
                    ? { marginLeft: spacing.digitBlock }
                    : null,
                  digitBlockStyle
                ]}
                duration={duration}
              />
            ))}
          </View>

          {/* Show separator after each section except the last */}
          {idx < sectionsData.length - 1 && showSeparators && (
            <View style={[styles.separator, separatorStyle]}>
              <View style={styles.separatorDot} />
              <View style={styles.separatorDot} />
            </View>
          )}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  unitTimeContainer: {
    alignItems: "center",
    marginBottom: 32,
    flexDirection: "column"
  },
  digitsRow: {
    flexDirection: "row"
  },
  label: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "400",
    marginTop: 8
  },
  separator: {
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8
  },
  separatorDot: {
    width: 5,
    height: 5,
    borderRadius: 5,
    backgroundColor: "white",
    marginVertical: 4
  }
})
