import { Auth } from 'aws-amplify';
import { Alert } from 'react-native';
import { createUser, updateUser } from '../src/graphql/mutations.js'
import { getUser } from '../src/graphql/queries.js'
import { API, graphqlOperation, Storage } from "aws-amplify";
import { Image } from 'react-native';

export default () => {

  const loadUserAsync = async (setImageURL, setName, setAge, setGender, setBioDetails, setGoalsDetails, setInitialFields) => {

    const updateFields = ({ fields }) => {
      Storage.get('profileimage.jpg', { level: 'protected' })
        .then((imageURL) => { //console.log("found profile image!", imageURL); 
          Image.getSize(imageURL, () => {
            setImageURL(imageURL);
          }, err => {
            setImageURL('')
          });
        })
        .catch((err) => { console.log("could not find image!", err) })

      setName(fields.name)
      setAge(fields.age)
      setGender(fields.gender)
      setBioDetails(fields.bio)
      setGoalsDetails(fields.goals)
      setInitialFields([fields.name, fields.age, fields.gender, fields.bio, fields.goals])
    }

    try {
      const query = await Auth.currentUserInfo();
      const { identityId } = await Auth.currentCredentials();
      const user = await API.graphql(graphqlOperation(getUser, { id: query.attributes.sub }));

      const fields = user.data.getUser;

      if (fields == null) {
        console.log("user doesn't exist, they must be making their profile for the first time");
      }
      else {
        updateFields({ fields })
      }
    }
    catch (err) {
      console.log("error: ", err);
    }
  };

  const updateUserAsync = async (imageURL, name, age, gender, bioDetails, goalsDetails) => {
    const updateUserInDB = async ( recurringUser ) => {
      try {
        if (imageURL !== '') {
          const response = await fetch(imageURL);
          const blob = await response.blob();
          await Storage.put('profileimage.jpg', blob, { level: 'protected', contentType: 'image/jpeg' })
        } else {
          Storage.remove('profileimage.jpg', { level: 'protected' })
            .then(result => console.log("removed profile image!", result))
            .catch(err => console.log(err));
        }
        await API.graphql(graphqlOperation(updateUser, { input: recurringUser }));
        Alert.alert("Profile submitted successfully!");
        console.log("updated user successfully");
      } catch (err) {
        Alert.alert("Could not submit profile! Error: ", err);
        console.log("error when updating user: ", err);
      }
    }

    const createUserInDB = async ( newUser ) => {
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
        pictureURL: identityId,
        name: name,
        age: age,
        gender: gender,
        bio: bioDetails,
        goals: goalsDetails
      };

      if (fields == null) {
        createUserInDB( ourUser )
      }
      else {
        updateUserInDB( ourUser )
      }
    }
    catch (err) {
      console.log("error: ", err);
    }
  };

  return [loadUserAsync, updateUserAsync];
}