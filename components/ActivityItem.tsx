import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native"
import { Ionicons, Feather } from "@expo/vector-icons"

interface ActivityItemProps {
  activity: {
    id: string
    type: string
    title: string
    description: string
    time: string
    user: {
      name: string
      avatar: string
    }
    caseId?: string
    status?: string
    icon?: string
    iconColor?: string
  }
  onPress: () => void
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity, onPress }) => {
  const getActivityIcon = () => {
    if (activity.icon) {
      return activity.icon as keyof typeof Ionicons.glyphMap;
    }

    switch (activity.type) {
      case "update":
        return "refresh-circle-outline" as keyof typeof Ionicons.glyphMap;
      case "comment":
        return "chatbubble-outline" as keyof typeof Ionicons.glyphMap;
      case "assignment":
        return "person-add-outline" as keyof typeof Ionicons.glyphMap;
      case "location":
        return "location-outline" as keyof typeof Ionicons.glyphMap;
      case "evidence":
        return "document-text-outline" as keyof typeof Ionicons.glyphMap;
      default:
        return "information-circle-outline" as keyof typeof Ionicons.glyphMap;
    }
  }

  const getActivityIconColor = () => {
    if (activity.iconColor) {
      return activity.iconColor
    }

    switch (activity.type) {
      case "update":
        return "#4CAF50"
      case "comment":
        return "#2196F3"
      case "assignment":
        return "#9C27B0"
      case "location":
        return "#FF9800"
      case "evidence":
        return "#795548"
      default:
        return "#607D8B"
    }
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: `${getActivityIconColor()}20` }]}>
        <Ionicons name={getActivityIcon()} size={20} color={getActivityIconColor()} />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>{activity.title}</Text>
          <Text style={styles.time}>{activity.time}</Text>
        </View>

        <Text style={styles.description}>{activity.description}</Text>

        <View style={styles.footerContainer}>
          <View style={styles.userContainer}>
            <Image source={{ uri: activity.user.avatar }} style={styles.avatar} />
            <Text style={styles.userName}>{activity.user.name}</Text>
          </View>

          {activity.caseId && (
            <View style={styles.caseContainer}>
              <Feather name="folder" size={12} color="#666" />
              <Text style={styles.caseId}>Case #{activity.caseId}</Text>
            </View>
          )}

          {activity.status && (
            <View style={styles.statusContainer}>
              <View
                style={[styles.statusDot, { backgroundColor: activity.status === "completed" ? "#4CAF50" : "#FF9800" }]}
              />
              <Text style={styles.statusText}>
                {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  time: {
    fontSize: 12,
    color: "#999",
    marginLeft: 8,
  },
  description: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
    lineHeight: 18,
  },
  footerContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 4,
  },
  userName: {
    fontSize: 12,
    color: "#666",
  },
  caseContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  caseId: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    color: "#666",
  },
})

export default ActivityItem

