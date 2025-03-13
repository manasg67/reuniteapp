"use client"

import React, { useState, useRef } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Pressable } from "react-native"
import { Ionicons, Feather } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"
import { MotiView } from "moti"

interface PriorityAlertProps {
  alert: {
    id: string
    name: string
    age: number
    location: string
    timeElapsed: string
    priority: "critical" | "high" | "medium"
    photo: string
    status: string
    isNew?: boolean
  }
  onPress: () => void
}

const PriorityAlert: React.FC<PriorityAlertProps> = ({ alert, onPress }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const pulseAnim = useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    if (alert.isNew) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start()
    }
  }, [])

  const handlePress = () => {
    onPress()
    setIsExpanded(!isExpanded)
  }

  const handleActionPress = (action: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    console.log(`Action ${action} pressed for ${alert.name}`)
  }

  const getAlertGradient = (): [string, string] => {
    switch (alert.priority) {
      case 'high':
        return ['#FF5252', '#FF1744'];
      case 'medium':
        return ['#FFA726', '#FB8C00'];
      default:
        return ['#66BB6A', '#43A047'];
    }
  };

  const getPriorityLabel = () => {
    switch (alert.priority) {
      case "critical":
        return "CRITICAL"
      case "high":
        return "HIGH PRIORITY"
      case "medium":
        return "MEDIUM PRIORITY"
      default:
        return "STANDARD"
    }
  }

  const borderScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  })

  const borderOpacity = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 1, 0.6],
  })

  return (
    <Pressable onPress={handlePress}>
      <View style={styles.container}>
        {alert.isNew && (
          <Animated.View
            style={[
              styles.pulseBorder,
              {
                borderColor: getAlertGradient()[0],
                opacity: borderOpacity,
                transform: [{ scale: borderScale }],
              },
            ]}
          />
        )}

        <View style={styles.contentContainer}>
          <View style={styles.photoContainer}>
            <Image source={{ uri: alert.photo }} style={styles.photo} />
            <LinearGradient
              colors={getAlertGradient()}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.priorityBadge}
            >
              <Text style={styles.priorityText}>{getPriorityLabel()}</Text>
            </LinearGradient>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.name}>
              {alert.name}, {alert.age}
            </Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={14} color="#666" />
              <Text style={styles.location}>{alert.location}</Text>
            </View>
            <View style={styles.timeContainer}>
              <Ionicons name="time-outline" size={14} color="#666" />
              <Text style={styles.time}>Missing for {alert.timeElapsed}</Text>
            </View>
            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>Status:</Text>
              <Text style={styles.statusValue}>{alert.status}</Text>
            </View>
          </View>
        </View>

        {isExpanded && (
          <MotiView
            from={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ type: "timing", duration: 300 }}
            style={styles.expandedContent}
          >
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleActionPress("view")}>
                <Ionicons name="eye-outline" size={18} color="#5e72e4" />
                <Text style={styles.actionText}>View Details</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={() => handleActionPress("update")}>
                <Feather name="edit" size={18} color="#4CAF50" />
                <Text style={styles.actionText}>Update</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={() => handleActionPress("share")}>
                <Ionicons name="share-social-outline" size={18} color="#FF9800" />
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>
            </View>
          </MotiView>
        )}

        <View style={styles.expandIconContainer}>
          <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color="#999" />
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: "relative",
    overflow: "hidden",
  },
  pulseBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderRadius: 12,
  },
  contentContainer: {
    flexDirection: "row",
  },
  photoContainer: {
    position: "relative",
    marginRight: 12,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  priorityBadge: {
    position: "absolute",
    bottom: -6,
    left: -6,
    right: -6,
    paddingVertical: 4,
    alignItems: "center",
    borderRadius: 4,
  },
  priorityText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  location: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  time: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  statusLabel: {
    fontSize: 12,
    color: "#666",
    marginRight: 4,
  },
  statusValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  actionText: {
    fontSize: 12,
    color: "#333",
    marginLeft: 4,
  },
  expandIconContainer: {
    position: "absolute",
    bottom: 4,
    right: 8,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
})

export default PriorityAlert

