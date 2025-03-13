"use client"

import type React from "react"
import { useEffect } from "react"
import { Text, StyleSheet, TouchableOpacity } from "react-native"
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, Easing } from "react-native-reanimated"
import { Ionicons } from "@expo/vector-icons"

interface ErrorStateProps {
  onRetry: () => void
}

const ErrorState: React.FC<ErrorStateProps> = ({ onRetry }) => {
  const opacity = useSharedValue(0)
  const scale = useSharedValue(0.9)
  const rotation = useSharedValue(0)

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400 })
    scale.value = withTiming(1, { duration: 400, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
    rotation.value = withSequence(
      withTiming(-0.05, { duration: 200 }),
      withTiming(0.05, { duration: 200 }),
      withTiming(0, { duration: 200 }),
    )
  }, [])

  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }, { rotate: `${rotation.value}rad` }],
    }
  })

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Ionicons name="alert-circle-outline" size={64} color="#F44336" />
      <Text style={styles.title}>Something Went Wrong</Text>
      <Text style={styles.message}>We encountered an error while searching. Please try again.</Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Ionicons name="refresh" size={20} color="#FFFFFF" />
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#212121",
    marginTop: 16,
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: "#757575",
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#1A237E",
    borderRadius: 20,
  },
  retryButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 8,
  },
})

export default ErrorState

