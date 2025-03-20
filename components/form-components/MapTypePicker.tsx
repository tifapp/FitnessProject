import { StyleProp, ViewStyle } from "react-native"
import { MapType } from "react-native-maps"
import { TiFFormMenuPickerView } from "./MenuPicker"
import { Ionicon } from "@components/common/Icons"

export type MapTypePickerProps = {
  selectedOption: MapType
  onOptionSelected: (option: MapType) => void
  style?: StyleProp<ViewStyle>
}

export const MapTypePickerView = ({
  selectedOption,
  onOptionSelected,
  style
}: MapTypePickerProps) => (
  <TiFFormMenuPickerView
    options={MAP_TYPE_OPTIONS}
    selectedOption={selectedOption}
    onOptionSelected={onOptionSelected}
    style={style}
  >
    <Ionicon name="map" size={24} />
  </TiFFormMenuPickerView>
)

const MAP_TYPE_OPTIONS = new Map<MapType, { title: string }>([
  ["standard", { title: "Default" }],
  ["satellite", { title: "Satellite" }],
  ["hybrid", { title: "Hybrid" }],
  ["terrain", { title: "Terrain" }]
])
