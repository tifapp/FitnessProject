import React, { useState } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
//import { Entypo } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Selector from './Selector'

const BasicInfoDetails = ({ label, field, updateField }) => {
    const [modalOpen, setModalOpen] = useState(false)

    return (
        <View>
            <Selector
                label={label}
                modalOpen={modalOpen}
                setModalOpen={setModalOpen}
                field={field}
                updateField={updateField} />

            <TouchableOpacity style={[styles.textBoxStyle, { borderBottomColor: 'gray', borderBottomWidth: 1 }]} onPress={() => setModalOpen(true)}>
                <View>
                    <Text style={{ marginLeft: 5 }}> {field}</Text>
                </View>

                {/* <MaterialCommunityIcons name="dumbbell" size={24} color="black" /> */}
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
        alignItems: 'center',
        paddingRight: 10,
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