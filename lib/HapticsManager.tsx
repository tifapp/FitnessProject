import { atom, useAtom, useSetAtom } from "jotai"
import { HapticEvent, HapticsFunctions, expoPlayHaptics } from "./Haptics"

export const hapticsAtom = atom(true)

export class HapticsManager implements HapticsFunctions {
  play = async (hapticTrigger: HapticEvent) => {
    const [areHapticsOn, setAreHapticsOn] = useAtom(hapticsAtom)
    if (areHapticsOn) {
      return await expoPlayHaptics(hapticTrigger)
        .then((data) => playAction())
        .catch((err) => errorHandle())
    }
  }

  mute = () => {
    const setHapticsOn = useSetAtom(hapticsAtom)
    setHapticsOn(false)
  }

  unmute = () => {
    const setHapticsOn = useSetAtom(hapticsAtom)
    setHapticsOn(true)
  }
}
function playAction () {
  throw new Error("Function not implemented.")
}

function errorHandle () {
  throw new Error("Function not implemented.")
}
