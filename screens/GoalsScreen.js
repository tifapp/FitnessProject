import React, {useState} from 'react';
import DetailedInfoInput from 'components/detailedInfoComponents/DetailedInfoInput'
import {
    StyleSheet,
    View,
    Button,
    Image,
    TextInput,
    Text,
    TouchableOpacity,
  } from "react-native";

const GoalsScreen = ({route}) => {
    const {field, goals} = route.params;
    const [text, setText] = useState(field)
    const totalCharsRemaining = goals - text.length;

    return (
        <View>
            <Text>Characters remaining: {totalCharsRemaining}</Text>
            <DetailedInfoInput 
                label = 'goals'
                description = 'Tell other users about your goals! By mentioning your goals, you can find like-minded people to work with!'
                text = {text}
                setText = {setText}
                maxLength = {1000}
            />
        </View>
    )
}

export default GoalsScreen;
