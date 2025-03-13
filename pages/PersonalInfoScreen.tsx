import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSharedValue } from 'react-native-reanimated';
import { router } from 'expo-router';
import AnimatedInput from '../components/AnimatedInput';
import ProgressIndicator from '../components/ProgressIndicator';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function PersonalInfoScreen() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [lastSeen, setLastSeen] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const currentIndex = useSharedValue(0);
  
  // Animation values
  const buttonAnimation = useSharedValue(0);

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

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || lastSeen;
    setShowDatePicker(false);
    setLastSeen(currentDate);
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
            <Text style={styles.title}>Missing Person Information</Text>
            <Text style={styles.subtitle}>Please provide the following details:</Text>
          </Animated.View>

          <View style={styles.inputContainer}>
            <Animated.View entering={FadeInDown.duration(1000).delay(400)}>
              <AnimatedInput
                label="Full Name"
                value={name}
                onChangeText={setName}
                placeholder="Enter full name"
                error={errors.name}
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(1000).delay(600)}>
              <AnimatedInput
                label="Age"
                value={age}
                onChangeText={setAge}
                placeholder="Enter age"
                error={errors.age}
                keyboardType="numeric"
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(1000).delay(800)}>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateLabel}>Last Seen Date</Text>
                <Text style={styles.dateValue}>
                  {lastSeen.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={lastSeen}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                  style={styles.datePicker}
                />
              )}
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
                colors={['#4A90E2', '#357ABD']}
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
  inputContainer: {
    marginBottom: 30,
  },
  dateInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  dateLabel: {
    color: '#B0BEC5',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  dateValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  datePicker: {
    width: '100%',
  },
  button: {
    borderRadius: 15,
    overflow: 'hidden',
    marginTop: 20,
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