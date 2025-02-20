"use client"

import { useEffect } from "react"
import { View, StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from "react-native-reanimated"
import { LinearGradient } from "expo-linear-gradient"

const LaunchScreen = () => {
  const navigation = useNavigation()
  const opacity = useSharedValue(0)

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 2000,
      easing: Easing.ease,
    })

    const timer = setTimeout(() => {
      navigation.navigate("Onboarding" as never)
    }, 3000)

    return () => clearTimeout(timer)
  }, [navigation, opacity])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    }
  })

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#E0F7FA", "#B2EBF2", "#80DEEA"]} style={styles.background} />
      <Animated.View style={[styles.logoContainer, animatedStyle]}>
        {/* Replace with your app logo */}
        <View style={styles.logo} />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
    backgroundColor: "#FFFFFF",
    borderRadius: 50,
  },
})

export default LaunchScreen
