import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence, 
  withDelay,
  withTiming 
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function SubmissionSuccessScreen() {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSequence(
      withSpring(0.8, { damping: 10 }),
      withSpring(1, { damping: 15 })
    );
    opacity.value = withSequence(
      withDelay(200, withTiming(1, { duration: 600 })),
    );
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: withSpring(opacity.value === 1 ? 0 : 20) }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleHomePress = () => {
    buttonScale.value = withSequence(
      withSpring(0.95),
      withSpring(1)
    );
    setTimeout(() => router.push('/(tabs)/home'), 150);
  };

  const caseNumber = Math.random().toString(36).slice(2, 8).toUpperCase();

  return (
    <LinearGradient
      colors={['#E8F0FE', '#F5F7FA']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Animated.View style={[styles.iconContainer, iconStyle]}>
            <View style={styles.iconBackground}>
              <Ionicons name="checkmark-circle" size={100} color="#34C759" />
            </View>
          </Animated.View>

          <Animated.View style={[styles.contentContainer, contentStyle]}>
            <Text style={styles.title}>Submission Successful</Text>
            <Text style={styles.message}>
              Thank you for your report. Our team is on it and will keep you updated.
            </Text>
            
            <View style={styles.caseContainer}>
              <Text style={styles.caseLabel}>Case ID</Text>
              <Text style={styles.caseNumber}>#{caseNumber}</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Next Steps</Text>
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={20} color="#666" />
                <Text style={styles.infoText}>Review within 24-48 hours</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="mail-outline" size={20} color="#666" />
                <Text style={styles.infoText}>Updates via email</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#666" />
                <Text style={styles.infoText}>Authorities notified if needed</Text>
              </View>
            </View>

            <TouchableOpacity 
              activeOpacity={0.9}
              onPress={handleHomePress}
            >
              <Animated.View style={[styles.buttonContainer, buttonStyle]}>
                <LinearGradient
                  colors={['#4A90E2', '#357ABD']}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>Back to Home</Text>
                  <Ionicons name="arrow-forward" size={20} color="white" style={styles.buttonIcon} />
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
    paddingTop: 40,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconBackground: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    borderRadius: 80,
    padding: 20,
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A237E',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  caseContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E6ED',
  },
  caseLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  caseNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4A90E2',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A237E',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#555',
    marginLeft: 12,
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
});