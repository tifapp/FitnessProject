"use strict";
exports.__esModule = true;
var react_1 = require("react");
var react_native_1 = require("react-native");
var width = react_native_1.Dimensions.get("screen").width;
function GroupDescription(_a) {
    var setDescription = _a.setDescription, descriptionVal = _a.descriptionVal, characterCount = _a.characterCount;
    var totalCharsRemaining = characterCount - descriptionVal.length;
    return (<react_native_1.View>
      <react_native_1.View style={styles.boxFormat}>
        <react_native_1.Text> Description: </react_native_1.Text>
        <react_native_1.Text> Characters remaining: {totalCharsRemaining}</react_native_1.Text>
        <react_native_1.TextInput style={styles.DescriptionBox} multiline={true} onChangeText={setDescription} placeholder="Enter a description for your group ...." value={descriptionVal} maxLength={1000}/>
      </react_native_1.View>
    </react_native_1.View>);
}
exports["default"] = GroupDescription;
var styles = react_native_1.StyleSheet.create({
    boxFormat: {
        paddingHorizontal: 8,
        paddingTop: 30,
        paddingBottom: 15
    },
    DescriptionBox: {
        marginTop: 16,
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderWidth: 2,
        borderColor: "grey",
        borderRadius: 6,
        backgroundColor: "#d3d3d3",
        fontSize: 15,
        width: width / 1.3
    }
});
