import React from 'react'
import {View, StyleSheet} from 'react-native'
import Button from './Button'

var styles = require('../../styles/stylesheet');

const ButtonToggle = ({bio, goals, setBio, setGoals}) => {
   
    return (
        <View style = {styles.rowContainerStyle}>

            <Button label = 'Bio' field = {bio} validate = {setBio} invalidate = {setGoals}/>
            <Button label = 'Goals' field = {goals} validate = {setGoals} invalidate = {setBio}/>

        </View>
    )
}

export default ButtonToggle