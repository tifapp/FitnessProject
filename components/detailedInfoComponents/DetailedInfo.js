import React, {useState} from 'react'
import {View} from 'react-native'
import ButtonToggle from './ButtonToggle'
import DetailedInfoDetails from './DetailedInfoDetails'

const DetailedInfo = ({bioDetails, goalsDetails, bioDetailsMaxLength, goalsDetailsMaxLength, setBioDetails, setGoalsDetails}) => {
    const [bio, setBio] = useState(true)
    const [goals, setGoals] = useState(false)

    return (
        <View>
            <ButtonToggle bio = {bio} goals = {goals} setBio = {setBio} setGoals = {setGoals} />
            {bio ? 
                <DetailedInfoDetails label = 'bio' field = {bioDetails} setField = {setBioDetails} bioDetailsMaxLength={bioDetailsMaxLength} /> : 
                <DetailedInfoDetails label = 'goals' field = {goalsDetails} setField = {setGoalsDetails} goalsDetailMaxLength={goalsDetailsMaxLength}/>
            }
        </View>
    )
}

export default DetailedInfo