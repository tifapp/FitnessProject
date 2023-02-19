import React from "react"
import { HexColor } from "@lib/Color"

export type HexColorPickerProps = {
  color: HexColor
  onChange: (color: HexColor) => void
  options: HexColor[]
}

const HexColorPicker = ({ color, onChange, options }: HexColorPickerProps) => {
  return <></>
}

export default HexColorPicker
