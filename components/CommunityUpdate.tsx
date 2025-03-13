import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native"
import { Ionicons, Feather } from "@expo/vector-icons"

interface CommunityUpdateProps {
  update: {
    id: string
    title: string
    content: string
    time: string
    source: string
    sourceIcon: string
    likes: number
    comments: number
    shares: number
    isUnread?: boolean
    image?: string
  }
  onPress: () => void
}

const CommunityUpdate: React.FC<CommunityUpdateProps> = ({ update, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.sourceContainer}>
          <Image source={{ uri: update.sourceIcon }} style={styles.sourceIcon} />
          <Text style={styles.source}>{update.source}</Text>
        </View>
        <Text style={styles.time}>{update.time}</Text>
        {update.isUnread && <View style={styles.unreadDot} />}
      </View>

      <Text style={styles.title}>{update.title}</Text>
      <Text style={styles.content} numberOfLines={3}>
        {update.content}
      </Text>

      {update.image && <Image source={{ uri: update.image }} style={styles.image} />}

      <View style={styles.footer}>
        <View style={styles.statContainer}>
          <Ionicons name="heart-outline" size={16} color="#666" />
          <Text style={styles.statText}>{update.likes}</Text>
        </View>

        <View style={styles.statContainer}>
          <Ionicons name="chatbubble-outline" size={16} color="#666" />
          <Text style={styles.statText}>{update.comments}</Text>
        </View>

        <View style={styles.statContainer}>
          <Ionicons name="share-social-outline" size={16} color="#666" />
          <Text style={styles.statText}>{update.shares}</Text>
        </View>

        <TouchableOpacity style={styles.moreButton}>
          <Feather name="more-horizontal" size={16} color="#666" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sourceContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  sourceIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  source: {
    fontSize: 13,
    fontWeight: "500",
    color: "#333",
  },
  time: {
    fontSize: 12,
    color: "#999",
    marginRight: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#5e72e4",
  },
  title: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },
  content: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  image: {
    width: "100%",
    height: 160,
    borderRadius: 8,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  moreButton: {
    marginLeft: "auto",
    padding: 4,
  },
})

export default CommunityUpdate

