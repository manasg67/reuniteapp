import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, Image, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSharedValue } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import ProgressIndicator from '../components/ProgressIndicator';
import { Ionicons } from '@expo/vector-icons';

export default function PhotoUploadScreen() {
  const [image, setImage] = useState<string | null>(null);
  const currentIndex = useSharedValue(1);

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

  return (
    <SafeAreaView style={styles.container}>
      <ProgressIndicator count={4} currentIndex={currentIndex} />
      <Text style={styles.title}>Upload Photo</Text>
      <Text style={styles.subtitle}>Please provide a recent photo</Text>

      <TouchableOpacity style={styles.uploadArea} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="camera" size={40} color="#1A237E" />
            <Text style={styles.uploadText}>Tap to upload photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, !image && styles.buttonDisabled]} 
        onPress={handleNext}
        disabled={!image}
      >
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
  uploadArea: {
    aspectRatio: 4/3,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 20,
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
    borderColor: '#B2EBF2',
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  uploadText: {
    marginTop: 10,
    color: '#1A237E',
  },
  button: {
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#B2EBF2',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 