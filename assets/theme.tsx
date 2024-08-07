import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

// Customize your theme here
export const customTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#F2524D',       // Change this to your primary color
    accent: '#F2524D',        // Change this to your accent color
    background: '#F2524D',    // Change this to your background color
    surface: '#ffffff',       // Change this to your surface color
    text: '#333333',          // Change this to your text color
    disabled: '#dddddd',      // Change this to your disabled color
    placeholder: '#aaaaaa',   // Change this to your placeholder color
    backdrop: '#000000',      // Change this to your backdrop color
    notification: '#ff4081',  // Change this to your notification color
  },
  roundness: 5,               // Adjust roundness of components
};