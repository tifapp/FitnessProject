import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, Button, Image, View, TextInput } from 'react-native';
import { withAuthenticator } from 'aws-amplify-react-native';
// Get the aws resources configuration parameters
import awsconfig from './aws-exports'; // if you are using Amplify CLI
import { Auth, Amplify, API, graphqlOperation, Storage } from "aws-amplify";
import { createUser, updateUser, deleteUser, createPicture } from './src/graphql/mutations';
import { listUsers, listPictures } from './src/graphql/queries';
import * as ImagePicker from 'expo-image-picker';

Amplify.configure(awsconfig);

const App = () => {
	const openImagePickerAsync = async () => {
		let permissionResult = await ImagePicker.requestCameraRollPermissionsAsync();

		if (permissionResult.granted === false) {
			alert('Permission to access camera roll is required!');
			return;
		}

		let pickerResult = await ImagePicker.launchImageLibraryAsync();

		if (pickerResult.cancelled === true) {
			return;
		}

		uploadImageToStorage(pickerResult.uri);
	};

	const uploadImageToStorage = async (uri) => {
		try {
			const response = await fetch(uri);
			const blob = await response.blob();

			Storage.put('profileimage.jpeg', blob, {
				level: 'protected',
				contentType: 'image/jpeg'
			})
		} catch (err) {
			console.log(err)
		}
	}

	const [selectedImage, setSelectedImage] = React.useState(null);

	const [username, setUsername] = useState('');
	const [users, setUsers] = useState([]);

    //componentDidMount event with useEffect
    useEffect(() => {
        console.log('useEffect has been called!');
		//check if user exists with fetch; if doesn't, create a user
		//download profile image if one exists by...;

		const { identityId } = await Auth.currentCredentials(); //make sure this format works plz
		console.log('identityId is: ', identityId);

		try {
			await API.graphql(graphqlOperation(updateUser, { input: { id: 'iwjaroajwro;i', identityId: identityId } })); //update user's identityid if they don't have one
			console.log('success uploading');
			
			setSelectedImage({ localUri: uri });
		} catch (err) {
			console.log('error uploading: ', err);
		}

		//downloading "profileimage" with the user's identityid. assuming auto overwriting, this is better. we'll have to save the user's identityid in the backend first though. ^
		Storage.get('profileimage.jpeg', { 
			level: 'protected', 
			identityId: identityId // the identityId of that user
		})
		.then(result => console.log(result)) //what does this return??? uri???
		.catch(err => console.log(err));

		//can't find any docs that clearly state if uploading a file with the same name overwrites it; probably not but we'll test it here
		//otherwise we'll have to remove the old picture before updating it when uploading a profile pic

		//test by closing and reopening the app; the selected profile image should show up persistently
		//check on the s3 console as well
    },[]); //Pass empty array as second argument to mimic componentDidMount()

	const addUserAsync = async () => {
		const newUser = { id: Date.now(), name: username };
		try {
			await API.graphql(graphqlOperation(createUser, { input: newUser }));
			console.log('success');
		} catch (err) {
			console.log('error: ', err);
		}
	};

	const showUsersAsync = async () => {
		try {
			const query = await API.graphql(graphqlOperation(listUsers));
			setUsers(query.data.listUsers.items);
			console.log('success', users);
		} catch (err) {
			console.log('error: ', err);
		}
	};

	const [pictures, setPictures] = useState([]);

	const showPicturesAsync = async () => {
		try {
			const query = await API.graphql(graphqlOperation(listPictures));
			setPictures(query.data.listPictures.items);
			console.log('success', query);
			//console.log('success', query.data.listPictures.items[0].file.key);
		} catch (err) {
			console.log('error: ', err);
		}
	};

	return (
		<View style={styles.container}>
			<Image
				source={{ uri: selectedImage !== null ? selectedImage.localUri : 'https://i.imgur.com/TkIrScD.png' }}
				style={styles.thumbnail}
			/>
			<Button onPress={openImagePickerAsync} title="pick image" color="#eeaa55" />

			<Text>Open up App.js to start working on your app!</Text>
			<TextInput
				style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
				placeholder={"new user"}
				onChangeText={setUsername}
				value={username}
			/>

			<Button onPress={addUserAsync} title="Add User" color="#eeaa55" />
			<Button onPress={showUsersAsync} title="List All Users" color="#eeaa55" />
			<Button onPress={showPicturesAsync} title="List All Pics" color="#eeaa55" />

			{/* <Text>All users:</Text>
			{users.map((book, index) => (
				<View key={index}>
					<Text>{book.name}</Text>
				</View>
			))} */}

			<StatusBar style="auto" />
		</View>
	);
}

export default withAuthenticator(App);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
	thumbnail: {
		width: 300,
		height: 300,
		resizeMode: "contain"
	},
});
