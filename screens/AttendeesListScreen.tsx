import IconButton from "@components/common/IconButton";
import React from "react";
import { Button, FlatList, View } from "react-native";

const someData = [
    {
        id: '1',
        imageURL: "Japan.com",
        name: "Cool"
    },
    {
        id: '2',
        imageURL: "USA.com",
        name: "Also cool"
    }
];


function goBack() {
    //Presumably do navigate back to the previous screen you were on
    return;
}

export const AttendeesListScreen = () => {
    //List of attendees

    //Button that would let you go back, goes on the top left
    //Could also use setOptions in navigation itself, for headerLeft
        
    <View>
        <IconButton iconName="height" onPress={goBack}/>
        <FlatList 
            data={someData}
            renderItem={({item}) => <Button title="cool"/>}
            keyExtractor={item => item.thing}
        />
    </View>
    }
            




}