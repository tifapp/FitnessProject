import { SetStateAction, atom } from "jotai"
import AsyncStorage from "@react-native-async-storage/async-storage"

export namespace JotaiUtils {
  /**
   * {@link atomWithStorage} but uses a default of {@link AsyncStorage}.
   *
   * Copied from: {@link https://jotai.org/docs/guides/persistence}
   */
  export const atomWithAsyncStorage = <Value>(
    key: string,
    initialValue: Value
  ) => {
    const baseAtom = atom<Value>(initialValue)
    baseAtom.onMount = (setValue) => {
      const loadInitial = async () => {
        const item = await AsyncStorage.getItem(key)
        if (item) setValue(JSON.parse(item))
      }
      loadInitial()
    }
    const derivedAtom = atom(
      (get) => get(baseAtom),
      (get, set, update) => {
        const nextValue =
          typeof update === "function" ? update(get(baseAtom)) : update
        set(baseAtom, nextValue)
        AsyncStorage.setItem(key, JSON.stringify(nextValue))
      }
    )
    return derivedAtom
  }

  /**
   * Creates a group of atoms that allow for debouncing operations.
   *
   * Copied from: {@link https://jotai.org/docs/recipes/atom-creators}
   */
  export const debounceAtomGroup = <T>(
    initialValue: T,
    delayMilliseconds = 500,
    shouldDebounceOnReset = false
  ) => {
    const prevTimeoutAtom = atom<ReturnType<typeof setTimeout> | undefined>(
      undefined
    )

    const _currentValueAtom = atom(initialValue)
    const isDebouncingAtom = atom(false)

    const debouncedValueAtom = atom(
      initialValue,
      (get, set, update: SetStateAction<T>) => {
        clearTimeout(get(prevTimeoutAtom))

        const prevValue = get(_currentValueAtom)
        const nextValue =
          typeof update === "function"
            ? (update as (prev: T) => T)(prevValue)
            : update

        const onDebounceStart = () => {
          set(_currentValueAtom, nextValue)
          set(isDebouncingAtom, true)
        }

        const onDebounceEnd = () => {
          set(debouncedValueAtom, nextValue)
          set(isDebouncingAtom, false)
        }

        onDebounceStart()

        if (!shouldDebounceOnReset && nextValue === initialValue) {
          onDebounceEnd()
          return
        }

        const nextTimeoutId = setTimeout(() => {
          onDebounceEnd()
        }, delayMilliseconds)

        set(prevTimeoutAtom, nextTimeoutId)
      }
    )

    const clearTimeoutAtom = atom(null, (get, set, _arg) => {
      clearTimeout(get(prevTimeoutAtom))
      set(isDebouncingAtom, false)
    })

    return {
      currentValueAtom: atom((get) => get(_currentValueAtom)),
      isDebouncingAtom,
      clearTimeoutAtom,
      debouncedValueAtom
    }
  }
}
