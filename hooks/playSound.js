import { Audio } from "expo-av";

export default async function playSound(soundName) {
  const { sound } = await Audio.Sound.createAsync(
    require("audio/" + soundName + ".wav")
  );
  sound.playAsync();
}
