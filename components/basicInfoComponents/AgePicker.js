import React, { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { Picker } from '@react-native-community/picker'

const ageRange = Array.from({ length: 100 - 18 + 1 }, (_, i) => i + 18);

const AgePicker = ({ field, selectedValue, setSelectedValue }) => {

    const fieldHandler = () => {
        if (field == '') {
            setSelectedValue("16")
        }
        else {
            setSelectedValue(field)
        }
    }

    useEffect(() => fieldHandler(), [])

    return (
        <View>
            <Picker
                selectedValue={selectedValue}
                itemStyle={{ height: 200, width: '100%' }}
                onValueChange={(itemValue, itemIndex) => setSelectedValue(itemValue)}
            >
                {
                    ageRange.map((v) => {
                        return <Picker.Item key={v} label={v.toString()} value={v.toString()} />
                    })
                }
            </Picker>
        </View>
    )
}

export default AgePicker