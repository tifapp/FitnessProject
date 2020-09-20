import React, {useState} from 'react';
import {View, StyleSheet, Text, TextInput, TouchableOpacity} from 'react-native';
import { Entypo } from '@expo/vector-icons'; 

const BasicInfoDetails = ({label, field, updateField}) => {
    const [inputEnabled, setInputEnabled] = useState(false)

    return (
        <View style = {styles.textBoxStyle}>
            <TextInput 
                style = {styles.textInputStyle} 
                placeholder = {`Enter your ${label}`} 
                autoCorrect = {false}
                value = {field}
                onChangeText = {updateField}
                onEndEditing = {() => setInputEnabled(false)}
                editable = {inputEnabled}
                autoFocus = {true}
            />
            <TouchableOpacity onPress = {() => setInputEnabled(true)}>
                <Entypo name="edit" size={24} color="black" />
            </TouchableOpacity>
            
        </View>  
    )
}

const styles = new StyleSheet.create({
    textBoxStyle: {
        flexDirection: 'row',
        height: 35,
        marginTop: 5,
        marginBottom: 8,
        marginHorizontal: 60,
        borderRadius: 10,
        alignItems: 'center'
    },
    textInputStyle: {
        fontSize: 15,
        marginHorizontal: 10,
        height: 30,
        flex: 1,
        borderBottomWidth: 1,
    }
})

export default BasicInfoDetails;