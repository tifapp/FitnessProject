import { ReactNode, createContext, useContext } from "react"
import { AppState, AppStateStatic } from "react-native"

const AppStateContext = createContext(AppState)

export type AppStateProviderProps = {
  appState: AppStateStatic
  children: ReactNode
}

export const AppStateProvider = ({
  appState,
  children
}: AppStateProviderProps) => (
  <AppStateContext.Provider value={appState}>
    {children}
  </AppStateContext.Provider>
)

export const useAppState = () => useContext(AppStateContext)
