"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { BlurView } from "expo-blur"
import * as Haptics from "expo-haptics"

interface VoiceSearchProps {
  onClose: () => void
  onResult: (text: string) => void
}

const VoiceSearch: React.FC<VoiceSearchProps> = ({ onClose, onResult }) => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")

  const animation = useRef(new Animated.Value(0)).current
  const waveAnimation = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Start animation when component mounts
    Animated.timing(animation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()

    // Simulate starting listening after a short delay
    const timer = setTimeout(() => {
      setIsListening(true)
      startWaveAnimation()

      // Simulate voice recognition with a mock result
      const recognitionTimer = setTimeout(() => {
        setTranscript("Looking for matches near me")
        setIsListening(false)

        // Send result after showing it briefly
        const resultTimer = setTimeout(() => {
          onResult("Looking for matches near me")
        }, 1500)

        return () => clearTimeout(resultTimer)
      }, 3000)

      return () => clearTimeout(recognitionTimer)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const startWaveAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnimation, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(waveAnimation, {
          toValue: 0,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start()
  }

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    Animated.timing(animation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose()
    })
  }

  const scale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  })

  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  })

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
        },
      ]}
    >
      <BlurView intensity={20} style={styles.blurContainer}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [{ scale }],
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Voice Search</Text>
            <TouchableOpacity onPress={handleCancel}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.voiceContainer}>
            {isListening ? (
              <View style={styles.waveformContainer}>
                {[...Array(5)].map((_, index) => (
                  <Animated.View
                    key={index}
                    style={[
                      styles.waveBar,
                      {
                        height: waveAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20 + Math.random() * 10, 40 + Math.random() * 30],
                        }),
                        backgroundColor: `rgba(94, 114, 228, ${0.5 + index * 0.1})`,
                      },
                    ]}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.micContainer}>
                <TouchableOpacity style={[styles.micButton, transcript ? styles.micButtonSuccess : null]}>
                  <Ionicons name={transcript ? "checkmark" : "mic"} size={28} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <Text style={styles.promptText}>
            {isListening ? "Listening..." : transcript ? "Here's what I heard:" : "Tap to speak"}
          </Text>

          {transcript && <Text style={styles.transcriptText}>{transcript}</Text>}
        </Animated.View>
      </BlurView>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  blurContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  voiceContainer: {
    marginVertical: 24,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  micContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#5e72e4",
    justifyContent: "center",
    alignItems: "center",
  },
  micButtonSuccess: {
    backgroundColor: "#4CAF50",
  },
  waveformContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 80,
  },
  waveBar: {
    width: 4,
    marginHorizontal: 3,
    borderRadius: 2,
    backgroundColor: "#5e72e4",
  },
  promptText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
  },
  transcriptText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },
})

export default VoiceSearch

