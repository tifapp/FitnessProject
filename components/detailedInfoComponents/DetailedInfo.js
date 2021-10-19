import React, { useState } from 'react'
import { View } from 'react-native'
import DetailedInfoDetails from './DetailedInfoDetails'

const DetailedInfo = ({ bioDetails, goalsDetails, setBioDetails, setGoalsDetails }) => {
    const [bio, setBio] = useState(true)
    const [goals, setGoals] = useState(false)

    return (
        <View>
            <DetailedInfoDetails label='bio' field={bioDetails} setField={setBioDetails} />
            <DetailedInfoDetails label='goals' field={goalsDetails} setField={setGoalsDetails} />
        </View>
    )
}

export default DetailedInfo