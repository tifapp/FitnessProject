import React from 'react'
import { View, StyleSheet, TextInput, Text, TouchableOpacity } from 'react-native'
//import { Entypo } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useNavigation } from '@react-navigation/native';

var styles = require('../../styles/stylesheet');

const DetailedInfoDetails = ({ label, field, setField }) => {
    const navigation = useNavigation();

    const goToTextBox = () => {
        (label == 'bio') ?
            navigation.navigate('Bio', { field: field }) :
            navigation.navigate('Goals', { field: field })
    }

    return (
        <TouchableOpacity style={{
            backgroundColor: "white",
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.18,
            shadowRadius: 1.0,
            marginBottom: 20,
            marginHorizontal: 20,

            elevation: 1,
            padding: 15,
            flex: 0
        }}
        onPress={goToTextBox}>
            <Text style={{fontSize: 18, color: "gray", marginBottom: 5}}>{label === 'bio' ? "Biography" : "Goals"}</Text>


            <TextInput
                //onFocus={goToTextBox}
                placeholder={`Enter your ${label}!`}
                multiline={true}
                autoCorrect={false}
                value={field}
                onChangeText={setField}
                editable={false}
                style={{fontSize: 18}}
            />
        </TouchableOpacity>
    )
}

export default DetailedInfoDetails