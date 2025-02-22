import { CollisionProvider } from ".storybook/components/CollisionContext/CollisionContext"
import { TiFBottomSheetProvider } from "@components/BottomSheet"
import { PortalProvider } from "@gorhom/portal"
import { TiFQueryClientProvider } from "@lib/ReactQuery"
import React from "react"
import { StyleProp, View, ViewStyle } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { RootSiblingParent } from "react-native-root-siblings"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { TiFContext, TiFContextValues } from "./Context"
import { RootNavigation } from "./navigation/Root"

export type TiFProps = {
  isFontsLoaded: boolean
  style?: StyleProp<ViewStyle>
} & TiFContextValues

/**
 * The root view of the app.
 */
export const TiFView = ({ isFontsLoaded, style, ...props }: TiFProps) => {
  if (!isFontsLoaded) return null
  return (
    <CollisionProvider>
      <GestureHandlerRootView>
        <PortalProvider>
          <TiFQueryClientProvider>
            <SafeAreaProvider>
              <RootSiblingParent>
                <TiFBottomSheetProvider>
                  <View style={style}>
                    <TiFContext.Provider value={props}>
                      <RootNavigation />
                    </TiFContext.Provider>
                  </View>
                </TiFBottomSheetProvider>
              </RootSiblingParent>
            </SafeAreaProvider>
          </TiFQueryClientProvider>
        </PortalProvider>
      </GestureHandlerRootView>
    </CollisionProvider>
  )
}
