import React from 'react'
import {View, StyleSheet, Text, TextInput, TouchableOpacity} from 'react-native'
import { Entypo } from '@expo/vector-icons'; 

const DetailedInfoDetails = ({navigation, label, field, setField}) => {
    return (
        <View>
            <TouchableOpacity onPress = {() => 
                { (label == 'bio') ? navigation.navigate('Bio') : navigation.navigate('Goals') }}
            >
                <Entypo style = {styles.editIconStyle}name="edit" size={24} color="black" />
            </TouchableOpacity>

            <TextInput 
                style = {styles.textInputStyle}
                placeholder = {`Enter your ${label}`} 
                multiline = {true}
                scrollEnabled = {false}
                autoCorrect = {false}
                value = {field}
                onChangeText = {setField}
                editable = {false}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    editIconStyle: {
        alignSelf: 'flex-end',
        marginRight: 3,
    },
    textInputStyle: {
        borderRadius: 20,
        fontSize: 15,
        marginHorizontal: 15,
        paddingHorizontal: 10,
        height: 150,
        marginBottom: 20,
        flex: 1,
        backgroundColor: 'white'
    },

})

export default DetailedInfoDetails