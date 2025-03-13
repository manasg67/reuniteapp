import type React from "react"
import { View, Text, StyleSheet, ActivityIndicator } from "react-native"
import { MotiView } from "moti"
import { Feather } from "@expo/vector-icons"

interface EmptyStateProps {
  query: string
  isLoading: boolean
}

const EmptyState: React.FC<EmptyStateProps> = ({ query, isLoading }) => {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5e72e4" />
          <Text style={styles.loadingText}>Searching for matches...</Text>
        </View>
      </View>
    )
  }

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "timing", duration: 400 }}
      style={styles.container}
    >
      <View style={styles.iconContainer}>
        <Feather name="search" size={40} color="#ccc" />
      </View>
      <Text style={styles.title}>No matches found</Text>
      <Text style={styles.subtitle}>We couldn't find any matches for "{query}".</Text>
      <Text style={styles.suggestion}>Try adjusting your search or filters to find more matches.</Text>
    </MotiView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    height: 300,
  },
  loadingContainer: {
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  suggestion: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
})

export default EmptyState

