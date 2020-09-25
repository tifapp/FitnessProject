import { Auth } from 'aws-amplify';
import {createUser, updateUser} from '../graphql/mutations.js'
import {getUser} from '../graphql/queries.js'
import { API, graphqlOperation, Storage} from "aws-amplify";

export default () => {

    const loadUserAsync = async (imageURL, name, age, gender, bioDetails, goalsDetails,
                                  setImageURL, setName, setAge, setGender, setBioDetails, setGoalsDetails) => {
        
        const updateFields = ({fields}) => {
            Storage.get('profileimage.jpg', {level: 'protected'})
            .then((imageURL) => {setImageURL(imageURL)})
            .catch((err) => {console.log(err)})

            setName(fields.name)
            setAge(fields.age)
            setGender(fields.gender)
            setBioDetails(fields.bio)
            setGoalsDetails(fields.goals)
        }
        
        const createUserInDB = async ({newUser}) => {
          try {
            await API.graphql(graphqlOperation(createUser, { input: newUser }));
            console.log("success");
          } catch (err) {
            console.log("error: ", err);
          }
        }

        try {
            const query = await Auth.currentUserInfo();
            const {identityId} = await Auth.currentCredentials();
            const user = await API.graphql(graphqlOperation(getUser, {id: query.attributes.sub }));

            const fields = user.data.getUser;

            if (user.data.getUser == null) {
                const newUser = {
                    id: query.attributes.sub,
                    pictureURL: identityId,
                    name: name,
                    age: age,
                    gender: gender,
                    bio: bioDetails,
                    goals: goalsDetails
                  };
                createUserInDB({newUser})
            }
            else {
                updateFields({fields})
            }
        }
        catch(err) {
            console.log("error: ", err);
        }
    };

    const updateUserAsync = async (imageURL, name, age, gender, bioDetails, goalsDetails) => {
        const updateUserInDB = async({recurringUser}) => {
          try {
            const response = await fetch(imageURL);
            const blob = await response.blob();
            Storage.put('profileimage.jpg', blob, {level: 'protected', contentType: 'image/jpeg'})
            await API.graphql(graphqlOperation(updateUser, { input: recurringUser }));
            console.log("updated");
          } catch (err) {
            console.log("error: ", err);
          }
        }

        try {
            const query = await Auth.currentUserInfo();
            const user = await API.graphql(graphqlOperation(getUser, {id: query.attributes.sub }));
            const {identityId} = await Auth.currentCredentials();
            const recurringUser = {
                id: query.attributes.sub,
                pictureURL: identityId,
                name: name,
                age: age,
                gender: gender,
                bio: bioDetails,
                goals: goalsDetails
              };
              updateUserInDB({recurringUser})
        }
        catch(err) {
            console.log("error: ", err);
        }
    };

    return [loadUserAsync, updateUserAsync];
}