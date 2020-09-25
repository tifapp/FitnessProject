import React from 'react'
import {View, StyleSheet, TextInput, TouchableOpacity} from 'react-native'
import { Entypo } from '@expo/vector-icons'; 
import { useNavigation } from '@react-navigation/native';


const DetailedInfoDetails = ({label, field, setField}) => {
    const navigation = useNavigation();

    return (
        <View>
            <TouchableOpacity onPress = {() => 
                { (label == 'bio') ? 
                    navigation.navigate('Bio', {field : field}) : 
                    navigation.navigate('Goals', {field : field}) 
                }}
            >
                <Entypo style = {styles.editIconStyle} name="edit" size={24} color="black" />
            </TouchableOpacity>

            <TextInput 
                style = {styles.textInputStyle}
                placeholder = {`Enter your ${label}!`} 
                multiline = {true}
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
        height: 100,
        marginBottom: 20,
        flex: 1,
        backgroundColor: 'white'
    },

})

export default DetailedInfoDetails