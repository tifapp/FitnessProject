import { MaterialIcons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { TouchableOpacity } from "react-native";

export default function SpamButton({ func }) {
  const [spamming, setSpamming] = useState(false);
  const timeoutFunction = useRef();

  const spam = () => {
    func(), (timeoutFunction.current = setTimeout(spam, 1000));
  };

  return (
    <TouchableOpacity
      onPress={() => {
        if (spamming) {
          clearTimeout(timeoutFunction.current);
        } else {
          spam();
        }
        setSpamming(!spamming);
      }}
    >
      <MaterialIcons
        name={spamming ? "close" : "10k"}
        size={30}
        color="black"
      />
    </TouchableOpacity>
  );
}
