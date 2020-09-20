import React from 'react'
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native'

const Button = ({label, field, validate, invalidate}) => {
    console.log({field})
    return (
        <TouchableOpacity 
            style = { (field) ? styles.onButtonStyle : styles.offButtonStyle}
            onPress = {() => {
                validate(true) 
                invalidate(false)
            }}
        >
            <Text style = {styles.buttonTextStyle}>{label}</Text>  
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    onButtonStyle: {
        alignSelf: 'center',
        backgroundColor: 'black',
        padding: 10,
        borderRadius: 10,
        height: 50,
        width: 100
    },
    offButtonStyle: {
        alignSelf: 'center',
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 10,
        height: 50,
        width: 100
    },
    buttonTextStyle: {
        fontSize: 25,
        color: '#d3d3d3',
        alignSelf: 'center'
    }
})

export default Button