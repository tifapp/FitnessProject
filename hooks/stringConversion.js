export function saveCapitals(string) {
  //possible improvements: use a dash instead of a comma if there are consecutive capitals. if there are more uppercase than lowercase characters, flip the script and add a signifier.
  length = string.length;
  string = string + "|";
  for (let i = 0; i < length; ++i) {
    if (isNaN(string[i] * 1) && string[i] == string[i].toUpperCase()) {
      //check if the character is a letter, and check if it's uppercase
      string =
        string.substring(0, i) +
        string[i].toLowerCase() +
        string.substring(i + 1) +
        (string.length > length + 1 ? "," : "") +
        i.toString();
    }
  }

  return string;
}

export function loadCapitals(string) {
  //capitalize the characters in the actual string according to the indexes at the end
  //start from the end, move to the front until you hit the "|" character.
  i = string.length - 1;
  capitalIndex = 0;
  while (i >= 0) {
    if (!isNaN(string[i] * 1)) {
      capitalIndex = parseInt(string[i] + (capitalIndex > 0 ? capitalIndex.toString() : ""));
    	console.log("current capitalIndex is ", capitalIndex, " and current int is ", string[i])
    } else {
      string = string.substring(0, capitalIndex) +
      string[capitalIndex].toUpperCase() +
      string.substring(capitalIndex + 1)
      capitalIndex = 0;
      if (string[i] == "|") break;
    }
    --i;
  }
  string = string.substring(0, i);
  return string;
}
