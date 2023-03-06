/* eslint-disable react/prop-types */
/* eslint-disable react/react-in-jsx-scope */
// @ts-nocheck
jest.mock("@gorhom/bottom-sheet", () => {
  const reactNative = jest.requireActual("react-native")
  const {
    useState,
    useImperativeHandle,
    createContext,
    useContext,
    forwardRef
  } = jest.requireActual("react")
  const { View } = reactNative
  const ModalContext = createContext(undefined)
  const BottomSheet = jest.requireActual("@gorhom/bottom-sheet")

  const useModal = () => useContext(ModalContext)

  return {
    __esModule: true,
    ...BottomSheet,
    BottomSheetView: View,
    BottomSheetModal: forwardRef(function ({ children }, ref) {
      const [isPresented, setIsPresented] = useModal()

      useImperativeHandle(
        ref,
        () => ({
          dismiss: () => setIsPresented(false),
          present: () => setIsPresented(true)
        }),
        []
      )

      return <View>{isPresented && children}</View>
    }),
    BottomSheetModalProvider: ({ children }) => {
      const [isPresented, setIsPresented] = useState(false)
      return (
        <ModalContext.Provider value={[isPresented, setIsPresented]}>
          {children}
        </ModalContext.Provider>
      )
    },
    useBottomSheetModal: () => {
      const [, setIsPresented] = useModal()
      return {
        dismiss: () => setIsPresented(false),
        present: () => setIsPresented(true)
      }
    }
  }
})
