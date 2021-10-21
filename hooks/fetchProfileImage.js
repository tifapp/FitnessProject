import { API, graphqlOperation, Cache, Storage } from "aws-amplify";
import { getUser } from '../src/graphql/queries';
import { loadCapitals } from 'hooks/stringConversion';

//cache stores objects like this {identityId: {imageURL, lastModified}}

const getLatestProfileImageAsync = async (identityId, isFullSize) => {
  let imageKey = `thumbnails/${identityId}/thumbnail-profileimage.jpg`;
  let imageConfig = {
    expires: 86400,
  };
  if (isFullSize) {
    imageKey = "profileimage.jpg";
    imageConfig.identityId = identityId;
    imageConfig.level = "protected";
  }
  //console.log("showing full image");
  return await Storage.get(imageKey, imageConfig)
};

const getLastModifiedAsync = async (identityId) => {
  const directory = `thumbnails/${identityId}`; //later on change this to get thumbnails or profie pics

  const results = await Storage.list(directory);

  if (results.length > 0) return results[0].lastModified; else return;
}

export default async function fetchProfileImageAsync(identityId, isFullSize) {
  //first check the cache
  //if it's there, compare the lastmodified date with the newest lastmodified date
  //if it's not there or if it was recently modified according to storage.list, storage.get it and return the link

  const lastModified = await getLastModifiedAsync(identityId);
  const imageURL = await getLatestProfileImageAsync(identityId, isFullSize);

  console.log(lastModified);
  
  try {
    const cachedInfo = await Cache.getItem(identityId);
    //console.log("checked cache");
  
    if (cachedInfo != null && cachedInfo.imageURL) { //will have to check if this gets called after the above callback, aka if setuserinfo is called twice.
      //console.log("is in cache");
      //fetch lastmodified date
      //const lastModified = await getLastModifiedAsync(identityId);
      if (lastModified && lastModified > cachedInfo.lastModified) {
        //console.log("returning updated image");
        //const imageURL = await getLatestProfileImageAsync(identityId);
        Cache.setItem(identityId, {lastModified: lastModified, imageURL: imageURL});
        return imageURL;
      } else {
        //console.log("returning cached image: ", cachedInfo.imageURL);
        return cachedInfo.imageURL;
      }
    } else {
      throw "not in cache"
    }
  } catch (e) {
    //console.log("not in cache, returning updated image");
    Cache.setItem(identityId, {lastModified: lastModified, imageURL: imageURL});
    //const imageURL = await getLatestProfileImageAsync(identityId);
    return imageURL; //dunno how else we can return from callback so we may need to do this twice or pass another param
  }
}