import React, { useState } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Modal } from 'react-native';
//import { Entypo } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AgePicker from './AgePicker'
import GenderPicker from './GenderPicker'

const BasicInfoDetails = ({ age, gender, setAge, setGender }) => {

    const [modalOpen, setModalOpen] = useState(false)

    return (
        <View>
            <Modal transparent={true} visible={modalOpen} animationType='slide'>
                <View style={{flex: 1}}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => setModalOpen(false)}>
                    </TouchableOpacity>
                    <View style={{ flexDirection: "row", justifyContent: "center", backgroundColor: "white", alignItems: "flex-end", marginTop: "auto" }} >
                        <AgePicker selectedValue={age} setSelectedValue={setAge} />
                        <GenderPicker selectedValue={gender} setSelectedValue={setGender} />
                    </View>
                </View>
            </Modal>

            <TouchableOpacity style={[styles.textBoxStyle]} onPress={() => setModalOpen(true)}>
                <Text style={{ fontSize: 16, color: "black" }}>{`(${age}, ${gender})`}</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = new StyleSheet.create({
    textBoxStyle: {
        flexDirection: 'row',
        height: 35,
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