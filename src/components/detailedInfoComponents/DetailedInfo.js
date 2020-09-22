import React, {useState} from 'react'
import {View, StyleSheet, Text} from 'react-native'
import ButtonToggle from './ButtonToggle'
import DetailedInfoDetails from './DetailedInfoDetails'

const DetailedInfo = ({bioDetails, goalsDetails, setBioDetails, setGoalsDetails}) => {
    const [bio, setBio] = useState(true)
    const [goals, setGoals] = useState(false)

    return (
        <View>
            <ButtonToggle bio = {bio} goals = {goals} setBio = {setBio} setGoals = {setGoals} />
            {bio ? 
                <DetailedInfoDetails label = 'bio' field = {bioDetails} setField = {setBioDetails} /> : 
                <DetailedInfoDetails label = 'goals' field = {goalsDetails} setField = {setGoalsDetails}/>
            }
        </View>
    )
}

const styles = StyleSheet.create({

})

export default DetailedInfo