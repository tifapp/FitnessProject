import React, {useState} from 'react'
import {View, StyleSheet, Text, Modal, Picker} from 'react-native'
import { AntDesign } from '@expo/vector-icons'
import AgePicker from './AgePicker'
import GenderPicker from './GenderPicker'

const Selector = ({label, modalOpen, setModalOpen, updateField}) => {
    const [selectedValue, setSelectedValue] = useState('');
    
    return (
        <Modal transparent = {true} visible = {modalOpen} animationType ='slide'>

            <View style = {styles.modalStyle} >
                <AntDesign 
                    onPress = {() => {
                        updateField(selectedValue)
                        setModalOpen(false)
                    }}
                    style = {styles.exitModalButton}
                    name="closecircle" 
                    size={18} 
                    color="black" 
                />
                
            {label == 'age' ? 
            <AgePicker selectedValue = {selectedValue} setSelectedValue = {setSelectedValue} /> : 
            <GenderPicker selectedValue = {selectedValue} setSelectedValue = {setSelectedValue} /> }
            
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalStyle: {
        flex: 1,
        marginTop: 350,
        width: '100%',
        backgroundColor: 'white'
    }, 
    exitModalButton: {
        marginVertical: 5,
        marginLeft: 5,
    }
})

export default Selector