import React from 'react';
import { TextInput, StyleSheet, View, Text } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface AnimatedInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  error?: string;
}

export default function AnimatedInput({ label, value, onChangeText, placeholder, error }: AnimatedInputProps) {
  const labelStyle = useAnimatedStyle(() => ({
    transform: [{ 
      translateY: withSpring(value ? -25 : 0)
    }],
    fontSize: withSpring(value ? 12 : 16),
  }));

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.label, labelStyle]}>
        {label}
      </Animated.Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={value ? '' : placeholder}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    paddingTop: 15,
  },
  label: {
    position: 'absolute',
    left: 0,
    top: 20,
    color: '#1A237E',
    paddingHorizontal: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#B2EBF2',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 5,
  }
});

