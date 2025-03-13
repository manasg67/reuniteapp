import type React from "react"
import { View, Text, StyleSheet, Pressable } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { MotiView } from "moti"

interface QuickActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  color: string
  onPress: () => void
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ icon, label, color, onPress }) => {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <MotiView
          animate={{
            scale: pressed ? 0.95 : 1,
          }}
          transition={{
            type: "timing",
            duration: 100,
          }}
        >
          <View style={styles.container}>
            <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
              <Ionicons name={icon} size={24} color={color} />
            </View>
            <Text style={styles.label}>{label}</Text>
          </View>
        </MotiView>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
  },
})

export default QuickActionButton

