import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
const Header: React.FC = () => {
  return (
      <View style={styles.header}>
        <Text style={styles.name}>
          Hi Abhishekk     
        </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  
  header: {
    backgroundColor: '#F2524D',
    flex: 0.16,
    borderBottomRightRadius: 50,
    width: '100%',
    justifyContent: 'center',
    paddingHorizontal: '8%',
    zIndex:-10
  },
  name: {
    color: 'white',
    fontSize: 30,
    fontFamily: 'Oswald',
  },
});

export default Header;
