import React, { createContext, ReactNode, useState } from 'react';
import { Gesture, GestureDetector, GestureUpdateEvent, PanGesture, PanGestureHandlerEventPayload } from 'react-native-gesture-handler';
import {
  runOnJS
} from 'react-native-reanimated';
import type { Target } from "./types";
import { useSharedState } from "./useSharedState";
import { areSetsEqual, isPointInTarget, remove, upsert } from "./utils";

export const HoverContext = createContext<
  {
    isHovering: boolean;
    hoverGesture: PanGesture;
    registerTarget: (target: Target) => void;
    unregisterTarget: (id: string) => void;
    hoveredTargets: Target[];
  }
>({
  registerTarget: () => {},
  unregisterTarget: () => {},
  hoveredTargets: [],
  hoverGesture: Gesture.Pan(),
  isHovering: false
});

const HIT_SLOP = 20;

export const HoverProvider = ({ children, hitSlop = HIT_SLOP }: { children: ReactNode, hitSlop?: number }) => {
  const [isHovering, setIsHovering] = useState(false)
  const [, setRegisteredTargets, sharedRegisteredTargets] = useSharedState<Target[]>([]);
  const [hoveredTargets, setHoveredTargets, sharedHoveredTargetIds] = useSharedState<Target[], string[]>([], (targets) => targets.map(target => target.id));

  const updateHoveredTargets = ({absoluteX, absoluteY}: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
    "worklet";
    const prevHoveredTargetIds = new Set(sharedHoveredTargetIds.value);
    const newHoveredTargetIds = new Set<string>();

    for (const target of sharedRegisteredTargets.value) {
      if (isPointInTarget(
        { x: absoluteX, y: absoluteY }, 
        target.measurements.value, 
        hitSlop
      )) {
        newHoveredTargetIds.add(target.id);
      }
    }

    if (!areSetsEqual(prevHoveredTargetIds, newHoveredTargetIds)) {
      runOnJS(setHoveredTargets)(
        sharedRegisteredTargets.value.filter(target => newHoveredTargetIds.has(target.id))
      );
    }
  };
  
  const hoverGesture = Gesture.Pan()
    .onStart(() => {
      "worklet"
      runOnJS(setIsHovering)(true)
    })
    .onBegin(updateHoveredTargets)
    .onUpdate(updateHoveredTargets)
    .onFinalize(() => {
      "worklet"
      runOnJS(setIsHovering)(false)
    })

  return (
    <HoverContext.Provider value={{
      registerTarget: (target: Target) => {
        setRegisteredTargets(prev => upsert(prev, target))
      },
      unregisterTarget: (id: string) => {
        setRegisteredTargets(prev => remove(prev, id))
      },
      hoveredTargets,
      hoverGesture,
      isHovering
    }}>
      <GestureDetector gesture={hoverGesture}>
        {children}
      </GestureDetector>
    </HoverContext.Provider>
  );
};