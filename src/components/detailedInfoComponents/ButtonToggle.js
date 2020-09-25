import React from 'react'
import {View, StyleSheet} from 'react-native'
import Button from './Button'

const ButtonToggle = ({bio, goals, setBio, setGoals}) => {
   
    return (
        <View style = {styles.containerStyle}>

            <Button label = 'Bio' field = {bio} validate = {setBio} invalidate = {setGoals}/>
            <Button label = 'Goals' field = {goals} validate = {setGoals} invalidate = {setBio}/>

        </View>
    )
}

const styles = new StyleSheet.create({
    containerStyle: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },
})

export default ButtonToggle