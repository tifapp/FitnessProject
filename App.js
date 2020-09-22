import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, Button, Image, View, TextInput } from 'react-native';
import { withAuthenticator } from 'aws-amplify-react-native';
// Get the aws resources configuration parameters
import awsconfig from './aws-exports'; // if you are using Amplify CLI
import { Auth, Amplify, API, graphqlOperation } from "aws-amplify";
import { createUser, updateUser, deleteUser, createPicture } from './src/graphql/mutations';
import { listUsers, listPictures } from './src/graphql/queries';
import * as ImagePicker from 'expo-image-picker';

Amplify.configure(awsconfig);

const App = () => {
	const [selectedImage, setSelectedImage] = React.useState(null);

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

		try {
			const query = await Auth.currentUserInfo();
			console.log('success finding user id', query, query.attributes.sub);
			
			const [, , , extension] = /([^.]+)(\.(\w+))?$/.exec(pickerResult.uri);
			const mimeType = pickerResult.type + "/" + (extension == "jpg" ? "jpeg" : extension); //kinda hacky but idk how else to resolve to the exact mimetype with expo's image picker

			const bucket = awsconfig.aws_user_files_s3_bucket;
			const region = awsconfig.aws_user_files_s3_bucket_region;
			const visibility = 'public';
			const { identityId } = await Auth.currentCredentials();

			const key = `${visibility}/${identityId}/${query.attributes.sub}${extension && '.'}${extension}`;

			let selectedFile = {
				bucket,
				key,
				region,
				mimeType,
				localUri: pickerResult.uri,
			};
			
			console.log("generated key is " + mimeType);

			try {
				await API.graphql(graphqlOperation(createPicture, { input: { id: key + Date.now(), file: selectedFile } }));
				console.log('success uploading');
				setSelectedImage({ localUri: pickerResult.uri });
			} catch (err) {
				console.log('error uploading: ', err);
			}

		} catch (err) {
			console.log('error finding user id: ', err);
		}
	};

	const [username, setUsername] = useState('');
	const [users, setUsers] = useState([]);

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
