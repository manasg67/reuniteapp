"use client"

import type React from "react"
import { useEffect } from "react"
import { View, TextInput, StyleSheet, TouchableOpacity, Dimensions } from "react-native"
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, Easing } from "react-native-reanimated"
import { Ionicons } from "@expo/vector-icons"

const { width } = Dimensions.get("window")

interface SearchBarProps {
  value: string
  onChangeText: (text: string) => void
  onSubmit: () => void
  onVoiceSearch: () => void
  voiceActive: boolean
  onFocus?: () => void
  onBlur?: () => void
  onClear?: () => void
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChangeText, onSubmit, onVoiceSearch, voiceActive }) => {
  const inputWidth = useSharedValue(width - 100)
  const voiceWave = useSharedValue(1)
  const voiceOpacity = useSharedValue(0)

  useEffect(() => {
    if (voiceActive) {
      voiceOpacity.value = withTiming(1, { duration: 200 })
      voiceWave.value = withRepeat(withTiming(1.3, { duration: 1000, easing: Easing.inOut(Easing.ease) }), -1, true)
    } else {
      voiceOpacity.value = withTiming(0, { duration: 200 })
      voiceWave.value = 1
    }
  }, [voiceActive])

  const inputAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: inputWidth.value,
    }
  })

  const voiceWaveStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: voiceWave.value }],
      opacity: voiceOpacity.value,
    }
  })

  const handleFocus = () => {
    inputWidth.value = withTiming(width - 100, { duration: 250 })
  }

  const handleBlur = () => {
    if (!value) {
      inputWidth.value = withTiming(width - 100, { duration: 250 })
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchIconContainer}>
        <Ionicons name="search" size={20} color="#757575" />
      </View>

      <Animated.View style={[styles.inputContainer, inputAnimatedStyle]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder="Search missing persons..."
          placeholderTextColor="#9E9E9E"
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={onSubmit}
          returnKeyType="search"
        />
      </Animated.View>

      <TouchableOpacity style={styles.voiceButton} onPress={onVoiceSearch}>
        <Ionicons name="mic" size={20} color={voiceActive ? "#1A237E" : "#757575"} />
        <Animated.View style={[styles.voiceWave, voiceWaveStyle]} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 24,
    height: 48,
    paddingHorizontal: 8,
  },
  searchIconContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  inputContainer: {
    height: 40,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#212121",
  },
  voiceButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  voiceWave: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(26, 35, 126, 0.1)",
  },
})

export default SearchBar

