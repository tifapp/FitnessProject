import React from "react"
import { StyleSheet } from "react-native"
import { MenuProvider } from "react-native-popup-menu"

export type TiFMenuProviderProps = {
  children: JSX.Element
}

/**
 * A wrapper provider for react-native-popup-menu.
 */
export const TiFMenuProvider = ({ children }: TiFMenuProviderProps) => (
  <MenuProvider customStyles={menuProviderStyles}>{children}</MenuProvider>
)

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "black",
    opacity: 0.5
  }
})

const menuProviderStyles = {
  backdrop: styles.backdrop
}
