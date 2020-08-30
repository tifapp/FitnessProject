import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, Button, Image, View, TextInput } from 'react-native';

export default function App() {	
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	
	const readValues = () => {
		if (username == "Sean" && password == "pass") {
			alert('yes');
		} else {
			alert('no');
		}
	}

	return (
	  <View>
		<Text>Login Screen</Text>
		
		<TextInput
		  style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
		  placeholder={"username"}
          onChangeText={(text) => setUsername(text)}
		  value={username}
		/>
		<TextInput
		  style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
		  placeholder={"password"}
          onChangeText={(text) => setPassword(text)}
		  value={password}
		/>
		<Button
			title="Submit"
			onPress={readValues}
		/>
	  </View>
	);
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
