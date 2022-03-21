import { Picker } from "@react-native-picker/picker";
import React from "react";

const minAge = 18;
const maxAge = 100;
const ageRange = Array.from(
  { length: maxAge - minAge + 1 },
  (_, i) => i + minAge
);

const AgePicker = ({ selectedValue, setSelectedValue }) => {
  return (
    <Picker
      selectedValue={selectedValue}
      itemStyle={{ width: 100 }}
      onValueChange={(itemValue, itemIndex) => setSelectedValue(itemValue)}
    >
      {ageRange.map((v) => {
        return <Picker.Item key={v} label={v.toString()} value={v} />;
      })}
    </Picker>
  );
};

export default AgePicker;
