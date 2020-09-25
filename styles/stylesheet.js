'use strict';

var React = require('react-native');

var {
  StyleSheet,
} = React;

module.exports = StyleSheet.create({

  secondaryContainerStyle: {
    backgroundColor: '#fefefe',
  },

  buttonStyle: {
    alignSelf: 'center',
    backgroundColor: 'orange',
    padding: 10,
    borderRadius: 5,
  },
  textButtonStyle: {
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    padding: 9,
    borderRadius: 5,
  },
  textButtonTextStyle: {
    color: 'blue',
    alignSelf: 'center',
    marginBottom: 2,
    marginHorizontal: 6,
  },
  unselectedButtonStyle: {
    borderWidth: 1,
    borderColor: "gray",
    alignSelf: 'center',
    backgroundColor: 'transparent',
    padding: 9,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  unselectedButtonTextStyle: {
    color: 'gray',
    alignSelf: 'center',
    marginBottom: 2,
    marginHorizontal: 6,
  },
  outlineButtonStyle: {
    borderWidth: 1,
    borderColor: "blue",
    alignSelf: 'center',
    backgroundColor: 'transparent',
    padding: 9,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  outlineButtonTextStyle: {
    color: 'blue',
    alignSelf: 'center',
    marginBottom: 2,
    marginHorizontal: 6,
  },
  buttonTextStyle: {
    color: 'white',
    alignSelf: 'center',
    fontWeight: 'bold',
    fontSize: 30,
    marginBottom: 2,
    marginHorizontal: 6,
  },

  containerStyle: {
    flex: 1,
    backgroundColor: '#eeefff'
  },
  upperScreenStyle: {
    backgroundColor: '#ffffff',
    marginBottom: 30,
  },
  rowContainerStyle: {
    flexBasis: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },


  editIconStyle: {
    alignSelf: 'flex-end',
    marginRight: 3,
  },
  textBoxStyle: {
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 20,
    fontSize: 15,
    marginHorizontal: 15,
    paddingHorizontal: 10,
    height: 100,
    paddingTop: 10,
    paddingLeft: 12,
    marginBottom: 30,
    flex: 1,
    backgroundColor: 'white'
  },

  textInputStyle: {
    marginHorizontal: 10,
    height: 30,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },

  val: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
  signOutVal: {
    fontWeight: "bold",
  },
  spaceAround: {
    paddingHorizontal: 125,
    paddingVertical: 15,
  },
  top: {
    alignItems: "center",
    marginTop: 30,
    padding: 15,
    borderWidth: 2,
    borderRadius: 10,
    backgroundColor: "#ffffff",
  },
  signOutTop: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 25,
    paddingTop: 50,
  },
  postButton: {
    alignItems: "center",
    marginTop: 30,
    padding: 20,
    borderWidth: 2,
    borderRadius: 10,
    backgroundColor: "#ffffff",
  },
  
  check: {
    padding: 25,
    marginTop: 16,
    borderColor: "#bbb",
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 10,
  },
  spaceAround: {
    padding: 25,
  },
  secondaryContainerStyle: {
    backgroundColor: '#eeeeee',
  },
});