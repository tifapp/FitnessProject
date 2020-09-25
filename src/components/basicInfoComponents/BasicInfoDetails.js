import React, {useState} from 'react';
import {View, StyleSheet, TextInput, TouchableOpacity} from 'react-native';
import { Entypo } from '@expo/vector-icons'; 
import Selector from './Selector'

const BasicInfoDetails = ({label, field, updateField}) => {
    const [modalOpen, setModalOpen] = useState(false)

    return (
        <View>
            {label != 'name' ? 
            <Selector 
                label = {label}
                modalOpen = {modalOpen} 
                setModalOpen = {setModalOpen} 
                field = {field}
                updateField = {updateField} /> : 
            null}

            <View style = {styles.textBoxStyle}>
                <TextInput
                    style = {styles.textInputStyle} 
                    placeholder = {`Enter your ${label}`} 
                    autoCorrect = {false}
                    value = {field}
                    onChangeText = {updateField}
                    editable = {(label == 'name') ? true : false}
                />

                <TouchableOpacity onPress = {() => setModalOpen(true)}> 
                    <Entypo name="edit" size={18} color="black" /> 
                </TouchableOpacity>
                
            </View> 

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
        alignItems: 'center',

    },
    textInputStyle: {
        fontSize: 15,
        marginHorizontal: 10,
        height: 30,
        flex: 1,
        borderBottomWidth: 1,
    },
   
})

export default BasicInfoDetails;