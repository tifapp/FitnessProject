import React, { useState, useEffect, useRef } from 'react';
import { ActivityIndicator, View, StyleSheet, Text, ScrollView, TouchableOpacity, TextInput, Alert, Image, Linking } from 'react-native';
import ProfilePic from 'components/ProfileImagePicker'
import BasicInfo from 'components/basicInfoComponents/BasicInfo'
import DetailedInfo from 'components/detailedInfoComponents/DetailedInfo';
import useUserDatabase from 'hooks/useUserDatabase';
import { Auth } from "aws-amplify";
import { Platform } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import CheckBox from '@react-native-community/checkbox'; //when ios is supported, we'll use this
import getLocation from 'hooks/useLocation';

var styles = require('styles/stylesheet');

export default function SignInScreen ({ navigation, route }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    async function signIn() {
        try {
            const user = await Auth.signIn(username.trim().toLowerCase().replace(function(c) {
                return c === /[\p{L}\p{M}\p{S}\p{N}\p{P}]+/ ? c : '';
            }).replace(/\s/g,''), password);
        } catch (error) {
            alert('error signing in', error);
        }
    }

    return (
        <View style={styles.containerStyle}>
            <TextInput
                style={[styles.textInputStyle, { flexGrow: 1 }]}
                placeholder="Input username"
                onChangeText={setUsername}
                value={username}
                clearButtonMode="always"
            />
            <TextInput
                style={[styles.textInputStyle, { flexGrow: 1 }]}
                placeholder="Input password"
                onChangeText={setPassword}
                value={password}
                clearButtonMode="always"
            />
            <TouchableOpacity style={[styles.buttonStyle, { marginBottom: 25 }]} onPress={signIn} >
                <Text style={styles.buttonTextStyle}>Submit</Text>
            </TouchableOpacity>
        </View>
    )
}