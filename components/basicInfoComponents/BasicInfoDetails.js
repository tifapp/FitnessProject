import React, { useState } from 'react';
import {Text, View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
//import { Entypo } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import Selector from './Selector'

const BasicInfoDetails = ({ label, field, updateField }) => {
    const [modalOpen, setModalOpen] = useState(false)

    return (
        <View>
            {label != 'name'
                ? <Selector
                    label={label}
                    modalOpen={modalOpen}
                    setModalOpen={setModalOpen}
                    field={field}
                    updateField={updateField} />
                : null}

            {label == 'name' ?
                <TouchableOpacity style={styles.textBoxStyle}>
                    <TextInput
                        style={field === '' ? styles.emptyTextInputStyle : styles.textInputStyle}
                        placeholder={`Enter your ${label}`}
                        autoCorrect={false}
                        value={field.toString()}
                        onChangeText={updateField}
                    />

                    {/* <MaterialCommunityIcons name="dumbbell" size={24} color="black" /> */}
                </TouchableOpacity> 

                :

                <TouchableOpacity style={[styles.textBoxStyle, {borderBottomColor: 'gray', borderBottomWidth: 1}]} onPress={()=>setModalOpen(true)}>
                    <View>
                        <Text style = {{marginLeft: 5}}> {field}</Text>
                    </View>

                    {/* <MaterialCommunityIcons name="dumbbell" size={24} color="black" /> */}
                </TouchableOpacity> 
            }
            

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
        borderBottomColor: 'gray',
    },
    emptyTextInputStyle: {
        fontSize: 15,
        marginHorizontal: 10,
        height: 30,
        flex: 1,
        borderBottomWidth: 1,
        borderBottomColor: 'red',
    },

})

export default BasicInfoDetails;