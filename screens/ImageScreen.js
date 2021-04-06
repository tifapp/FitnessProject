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
    const { uri } = route.params;
    console.log("testing");

    return (
        <View>
                <Image
                    style={{
                        resizeMode: "contain",
                        resizeMethod: "scale",
                        height: '100%', width: '100%' }}
                    source={uri === '' ? require('../assets/icon.png') : { uri: uri }}
                />
        </View>
    )
}

export default ImageScreen;