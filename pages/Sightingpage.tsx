"use client"

import React, { useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
} from "react-native"
import { Feather } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { SafeAreaView } from "react-native-safe-area-context"
import { router } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"

const { width } = Dimensions.get("window")

export default function HomeScreen() {
  const navigation = useNavigation()

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current
  const slideAnim = React.useRef(new Animated.Value(50)).current
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current

  // Card animation values
  const cardAnimations = [
    React.useRef(new Animated.Value(100)).current,
    React.useRef(new Animated.Value(100)).current,
    React.useRef(new Animated.Value(100)).current,
  ]

  useEffect(() => {
    // Animate header
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start()

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start()

    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start()

    // Animate cards with staggered delay
    cardAnimations.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 0,
        duration: 600,
        delay: 400 + index * 150,
        useNativeDriver: true,
      }).start()
    })
  }, [])

  const renderCard = (index: number, title: string, description: string, icon: string, color: any, gradientColors: any, route: string) => {
    return (
      <Animated.View
        style={[
          styles.cardWrapper,
          {
            transform: [{ translateY: cardAnimations[index] }, { scale: scaleAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableOpacity style={styles.card} onPress={() => router.push(route as any)} activeOpacity={0.9}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
            <View style={styles.cardContent}>
              <View style={[styles.iconContainer, { backgroundColor: color.light }]}>
                <Feather name={icon as any} size={28} color={color.main} />
              </View>

              <Text style={styles.cardTitle}>{title}</Text>
              <Text style={styles.cardDescription}>{description}</Text>

              <View style={styles.buttonContainer}>
                <LinearGradient
                  colors={[color.main, color.dark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>{title}</Text>
                  <View style={styles.iconCircle}>
                    <Feather name="arrow-right" size={16} color={color.main} />
                  </View>
                </LinearGradient>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <StatusBar barStyle="light-content" />

      <ImageBackground
        source={{ uri: "/placeholder.svg?height=200&width=400" }}
        style={styles.headerBackground}
        imageStyle={styles.headerBackgroundImage}
      >
        <LinearGradient colors={["rgba(26, 54, 93, 0.9)", "rgba(26, 54, 93, 0.8)"]} style={styles.headerGradient}>
          <Animated.View
            style={[
              styles.headerContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.headerIconContainer}>
              <Feather name="map-pin" size={28} color="#fff" />
            </View>
            <Text style={styles.title}>Missing Persons Sightings</Text>
          </Animated.View>
        </LinearGradient>
      </ImageBackground>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {renderCard(
          0,
          "View Sightings",
          "Browse and filter through reported sightings of missing persons in your area.",
          "list",
          { light: "#E6F0FB", main: "#2B6CB0", dark: "#1A4971" },
          ["#ffffff", "#f7faff"],
          "/sightlist",
        )}

        {renderCard(
          1,
          "Report Sighting",
          "Submit a new sighting report with details to help locate missing persons.",
          "plus-circle",
          { light: "#FFF8E6", main: "#F59E0B", dark: "#D97706" },
          ["#ffffff", "#fffcf7"],
          "/sightreport",
        )}

        {renderCard(
          2,
          "Sighting Details",
          "View detailed information about specific sighting reports and their status.",
          "file-text",
          { light: "#E7F5E8", main: "#48BB78", dark: "#2F855A" },
          ["#ffffff", "#f7fdf8"],
          "/sightdetails",
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerDots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  headerBackground: {
    height: 220,
    width: "100%",
  },
  headerBackgroundImage: {
    opacity: 0.8,
  },
  headerGradient: {
    height: "100%",
    width: "100%",
    justifyContent: "flex-end",
    paddingBottom: 20,
  },
  headerContent: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  headerIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 30,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    paddingHorizontal: 24,
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
    marginTop: -30,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  cardWrapper: {
    marginBottom: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
  },
  cardGradient: {
    borderRadius: 16,
  },
  cardContent: {
    padding: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
    color: "#1A365D",
  },
  cardDescription: {
    fontSize: 15,
    color: "#64748B",
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 22,
  },
  buttonContainer: {
    alignItems: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    width: width * 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginRight: 8,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  footerDots: {
    flexDirection: "row",
    justifyContent: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#CBD5E0",
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: "#2B6CB0",
    width: 20,
  },
})

