import React, {useState} from 'react'
import {View, StyleSheet, Text} from 'react-native'
import ButtonToggle from './ButtonToggle'
import DetailedInfoDetails from './DetailedInfoDetails'

const DetailedInfo = ({navigation}) => {
    const [bio, setBio] = useState(true)
    const [goals, setGoals] = useState(false)

    const [bioDetails, setBioDetails] = useState('')
    const [goalsDetails, setGoalsDetails] = useState('')

    return (
        <View>
            <ButtonToggle bio = {bio} goals = {goals} setBio = {setBio} setGoals = {setGoals} />
            {bio ? 
                <DetailedInfoDetails navigation = {navigation} label = 'bio' field = {bioDetails} setField = {setBioDetails} /> : 
                <DetailedInfoDetails navigation = {navigation} label = 'goals' field = {goalsDetails} setField = {setGoalsDetails}/>
            }
        </View>
    )
}

const styles = StyleSheet.create({

})

export default DetailedInfo