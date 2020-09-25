import React, {useState} from 'react';
import DetailedInfoInput from '../components/detailedInfoComponents/DetailedInfoInput'

const BioScreen = ({route}) => {
    const field = route.params.field
    const [text, setText] = useState(field)

    return (
        <DetailedInfoInput 
            label = 'bio'
            description = 'Tell other users a little bit about yourself! Mention information such as your favorite exercises, sports, music, food, etc to connect with others!'
            text = {text}
            setText = {setText}
        />
    )
}

export default BioScreen;