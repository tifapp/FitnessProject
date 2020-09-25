import React, {useState} from 'react';
import DetailedInfoInput from '../components/detailedInfoComponents/DetailedInfoInput'

const GoalsScreen = ({route}) => {
    const field = route.params.field
    const [text, setText] = useState(field)

    return (
        <DetailedInfoInput 
            label = 'goals'
            description = 'Tell other users about your goals! By mentioning your goals, you can find like-minded people to work with!'
            text = {text}
            setText = {setText}
        />
    )
}

export default GoalsScreen;
