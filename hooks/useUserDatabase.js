import { Auth } from 'aws-amplify';
import { Alert } from 'react-native';
import { createUser, updateUser, deleteUser } from '../src/graphql/mutations.js'
import { getUser } from '../src/graphql/queries.js'
import { API, graphqlOperation, Storage, Cache } from "aws-amplify";
import { Image } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import {saveCapitals, loadCapitals} from 'hooks/stringConversion'

export default () => {

  const loadUserAsync = async () => {
    const query = await Auth.currentUserInfo();
    const user = await API.graphql(graphqlOperation(getUser, { id: query.attributes.sub }));
    const imageURL = await Storage.get('profileimage.jpg', { level: 'protected' });

    const fields = user.data.getUser;

    if (fields == null) {
      console.log("user doesn't exist, they must be making their profile for the first time");
    } else {
      Cache.setItem(query.attributes.sub, { name: loadCapitals(fields.name), imageURL: imageURL, isFull: true }, { priority: 1, expires: Date.now() + 86400000 });
      fields.name = loadCapitals(fields.name)
      fields.bio = loadCapitals(fields.bio)
      fields.goals = loadCapitals(fields.goals)
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
    const saveProfilePicture = async (userId) => {
      if (imageURL !== '') {
        const resizedPhoto = await ImageManipulator.manipulateAsync(
          imageURL,
          [{ resize: { width: 200 } }], // resize to width of 300 and preserve aspect ratio 
          { compress: 1, format: 'jpeg' },
        );
        const response = await fetch(resizedPhoto.uri);
        const blob = await response.blob();

        await Storage.put('profileimage.jpg', blob, { level: 'protected', contentType: 'image/jpeg' });

        console.log("changing cached profile pic");
        Cache.setItem(userId, { name: name, imageURL: imageURL, isFull: true, changed: true }, { priority: 1, expires: Date.now() + 86400000 });
      } else {
        Storage.remove('profileimage.jpg', { level: 'protected' })
          .then(result => console.log("removed profile image!", result))
          .catch(err => console.log(err));
        Cache.setItem(userId, { name: name, imageURL: '', changed: true }, { priority: 1, expires: Date.now() + 86400000 });
      }
    }

    const updateUserInDB = async (recurringUser) => {
      try {
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
        name: saveCapitals(name),
        age: age,
        gender: gender, //should be using an enum
        bio: saveCapitals(bioDetails),
        goals: saveCapitals(goalsDetails),
        latitude: location == null || location.latitude == null || location.latitude < 0 ? null : location.latitude,
        longitude: location == null || location.latitude == null || location.latitude < 0 ? null : location.longitude
      };

      saveProfilePicture(query.attributes.sub);
      if (fields == null) {
        ourUser.identityId = identityId;
        createUserInDB(ourUser)
      }
      else {
        updateUserInDB(ourUser)
      }

      return [ourUser, query.attributes.sub];
    }
    catch (err) {
      console.log("error: ", err);
    }
  };

  const updateUserLocationAsync = async (location) => {
    //if user doesn't exist, make one
    try {
      const query = await Auth.currentUserInfo();
      const user = await API.graphql(graphqlOperation(getUser, { id: query.attributes.sub }));
      const fields = user.data.getUser;
      console.log('returning users fields looks like', fields);

      const ourUser = {
        id: query.attributes.sub,
        latitude: location == null || location.latitude < 0 ? null : location.latitude,
        longitude: location == null || location.latitude < 0 ? null : location.longitude
      };

      if (fields != null) {
        await API.graphql(graphqlOperation(updateUser, { input: ourUser }));
      }
    }
    catch (err) {
      console.log("error: ", err);
    }   
  }

  return [loadUserAsync, updateUserAsync, updateUserLocationAsync, deleteUserAsync];
}