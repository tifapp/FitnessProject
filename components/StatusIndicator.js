import React, { useState } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Modal } from 'react-native';
import StatusColors from 'hooks/statusColors';
import { MaterialIcons } from "@expo/vector-icons";

export default function StatusIndicator({status, shouldShow}) {
    if (status || shouldShow)
    return(        
        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "white", padding: 5, paddingRight: 8, borderRadius: 15 }}>
            <MaterialIcons name="circle" size={16} color={status ? StatusColors[status] : "gray"} />
            <Text style={{ fontSize: 16, color: status ? "black" : "gray", marginLeft: 5 }}>{`${status ? status : "Set your status!"}`}</Text>
        </View>
    )
    else return null;
}