import React, { useCallback, useEffect, useState } from "react"
import {
  Animated,
  Dimensions,
  LayoutRectangle,
  StyleSheet,
  Text,
  View
} from "react-native"
import {
  Gesture,
  PanGestureHandler,
  PanGestureHandlerGestureEvent
} from "react-native-gesture-handler"

export type Option = {
  id: string
  text: string
}

export type Question = {
  text: string
  correctAnswer: string
  options: Option[]
}

type AnswerBoxLayout = {
  id: string
  layout: LayoutRectangle
}

type Props = {
  question: Question
  onAnswerSelected?: (answerId: string) => void
  onAnswerCorrect?: () => void
  onAnswerIncorrect?: () => void
}

export const DragAndDropSelect: React.FC<Props> = ({
  question,
  onAnswerSelected,
  onAnswerCorrect,
  onAnswerIncorrect
}) => {
  const dragX = useState(new Animated.Value(0))[0]
  const dragY = useState(new Animated.Value(0))[0]
  const scale = useState(new Animated.Value(1))[0]
  const pulseAnim = useState(new Animated.Value(1))[0]
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [draggedOver, setDraggedOver] = useState<string | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [answerLayouts, setAnswerLayouts] = useState<AnswerBoxLayout[]>([])
  const [lastDropPosition, setLastDropPosition] = useState<{
    x: number
    y: number
  } | null>(null)

  useEffect(() => {
    const { height, width } = Dimensions.get("window")
    const initialY = height - 200
    const initialX = width / 2 - 24

    dragY.setValue(initialY)
    dragX.setValue(initialX)
    setOffset({ x: initialX, y: initialY })
  }, [])

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        })
      ])
    )

    if (!selectedAnswer) {
      pulse.start()
    } else {
      pulse.stop()
    }

    return () => pulse.stop()
  }, [selectedAnswer])

  const checkOverlap = useCallback(
    (x: number, y: number) => {
      const tokenSize = 48
      const tokenCenter = {
        x: x + tokenSize / 2,
        y: y + tokenSize / 2
      }

      for (const box of answerLayouts) {
        if (
          tokenCenter.x >= box.layout.x &&
          tokenCenter.x <= box.layout.x + box.layout.width &&
          tokenCenter.y >= box.layout.y &&
          tokenCenter.y <= box.layout.y + box.layout.height
        ) {
          return box.id
        }
      }
      return null
    },
    [answerLayouts]
  )

  const onGestureEvent = useCallback(
    (event: PanGestureHandlerGestureEvent) => {
      const { translationX, translationY } = event.nativeEvent
      dragX.setValue(translationX + offset.x)
      dragY.setValue(translationY + offset.y)
    },
    [offset]
  )

  const onHandlerStateChange = useCallback(
    (event: PanGestureHandlerGestureEvent) => {
      const { state, translationX, translationY } = event.nativeEvent

      if (state === 5) {
        setOffset({
          x: offset.x + translationX,
          y: offset.y + translationY
        })
        const overlappingBox = checkOverlap(translationX, translationY)

        if (overlappingBox) {
          setSelectedAnswer(overlappingBox)
          setShowFeedback(true)
          setLastDropPosition({ x: translationX, y: translationY })
          onAnswerSelected?.(overlappingBox)

          if (overlappingBox === question.correctAnswer) {
            onAnswerCorrect?.()
          } else {
            onAnswerIncorrect?.()
          }
        } else if (lastDropPosition) {
          Animated.parallel([
            Animated.spring(dragX, {
              toValue: lastDropPosition.x,
              useNativeDriver: true
            }),
            Animated.spring(dragY, {
              toValue: lastDropPosition.y,
              useNativeDriver: true
            })
          ]).start()
        }

        setDraggedOver(null)
        setIsDragging(false)
      } else if (state === 2) {
        setIsDragging(true)
        const overlappingBox = checkOverlap(translationX, translationY)
        setDraggedOver(overlappingBox)
      }
    },
    [
      dragX,
      dragY,
      checkOverlap,
      lastDropPosition,
      question.correctAnswer,
      onAnswerSelected,
      onAnswerCorrect,
      onAnswerIncorrect
    ]
  )

  return (
    <View style={styles.container}>
      <Text style={styles.questionText}>{question.text}</Text>

      <View style={styles.grid}>
        {question.options.map((option) => (
          <View
            key={option.id}
            onLayout={(event) => {
              const { layout } = event.nativeEvent
              setAnswerLayouts((prev) => [
                ...prev.filter((item) => item.id !== option.id),
                { id: option.id, layout }
              ])
            }}
            style={[
              styles.answerBox,
              isDragging && styles.answerBoxDragging,
              draggedOver === option.id && styles.answerBoxHovered,
              selectedAnswer === option.id && styles.answerBoxSelected
            ]}
          >
            <Text style={styles.answerText}>{option.text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.tokenContainer}>
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View
            style={[
              styles.token,
              {
                transform: [
                  { translateX: dragX },
                  { translateY: dragY },
                  { scale: Animated.multiply(scale, pulseAnim) }
                ]
              }
            ]}
          >
            <Text style={styles.tokenText}>{selectedAnswer ? "✓" : "?"}</Text>
          </Animated.View>
        </PanGestureHandler>
      </View>

      {showFeedback && (
        <View
          style={[
            styles.feedback,
            selectedAnswer === question.correctAnswer
              ? styles.feedbackSuccess
              : styles.feedbackError
          ]}
        >
          <Text
            style={[
              styles.feedbackText,
              selectedAnswer === question.correctAnswer
                ? styles.feedbackTextSuccess
                : styles.feedbackTextError
            ]}
          >
            {selectedAnswer === question.correctAnswer
              ? "Correct!"
              : "Try again!"}
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff"
  },
  questionText: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 24
  },
  tokenContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 100
  },
  token: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4
  },
  tokenText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold"
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16
  },
  answerBox: {
    width: "47%",
    aspectRatio: 1.5,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff"
  },
  answerBoxDragging: {
    borderColor: "#94a3b8",
    backgroundColor: "#f8fafc",
    transform: [{ scale: 1.02 }]
  },
  answerBoxHovered: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
    transform: [{ scale: 1.05 }],
    borderWidth: 3
  },
  answerBoxSelected: {
    borderColor: "#2563eb",
    backgroundColor: "#bfdbfe",
    borderWidth: 3
  },
  answerText: {
    fontSize: 18
  },
  feedback: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center"
  },
  feedbackSuccess: {
    backgroundColor: "#dcfce7"
  },
  feedbackError: {
    backgroundColor: "#fee2e2"
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: "500"
  },
  feedbackTextSuccess: {
    color: "#16a34a"
  },
  feedbackTextError: {
    color: "#dc2626"
  }
} as const)
