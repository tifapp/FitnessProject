import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { ProfileImageAndName } from './ProfileImageAndName';
import computeDistance from "hooks/computeDistance";
import getLocation from 'hooks/useLocation';
import {loadCapitals} from 'hooks/stringConversion';

var styles = require('../styles/stylesheet');

export default function UserListItem({
  item,
  matchingname
}) {
  return (
        <ProfileImageAndName
          textLayoutStyle={{alignSelf: "center", flex: 1}}
          userId={item.id}
          imageSize={60}
          textStyle={{fontSize: 16, fontWeight: "bold"}}
          style={[
            {
              justifyContent: "flex-start",
              alignItems: "flex-start",
              marginHorizontal: 20,
              marginTop: 20,
              backgroundColor: "white",
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.18,
              shadowRadius: 1.0,
      
          elevation: 1,
        },
      ]}
      subtitleComponent={
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          {
            getLocation() != null && item.latitude != null
              ? <Text>{computeDistance([item.latitude, item.longitude])} mi.</Text>
              : null
          }{

            loadCapitals(item.bio).length > 0 ?
              <Text style={
                {
                  paddingTop: 7,
                  paddingBottom: 2,
                  fontSize: 12,
                  marginRight: 15,
                }}
                numberOfLines={1}> "{loadCapitals(item.bio)}"</Text> 
                : null
          }
        </View>
      }
    />
  );
}