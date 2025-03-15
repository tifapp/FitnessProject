import React, { createContext, ReactNode } from 'react';
import { SharedValue } from 'react-native-reanimated';
import type { Measurements, Target } from "../HoverContext/types";
import { useSharedState } from "../HoverContext/useSharedState";
import { doSharedMeasurementsOverlap, remove, upsert } from "../HoverContext/utils";

export const CollisionContext = createContext<
  {
    registerTarget: (target: Target) => void;
    unregisterTarget: (id: string) => void;
    checkCollidingTargets: (measurements: SharedValue<Measurements>) => Target[]
  }
>({
  registerTarget: () => {},
  unregisterTarget: () => {},
  checkCollidingTargets: () => []
});

const HIT_SLOP = 0;

export const CollisionProvider = ({ children, hitSlop = HIT_SLOP }: { children: ReactNode, hitSlop?: number }) => {
  const [, setRegisteredTargets, sharedRegisteredTargets] = useSharedState<Target[]>([]);

  const checkCollidingTargets = (bounds: SharedValue<Measurements>): Target[] => {
    "worklet";
    const collidingTargetIds = new Set<string>();

    for (const target of sharedRegisteredTargets.value) {
      if (doSharedMeasurementsOverlap(
        bounds, 
        target.measurements, 
        hitSlop
      )) {
        collidingTargetIds.add(target.id);
      }
    }

    return sharedRegisteredTargets.value.filter(target => collidingTargetIds.has(target.id))
  };

  return (
    <CollisionContext.Provider value={{
      registerTarget: (target: Target) => {
        setRegisteredTargets(prev => upsert(prev, target))
      },
      unregisterTarget: (id: string) => {
        setRegisteredTargets(prev => remove(prev, id))
      },
      checkCollidingTargets
    }}>
      {children}
    </CollisionContext.Provider>
  );
};