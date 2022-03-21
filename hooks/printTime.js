export default function printTime(dateInMilliseconds) {
  const dateInfo = new Date(dateInMilliseconds);

  var hourVal = dateInfo.getHours();
  var totalTime = dateInfo.getTime();

  var currentTotalTime = Date.now();

  var timeDifference = currentTotalTime - totalTime;

  var secondDifference = timeDifference / 1000;
  var minuteDifference = secondDifference / 60;
  var hourDifference = minuteDifference / 60;
  var dayDifference = hourDifference / 24;
  var monthDifference = dayDifference / 30;
  var yearDifference = monthDifference / 12;

  let displayTime = "";
  if (secondDifference < 60) {
    displayTime = "Just now";
  } else if (minuteDifference >= 1 && minuteDifference < 60) {
    minuteDifference = Math.floor(minuteDifference);
    if (minuteDifference == 1) {
      displayTime = minuteDifference + " min";
    } else {
      displayTime = minuteDifference + " mins";
    }
  } else if (hourDifference >= 1 && hourDifference < 24) {
    hourDifference = Math.floor(hourDifference);
    if (hourDifference == 1) {
      displayTime = hourDifference + " hr";
    } else {
      displayTime = hourDifference + " hrs";
    }
  } else if (dayDifference >= 1 && dayDifference < 31) {
    dayDifference = Math.floor(dayDifference);
    if (dayDifference == 1) {
      displayTime = dayDifference + " day";
    } else {
      displayTime = dayDifference + " days";
    }
  } else if (monthDifference >= 1 && monthDifference < 12) {
    monthDifference = Math.floor(monthDifference);
    if (monthDifference == 1) {
      displayTime = monthDifference + " m";
    } else {
      displayTime = dayDifference + " m";
    }
  } else if (yearDifference >= 1) {
    yearDifference = Math.floor(yearDifference);
    if (yearDifference == 1) {
      displayTime = yearDifference + " y";
    } else {
      displayTime = yearDifference + " y";
    }
  }

  return displayTime;
}

/*

const months = [
  "January",
  "Febuary",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function PostItem({
  item,
  deletePostsAsync,
  writtenByYou,
  setPostVal,
  setUpdatePostID,
}) {
  const dateInfo = new Date(item.timestamp * 1000);
  var yearVal = dateInfo.getFullYear();
  var monthVal = dateInfo.getMonth();
  var dayVal = dateInfo.getDate();
  var hourVal = dateInfo.getHours();
  var minuteVal = dateInfo.getMinutes();
  var totalTime = dateInfo.getTime();

  var currentTotalTime = new Date().getTime();

  var timeDifference = currentTotalTime - totalTime;
  var secondDifference = timeDifference / 1000;
  var minuteDifference = secondDifference / 60;
  var hourDifference = minuteDifference / 60;
  var dayDifference = hourDifference / 24;
  var monthDifference = dayDifference / 30;
  var yearDifference = monthDifference / 12;

  let displayTime = "";
  if (secondDifference < 60) {
    //secondDifference = Math.floor(secondDifference);
    displayTime = "Just now";
  }
  else if (minuteDifference >= 1 && minuteDifference < 60) {
    minuteDifference = Math.floor(minuteDifference);
    if (minuteDifference == 1) {
      displayTime = minuteDifference + " minute ago";
    }
    else {
      displayTime = minuteDifference + " minutes ago";
    }
  }
  else if (hourDifference >= 1 && hourDifference < 24) {
    hourDifference = Math.floor(hourDifference);
    if (hourDifference == 1) {
      displayTime = hourDifference + " hour ago";
    }
    else {
      displayTime = hourDifference + " hours ago";
    }
  }
  else if (dayDifference >= 1 && dayDifference < 31) {
    dayDifference = Math.floor(dayDifference);
    if (dayDifference == 1) {
      displayTime = dayDifference + " day ago";
    }
    else {
      displayTime = dayDifference + " days ago";
    }
  }
  else if (monthDifference >= 1 && monthDifference < 12) {
    monthDifference = Math.floor(monthDifference);
    if (monthDifference == 1) {
      displayTime = monthDifference + " month ago";
    }
    else {
      displayTime = dayDifference + " months ago";
    }
  }
  else if (yearDifference >= 1) {
    yearDifference = Math.floor(yearDifference);
    if (yearDifference == 1) {
      displayTime = yearDifference + " year ago";
    }
    else {
      displayTime = yearDifference + " years ago";
    }
  }


  let timeCheck = "AM";

  if (hourVal >= 12 && hourVal <= 23) {
    timeCheck = "PM";
  }

  if (hourVal == 0) {
    hourVal = hourVal + 12;
  }

  if (hourVal > 12) {
    hourVal = hourVal - 12;
  }
  
  const navigation = useNavigation();
  const goToProfile = () => {
    navigation.navigate('Lookup',
      { userId: item.userId })
  }
*/
