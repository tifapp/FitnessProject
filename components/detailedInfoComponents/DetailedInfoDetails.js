import React from 'react'
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native'
import { Entypo } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

var styles = require('../../styles/stylesheet');

const DetailedInfoDetails = ({ label, field, setField }) => {
    const navigation = useNavigation();

    const goToTextBox = () => {
        (label == 'bio') ?
            navigation.navigate('Bio', { field: field }) :
            navigation.navigate('Goals', { field: field })
    }

    return (
        <View>
            <TouchableOpacity onPress={goToTextBox}
            >
                <Entypo style={styles.editIconStyle} name="edit" size={24} color="black" />
            </TouchableOpacity>

            <TextInput
                //onFocus={goToTextBox}
                style={styles.textBoxStyle}
                placeholder={`Enter your ${label}!`}
                multiline={true}
                autoCorrect={false}
                value={field}
                onChangeText={setField}
                editable={false}
            />
        </View>
    )
}

export default DetailedInfoDetails