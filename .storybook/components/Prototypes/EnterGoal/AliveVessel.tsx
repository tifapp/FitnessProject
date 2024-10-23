import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Animated, {
    Easing,
    interpolateColor,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { useHaptics } from '../../../../modules/tif-haptics';
import { PROGRESS_DURATION } from './PickerItem';

export const ITEM_SIZE = 125;
const HEARTBEAT_INTERVAL = 2000;

export type DollProps = {
  color: string;
  rotation: number;
  opacity?: number;
  isPressed?: boolean;
  triggerFall?: boolean;
};

export interface DollRef {
  handleGestureStart: () => void;
  handleGestureEnd: () => void;
}

export const Doll = ({
  color,
  rotation,
  opacity,
  isPressed,
  triggerFall = false,
}: DollProps) => {
  const [dummy, setDummy] = useState(false);
  const haptics = useHaptics();

  const pulse = useSharedValue(0);
  const progress = useSharedValue(0);
  const iconRotation = useSharedValue(rotation);

  const jumpingTranslateY = useSharedValue(0);
  const jumpingScale = useSharedValue(1);
  const jumpingRotate = useSharedValue(0);

  const fallTranslateX = useSharedValue(0);
  const fallTranslateY = useSharedValue(0);
  const fallRotation = useSharedValue(0);
  const fallColor = useSharedValue(0);

  const {
    jumpHeight,
    jumpDurationUp,
    jumpDurationDown,
    scaleUp,
    rotateMax,
  } = useMemo(() => {
    const jumpHeight = -50 + Math.random() * -20;
    const jumpDurationUp = 550 + Math.random() * 200;
    const jumpDurationDown = 550 + Math.random() * 200;
    const scaleUp = 1 + Math.random() * 0.2;
    const rotateMax = 10 + Math.random() * 10;
    const phaseOffset = Math.random() * 1000;
    return { jumpHeight, jumpDurationUp, jumpDurationDown, scaleUp, rotateMax, phaseOffset };
  }, []);

  const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);

  const animatedIconStyle = useAnimatedStyle(() => {

    return {
      transform: [
        { rotate: `${jumpingRotate.value}deg` },
        { scale: jumpingScale.value },
        { translateY: jumpingTranslateY.value + fallTranslateY.value },
        { translateX: fallTranslateX.value },
      ],
      opacity: opacity ?? 1,
    };
  });
  
  const fallAnimatedIconStyle = useAnimatedStyle(() => {
    const pulseColor = interpolateColor(pulse.value, [0, 1], [color, 'black']);

    const finalColor = interpolateColor(
      fallColor.value,
      [0, 1],
      [pulseColor, 'black']
    );

    return {
      transform: [
        { rotate: `${fallRotation.value}deg` },
      ],
      color: finalColor,
    };
  });

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const startTime = Date.now();

    const playHeartbeat = () => {
      if (!isMounted || !isPressed) return;

      const elapsedTime = Date.now() - startTime;

      // Decrease interval duration over time
      const newInterval = Math.max(HEARTBEAT_INTERVAL - elapsedTime / 5, 200);

      haptics.playHeartbeat();

      // Trigger pulse animation (synchronized with haptic)
      pulse.value = withSequence(
        withTiming(1, {
          duration: 200,
          easing: Easing.out(Easing.ease),
        }),
        withTiming(0, {
          duration: 200,
          easing: Easing.in(Easing.ease),
        })
      );

      timeoutId = setTimeout(playHeartbeat, newInterval);
    };

    if (isPressed && dummy && !triggerFall) {
      playHeartbeat();

      stopJumping();

      progress.value = withTiming(
        1,
        {
          duration: PROGRESS_DURATION,
          easing: Easing.linear,
        },
        (isFinished) => {
          if (isFinished && isPressed) {
            runOnJS(haptics.playHeartbeat)();

            pulse.value = withSequence(
              withTiming(1, {
                duration: 200,
                easing: Easing.out(Easing.ease),
              }),
              withTiming(0, {
                duration: 200,
                easing: Easing.in(Easing.ease),
              })
            );

            iconRotation.value = withTiming(0, {
              duration: 300,
              easing: Easing.out(Easing.ease),
            });

            progress.value = 0;
            pulse.value = 0;
          }
        }
      );
    } else {
      progress.value = withTiming(0, { duration: 300 });

      pulse.value = withTiming(0, { duration: 300 });

      startJumping();
    }

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isPressed, dummy, haptics, triggerFall]);

  useEffect(() => {
    setTimeout(() => setDummy(true), 100);
  }, []);

  const startJumping = () => {
    jumpingTranslateY.value = 0;
    jumpingScale.value = 1;
    jumpingRotate.value = 0;

    jumpingTranslateY.value = withRepeat(
      withSequence(
        withTiming(jumpHeight, {
          duration: jumpDurationUp,
          easing: Easing.out(Easing.quad),
        }),
        withTiming(0, {
          duration: jumpDurationDown,
          easing: Easing.in(Easing.quad),
        })
      ),
      -1,
      true
    );

    jumpingScale.value = withRepeat(
      withSequence(
        withTiming(scaleUp, {
          duration: jumpDurationUp,
          easing: Easing.out(Easing.quad),
        }),
        withTiming(1, {
          duration: jumpDurationDown,
          easing: Easing.in(Easing.quad),
        })
      ),
      -1,
      true
    );

    jumpingRotate.value = withRepeat(
      withSequence(
        withTiming(rotateMax, {
          duration: jumpDurationUp / 2,
          easing: Easing.out(Easing.quad),
        }),
        withTiming(-rotateMax, {
          duration: jumpDurationDown,
          easing: Easing.inOut(Easing.quad),
        }),
        withTiming(0, {
          duration: jumpDurationUp / 2,
          easing: Easing.in(Easing.quad),
        })
      ),
      -1,
      false
    );
  };

  const stopJumping = () => {
    jumpingTranslateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) });
    jumpingScale.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) });
    jumpingRotate.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) });
  };

  useEffect(() => {
    if (triggerFall) {
      stopJumping();
      pulse.value = withTiming(0, { duration: 300 });
      progress.value = withTiming(0, { duration: 300 });

      const { height: windowHeight } = Dimensions.get('window');

      const horizontalVelocity = -100;

      fallTranslateX.value = withTiming(horizontalVelocity, {
        duration: 1000,
        easing: Easing.out(Easing.cubic),
      });

      fallTranslateY.value = withTiming(windowHeight, {
        duration: 1000,
        easing: Easing.quad,
      });

      fallRotation.value = withTiming(-80, {
        duration: 1000,
        easing: Easing.linear,
      });

      fallColor.value = withTiming(1, {
        duration: 300,
        easing: Easing.linear,
      });
    }
  }, [triggerFall]);

  return (
    <Animated.View style={styles.optionContainer}>
      <Animated.View style={animatedIconStyle}>
        <AnimatedIcon name="accessibility" style={fallAnimatedIconStyle} size={90} />
        </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  optionContainer: {
    backgroundColor: 'transparent',
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    position: 'relative',
  },
});
