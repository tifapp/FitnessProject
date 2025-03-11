import React, { useCallback, useEffect, useRef, useState } from "react"
import {
  Dimensions,
  LayoutChangeEvent,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  TextInputSelectionChangeEventData,
  View
} from "react-native"
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated"
import Svg, { Circle } from "react-native-svg"

// ======== Types ========
interface TelescopeInputProps {
  initialText?: string
  onChange?: (text: string) => void
  onSubmit?: (text: string) => void
}

interface CursorPosition {
  x: number
  y: number
}

interface ViewportDimensions {
  width: number
  height: number
}

interface LensAnimationProps {
  animationProgress: Animated.SharedValue<number>
  width: number
}

interface BlinkingCursorProps {
  isBlinking: boolean
}

// ======== Constants ========
const FONT_SETTINGS = {
  FIXED_SIZE: 24, // Fixed font size instead of dynamic sizing
  LINE_HEIGHT_RATIO: 1.2,
  CHARS_PER_LINE: 10, // Reduced from 30 to make scaling happen faster
  MAX_SCALE: 5, // Starting scale factor (5x)
  MIN_SCALE: 1 // Minimum scale factor (1x)
}

const VIEWPORT_SETTINGS = {
  MEASURE_DELAY: 10,
  PADDING: 8,
  BASE_SIZE: 0.8, // Base size as percentage of window width
  MAX_SCALE: 1.5 // Maximum scale factor for viewport growth
}

const ANIMATION = {
  LENS_DURATION: 800,
  IRIS_COLOR: "#000000",
  FINAL_DELAY: 500,
  BORDER_COLOR: "#2D3748",
  OPENING_DURATION: 700,
  TIMING_CONFIG: { duration: 300 },
  SCALE_DURATION: 400, // Duration for text scaling animation
  CURSOR_BLINK_DURATION: 1200 // Duration for cursor blink animation
}

// ======== Sub-Components ========

// BlinkingCursor component
const BlinkingCursor: React.FC<BlinkingCursorProps> = ({ isBlinking }) => {
  const opacity = useSharedValue(1)

  useEffect(() => {
    // If blinking is enabled, start the animation
    if (isBlinking) {
      // Store reference to whether component is still mounted
      let isMounted = true

      // Define the recursive animation function
      function animateBlink() {
        "worklet"

        if (!isMounted) return

        // Fade out
        opacity.value = withTiming(0, { duration: ANIMATION.CURSOR_BLINK_DURATION / 2 }, () => {
          if (!isMounted) return

          // Fade in
          opacity.value = withTiming(1, { duration: ANIMATION.CURSOR_BLINK_DURATION / 2 }, () => {
            if (isMounted && isBlinking) {
              // Continue blinking if still enabled
              animateBlink()
            }
          })
        })
      }

      // Start the animation
      animateBlink()

      // Cleanup function
      return () => {
        isMounted = false
      }
    } else {
      // If blinking is disabled, ensure cursor is visible
      opacity.value = 1
    }
  }, [isBlinking])

  const cursorStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value
    }
  })

  return (
    <Animated.View style={[styles.cursor, cursorStyle]} />
  )
}

// Lens Animation (Iris Effect)
const LensAnimation: React.FC<LensAnimationProps> = ({ animationProgress, width }) => {
  const radius = useSharedValue(width / 2)

  // Animate the iris radius based on progress
  useAnimatedReaction(
    () => animationProgress.value,
    (progress) => {
      // Calculate iris radius (0 for closed, width/2 for open)
      radius.value = width / 2 * (1 - progress)
    },
    [width]
  )

  // Only show the lens during opening/closing animations
  const animatedStyles = useAnimatedStyle(() => {
    // When fully open (animationProgress near 0), make it completely transparent
    const opacity = animationProgress.value > 0.05 ? animationProgress.value : 0

    return {
      opacity
    }
  })

  return (
    <Animated.View style={[styles.lensContainer, animatedStyles]}>
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        <Circle
          cx="50%"
          cy="50%"
          r="100%"
          fill="#000"
        />
      </Svg>
    </Animated.View>
  )
}

// ======== Main Component ========
const TelescopeInput: React.FC<TelescopeInputProps> = ({ initialText = "", onChange = null, onSubmit = null }) => {
  // References
  const textInputRef = useRef<TextInput>(null)

  // Window dimensions
  const windowWidth = Dimensions.get("window").width
  const baseSize = windowWidth * VIEWPORT_SETTINGS.BASE_SIZE

  // Dimensions
  const [viewportDimensions, setViewportDimensions] = useState<ViewportDimensions>({
    width: baseSize,
    height: baseSize
  })

  // State
  const [text, setText] = useState<string>(initialText)
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({ x: 0, y: 0 })
  const [isClosed, setIsClosed] = useState<boolean>(false)

  // Animated Values
  const animationProgress = useSharedValue<number>(1) // 1 = closed, 0 = open
  const viewportScale = useSharedValue<number>(1) // For scaling the viewport
  const textScale = useSharedValue<number>(FONT_SETTINGS.MAX_SCALE) // For scaling the text

  // Animated styles for telescope viewport
  const telescopeStyle = useAnimatedStyle(() => {
    const borderWidth = Math.max(1, 4 * (1 - animationProgress.value))
    const scale = isClosed ? 0 : (1 - (animationProgress.value * 0.9)) * viewportScale.value

    return {
      borderWidth,
      transform: [{ scale }],
      width: baseSize,
      height: baseSize,
      backgroundColor: "#FFFFFF"
    }
  })

  // Animated style for text scaling
  const textContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: textScale.value }]
    }
  })

  // Calculate text scale based on text length
  useEffect(() => {
    if (!text) {
      // Reset to maximum scale when text is empty
      textScale.value = withTiming(FONT_SETTINGS.MAX_SCALE, { duration: ANIMATION.SCALE_DURATION })
      viewportScale.value = withTiming(1, { duration: ANIMATION.SCALE_DURATION })
      return
    }

    // Calculate how close we are to a full line
    const fullLineProgress = Math.min(text.length / FONT_SETTINGS.CHARS_PER_LINE, 1)

    // Calculate the new scale factor - linear interpolation between MAX_SCALE and MIN_SCALE
    const newScale = FONT_SETTINGS.MAX_SCALE -
                     (fullLineProgress * (FONT_SETTINGS.MAX_SCALE - FONT_SETTINGS.MIN_SCALE))

    // Animate to the new scale
    textScale.value = withTiming(newScale, { duration: ANIMATION.SCALE_DURATION })

    // Calculate viewport scale - inverse relationship with text scale
    // As text gets smaller, viewport gets larger
    const viewportScaleFactor = 1 + ((FONT_SETTINGS.MAX_SCALE - newScale) /
                             (FONT_SETTINGS.MAX_SCALE - FONT_SETTINGS.MIN_SCALE)) *
                             (VIEWPORT_SETTINGS.MAX_SCALE - 1)

    viewportScale.value = withTiming(viewportScaleFactor, { duration: ANIMATION.SCALE_DURATION })
  }, [text])

  // Opening animation on mount
  useEffect(() => {
    // Start with closed iris
    animationProgress.value = 1

    // Animate to open
    animationProgress.value = withTiming(0, {
      duration: ANIMATION.OPENING_DURATION
    })
  }, [])

  // Handle cursor position
  const handleSelectionChange = useCallback((e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
    if (isClosed) return

    const { start } = e.nativeEvent.selection
    const textBeforeCursor = text.substring(0, start)

    // Basic estimation of cursor position
    const lines = textBeforeCursor.split("\n")
    const lineCount = lines.length - 1
    const lastLine = lines[lineCount] || ""

    // Estimate position
    const charWidth = FONT_SETTINGS.FIXED_SIZE * 0.6
    const lineHeight = FONT_SETTINGS.FIXED_SIZE * FONT_SETTINGS.LINE_HEIGHT_RATIO

    const estimatedX = lastLine.length * charWidth
    const estimatedY = lineCount * lineHeight

    // Set cursor position
    setCursorPosition({ x: estimatedX, y: estimatedY })
  }, [text, isClosed])

  // Handle text change
  const handleTextChange = useCallback((newText: string) => {
    setText(newText)
    if (onChange) {
      onChange(newText)
    }
  }, [onChange])

  // Handle Enter/Return key press
  const handleKeyPress = useCallback((e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    const nativeEvent = e.nativeEvent
    // Check for Return key
    if ((nativeEvent.key === "Enter") && !isClosed) {
      // Start closing animation
      animationProgress.value = withTiming(1, ANIMATION.TIMING_CONFIG, () => {
        // Animation complete
        runOnJS(setIsClosed)(true)

        // Submit after delay
        if (onSubmit) {
          runOnJS(() => {
            setTimeout(() => {
              onSubmit(text)
            }, ANIMATION.FINAL_DELAY)
          })()
        }
      })
    }
  }, [isClosed, onSubmit, text])

  // Measure telescope viewport dimensions
  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout
    setViewportDimensions({ width, height })
  }, [])

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.telescopeViewport, telescopeStyle]}
        onLayout={handleLayout}
      >
        {/* White background */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: "#FFF" }]} />

        <View style={styles.contentView}>
          <Animated.View style={[styles.textContainer, textContainerStyle]}>
            <View style={styles.textWithCursor}>
              <Text
                style={[
                  styles.textDisplay,
                  {
                    fontSize: FONT_SETTINGS.FIXED_SIZE,
                    maxWidth: viewportDimensions.width * 0.7 // Limit width to 70% of viewport
                  }
                ]}
              >
                {text}
              </Text>
              {!text && <BlinkingCursor isBlinking={true} />}
            </View>
          </Animated.View>
        </View>

        <TextInput
          ref={textInputRef}
          style={styles.hiddenInput}
          value={text}
          onChangeText={handleTextChange}
          onSelectionChange={handleSelectionChange}
          onKeyPress={handleKeyPress}
          multiline
          autoFocus
          caretHidden={true}
          selectionColor="transparent"
        />

        <LensAnimation
          animationProgress={animationProgress}
          width={viewportDimensions.width}
        />
      </Animated.View>
    </View>
  )
}

// ======== Styles ========
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000" // Keep outer container black for contrast
  },
  telescopeViewport: {
    borderRadius: 9999,
    borderColor: ANIMATION.BORDER_COLOR,
    overflow: "hidden",
    backgroundColor: "#FFFFFF" // Explicit white background
  },
  contentView: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },
  textContainer: {
    padding: VIEWPORT_SETTINGS.PADDING * 3, // Increased padding
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    // Add horizontal margin to prevent text from touching edges
    marginHorizontal: 20
  },
  textWithCursor: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center"
  },
  textDisplay: {
    color: "black",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    lineHeight: FONT_SETTINGS.FIXED_SIZE * FONT_SETTINGS.LINE_HEIGHT_RATIO,
    textAlign: "center"
  },
  cursor: {
    width: FONT_SETTINGS.FIXED_SIZE * 0.6,
    height: 3,
    backgroundColor: "black",
    marginBottom: 2
  },
  hiddenInput: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0,
    color: "transparent",
    backgroundColor: "transparent"
  },
  lensContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    pointerEvents: "none",
    backgroundColor: "transparent"
  }
})

export default TelescopeInput
