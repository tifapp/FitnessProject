import { LocalSettings } from "@settings-storage/LocalSettings"
import { SettingsReader } from "@settings-storage/PersistentStore"
import { requireOptionalNativeModule } from "expo"
import { ReactNode, createContext, useContext } from "react"

const ExpoTiFWeblinks = requireOptionalNativeModule("ExpoTiFWeblinks")

/**
 * Opens the url based on the user's preferences.
 *
 * If the user prefers to use an in-app browser, then this function will try to
 * find an installed app to open the URL in first. If no installed app is found,
 * then the URL will be opened in the in-app browser.
 */
export const openWeblink = async (
  url: string,
  settingsReader: SettingsReader<LocalSettings>
) => {
  const { isUsingSafariReaderMode, preferredBrowserName } =
    await settingsReader.load()
  await ExpoTiFWeblinks.openWeblink(
    url,
    preferredBrowserName === "in-app",
    isUsingSafariReaderMode
  )
}

const OpenWeblinkContext = createContext<(url: string) => Promise<void>>(
  async () => console.log("TODO: - Default Value")
)

export type OpenWeblinkProviderProps = {
  open: (url: string) => Promise<void>
  children: ReactNode
}

export const OpenWeblinkProvider = ({
  open,
  children
}: OpenWeblinkProviderProps) => (
  <OpenWeblinkContext.Provider value={open}>
    {children}
  </OpenWeblinkContext.Provider>
)

export const useOpenWeblink = () => useContext(OpenWeblinkContext)
