import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface ProgressIndicatorProps {
  count: number;
  currentIndex: Animated.SharedValue<number>;
}

export default function ProgressIndicator({ count, currentIndex }: ProgressIndicatorProps) {
  const dots = Array(count).fill(0);

  return (
    <View style={styles.container}>
      {dots.map((_, index) => {
        const animatedStyle = useAnimatedStyle(() => ({
          transform: [{ scale: withSpring(currentIndex.value === index ? 1.2 : 1) }],
          backgroundColor: currentIndex.value >= index ? '#1A237E' : '#B2EBF2',
        }));

        return (
          <Animated.View
            key={index}
            style={[styles.dot, animatedStyle]}
          />
        );
      })}
      <Animated.View style={[styles.progressLine]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 8,
  },
  progressLine: {
    position: 'absolute',
    height: 3,
    backgroundColor: '#1A237E',
    bottom: '50%',
    left: '10%',
    right: '10%',
    zIndex: -1,
  }
});

