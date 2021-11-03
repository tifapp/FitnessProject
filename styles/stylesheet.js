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
  unblockButton: {
    marginTop: 20,
    alignSelf: "center",
    backgroundColor: "black",
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
  acceptMessageButton: {
    borderWidth: 2,
    borderColor: "gray",
    alignSelf: "center",
    backgroundColor: "transparent",
    padding: 9,
    borderRadius: 5,
    marginHorizontal: 10,
    flexDirection: "row"
  },
  rejectMessageButton: {
    borderWidth: 2,
    borderColor: "red",
    alignSelf: "center",
    backgroundColor: "transparent",
    padding: 9,
    borderRadius: 5,
    marginHorizontal: 10,
    flexDirection: "row"
  },
  blockMessageButton: {
    borderWidth: 2,
    borderColor: "black",
    alignSelf: "center",
    backgroundColor: "transparent",
    padding: 9,
    borderRadius: 5,
    marginHorizontal: 10,
    flexDirection: "row"
  },
  messageButton: {
    marginTop: 20,
    alignSelf: "center",
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5
  },
  secondaryContainerStyle: {
    backgroundColor: "#fefefe",
  },

  buttonStyle: {
    alignSelf: "center",
    backgroundColor: "blue",
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
    color: "blue",
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
  acceptButtonTextStyle: {
    color: "gray",
    alignSelf: "center",
    marginBottom: 2,
    marginHorizontal: 6,
    fontWeight: "bold",
  },
  rejectButtonTextStyle: {
    color: "red",
    alignSelf: "center",
    marginBottom: 2,
    marginHorizontal: 6,
    fontWeight: "bold",
  },
  blockButtonTextStyle: {
    color: "black",
    alignSelf: "center",
    marginBottom: 2,
    marginHorizontal: 6,
    fontWeight: "bold",
  },
  unselectedRejectButtonTextStyle: {
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
  containerStyleMessage: {
    flex: 1,
    backgroundColor: "#fffffd",
    borderColor: "black",
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
    paddingLeft: 0,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
  },
  spaceAroundReply: {
    paddingHorizontal: 60,
    paddingTop: 24,
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
  },
  secondaryContainerStyle: {
    backgroundColor: "#fdfffe",
  },

  imageStyle: {
    alignSelf: "center",
    height: 125,
    width: 125,
  },
  smallImageStyle: {
    resizeMode: "cover",
    height: 50,
    width: 50,
  },
  smallerImageStyle: {
    resizeMode: "cover",
    height: 35,
    width: 35,
  },
  smallestImageStyle: {
    resizeMode: "cover",
    height: 19,
    width: 19,
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
