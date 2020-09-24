import React, {useEffect} from 'react'
import {View, StyleSheet, Text, Picker} from 'react-native'

const AgePicker = ({field, selectedValue, setSelectedValue}) => {

    const fieldHandler = () => {
        if (field == '') {
            setSelectedValue('16')
        }
        else {
            setSelectedValue(field)
        }
    }

    useEffect(() => fieldHandler(), [ ])

    return (
        <View>
            <Picker
                selectedValue={selectedValue}
                itemStyle={{height: 200, width: '100%'}}
                onValueChange={(itemValue, itemIndex) => setSelectedValue(itemValue)}
            >
                <Picker.Item label = "16" value = "16" />
                <Picker.Item label = "17" value = "17" />
                <Picker.Item label = "18" value = "18" />
                <Picker.Item label = "19" value = "19" />
                <Picker.Item label = "20" value = "20" />
                <Picker.Item label = "21" value = "21" />
                <Picker.Item label = "22" value = "22" />
                <Picker.Item label = "23" value = "23" />
                <Picker.Item label = "24" value = "24" />
                <Picker.Item label = "25" value = "25" />
                <Picker.Item label = "26" value = "26" />
                <Picker.Item label = "27" value = "27" />
                <Picker.Item label = "28" value = "28" />
                <Picker.Item label = "29" value = "29" />
                <Picker.Item label = "30" value = "30" />
                <Picker.Item label = "31" value = "31" />
                <Picker.Item label = "32" value = "32" />
                <Picker.Item label = "33" value = "33" />
                <Picker.Item label = "34" value = "34" />
                <Picker.Item label = "35" value = "35" />
                <Picker.Item label = "36" value = "36" />
                <Picker.Item label = "37" value = "37" />
                <Picker.Item label = "38" value = "38" />
                <Picker.Item label = "39" value = "39" />
                <Picker.Item label = "40" value = "40" />
                <Picker.Item label = "41" value = "41" />
                <Picker.Item label = "42" value = "42" />
                <Picker.Item label = "43" value = "43" />
                <Picker.Item label = "44" value = "44" />
                <Picker.Item label = "45" value = "45" />
                <Picker.Item label = "46" value = "46" />
                <Picker.Item label = "47" value = "47" />
                <Picker.Item label = "48" value = "48" />
                <Picker.Item label = "49" value = "49" />
                <Picker.Item label = "50" value = "50" />
                <Picker.Item label = "51" value = "51" />
                <Picker.Item label = "52" value = "52" />
                <Picker.Item label = "53" value = "53" />
                <Picker.Item label = "54" value = "54" />
                <Picker.Item label = "55" value = "55" />
                
            </Picker>
        </View>
    )
}

const styles = StyleSheet.create({

})

export default AgePicker