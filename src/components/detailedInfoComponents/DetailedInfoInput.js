import React from 'react'
import {View, StyleSheet, Text, TextInput, Keyboard, TouchableWithoutFeedback, TouchableOpacity} from 'react-native'
import { useNavigation } from '@react-navigation/native';

const DetailedInfoInput = ({label, description, text, setText}) => {
    const navigation = useNavigation();

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View>
                <Text style = {styles.descriptionStyle}>{description}</Text>
                <TextInput 
                    style = {styles.textInputStyle}
                    multiline = {true}
                    //autoCorrect = {false}
                    value = {text}
                    onChangeText = {setText}
                />
                <TouchableOpacity 
                    style = {styles.buttonStyle} 
                    onPress = {() => navigation.navigate('Profile', {updatedField: text, label: label})}
                >
                    <Text style = {styles.buttonTextStyle}>Save</Text>
                </TouchableOpacity>
            </View>
        </TouchableWithoutFeedback>
    )
}

const styles = StyleSheet.create({
    descriptionStyle: {
        fontWeight: 'bold',
        marginHorizontal: '5%',
        marginVertical: '2%'
    },
    textInputStyle: {
        height: 100,
        backgroundColor: '#d3d3d3',
        borderRadius: 20,
        fontSize: 15,
        marginHorizontal: 15,
        paddingHorizontal: 10,
    },
    buttonStyle: {
        marginTop: '5%',
        alignSelf: 'center',
        backgroundColor: 'blue',
        padding: 10,
        borderRadius: 20,
        height: 50,
        width: 100
    },
    buttonTextStyle: {
        fontSize: 25,
        color: 'white',
        alignSelf: 'center'
    }
})

export default DetailedInfoInput