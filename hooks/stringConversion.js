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
    if (lowercaseString[lowercaseString.length - 1] === ",") {
      lowercaseString = lowercaseString.slice(0, -1);
    }
  }

  return lowercaseString;
}

export function loadCapitals(string) {
  //capitalize the characters in the actual string according to the indexes at the end
  //start from the end, move to the front until you hit the "|" character.
  let stringTokens = string.split("|");
  let capitalIndices = stringTokens
    .pop()
    .split(",")
    .map((item) => parseInt(item));
  let result = stringTokens.join("");
  let capitalizedString = "";
  let capitalIndicesIndex = 0;
  for (let index in result) {
    if (capitalIndicesIndex >= capitalIndices.length) {
      capitalizedString += result.substring(index);
      break;
    }
    if (index == capitalIndices[capitalIndicesIndex]) {
      capitalizedString += result[index].toUpperCase();
      ++capitalIndicesIndex;
    } else {
      capitalizedString += result[index];
    }
  }

  return capitalizedString;
}
