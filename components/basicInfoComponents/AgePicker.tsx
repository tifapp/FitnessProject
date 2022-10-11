import { Picker } from "@react-native-picker/picker";
import React from "react";

const minAge: number = 18;
const maxAge: number = 100;
const ageRange: number[] = Array.from(
  { length: maxAge - minAge + 1 },
  (_, i) => i + minAge
);

interface Props {
  selectedValue: number,
  setSelectedValue: (n: number) => void
}

export default function AgePicker({ selectedValue, setSelectedValue }: Props) {
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
