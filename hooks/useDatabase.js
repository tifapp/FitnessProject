import { Auth } from 'aws-amplify';
import { Alert } from 'react-native';
import { createUser, updateUser, deleteUser } from '../src/graphql/mutations.js'
import { getUser } from '../src/graphql/queries.js'
import { API, graphqlOperation, Storage, Cache } from "aws-amplify";
import { Image } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';

export default () => {

  const loadUserAsync = async () => {
    const query = await Auth.currentUserInfo();
    const user = await API.graphql(graphqlOperation(getUser, { id: query.attributes.sub }));
    const imageURL = await Storage.get('profileimage.jpg', { level: 'protected' });
    Cache.setItem(query.attributes.sub, imageURL, { priority: 1, expires: Date.now() + 86400000 });

    const fields = user.data.getUser;

    if (fields == null) {
      console.log("user doesn't exist, they must be making their profile for the first time");
    } else {
      return {...fields, pictureURL: imageURL};
    }
  };
  
  const deleteUserAsync = async () => {
    const query = await Auth.currentUserInfo();
    await API.graphql(graphqlOperation(deleteUser, { input: { id: query.attributes.sub }}));

    await Storage.remove('profileimage.jpg', { level: 'protected' })
    .then(result => console.log("removed profile image!", result))
    .catch(err => console.log(err));

    return 'successfully deleted';
  };

  const updateUserAsync = async (imageURL, name, age, gender, bioDetails, goalsDetails, location) => {
    const updateUserInDB = async (recurringUser) => {
      try {
        if (imageURL !== '') {
          const resizedPhoto = await ImageManipulator.manipulateAsync(
            imageURL,
            [{ resize: { width: 200 } }], // resize to width of 300 and preserve aspect ratio 
            { compress: 1, format: 'jpeg' },
           );
          const response = await fetch(resizedPhoto.uri);
          const blob = await response.blob();

          await Storage.put('profileimage.jpg', blob, { level: 'protected', contentType: 'image/jpeg' });

          const query = await Auth.currentUserInfo();
          Cache.setItem(query.attributes.sub, imageURL, { priority: 1, expires: Date.now() + 86400000 });
        } else {
          Storage.remove('profileimage.jpg', { level: 'protected' })
            .then(result => console.log("removed profile image!", result))
            .catch(err => console.log(err));
        }
        await API.graphql(graphqlOperation(updateUser, { input: recurringUser }));
        console.log("updated user successfully");
      } catch (err) {
        Alert.alert("Could not submit profile! Error: ", err.errors[0].message);
        console.log("error when updating user: ", err);
      }
    }

    const createUserInDB = async (newUser) => {
      try {
        await API.graphql(graphqlOperation(createUser, { input: newUser }));
        console.log("success");
      } catch (err) {
        console.log("error: ", err);
      }
    }

    //if user doesn't exist, make one
    try {
      const { identityId } = await Auth.currentCredentials();
      const query = await Auth.currentUserInfo();
      const user = await API.graphql(graphqlOperation(getUser, { id: query.attributes.sub }));
      const fields = user.data.getUser;
      console.log('returning users fields looks like', fields);

      const ourUser = {
        id: query.attributes.sub,
        identityId: identityId,
        name: name,
        age: age,
        gender: gender,
        bio: bioDetails,
        goals: goalsDetails,
        latitude: location == null ? null : location.latitude,
        longitude: location == null ? null : location.longitude
      };

      if (fields == null) {
        createUserInDB(ourUser)
      }
      else {
        updateUserInDB(ourUser)
      }
    }
    catch (err) {
      console.log("error: ", err);
    }
  };

  return [loadUserAsync, updateUserAsync, deleteUserAsync];
}