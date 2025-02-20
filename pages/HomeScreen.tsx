
import { useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  interpolateColor,
} from "react-native-reanimated"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"
import { Ionicons } from "@expo/vector-icons"
import { router } from 'expo-router'

const HomeScreen = () => {
  const insets = useSafeAreaInsets()
  const fabScale = useSharedValue(1)
  const cardScale = useSharedValue(1)
  const gradientProgress = useSharedValue(0)

  useEffect(() => {
    const interval = setInterval(() => {
      gradientProgress.value = withTiming(Math.random(), { duration: 5000 })
    }, 5000)

    return () => clearInterval(interval)
  }, [gradientProgress])

  const fabAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: fabScale.value }],
    }
  })

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: cardScale.value }],
    }
  })

  const backgroundStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(gradientProgress.value, [0, 0.5, 1], ["#E0F7FA", "#B2EBF2", "#80DEEA"])
    return { backgroundColor }
  })

  const handleEmergencyPress = () => {
    fabScale.value = withRepeat(withSpring(1.2), 3, true)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
    router.push('/PersonalInfoScreen')
  }

  const handleCardPress = () => {
    cardScale.value = withSpring(0.95)
    Haptics.selectionAsync()
    // Navigate to card details
  }

  return (
    <Animated.View style={[styles.container, backgroundStyle]}>
      <View style={[styles.content, { paddingTop: insets.top }]}>
        <Text style={styles.title}>Welcome</Text>
        <Animated.View style={[styles.card, cardAnimatedStyle]}>
          <TouchableOpacity onPress={handleCardPress}>
            <Text style={styles.cardTitle}>Recent Cases</Text>
            <Text style={styles.cardContent}>Loading...</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
      <Animated.View style={[styles.fab, fabAnimatedStyle]}>
        <TouchableOpacity onPress={handleEmergencyPress}>
          <LinearGradient colors={["#FF6B6B", "#FF8E53"]} style={styles.fabGradient}>
            <Ionicons name="alert" size={24} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#1A237E",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1A237E",
  },
  cardContent: {
    fontSize: 14,
    color: "#303F9F",
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 100,
  },
})

export default HomeScreen

