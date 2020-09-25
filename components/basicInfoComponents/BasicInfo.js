import React from 'react';
import {View} from 'react-native';
import BasicInfoDetails from './BasicInfoDetails';

const BasicInfo = ({name, setName, age, setAge, gender, setGender}) => {
    
    return (
        <View>
            <BasicInfoDetails label = 'name' field = {name} updateField = {setName} /> 
            <BasicInfoDetails label = 'age' field = {age} updateField = {setAge} />
            <BasicInfoDetails label = 'gender' field = {gender} updateField = {setGender} />
        </View>
    )
}

export default BasicInfo;