import React from 'react'
import {StyleSheet, Text, TouchableOpacity} from 'react-native'

var styles = require('../../styles/stylesheet');

const Button = ({label, field, validate, invalidate}) => {
    return (
        <TouchableOpacity 
            style = { (field) ? styles.outlineButtonStyle : styles.unselectedButtonStyle}
            onPress = {() => {
                validate(true) 
                invalidate(false)
            }}
        >
            <Text style = {(field) ? styles.outlineButtonTextStyle : styles.unselectedButtonTextStyle}>{label}</Text>  
        </TouchableOpacity>
    )
}

export default Button