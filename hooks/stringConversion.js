export function saveCapitals(string) {
  //possible improvements: use a dash instead of a comma if there are consecutive capitals. if there are more uppercase than lowercase characters, flip the script and add a signifier.
  let lowercaseString = string.toLowerCase();
  if (string.length > 0) {
    lowercaseString = lowercaseString + "|";
    for (let i = 0; i < string.length; ++i) {
      if (isNaN(string[i] * 1) && string[i] !== lowercaseString[i]) {
        //check if the character is a letter, and check if it's uppercase
        lowercaseString += i.toString() + ",";
      }
    }
    if (lowercaseString[lowercaseString.length-1] === ",") {
      lowercaseString = lowercaseString.slice(0, -1); 
    }
  }

  console.log("saved string is, ", lowercaseString)
  return lowercaseString;
}

export function loadCapitals(string) {
  console.log(string);
  //capitalize the characters in the actual string according to the indexes at the end
  //start from the end, move to the front until you hit the "|" character.
  i = string.length - 1;
  capitalIndex = 0;
  while (i >= 0) {
    if (!isNaN(string[i] * 1)) {
      capitalIndex = parseInt(string[i] + (capitalIndex > 0 ? capitalIndex.toString() : ""));
      //console.log("current capitalIndex is ", capitalIndex, " and current int is ", string[i])
    } else {
      string = string.substring(0, capitalIndex) +
        string[capitalIndex].toUpperCase() +
        string.substring(capitalIndex + 1)
      capitalIndex = 0;
      if (string[i] === "|") break;
    }
    --i;
  }
  string = string.substring(0, i);
  return string;
}
