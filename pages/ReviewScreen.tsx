import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ScrollView, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSharedValue } from 'react-native-reanimated';
import { router } from 'expo-router';
import ProgressIndicator from '../components/ProgressIndicator';
import { Ionicons } from '@expo/vector-icons';

export default function ReviewScreen() {
  const currentIndex = useSharedValue(3);

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

  const InfoSection = ({ title, data, onEdit }: { title: string; data: any; onEdit: () => void }) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity onPress={onEdit}>
          <Ionicons name="pencil" size={20} color="#4a90e2" />
        </TouchableOpacity>
      </View>
      {Object.entries(data).map(([key, value]) => (
        <View key={key} style={styles.infoRow}>
          <Text style={styles.infoLabel}>{key}:</Text>
          <Text style={styles.infoValue}>{value as string}</Text>
        </View>
      ))}
    </View>
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <ProgressIndicator count={4} currentIndex={currentIndex} />
        <Text style={styles.title}>Review Information</Text>
        <Text style={styles.subtitle}>Please verify all details before submitting</Text>

        <InfoSection 
          title="Personal Information"
          data={personalInfo}
          onEdit={() => handleEdit('personal')}
        />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Photo</Text>
            <TouchableOpacity onPress={() => handleEdit('photo')}>
              <Ionicons name="pencil" size={20} color="#4a90e2" />
            </TouchableOpacity>
          </View>
          <View style={styles.photoContainer}>
            <Image 
              source={{ uri: 'placeholder-uri' }} // Replace with actual photo
              style={styles.photo}
            />
          </View>
        </View>

        <InfoSection 
          title="Additional Details"
          data={additionalDetails}
          onEdit={() => handleEdit('details')}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Report</Text>
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
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    color: '#1A237E',
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    flex: 1,
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    flex: 2,
    fontSize: 16,
    color: '#333',
  },
  photoContainer: {
    aspectRatio: 4/3,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 