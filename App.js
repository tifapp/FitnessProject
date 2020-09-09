import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, Button, Image, View, TextInput } from 'react-native';
import { withAuthenticator } from 'aws-amplify-react-native';
import Amplify from 'aws-amplify';
// Get the aws resources configuration parameters
import awsconfig from './aws-exports'; // if you are using Amplify CLI

Amplify.configure(awsconfig);

import { API, graphqlOperation } from "aws-amplify";
import { createUser, updateUser, deleteUser } from './src/graphql/mutations';
import { listUsers } from './src/graphql/queries';

const App = () => {	
  const [username, setUsername] = useState('');
  const [users, setUsers] = useState([]);

	const addUserAsync = async () => {
	  const newUser = { id : Date.now(), name: username };
	  try {
		await API.graphql(graphqlOperation(createUser, {input: newUser}));
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

  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
	  <TextInput
		  style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
		  placeholder={"new user"}
          onChangeText={(text) => setUsername(text)}
		  value={username}
		/>

	  <Button onPress={addUserAsync} title="Add User" color="#eeaa55" />
	  <Button onPress={showUsersAsync} title="List All Users" color="#eeaa55" />
	  
      <Text>All users:</Text>
	  {users.map((book, index) => (
		  <View key={index}>
			<Text>{book.name}</Text>
		  </View>
		))}
	  
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
});
