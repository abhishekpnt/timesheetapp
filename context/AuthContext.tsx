import { ReactNode } from "react";
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextData {
  isAuthenticated: boolean;
  token: string | null; // Add token field
  login: (token: string, refreshToken: string, responseData: any) => void;
  logout: () => void;
  refreshToken: () => Promise<void>;
  profile: any;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null); // Add token state
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const loadStoredTokens = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      const storedProfile = await AsyncStorage.getItem('profileDetails');
      
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      }

      if (storedToken && refreshToken) {
        setToken(storedToken); // Set token
        setIsAuthenticated(true);
      }
    };
    loadStoredTokens();
  }, []);

  const login = async (token: string, refreshToken: string, profileDetails: any) => {
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('refreshToken', refreshToken);
    await AsyncStorage.setItem('profileDetails', JSON.stringify(profileDetails));

    setToken(token); // Update token
    setIsAuthenticated(true);
    setProfile(profileDetails);
    console.log('profiledetails', profileDetails);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('profileDetails');

    setToken(null); // Clear token
    setIsAuthenticated(false);
    setProfile(null);
  };

  const refreshToken = async () => {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) {
      logout();
      return;
    }

    try {
      const response = await fetch('https://kronos.tarento.com/api/v1/user/refresh-token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('token', data.token);
        setToken(data.token); // Update token
      } else {
        logout();
      }
    } catch (error) {
      console.error('Failed to refresh token', error);
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, login, logout, refreshToken, profile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
