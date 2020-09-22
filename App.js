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
			const { identityId } = await Auth.currentCredentials();
			const query = await Auth.currentUserInfo();
			console.log('success finding user id', query, query.attributes.sub);

			const [, , , extension] = /([^.]+)(\.(\w+))?$/.exec(uri);

			const response = await fetch(uri);
			const blob = await response.blob();
			const visibility = 'public';
			const key = `${visibility}/${identityId}/${query.attributes.sub}${extension && '.'}${extension}`;

			Storage.put(key, blob, {
				contentType: 'image/jpeg',
				level: 'public'
			})
			
			try {
				await API.graphql(graphqlOperation(createPicture, { input: { id: key } }));
				console.log('success uploading');
				
				setSelectedImage({ localUri: uri });
			} catch (err) {
				console.log('error uploading: ', err);
			}
		} catch (err) {
			console.log(err)
		}
	}

	const [selectedImage, setSelectedImage] = React.useState(null);

	const [username, setUsername] = useState('');
	const [users, setUsers] = useState([]);

    //useEffect
    useEffect(() => {
        console.log('useEffect has been called!');
		setFullName({name:'Marco',familyName: 'Shaw'});
		//check if user exists with fetch; if doesn't, create a user
		//download profile image if one exists by...;
		//either reading user's profile image field and then download with the key

		Storage.get('test.txt', { 
			level: 'protected', 
			identityId: 'xxxxxxx' // the identityId of that user
		})
		.then(result => console.log(result)) //what does this return???
		.catch(err => console.log(err));
		

		//or simply downloading "profileimage" with the user's identityid. assuming auto overwriting, this is better.
		//okay we'll try using protected since it seems more secure (even though it's absolute busted since we also need to keep track of identityid...)

		//can't find any docs that clearly state if uploading a file with the same name overwrites it; probably not but we'll test it here
		//otherwise we'll have to remove the old picture before updating it when uploading a profile pic

		//test by closing and reopening the app; the selected profile image should show up persistently
    },[]); //Pass Array as second argument

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

			<Image
				source={{ uri: pictures.length > 0 ? pictures[0].file.key : '' }}
				style={styles.thumbnail}
			/>
			{/* {
				pictures.map((p, i) => (
					<Image
						key={i}
						source={{ uri: p.key }}
						style={styles.thumbnail}
					/>
				))
			} */}

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
