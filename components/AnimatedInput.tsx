import React, { useState } from 'react';
import { StyleSheet, TextInput, View, Text, StyleProp, ViewStyle, KeyboardTypeOptions } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface AnimatedInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  style?: StyleProp<ViewStyle>;
  keyboardType?: KeyboardTypeOptions;
}

const AnimatedInput: React.FC<AnimatedInputProps> = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  error, 
  style, 
  keyboardType = 'default' 
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const animatedLabelStyle = useAnimatedStyle(() => {
    const isActive = isFocused || value.length > 0;
    return {
      transform: [
        {
          translateY: withTiming(isActive ? -20 : 0, {
            duration: 200,
            easing: Easing.ease,
          }),
        },
        {
          scale: withTiming(isActive ? 0.9 : 1, {
            duration: 200,
            easing: Easing.ease,
          }),
        },
      ],
      color: isActive ? '#FFFFFF' : '#B0BEC5',
    };
  });

  const animatedBorderStyle = useAnimatedStyle(() => {
    return {
      borderColor: error ? '#FF5252' : '#FFFFFF',
      borderWidth: withTiming(isFocused ? 2 : 1, {
        duration: 200,
      }),
    };
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[styles.inputWrapper, animatedBorderStyle]}>
        <LinearGradient
          colors={['#4A90E2', '#357ABD']}
          style={styles.gradientBackground}
        >
          <Animated.Text style={[styles.label, animatedLabelStyle]}>
            {label.toUpperCase()}
          </Animated.Text>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder={isFocused ? '' : placeholder}
            placeholderTextColor="#FFFFFF"
            keyboardType={keyboardType}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </LinearGradient>
      </Animated.View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
    width: '100%',
  },
  inputWrapper: {
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  gradientBackground: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 15,
  },
  label: {
    position: 'absolute',
    left: 15,
    top: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  input: {
    fontSize: 16,
    color: '#FFFFFF',
    height: 40,
    borderWidth: 0,
    paddingTop: 15, // Space for label
  },
  errorText: {
    color: '#FF5252',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 15,
  },
});

export default AnimatedInput;