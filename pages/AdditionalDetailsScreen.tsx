import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSharedValue } from 'react-native-reanimated';
import { router } from 'expo-router';
import AnimatedInput from '../components/AnimatedInput';
import ProgressIndicator from '../components/ProgressIndicator';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, withSpring } from 'react-native-reanimated';

export default function AdditionalDetailsScreen() {
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const currentIndex = useSharedValue(2);
  
  // Animation value for button
  const buttonAnimation = useSharedValue(0);

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

  // Animated button style
  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{
        scale: withSpring(buttonAnimation.value ? 1.05 : 1)
      }]
    };
  });

  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView>
            <Animated.View entering={FadeInUp.duration(1000)}>
              <ProgressIndicator count={4} currentIndex={currentIndex} />
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(1000).delay(200)}>
              <Text style={styles.title}>Additional Details</Text>
              <Text style={styles.subtitle}>Help us gather more information</Text>
            </Animated.View>

            <View style={styles.inputContainer}>
              <Animated.View entering={FadeInDown.duration(1000).delay(400)}>
                <AnimatedInput
                  label="Physical Description"
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Height, weight, clothing, etc."
                  error={errors.description}
                />
              </Animated.View>

              <Animated.View entering={FadeInDown.duration(1000).delay(600)}>
                <AnimatedInput
                  label="Last Known Location"
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Where were they last seen?"
                  error={errors.location}
                />
              </Animated.View>

              <Animated.View entering={FadeInDown.duration(1000).delay(800)}>
                <AnimatedInput
                  label="Contact Information"
                  value={contact}
                  onChangeText={setContact}
                  placeholder="Your phone number or email"
                  error={errors.contact}
                />
              </Animated.View>
            </View>

            <Animated.View 
              entering={FadeInUp.duration(1000).delay(1000)}
              style={animatedButtonStyle}
            >
              <TouchableOpacity 
                style={styles.button}
                onPress={handleNext}
                onPressIn={() => (buttonAnimation.value = 1)}
                onPressOut={() => (buttonAnimation.value = 0)}
              >
                <LinearGradient
                  colors={['#4a90e2', '#357abd']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Next</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e0e0',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 30,
  },
  button: {
    borderRadius: 15,
    overflow: 'hidden',
    marginTop: 20,
    marginBottom: 40,
  },
  buttonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});