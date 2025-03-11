import { Audio, AVPlaybackSource } from "expo-av"
import { useEffect, useRef, useState } from "react"

type SoundParams = [
  AVPlaybackSource,
  { paused?: boolean; loop?: boolean; volume?: number }?
]

const loadSound = async ([
  asset,
  { paused = false, loop = true, volume = 1.0 } = {}
]: SoundParams) => {
  const { sound } = await Audio.Sound.createAsync(asset)
  await sound.setIsLoopingAsync(loop)
  await sound.setVolumeAsync(volume)
  if (!paused) {
    await sound.playAsync()
  }
  return sound
}

const useSound = (...params: SoundParams) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null)

  useEffect(() => {
    loadSound(params)
      .then(setSound)
      .catch((e) => console.error(e))

    return () => {
      if (sound) {
        sound.unloadAsync()
      }
    }
  }, [])

  return { sound }
}

/**
 * Loads and plays a background soundtrack.
 * By default, the sound will start playing immediately on loop with full volume.
 *
 * @param asset - The audio file to be loaded, such as a local asset or a URI to an audio file.
 * @returns {Audio.Sound} - Returns an instance of `Audio.Sound` or `null`.
 *
 * Example:
 * ```ts
 * const { sound: backgroundMusic } = useTrack(require('./assets/background.mp3'), { volume: 0.8 });
 * ```
 */
export const useTrack = (
  ...[asset, { paused = false, loop = true, volume = 1.0 } = {}]: SoundParams
) => {
  return useSound(asset, { paused, loop, volume })
}

/**
 * Loads and plays a sound effect.
 * By default, the sound is paused initially and does not loop.
 *
 * @param asset - The audio file to be loaded, such as a local asset or a URI to an audio file.
 * @returns {Audio.Sound} - Returns an instance of `Audio.Sound` or `null`.
 *
 * Example:
 * ```ts
 * const { sound: buttonClickSound } = useSFX(require('./assets/button-click.wav'));
 * ```
 */
export const useSFX = (
  ...[asset, { paused = true, loop = false, volume = 1.0 } = {}]: SoundParams
) => {
  return useSound(asset, { paused, loop, volume })
}

type InterpolationFunction = (progress: number) => number

const linearInterpolation: InterpolationFunction = (progress: number) =>
  progress

export const useFade = (
  initialValue: number,
  setValue: (value: number) => void
) => {
  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const currentValueRef = useRef<number>(initialValue)

  const interpolate = (
    duration: number,
    targetValue: number,
    interpolationFunction: InterpolationFunction = linearInterpolation
  ) => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current)
    }
    startTimeRef.current = null

    const initial = currentValueRef.current
    const delta = targetValue - initial

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current
      const progress = interpolationFunction(Math.min(elapsed / duration, 1))

      const newValue = initial + delta * progress
      setValue(newValue)
      currentValueRef.current = newValue

      if (elapsed < duration) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        animationRef.current = null
      }
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  const fadeIn = (
    duration: number = 1000,
    targetValue: number = 1,
    interpolationFunction?: InterpolationFunction
  ) => {
    interpolate(duration, targetValue, interpolationFunction)
  }

  const fadeOut = (
    duration: number = 1000,
    targetValue: number = 0,
    interpolationFunction?: InterpolationFunction
  ) => {
    interpolate(duration, targetValue, interpolationFunction)
  }

  const clearFade = () => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      clearFade()
    }
  }, [])

  return { fadeIn, fadeOut }
}
