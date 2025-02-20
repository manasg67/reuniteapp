import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSharedValue } from 'react-native-reanimated';
import { router } from 'expo-router';
import AnimatedInput from '../components/AnimatedInput';
import ProgressIndicator from '../components/ProgressIndicator';

export default function AdditionalDetailsScreen() {
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const currentIndex = useSharedValue(2);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!description) newErrors.description = 'Description is required';
    if (!location) newErrors.location = 'Last known location is required';
    if (!contact) newErrors.contact = 'Contact information is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      currentIndex.value = 3;
      router.push('/Review');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <ProgressIndicator count={4} currentIndex={currentIndex} />
        <Text style={styles.title}>Additional Details</Text>
        <Text style={styles.subtitle}>Help us gather more information</Text>

        <AnimatedInput
          label="Physical Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Height, weight, clothing, etc."
          error={errors.description}
        />
        <AnimatedInput
          label="Last Known Location"
          value={location}
          onChangeText={setLocation}
          placeholder="Where were they last seen?"
          error={errors.location}
        />
        <AnimatedInput
          label="Contact Information"
          value={contact}
          onChangeText={setContact}
          placeholder="Your phone number or email"
          error={errors.contact}
        />

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </ScrollView>
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
    marginBottom: 40,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 