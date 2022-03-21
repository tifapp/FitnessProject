import { Cache, Storage } from "aws-amplify";
import { loadCapitals } from "hooks/stringConversion";
import { API, graphqlOperation } from "aws-amplify";
import { getUser } from "../src/graphql/queries";

async function setMyId() {
  const query = await Auth.currentUserInfo();
  global.id = query.attributes.sub;
}

export function getMyId() {
  if (global.id == null) {
    setMyId();
  }

  return global.id;
}

const addUserInfotoCache = (isFull = false) => {
  //console.log('cache missed!', props.userId); //this isn't printing for some reason
  API.graphql(graphqlOperation(getUser, { id: props.userId })).then((u) => {
    const user = u.data.getUser;
    if (user != null) {
      const info = {
        name: loadCapitals(user.name),
        imageURL: "",
        isFull: isFull,
        changed: false,
      };
      Cache.setItem(props.userId, info, {
        expires: Date.now() + 86400000,
      });
      setUserInfo(info);
      console.log("adding name to cache");
      if (props.callback) props.callback(info);
      let imageKey = `thumbnails/${user.identityId}/thumbnail-profileimage.jpg`;
      let imageConfig = {
        expires: 86400,
      };
      if (isFull) {
        imageKey = "profileimage.jpg";
        imageConfig.identityId = user.identityId;
        imageConfig.level = "protected";
      }
      //console.log("showing full image");
      Storage.get(imageKey, imageConfig) //this will incur lots of repeated calls to the backend, idk how else to fix it right now
        .then((imageURL) => {
          Image.getSize(
            imageURL,
            () => {
              //if (mounted) {
              info.imageURL = imageURL;
              Cache.setItem(props.userId, info);
              setUserInfo(info);
              console.log("adding photo to cache");
              //}
            },
            (err) => {
              //console.log("couldn't find user's profile image");
              Cache.setItem(props.userId, info);
              setUserInfo(info);
              console.log("adding photo to cache");
            }
          );
        })
        .catch((err) => {
          console.log("could not find image!", err);
        }); //should just use a "profilepic" component
    }
  });
  return null;
};
