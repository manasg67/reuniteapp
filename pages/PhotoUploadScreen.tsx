import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, Image, View, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSharedValue } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import ProgressIndicator from '../components/ProgressIndicator';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, withSpring } from 'react-native-reanimated';

export default function PhotoUploadScreen() {
  const [image, setImage] = useState<string | null>(null);
  const currentIndex = useSharedValue(1);
  
  // Animation value for button
  const buttonAnimation = useSharedValue(0);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleNext = () => {
    if (image) {
      currentIndex.value = 2;
      router.push('/AdditionalDetails');
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
          <Animated.View entering={FadeInUp.duration(1000)}>
            <ProgressIndicator count={4} currentIndex={currentIndex} />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(1000).delay(200)}>
            <Text style={styles.title}>Upload Photo</Text>
            <Text style={styles.subtitle}>Please provide a recent photo</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(1000).delay(400)} style={styles.uploadContainer}>
            <TouchableOpacity style={styles.uploadArea} onPress={pickImage}>
              {image ? (
                <Image source={{ uri: image }} style={styles.image} />
              ) : (
                <View style={styles.placeholder}>
                  <Ionicons name="camera" size={50} color="#e0e0e0" />
                  <Text style={styles.uploadText}>Tap to upload photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>

          <Animated.View 
            entering={FadeInUp.duration(1000).delay(600)}
            style={animatedButtonStyle}
          >
            <TouchableOpacity 
              style={[styles.button, !image && styles.buttonDisabled]} 
              onPress={handleNext}
              onPressIn={() => (buttonAnimation.value = 1)}
              onPressOut={() => (buttonAnimation.value = 0)}
              disabled={!image}
            >
              <LinearGradient
                colors={['#4a90e2', '#357abd']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Next</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
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
  uploadContainer: {
    marginBottom: 30,
    marginLeft: 10
  },
  uploadArea: {
    aspectRatio: 4/3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    marginLeft:30,
    overflow: 'hidden',
    marginVertical: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#B0BEC5',
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  uploadText: {
    marginTop: 10,
    color: '#e0e0e0',
    fontSize: 16,
  },
  button: {
    borderRadius: 15,
    overflow: 'hidden',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#B0BEC5',
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