import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../../context/AuthContext'; // Adjust path as needed
import Power from '../../../assets/img/power.svg';

const Header: React.FC = () => {
  const { profile, logout } = useAuth();
  return (
    <View style={styles.header}>
      <Text style={styles.name}>
        Hi {profile.firstName.split(" ")[0]}
      </Text>
      <Text style={styles.name}> <Power width={35} height={35} onPress={() => logout()} /></Text>
    </View>
  );
};

const styles = StyleSheet.create({

  header: {
    backgroundColor: '#F2524D',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 0.16,
    borderBottomRightRadius: 50,
    width: '100%',
    height: 100,
    // justifyContent: 'center',
    paddingHorizontal: '8%',
    zIndex: -10
  },
  name: {
    paddingTop: 10,
    color: 'white',
    fontSize: 30,
    fontFamily: 'Oswald',
  },

});

export default Header;
