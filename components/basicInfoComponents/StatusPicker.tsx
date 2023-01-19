import StatusColors, { Status } from "@hooks/statusColors";
import { Picker } from "@react-native-picker/picker";
import React from "react";

interface Props {
  selectedValue: Status,
  setSelectedValue: (s:Status) => void
}

const StatusPicker = ({ selectedValue, setSelectedValue }: Props) => {
  return (
    <Picker
      selectedValue={selectedValue}
      itemStyle={{ width: 1000 }}
      onValueChange={(itemValue, itemIndex) => setSelectedValue(itemValue)}
    >
      {Object.keys(StatusColors).map((v) => {
        return <Picker.Item key={v} label={v.toString()} value={v} />;
      })}
    </Picker>
  );
};

export default StatusPicker;

