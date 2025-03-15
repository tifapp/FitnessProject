import { useEffect, useState } from "react"
import { SharedValue, useSharedValue } from "react-native-reanimated"

/**
 * Hook that synchronizes a React state value with a Reanimated shared value.
 * Use this when you need a value to be:
 * 1. Modifiable from the JS thread (via setState)
 * 2. Accessible in Reanimated worklets (via shared value)
 * 3. Reflected in React renders (via state)
 *
 * Common use cases:
 * - Animating values that also need to be displayed in UI text/components
 * - Values that can be changed by both user input and animations
 * - State that needs to be accessed in both animation worklets and React renders
 *
 * @param initialValue The initial value for both state and shared value
 * @returns Tuple of [state, setState, sharedValue] where sharedValue is readonly
 *
 * @example
 * // Draggable component that shows current position
 * function DraggableWithPosition() {
 *   const [position, setPosition, animatedPosition] = useSharedState({ x: 0, y: 0 });
 *
 *   const animatedStyle = useAnimatedStyle(() => ({
 *     transform: [
 *       { translateX: animatedPosition.value.x },
 *       { translateY: animatedPosition.value.y }
 *     ]
 *   }));
 *
 *   return (
 *     <>
 *       <Animated.View style={animatedStyle} />
 *       <Text>Position: {position.x}, {position.y}</Text>
 *     </>
 *   );
 * }
 *
 * @example
 * // Input that can be changed by both user and animation
 * function AnimatedInput() {
 *   const [value, setValue, animatedValue] = useSharedState(0);
 *
 *   const handleAnimate = () => {
 *     setValue(prev => prev + 1); // Updates both state and shared value
 *   };
 *
 *   const animatedStyle = useAnimatedStyle(() => ({
 *     opacity: withSpring(animatedValue.value / 10)
 *   }));
 *
 *   return (
 *     <>
 *       <TextInput
 *         value={String(value)}
 *         onChangeText={v => setValue(Number(v))}
 *       />
 *       <Animated.View style={animatedStyle} />
 *     </>
 *   );
 * }
 */
export const useSharedState = <TState, TShared = TState>(
  initialValue: TState,
  selector?: (state: TState) => TShared
): [
  TState,
  React.Dispatch<React.SetStateAction<TState>>,
  Readonly<SharedValue<TShared>>
] => {
  const [state, setState] = useState<TState>(initialValue)
  const shared = useSharedValue<TShared>(
    selector ? selector(initialValue) : (initialValue as unknown as TShared)
  )

  useEffect(() => {
    shared.value = selector ? selector(state) : (state as unknown as TShared)
  }, [state, selector])

  return [state, setState, shared]
}
