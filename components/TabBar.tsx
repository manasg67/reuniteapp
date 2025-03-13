import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { MotiView } from "moti"

const { width } = Dimensions.get("window")

interface TabBarProps {
  tabs: Array<{
    key: string
    label: string
    icon: keyof typeof Ionicons.glyphMap
  }>
  activeTab: string
  onTabPress: (key: string) => void
}

const getIconName = (baseName: keyof typeof Ionicons.glyphMap, isActive: boolean): keyof typeof Ionicons.glyphMap => {
  return (baseName + (isActive ? '' : '-outline')) as keyof typeof Ionicons.glyphMap;
};

const TabBar: React.FC<TabBarProps> = ({ tabs, activeTab, onTabPress }) => {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key

        return (
          <TouchableOpacity key={tab.key} style={styles.tab} onPress={() => onTabPress(tab.key)}>
            <View style={styles.tabContent}>
              {isActive && (
                <MotiView
                  from={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "timing", duration: 300 }}
                  style={styles.activeBackground}
                />
              )}

              <Ionicons
                name={getIconName(tab.icon, isActive)}
                size={22}
                color={isActive ? "#5e72e4" : "#999"}
              />

              <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>{tab.label}</Text>
            </View>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingBottom: Platform.OS === "ios" ? 20 : 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    position: "relative",
  },
  activeBackground: {
    position: "absolute",
    top: -6,
    left: -16,
    right: -16,
    bottom: -6,
    backgroundColor: "#f0f2ff",
    borderRadius: 8,
    zIndex: -1,
  },
  tabLabel: {
    fontSize: 10,
    color: "#999",
    marginTop: 2,
  },
  activeTabLabel: {
    color: "#5e72e4",
    fontWeight: "500",
  },
})

export default TabBar

