"use strict";

var React = require("react-native");

var { StyleSheet } = React;

module.exports = StyleSheet.create({
  header: {
    height: 80,
    paddingTop: 25,
    backgroundColor: "coral",
    borderRadius: 5,
    marginHorizontal: 10,
    marginTop: 10,
  },
  subtitleButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  spacingTop: {
    marginTop: 10,
  },
  title: {
    textAlign: "center",
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  offlineContainer: {
    backgroundColor: "#b52424",
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  offlineText: { color: "#fff" },
  submitButton: {
    marginTop: 20,
    alignSelf: "center",
    backgroundColor: "orange",
    padding: 10,
    borderRadius: 5,
  },

  unsendButton: {
    marginTop: 20,
    alignSelf: "center",
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
  },

  secondaryContainerStyle: {
    backgroundColor: "#fefefe",
  },

  buttonStyle: {
    alignSelf: "center",
    backgroundColor: "orange",
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 6,
  },
  textButtonStyle: {
    alignSelf: "center",
    backgroundColor: "#ffffff",
    padding: 9,
    borderRadius: 5,
  },
  textButtonTextStyle: {
    color: "orange",
    alignSelf: "center",
    marginBottom: 2,
    marginHorizontal: 6,
  },
  unselectedButtonStyle: {
    borderWidth: 2,
    borderColor: "gray",
    alignSelf: "center",
    backgroundColor: "transparent",
    padding: 9,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  unselectedReplyStyle: {
    borderWidth: 2,
    alignSelf: "center",
    padding: 9,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  unselectedButtonTextStyle: {
    color: "gray",
    alignSelf: "center",
    marginBottom: 2,
    marginHorizontal: 6,
    fontWeight: "bold",
  },
  outlineButtonStyle: {
    borderWidth: 2,
    borderColor: "orange",
    alignSelf: "center",
    backgroundColor: "transparent",
    padding: 9,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  outlineButtonTextStyle: {
    color: "orange",
    alignSelf: "center",
    marginBottom: 2,
    marginHorizontal: 6,
    fontWeight: "bold",
  },
  buttonTextStyle: {
    color: "white",
    alignSelf: "center",
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 2,
    marginHorizontal: 6,
  },

  containerStyle: {
    flex: 1,
    backgroundColor: "#fffffd",
  },
  floatingContainerStyle: {
    borderBottomWidth: 1,
  },
  upperScreenStyle: {
    backgroundColor: "#ffffff",
    marginBottom: 30,
  },
  rowContainerStyle: {
    flexDirection: "row",
    justifyContent: "center",
  },

  editIconStyle: {
    alignSelf: "flex-end",
    marginRight: 3,
  },
  textBoxStyle: {
    textAlignVertical: "top",
    borderWidth: 2,
    borderColor: "gray",
    borderRadius: 20,
    fontSize: 15,
    marginHorizontal: 15,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingLeft: 12,
    marginBottom: 30,
    flex: 1,
    backgroundColor: "transparent",
  },

  textInputStyle: {
    marginHorizontal: 10,
    height: 30,
    borderBottomWidth: 2,
    borderBottomColor: "gray",
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
    paddingHorizontal: 5,
    paddingVertical: 15,
  },
  spaceAroundReply: {
    paddingHorizontal: 60,
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
    borderWidth: 2,
    borderStyle: "solid",
    borderRadius: 10,
  },
  spaceAround: {
    padding: 25,
  },
  secondaryContainerStyle: {
    backgroundColor: "#fdfffe",
  },

  imageStyle: {
    alignSelf: "center",
    marginTop: 30,
    height: 110,
    width: 110,
    borderRadius: 10,
  },
  smallImageStyle: {
    height: 60,
    width: 60,
    borderRadius: 5,
  },
  goBackButton: {
    alignSelf: "center",
    backgroundColor: "orange",
    padding: 20,
    marginTop: 50,
    borderRadius: 5,
  },
  border: {
    alignItems: "center",
  },
  viewProfileScreen: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  boxFormat: {
    paddingHorizontal: 8,
    paddingTop: 30,
    paddingBottom: 15,
  },
});
