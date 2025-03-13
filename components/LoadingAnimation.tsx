"use client"

import type React from "react"
import { useEffect } from "react"
import { View, Text, StyleSheet } from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated"

const LoadingAnimation: React.FC = () => {
  const dot1Opacity = useSharedValue(0)
  const dot2Opacity = useSharedValue(0)
  const dot3Opacity = useSharedValue(0)
  const searchingScale = useSharedValue(0.9)

  useEffect(() => {
    // Animate dots
    dot1Opacity.value = withRepeat(
      withSequence(withTiming(1, { duration: 400 }), withTiming(0.3, { duration: 400 })),
      -1,
    )

    dot2Opacity.value = withDelay(
      200,
      withRepeat(withSequence(withTiming(1, { duration: 400 }), withTiming(0.3, { duration: 400 })), -1),
    )

    dot3Opacity.value = withDelay(
      400,
      withRepeat(withSequence(withTiming(1, { duration: 400 }), withTiming(0.3, { duration: 400 })), -1),
    )

    // Animate searching text
    searchingScale.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
        withTiming(0.9, { duration: 1000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
      ),
      -1,
      true,
    )
  }, [])

  const dot1Style = useAnimatedStyle(() => {
    return {
      opacity: dot1Opacity.value,
    }
  })

  const dot2Style = useAnimatedStyle(() => {
    return {
      opacity: dot2Opacity.value,
    }
  })

  const dot3Style = useAnimatedStyle(() => {
    return {
      opacity: dot3Opacity.value,
    }
  })

  const searchingStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: searchingScale.value }],
    }
  })

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.searchingContainer, searchingStyle]}>
        <Text style={styles.searchingText}>Searching</Text>
        <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, dot1Style]} />
          <Animated.View style={[styles.dot, dot2Style]} />
          <Animated.View style={[styles.dot, dot3Style]} />
        </View>
      </Animated.View>
      <Text style={styles.infoText}>We're searching our database for potential matches</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  searchingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  searchingText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A237E",
  },
  dotsContainer: {
    flexDirection: "row",
    marginLeft: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1A237E",
    marginHorizontal: 2,
  },
  infoText: {
    fontSize: 16,
    color: "#757575",
    textAlign: "center",
  },
})

export default LoadingAnimation

