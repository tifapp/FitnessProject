import React, {useState} from 'react';
import {
    StyleSheet,
    View,
    Button,
    Image,
    TextInput,
    Text,
    TouchableOpacity,
  } from "react-native";

var styles = require('styles/stylesheet');

const FriendScreen = ({ navigation }) => {
    const [friendsEnabled, setFriendsEnabled] = useState(true);
    return (
        <View>
            <View style = {{flexDirection: 'row', justifyContent: 'center', marginTop: 25}}>
                <TouchableOpacity 
                    style = { (friendsEnabled) ? styles.outlineButtonStyle : styles.unselectedButtonStyle}
                    onPress = {() => setFriendsEnabled(true)}> 
                    <Text style = {(friendsEnabled) ? styles.outlineButtonTextStyle : styles.unselectedButtonTextStyle}>Friends</Text>  
                </TouchableOpacity>
                <TouchableOpacity 
                    style = { (friendsEnabled) ? styles.unselectedButtonStyle : styles.outlineButtonStyle}
                    onPress = {() => setFriendsEnabled(false)}>
                    <Text style = {(friendsEnabled) ? styles.unselectedButtonTextStyle : styles.outlineButtonTextStyle}>Requests</Text>  
                </TouchableOpacity>
                
            </View>
            <View style = {{marginTop: 15, alignSelf: 'center'}}>
                {friendsEnabled ? <Text>Your awesome friends!</Text> : <Text>Incoming Requests!</Text>}
            </View>
            
        </View>
    )
}

export default FriendScreen;