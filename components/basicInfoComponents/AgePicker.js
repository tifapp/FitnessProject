import React, { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { Picker } from '@react-native-picker/picker'

const minAge = 18;
const maxAge = 100;
const ageRange = Array.from({ length: maxAge - minAge + 1 }, (_, i) => i + minAge);

const AgePicker = ({ field, selectedValue, setSelectedValue }) => {
    return (
        <Picker
            style={{width: 100, height: 200}}
            selectedValue={selectedValue}
            itemStyle={{ height: 100, width: '100%' }}
            onValueChange={(itemValue, itemIndex) => setSelectedValue(itemValue)}
        >
            {
                ageRange.map((v) => {
                    return <Picker.Item key={v} label={v.toString()} value={v} />
                })
            }
        </Picker>
    )
}

export default AgePicker