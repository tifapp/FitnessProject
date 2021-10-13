import React from 'react'
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native'
//import { Entypo } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useNavigation } from '@react-navigation/native';

var styles = require('../../styles/stylesheet');

const DetailedInfoDetails = ({ label, field, setField, goalsDetailMaxLength, bioDetailsMaxLength }) => {
    const navigation = useNavigation();

    const goToTextBox = () => {
        (label == 'bio') ?
            navigation.navigate('Bio', { field: field, bio: bioDetailsMaxLength }) :
            navigation.navigate('Goals', { field: field, goals: goalsDetailMaxLength })
    }

    return (
        <View style={{
            backgroundColor: "white",
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.18,
            shadowRadius: 1.0,
            marginBottom: 20,
            marginHorizontal: 20,

            elevation: 1,
            padding: 15,
            flex: 0
        }}>
            <TouchableOpacity onPress={goToTextBox}>
                <MaterialCommunityIcons style={styles.editIconStyle} name="dumbbell" size={24} color="black" />
            </TouchableOpacity>


            <TextInput
                //onFocus={goToTextBox}
                placeholder={`Enter your ${label}!`}
                multiline={true}
                autoCorrect={false}
                value={field}
                onChangeText={setField}
                editable={false}
                style={{fontSize: 18}}
            />
        </View>
    )
}

export default DetailedInfoDetails