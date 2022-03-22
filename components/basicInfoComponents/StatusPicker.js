import StatusColors from "@hooks/statusColors";
import { Picker } from "@react-native-picker/picker";
import React from "react";

const StatusPicker = ({ selectedValue, setSelectedValue }) => {
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
