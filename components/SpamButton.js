import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { ProfileImageAndName } from './ProfileImageAndName';
import { MaterialIcons } from '@expo/vector-icons';
import computeDistance from "hooks/computeDistance";
import getLocation from 'hooks/useLocation';

var styles = require('../styles/stylesheet');

export default function SpamButton({
  func
}) {
  const [spamming, setSpamming] = useState(false);
  const timeoutFunction = useRef();

  const spam = () => {func(), timeoutFunction.current = setTimeout(spam, 1000);}

  return (
    <TouchableOpacity onPress={() => {
      if (spamming) {
        clearTimeout(timeoutFunction.current);
      } else {
        spam();
      }
      setSpamming(!spamming)
    }}>
      <MaterialIcons name={spamming ? "close" : "10k"} size={30} color="black" />
    </TouchableOpacity>
  );
}