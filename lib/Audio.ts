import { Audio, AVPlaybackSource } from 'expo-av';
import { useEffect, useState } from 'react';

interface UseSoundOptions {
  asset: AVPlaybackSource;
  loop?: boolean;
  volume?: number;
}

const playSound = async ({asset, loop = false, volume = 1.0}: UseSoundOptions) => {
  const { sound } = await Audio.Sound.createAsync(asset);
  await sound.setIsLoopingAsync(loop);
  await sound.setVolumeAsync(volume);
  await sound.playAsync();
  return sound
};

export const useSound = (params: UseSoundOptions) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    playSound(params).then(setSound);

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  return {sound};
};
