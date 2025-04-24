import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import HomeScreen from './HomeScreen';
import MapScreen from './MapScreen';
import EarthquakeDetailScreen from './EarthquakeDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const DarkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1db954',
    background: '#121212', 
    card: '#121212',
    text: '#ffffff', 
    border: '#333333', 
    notification: '#1db954',
  },
};

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#1db954', 
        tabBarInactiveTintColor: '#888888', 
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#121212',
          borderTopColor: '#333333', 
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      }}
    >
      <Tab.Screen 
        name="Liste" 
        component={HomeScreen} 
        options={{
          tabBarLabel: 'Liste',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="format-list-bulleted" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Harita" 
        component={MapScreen} 
        options={{
          tabBarLabel: 'Harita',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="map" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <View style={{ flex: 1, backgroundColor: '#121212' }}>
      <StatusBar style="light" />
      <NavigationContainer theme={DarkTheme}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#121212' },
          }}
        >
          <Stack.Screen name="Ana Ekran" component={HomeTabs} />
          <Stack.Screen name="Deprem Detayı" component={EarthquakeDetailScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}
