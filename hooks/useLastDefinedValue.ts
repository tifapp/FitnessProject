import { useRef } from "react"

/**
 * Remembers the last value that was not undefined.
 *
 * This is most useful for preserving dismissal UI during state driven navigation, where
 * setting the state to undefined dismisses the current screen, modal, bottom sheet, etc.
 *
 * The following shows this hook in action by providing a way to keep the contents of the screen
 * on display when the bottom sheet is being dismissed:
 *
 * ```tsx
 * const SectionedBottomSheet = () => {
 *  const bottomSheetRef = useRef<BottomSheetModal>(null)
 *  const section = useSection() // Assume we get this from some parent context
 *
 *  // Remember the last displayed section so that it still appears in
 *  // the bottom sheet while it's animating its dismissal.
 *  const displayedSection = useLastDefinedValue(section)
 *
 *  const snapPoints = useSnapPoints()
 *
 *  // Dismiss the bottom sheet when the section is undefined
 *  useEffect(() => {
 *    if (section) {
 *      bottomSheetRef.current?.present()
 *    } else {
 *      bottomSheetRef.current?.dismiss()
 *    }
 *  }, [section])
 *
 *  return (
 *    <BottomSheetModalProvider>
 *      <BottomSheetModal
 *        ref={bottomSheetRef}
 *        snapPoints={snapPoints}
 *      >
 *        {displayedSection === "section0" && <Text>Section 0</Text>}
 *        {displayedSection === "section1" && <Text>Section 1</Text>}
 *        {displayedSection === "section2" && <Text>Section 2</Text>}
 *      </BottomSheetModal>
 *    </BottomSheetModalProvider>
 *  )
 * }
 * ```
 */
export const useLastDefinedValue = <T>(value?: T) => {
  const lastValue = useRef(value)
  lastValue.current = value ?? lastValue.current
  return lastValue.current
}
