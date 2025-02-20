"use client"

import { useState, useRef } from "react"
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity } from "react-native"
import Animated, { useSharedValue, useAnimatedStyle, interpolate, Extrapolate } from "react-native-reanimated"
import { LinearGradient } from "expo-linear-gradient"
import { router } from 'expo-router'

const { width, height } = Dimensions.get("window")

const ONBOARDING_DATA = [
  {
    title: "Welcome",
    description: "Our app is here to help you in difficult times.",
    image: "🏠", // Replace with actual image component
  },
  {
    title: "Report",
    description: "Quickly and easily report a missing person.",
    image: "📝", // Replace with actual image component
  },
  {
    title: "Search",
    description: "Access a comprehensive database of missing persons.",
    image: "🔍", // Replace with actual image component
  },
  {
    title: "Support",
    description: "Connect with resources and support networks.",
    image: "🤝", // Replace with actual image component
  },
]

const OnboardingScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollX = useSharedValue(0)
  const flatListRef = useRef<FlatList>(null)

  const onScroll = (event: any) => {
    scrollX.value = event.nativeEvent.contentOffset.x
  }

  const imageAnimatedStyles = ONBOARDING_DATA.map((_, index) => {
    return useAnimatedStyle(() => {
      const inputRange = [(index - 1) * width, index * width, (index + 1) * width]

      const translateY = interpolate(scrollX.value, inputRange, [50, 0, 50], Extrapolate.CLAMP)

      const scale = interpolate(scrollX.value, inputRange, [0.8, 1, 0.8], Extrapolate.CLAMP)

      return {
        transform: [{ translateY }, { scale }],
      }
    })
  })

  const textAnimatedStyles = ONBOARDING_DATA.map((_, index) => {
    return useAnimatedStyle(() => {
      const inputRange = [(index - 1) * width, index * width, (index + 1) * width]

      const translateY = interpolate(scrollX.value, inputRange, [100, 0, -100], Extrapolate.CLAMP)

      const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolate.CLAMP)

      return {
        transform: [{ translateY }],
        opacity,
      }
    })
  })

  const dotAnimatedStyles = ONBOARDING_DATA.map((_, index) => {
    return useAnimatedStyle(() => {
      const inputRange = [(index - 1) * width, index * width, (index + 1) * width]
      const scale = interpolate(scrollX.value, inputRange, [0.8, 1.4, 0.8], Extrapolate.CLAMP)
      const opacity = interpolate(scrollX.value, inputRange, [0.6, 1, 0.6], Extrapolate.CLAMP)
      return {
        transform: [{ scale }],
        opacity,
      }
    })
  })

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    return (
      <View style={styles.itemContainer}>
        <Animated.View style={[styles.imageContainer, imageAnimatedStyles[index]]}>
          <Text style={styles.image}>{item.image}</Text>
        </Animated.View>
        <Animated.View style={[styles.textContainer, textAnimatedStyles[index]]}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </Animated.View>
      </View>
    )
  }

  const renderDots = () => {
    return ONBOARDING_DATA.map((_, index) => {
      return <Animated.View key={index.toString()} style={[styles.dot, dotAnimatedStyles[index]]} />
    })
  }

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true })
      setCurrentIndex(currentIndex + 1)
    } else {
      router.push('/home')
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#E0F7FA", "#B2EBF2", "#80DEEA"]} style={styles.background} />
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_DATA}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />
      <View style={styles.dotsContainer}>{renderDots()}</View>
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>
          {currentIndex === ONBOARDING_DATA.length - 1 ? "Get Started" : "Next"}
        </Text>
      </TouchableOpacity>
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
  itemContainer: {
    width,
    height,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    fontSize: 100,
  },
  textContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1A237E",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
    color: "#303F9F",
  },
  dotsContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 100,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#1A237E",
    marginHorizontal: 5,
  },
  nextButton: {
    position: "absolute",
    bottom: 40,
    backgroundColor: "#1A237E",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default OnboardingScreen

