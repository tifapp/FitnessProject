import React from "react";
import {StyleSheet, Text, View } from "react-native";
import { Icon } from "react-native-elements";
import SelectDropdown from 'react-native-select-dropdown';


export default function NearbyActivities() {
  const options = ['Today', 'Upcoming'];

  const dropdownIcon = (isOpened: boolean) => {
    return  <Icon
    name={isOpened ? 'expand-less' : 'expand-more'}
    color={'black'} size={18}
  />
  }

  return (
    <View style={styles.container}>
      <View style={styles.activitiesContainer}>
        <Text style={styles.activitiesText}>Nearby Activities</Text>
      </View>
      {/*
      // @ts-ignore */}
      <SelectDropdown
        data={options}
        defaultValue={options[0]}
        buttonStyle={styles.dropdown}
        buttonTextStyle={styles.dropdownText}
        renderDropdownIcon={dropdownIcon}
        dropdownIconPosition={'right'}
        dropdownOverlayColor={'transparent'}
        dropdownStyle={styles.dropdownList}
        onSelect={(selectedItem, index) => {
          console.log(selectedItem, index);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
     backgroundColor: "#f7f7f7"
  },
  activitiesContainer: {
    flex: 1,
    paddingLeft: '3%',
    justifyContent: 'space-around'
  },
  activitiesText: {
    fontSize: 18,
  },
  dropdown: {
    backgroundColor: "#f7f7f7",
  },
  dropdownText: {
    textAlign: 'right',
    fontSize: 18
  },
  dropdownList: {
    backgroundColor: "#f7f7f7"
  }
});
