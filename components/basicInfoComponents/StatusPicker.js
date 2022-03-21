import React, { useEffect } from "react";
import { View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import StatusColors from "hooks/statusColors";

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
