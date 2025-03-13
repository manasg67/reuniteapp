"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"

interface StatisticCardProps {
  statistic: {
    id: string
    title: string
    value: number
    change: number
    period: string
    icon: keyof typeof Ionicons.glyphMap
    color: string
    trend: "up" | "down" | "neutral"
  }
  onPress: () => void
}

const StatisticCard: React.FC<StatisticCardProps> = ({ statistic, onPress }) => {
  const progressAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start()
  }, [])

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  })

  const getTrendIcon = () => {
    switch (statistic.trend) {
      case "up":
        return "trending-up"
      case "down":
        return "trending-down"
      default:
        return "trending-flat"
    }
  }

  const getTrendColor = () => {
    switch (statistic.trend) {
      case "up":
        return statistic.title.includes("Resolved") ? "#4CAF50" : "#FF5252"
      case "down":
        return statistic.title.includes("Resolved") ? "#FF5252" : "#4CAF50"
      default:
        return "#607D8B"
    }
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${statistic.color}20` }]}>
          <Ionicons name={statistic.icon} size={20} color={statistic.color} />
        </View>
        <Text style={styles.title}>{statistic.title}</Text>
      </View>

      <Text style={styles.value}>{statistic.value}</Text>

      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressWidth,
              backgroundColor: statistic.color,
            },
          ]}
        />
      </View>

      <View style={styles.footer}>
        <View style={styles.changeContainer}>
          <MaterialIcons name={getTrendIcon()} size={16} color={getTrendColor()} />
          <Text style={[styles.changeText, { color: getTrendColor() }]}>{statistic.change}%</Text>
        </View>
        <Text style={styles.period}>{statistic.period}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 160,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  title: {
    fontSize: 13,
    color: "#666",
    flex: 1,
  },
  value: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  progressContainer: {
    height: 4,
    backgroundColor: "#f0f0f0",
    borderRadius: 2,
    marginBottom: 12,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  changeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  changeText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 2,
  },
  period: {
    fontSize: 12,
    color: "#999",
  },
})

export default StatisticCard

