import React, { useState } from 'react'
import { View } from 'react-native'
import DetailedInfoDetails from './DetailedInfoDetails'

const DetailedInfo = ({ bioDetails, goalsDetails, bioDetailsMaxLength, goalsDetailsMaxLength, setBioDetails, setGoalsDetails }) => {
    const [bio, setBio] = useState(true)
    const [goals, setGoals] = useState(false)

    return (
        <View>
            <DetailedInfoDetails label='bio' field={bioDetails} setField={setBioDetails} bioDetailsMaxLength={bioDetailsMaxLength} />
            <DetailedInfoDetails label='goals' field={goalsDetails} setField={setGoalsDetails} goalsDetailMaxLength={goalsDetailsMaxLength} />
        </View>
    )
}

export default DetailedInfo