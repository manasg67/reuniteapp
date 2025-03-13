import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ScrollView, View, Image, Platform, KeyboardAvoidingView   } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSharedValue } from 'react-native-reanimated';
import { router } from 'expo-router';
import ProgressIndicator from '../components/ProgressIndicator';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, withSpring } from 'react-native-reanimated';

export default function ReviewScreen() {
  const currentIndex = useSharedValue(3);
  
  // Animation value for button
  const buttonAnimation = useSharedValue(0);

  const handleSubmit = () => {
    // Here you would typically send the data to your backend
    router.push('/SubmissionSuccess');
  };

  const handleEdit = (section: string) => {
    switch (section) {
      case 'personal':
        router.push('/PersonalInfoScreen');
        break;
      case 'photo':
        router.push('/Photouplode');
        break;
      case 'details':
        router.push('/AdditionalDetails');
        break;
    }
  };

  const InfoSection = ({ title, data, onEdit, isPhoto = false }: { title: string; data: any; onEdit: () => void; isPhoto?: boolean }) => (
    <Animated.View entering={FadeInDown.duration(1000).delay(isPhoto ? 800 : 400)} style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity onPress={onEdit}>
          <Ionicons name="pencil" size={20} color="#4a90e2" />
        </TouchableOpacity>
      </View>
      {isPhoto ? (
        <View style={styles.photoContainer}>
          <Image 
            source={{ uri: 'placeholder-uri' }} // Replace with actual photo
            style={styles.photo}
          />
        </View>
      ) : (
        Object.entries(data).map(([key, value]) => (
          <View key={key} style={styles.infoRow}>
            <Text style={styles.infoLabel}>{key}:</Text>
            <Text style={styles.infoValue}>{value as string}</Text>
          </View>
        ))
      )}
    </Animated.View>
  );

  // Mock data - in a real app, you'd pass this via state management
  const personalInfo = {
    'Full Name': 'John Doe',
    'Age': '25',
    'Last Seen': '2024-02-20',
  };

  const additionalDetails = {
    'Description': 'Height: 5\'10", wearing blue jacket',
    'Location': 'Central Park, NYC',
    'Contact': '+1 234-567-8900',
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
          <ScrollView showsVerticalScrollIndicator={false}>
            <Animated.View entering={FadeInUp.duration(1000)}>
              <ProgressIndicator count={4} currentIndex={currentIndex} />
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(1000).delay(200)}>
              <Text style={styles.title}>Review Information</Text>
              <Text style={styles.subtitle}>Please verify all details before submitting</Text>
            </Animated.View>

            <InfoSection 
              title="Personal Information"
              data={personalInfo}
              onEdit={() => handleEdit('personal')}
            />

            <InfoSection 
              title="Photo"
              data={{}}
              onEdit={() => handleEdit('photo')}
              isPhoto={true}
            />

            <InfoSection 
              title="Additional Details"
              data={additionalDetails}
              onEdit={() => handleEdit('details')}
            />

            <Animated.View 
              entering={FadeInUp.duration(1000).delay(1000)}
              style={animatedButtonStyle}
            >
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleSubmit}
                onPressIn={() => (buttonAnimation.value = 1)}
                onPressOut={() => (buttonAnimation.value = 0)}
              >
                <LinearGradient
                  colors={['#4CAF50', '#388E3C']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.submitButtonText}>Submit Report</Text>
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
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e0e0e0',
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoLabel: {
    flex: 1,
    fontSize: 16,
    color: '#B0BEC5',
  },
  infoValue: {
    flex: 2,
    fontSize: 16,
    color: '#FFFFFF',
  },
  photoContainer: {
    aspectRatio: 4/3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  submitButton: {
    borderRadius: 15,
    overflow: 'hidden',
    marginVertical: 20,
  },
  buttonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});