import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence, 
  withDelay 
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

export default function SubmissionSuccessScreen() {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSequence(
      withSpring(1.2),
      withSpring(1)
    );
    opacity.value = withDelay(
      500,
      withSpring(1)
    );
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: withSpring(opacity.value * 0) }]
  }));

  const handleHomePress = () => {
    router.push('/(tabs)/home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.iconContainer, iconStyle]}>
          <Ionicons name="checkmark-circle" size={100} color="#4CAF50" />
        </Animated.View>

        <Animated.View style={contentStyle}>
          <Text style={styles.title}>Report Submitted</Text>
          <Text style={styles.message}>
            Thank you for submitting your report. Our team will review it and take appropriate action.
          </Text>
          <Text style={styles.caseNumber}>
            Case Number: #{Math.random().toString().slice(2, 8)}
          </Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>What happens next?</Text>
            <Text style={styles.infoText}>
              • Your report will be reviewed within 24 hours{'\n'}
              • You'll receive updates via email/phone{'\n'}
              • Local authorities will be notified if necessary
            </Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleHomePress}>
            <Text style={styles.buttonText}>Return to Home</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A237E',
    textAlign: 'center',
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  caseNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4a90e2',
    textAlign: 'center',
    marginBottom: 30,
  },
  infoBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 15,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 