import { Cache, Storage } from "aws-amplify"

// cache stores objects like this {identityId: {imageURL, lastModified, isFullSize}}

function getExpiryTime (imageLink) {
  // console.log("starting calc");
  const date = imageLink.substring(
    imageLink.indexOf("Date=") + 5,
    imageLink.indexOf("&X-Amz-Expires=")
  )
  const formattedDate =
    date.slice(0, 4) +
    "-" +
    date.slice(4, 6) +
    "-" +
    date.slice(6, 11) +
    ":" +
    date.slice(11, 13) +
    ":" +
    date.slice(13)
  const dateObj = new Date(formattedDate)
  const expires = parseInt(
    imageLink.substring(
      imageLink.indexOf("Expires=") + 8,
      imageLink.indexOf("&X-Amz-Security-Token")
    )
  )
  dateObj.setSeconds(expires)

  return dateObj
}

const getLatestProfileImageAsync = async (identityId, isFullSize) => {
  let imageKey = `thumbnails/${identityId}/thumbnail-profileimage.jpg`
  const imageConfig = {
    expires: 21600 // can wem ake this longer? 6 hours currently because seomtimes links still expire before the expiry date
  }
  if (isFullSize) {
    imageKey = "profileimage.jpg"
    imageConfig.identityId = identityId
    imageConfig.level = "protected"
  }
  // console.log("showing full image");
  return await Storage.get(imageKey, imageConfig)
}

const getLastModifiedAsync = async (identityId) => {
  const directory = `thumbnails/${identityId}` // later on change this to get thumbnails or profie pics

  const results = await Storage.list(directory)

  if (results.length > 0) return results[0].lastModified
  else return
}

export default async function fetchProfileImageAsync (identityId, isFullSize) {
  // first check the cache
  // if it's there, compare the lastmodified date with the newest lastmodified date
  // if it's not there or if it was recently modified according to storage.list, storage.get it and return the link

  const lastModified = await getLastModifiedAsync(identityId)
  const imageURL = await getLatestProfileImageAsync(identityId, isFullSize)

  // console.log(lastModified);

  try {
    const cachedInfo = await Cache.getItem(identityId)
    // console.log("checked cache");

    if (cachedInfo != null) {
      // will have to check if this gets called after the above callback, aka if setuserinfo is called twice.
      // console.log("is in cache");
      // fetch lastmodified date
      // const lastModified = await getLastModifiedAsync(identityId);
      if (
        (lastModified && lastModified > cachedInfo.lastModified) ||
        (isFullSize && !cachedInfo.isFullSize)
      ) {
        // console.log("returning updated image");
        // const imageURL = await getLatestProfileImageAsync(identityId);
        Cache.setItem(identityId, {
          lastModified,
          imageURL,
          isFullSize
        })
        return imageURL
      } else {
        // console.log("calculating expiry");
        // console.log("current date is ", new Date(Date.now()));
        // console.log("expiry date is ", getExpiryTime(cachedInfo.imageURL));
        if (new Date(Date.now()) >= getExpiryTime(cachedInfo.imageURL)) {
          // console.log("returning new image");
          return imageURL
        } else {
          // console.log("returning old image");
          return cachedInfo.imageURL
        }
      }
    } else {
      throw "not in cache"
    }
  } catch (e) {
    // console.log("not in cache, returning updated image");
    Cache.setItem(identityId, {
      lastModified,
      imageURL,
      isFullSize
    })
    // const imageURL = await getLatestProfileImageAsync(identityId);
    return imageURL // dunno how else we can return from callback so we may need to do this twice or pass another param
  }
}
