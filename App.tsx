import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from './context/AuthContext'; 
import MainComponent from './components/main/Main';
import { customTheme } from './assets/theme';

const App: React.FC = () => {

  return (
    <PaperProvider theme={customTheme}>
      <SafeAreaProvider>
        <AuthProvider>
          <MainComponent/>
        </AuthProvider>
      </SafeAreaProvider>
    </PaperProvider>
  );
};

export default App;
