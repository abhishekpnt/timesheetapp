import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { TextInput, Button, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext'; // Adjust path as needed
import { customTheme } from '../../assets/theme';

const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://kronos.tarento.com/api/v1/user/login', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const data = await response.json();
      console.log('---',JSON.stringify(data))

      if (data.statusCode===200) {
        console.log('res',response)
        Alert.alert('Success', 'Logged in successfully');
        let name=`${data.responseData.firstName} ${data.responseData.lasttName}`
        login(data.responseData.sessionId, data.responseData.refreshToken,data.responseData);
      } else {
        Alert.alert('Error', data.message || 'Login failed');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaProvider>
      <PaperProvider theme={customTheme}>
        <View style={styles.container}>
          <Text style={styles.title}>Login</Text>
          <TextInput
            label="Username"
            value={username}
            onChangeText={text => setUsername(text)}
            style={styles.input}
            autoCapitalize="none"
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={text => setPassword(text)}
            style={styles.input}
            secureTextEntry
          />
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
          ) : (
            <Button mode="contained" onPress={handleLogin} style={styles.button}>
              Login
            </Button>
          )}
        </View>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
  },
  loader: {
    marginTop: 10,
  },
});

export default LoginScreen;
