import React, {useState} from 'react';
import DetailedInfoInput from '../components/detailedInfoComponents/DetailedInfoInput'
import {
    StyleSheet,
    View,
    Button,
    Image,
    TextInput,
    Text,
    TouchableOpacity,
  } from "react-native";

const BioScreen = ({route}) => {
    const {field, bio} = route.params;
    const [text, setText] = useState(field)
    const totalCharsRemaining = bio-text.length;
    

    return (
        <View>
            <Text> Characters remaining: {totalCharsRemaining}</Text>
            <DetailedInfoInput 
                label = 'bio'
                description = 'Tell other users a little bit about yourself! Mention information such as your favorite exercises, sports, music, food, etc to connect with others!'
                text = {text}
                setText = {setText}
                maxLength = {1000}
            />
        </View>
    )
}

export default BioScreen;