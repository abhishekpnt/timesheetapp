import React from 'react';
import { View, StyleSheet } from 'react-native';

interface CardProps {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children }) => {
  return (
    <View style={styles.card}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    alignSelf:'center',
    width:'95%',
    borderWidth: 1,
    borderColor: '#ddd', // Light border color
    borderRadius: 20, // Rounded corners for aesthetic
    padding: 16, // Padding inside the card
    marginVertical: 8, // Space between cards
    backgroundColor: '#fff', // White background for contrast
    shadowColor: '#000', // Shadow for depth
    shadowOffset: { width: 0, height: 2 }, // Subtle shadow offset
    shadowOpacity: 0.1, // Light shadow opacity
    shadowRadius: 4, // Shadow radius for smoothness
    elevation: 2, // Elevation for Android shadow
  },
});

export default Card;
