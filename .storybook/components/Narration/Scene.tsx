
import { AnimatedTitle } from '@components/Text';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, SafeAreaView, StyleSheet } from 'react-native';
import { useHaptics } from '../../../modules/tif-haptics';
import { FadeOut } from "../FadeOut/FadeOut";
import { createFadeOutPattern, createHeartbeatPattern } from '../Haptics';
import { Mountain } from "../Icons/Mountain";

export const NarrationScene = ({ goal, onComplete }: {goal: string, onComplete: () => void}) => {
  const haptics = useHaptics();
  
  const items = [
    { type: 'text', content: `I have walked the path before you.`, key: 'line2', duration: 1000, pauseAfter: 500 },
    { type: 'text', content: `I am what you aspire to be.`, key: 'line2', duration: 1000, pauseAfter: 500 },
    { type: 'text', content: 'Meet me at the top.', key: 'line3', duration: 1000, pauseAfter: 500 },
    { type: 'image', component: <Mountain width={1000} height={1000} />, key: 'mountain', duration: 1000, pauseAfter: 1000 },
  ];

  // Create an array of Animated.Values for opacity
  const opacityValues = useRef(items.map(() => new Animated.Value(0))).current;

  const [finished, setFinished] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function animateSequence() {
      for (let i = 0; i < items.length; i++) {
        if (isCancelled) return;

        await new Promise((resolve) => {
          Animated.timing(opacityValues[i], {
            toValue: 1,
            duration: items[i].duration || 1000,
            useNativeDriver: true,
          }).start(() => {
            haptics.playCustomPattern(createHeartbeatPattern());
            resolve(null);
          });
        });

        // Pause after the current item, if pauseAfter is specified
        if (items[i].pauseAfter) {
          await new Promise((resolve) => setTimeout(resolve, items[i].pauseAfter));
        }
      }

      if (!isCancelled) {
        haptics.playCustomPattern(createFadeOutPattern())
        setFinished(true);
      }
    }

    animateSequence();

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {items.map((item, index) => {
        const opacity = opacityValues[index];
        if (item.type === 'text') {
          return (
            <AnimatedTitle key={item.key} style={[styles.title, { opacity }]}>
              {item.content}
            </AnimatedTitle>
          );
        } else if (item.type === 'image') {
          return (
            <Animated.View key={item.key} style={[styles.background, { opacity }]}>
              {item.component}
            </Animated.View>
          );
        }
        return null;
      })}

      <FadeOut
        trigger={finished}
        onComplete={() => onComplete()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 100,
    backgroundColor: "#fff",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  background: {
    position: "absolute",
    opacity: 0.5,
    top: 300,
  },
  title: {
    width: "100%",
    textAlign: "center",
    fontSize: 24,
    marginBottom: 100,
    paddingHorizontal: 20,
  },
});
