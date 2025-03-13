import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);

export default function TabLayout() {   
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#1A237E",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: "#f5f5f5",
          ...(Platform.OS === 'ios' && {
            position: 'absolute',
          }),
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          
          switch (route.name) {
            case 'home':
              iconName = focused ? "home" : "home-outline";
              break;
            case 'profile':
              iconName = focused ? "person" : "person-outline";
              break;
            case 'search':
              iconName = focused ? "search" : "search-outline";
              break;
            case 'report':
              iconName = focused ? "alert-circle" : "alert-circle-outline";
              break;
            case 'resources':
              iconName = focused ? "information-circle" : "information-circle-outline";
              break;
            default:
              iconName = "help-outline";
          }

          const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: withTiming(focused ? 1.2 : 1, { duration: 200 }) }],
          }), [focused]);

          return <AnimatedIcon name={iconName} size={size} color={color} style={animatedStyle} />;
        },
      })}>
      <Tabs.Screen 
        name="home" 
        options={{ 
          title: 'Home',
          headerShown: false 
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Profile',
          headerShown: false 
        }} 
      />
      <Tabs.Screen 
        name="search" 
        options={{ 
          title: 'Search',
          headerShown: false 
        }} 
      />
      <Tabs.Screen 
        name="report" 
        options={{ 
          title: 'Report',
          headerShown: false 
        }} 
      />
      <Tabs.Screen 
        name="resources" 
        options={{ 
          title: 'Resources',
          headerShown: false 
        }} 
      />
    </Tabs>
  );
}
