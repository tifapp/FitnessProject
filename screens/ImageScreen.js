import React, { useState, useEffect, useRef } from 'react';
import {
    Alert,
    View,
    Text,
    TouchableOpacity,
    Image
} from "react-native";

import { AntDesign } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
var styles = require('../styles/stylesheet');

const ImageScreen = ({route, navigation}) => {
    //const { uri } = route.params;
    const { userInfo } = route.params;
    const { props } = route.params;
    console.log("testing");
    console.log(userInfo);

    return (
        <View>
                <Image
                    style={{
                        width: '100%', height: '100%'}}
                    source={userInfo.imageURL === '' ? require('../assets/icon.png') : { uri: userInfo.imageURL }}
                />
        </View>
    )
}

export default ImageScreen;