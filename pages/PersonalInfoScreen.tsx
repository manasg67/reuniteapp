"use client"

import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSharedValue } from 'react-native-reanimated';
import { router } from 'expo-router';
import AnimatedInput from '../components/AnimatedInput';
import ProgressIndicator from '../components/ProgressIndicator';

export default function PersonalInfoScreen() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [lastSeen, setLastSeen] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const currentIndex = useSharedValue(0);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name) newErrors.name = 'Name is required';
    if (!age) newErrors.age = 'Age is required';
    if (!lastSeen) newErrors.lastSeen = 'Last seen date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      currentIndex.value = 1;
      router.push('/Photouplode');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ProgressIndicator count={4} currentIndex={currentIndex} />
      <Text style={styles.title}>Missing Person Information</Text>
      <Text style={styles.subtitle}>Please provide the following details:</Text>

      <AnimatedInput
        label="Full Name"
        value={name}
        onChangeText={setName}
        placeholder="Enter full name"
        error={errors.name}
      />
      <AnimatedInput
        label="Age"
        value={age}
        onChangeText={setAge}
        placeholder="Enter age"
        error={errors.age}
      />
      <AnimatedInput
        label="Last Seen Date"
        value={lastSeen}
        onChangeText={setLastSeen}
        placeholder="YYYY-MM-DD"
        error={errors.lastSeen}
      />

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

