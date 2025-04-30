import React, { useState } from "react"
import { StyleSheet, View, StyleProp, ViewStyle } from "react-native"

export type DashedLineProps = {
  axis?: "horizontal" | "vertical"
  dashGap?: number
  dashLength?: number
  dashThickness?: number
  dashColor?: string
  dashStyle?: StyleProp<ViewStyle>
  style?: StyleProp<ViewStyle>
}

export const DashedLine = ({
  axis = "horizontal",
  dashGap = 2,
  dashLength = 4,
  dashThickness = 2,
  dashColor = "#000",
  dashStyle,
  style
}: DashedLineProps) => {
  const [lineLength, setLineLength] = useState(0)
  const isRow = axis === "horizontal"
  const numOfDashes = Math.ceil(lineLength / (dashGap + dashLength))
  return (
    <View
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout
        setLineLength(isRow ? width : height)
      }}
      style={[style, isRow ? styles.row : styles.column]}
    >
      {[...Array(numOfDashes)].map((_, i) => {
        // eslint-disable-next-line react/no-array-index-key
        return (
          <View
            key={i}
            style={[
              {
                width: isRow ? dashLength : dashThickness,
                height: isRow ? dashThickness : dashLength,
                marginRight: isRow ? dashGap : 0,
                marginBottom: isRow ? 0 : dashGap,
                backgroundColor: dashColor
              },
              dashStyle
            ]}
          />
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row"
  },
  column: {
    flexDirection: "column"
  }
})
