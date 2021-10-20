import { API, graphqlOperation, Cache, Storage } from "aws-amplify";
import { getUser } from '../src/graphql/queries';
import { loadCapitals } from 'hooks/stringConversion';

//cache stores objects like this {identityId: {imageURL, lastModified}}

const getLatestProfileImageAsync = async (identityId, isFull) => {
  let imageKey = `thumbnails/${identityId}/thumbnail-profileimage.jpg`;
  if (isFull) {
    imageKey = "profileimage.jpg";
    imageConfig.identityId = user.identityId;
    imageConfig.level = "protected";
    //console.log("showing full image");
  }
  
  return await Storage.get(imageKey); //dunno if this will work on deleted profile pics cause of the image.getsize workaround, but we'll see
};

const getLastModifiedAsync = async (identityId) => {
  const directory = `thumbnails/${identityId}`; //later on change this to get thumbnails or profie pics

  const results = await Storage.list(directory);

  if (results.length > 0) return results[0].lastModified; else return;
}

export default async function fetchProfileImageAsync(identityId) {
  //first check the cache
  //if it's there, compare the lastmodified date with the newest lastmodified date
  //if it's not there or if it was recently modified according to storage.list, storage.get it and return the link

  const lastModified = await getLastModifiedAsync(identityId);
  const imageURL = await getLatestProfileImageAsync(identityId);
  
  try {
    const cachedInfo = await Cache.getItem(identityId, { callback: async () => {
      //const lastModified = await getLastModifiedAsync(identityId);
      //const imageURL = await getLatestProfileImageAsync(identityId);
      Cache.setItem(identityId, {lastModified: lastModified, imageURL: imageURL});
    } });
  
    if (cachedInfo != null) { //will have to check if this gets called after the above callback, aka if setuserinfo is called twice.
      //fetch lastmodified date
      //const lastModified = await getLastModifiedAsync(identityId);
      if (lastModified && lastModified > cachedInfo.lastModified) {
        //const imageURL = await getLatestProfileImageAsync(identityId);
        Cache.setItem(identityId, {lastModified: lastModified, imageURL: imageURL});
        return imageURL;
      } else {
        return cachedInfo.imageURL;
      }
    }
  } catch (e) {
    //const imageURL = await getLatestProfileImageAsync(identityId);
    return imageURL; //dunno how else we can return from callback so we may need to do this twice or pass another param
  }
}