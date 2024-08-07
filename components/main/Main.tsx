import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LoginScreen from '../login/Login';
import { useAuth } from '../../context/AuthContext';
import TimeSheet from '../timesheet/Timesheet'; // Your main content component

const MainComponent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <View style={styles.container}>
      {isAuthenticated ? <TimeSheet /> : <LoginScreen />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MainComponent;
