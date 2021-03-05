import { Audio } from "expo-av";

export default async function playSound(soundName) {
  const { sound } = await Audio.Sound.createAsync(
    soundName == "confirm-up" ? 
    require('audio/confirm-up.wav') :
    soundName == "confirm-down" ?
    require('audio/confirm-down.wav') :
    soundName == "complete" ?
    require("audio/complete.wav") :
    require("audio/celebrate.wav")
  );
  sound.playAsync();
}
