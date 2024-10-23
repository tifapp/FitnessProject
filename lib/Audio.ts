import { Audio, AVPlaybackSource } from "expo-av"
import { useEffect, useState } from "react"

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
