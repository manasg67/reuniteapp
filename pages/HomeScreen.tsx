"use client"

import React, { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  RefreshControl,
  Dimensions,
  Image,
  StatusBar,
  Platform,
  ActivityIndicator,
  Pressable,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons"
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"
import { MotiView } from "moti"
import { Easing } from "react-native-reanimated"
import { router } from "expo-router"

const { width } = Dimensions.get("window")

// Mock data
const mockAlerts: Alert[] = [
  {
    id: "1",
    name: "Emily Johnson",
    age: 8,
    location: "Central Park, New York",
    timeElapsed: "6 hours",
    priority: "critical" as const,
    photo:
      "https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    status: "Active Search",
    isNew: true,
  },
  {
    id: "2",
    name: "Michael Chen",
    age: 16,
    location: "Downtown, Boston",
    timeElapsed: "24 hours",
    priority: "high" as const,
    photo:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    status: "Investigation",
  },
  {
    id: "3",
    name: "Sarah Williams",
    age: 32,
    location: "Riverside, Chicago",
    timeElapsed: "3 days",
    priority: "medium" as const,
    photo:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=688&q=80",
    status: "Limited Search",
  },
]

const mockActivities = [
  {
    id: "1",
    type: "update",
    title: "Search area expanded for Emily Johnson",
    description:
      "The search perimeter has been expanded to include the northern section of Central Park and surrounding neighborhoods.",
    time: "30 min ago",
    user: {
      name: "Det. Rodriguez",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    },
    caseId: "2023-0142",
    status: "in-progress",
  },
  {
    id: "2",
    type: "evidence",
    title: "New evidence submitted",
    description:
      "Witness statement and CCTV footage from the corner of 5th Ave and 59th St has been added to the case file.",
    time: "1 hour ago",
    user: {
      name: "Officer Wilson",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    },
    caseId: "2023-0142",
    status: "completed",
  },
  {
    id: "3",
    type: "assignment",
    title: "K-9 Unit assigned to Michael Chen case",
    description: "K-9 Unit has been dispatched to the last known location to assist with the search operation.",
    time: "3 hours ago",
    user: {
      name: "Sgt. Thompson",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    },
    caseId: "2023-0138",
    status: "in-progress",
  },
]

const mockStatistics = [
  {
    id: "1",
    title: "Active Cases",
    value: 42,
    change: 8,
    period: "vs last month",
    icon: "search-outline" as keyof typeof Ionicons.glyphMap,
    color: "#5e72e4",
    trend: "up" as const
  },
  {
    id: "2",
    title: "Cases Resolved",
    value: 28,
    change: 12,
    period: "vs last month",
    icon: "checkmark-circle-outline" as keyof typeof Ionicons.glyphMap,
    color: "#2DCE89",
    trend: "up" as const
  },
  {
    id: "3",
    title: "Volunteer Hours",
    value: 1240,
    change: 23,
    period: "vs last month",
    icon: "people-outline" as keyof typeof Ionicons.glyphMap,
    color: "#FB6340",
    trend: "up" as const
  },
  {
    id: "4",
    title: "Avg. Response Time",
    value: 18,
    change: 5,
    period: "vs last month",
    icon: "time-outline" as keyof typeof Ionicons.glyphMap,
    color: "#11CDEF",
    trend: "down" as const
  },
]

const mockCommunityUpdates = [
  {
    id: "1",
    title: "Volunteer Search Party for Emily Johnson",
    content:
      "We are organizing a community search party to help find Emily Johnson. Meeting point is at the Central Park Boathouse at 9 AM tomorrow. Please bring water, comfortable shoes, and a fully charged phone.",
    time: "2 hours ago",
    source: "Community Watch",
    sourceIcon:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    likes: 42,
    comments: 18,
    shares: 36,
    isUnread: true,
    image:
      "https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
  },
  {
    id: "2",
    title: "Missing Persons Awareness Workshop",
    content:
      "Join us for a workshop on missing persons awareness and prevention strategies. Learn how to keep your loved ones safe and what to do in case of an emergency.",
    time: "1 day ago",
    source: "Safety First",
    sourceIcon:
      "https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    likes: 28,
    comments: 7,
    shares: 15,
  },
]

const mockNearbyMarkers = [
  {
    id: "1",
    latitude: 37.78825,
    longitude: -122.4324,
    title: "Emily Johnson",
    description: "Last seen here 6 hours ago",
    priority: "high",
  },
  {
    id: "2",
    latitude: 37.78525,
    longitude: -122.4301,
    title: "Michael Chen",
    description: "Last known location",
    priority: "medium",
  },
  {
    id: "3",
    latitude: 37.78925,
    longitude: -122.4344,
    title: "Search Area",
    description: "Current search perimeter",
    priority: "low",
  },
]

const TABS = [
  { key: "dashboard", label: "Dashboard", icon: "home" as keyof typeof Ionicons.glyphMap },
  { key: "cases", label: "Cases", icon: "folder" as keyof typeof Ionicons.glyphMap },
  { key: "map", label: "Map", icon: "map" as keyof typeof Ionicons.glyphMap },
  { key: "community", label: "Community", icon: "people" as keyof typeof Ionicons.glyphMap },
  { key: "profile", label: "Profile", icon: "person" as keyof typeof Ionicons.glyphMap }
]

export interface Alert {
  id: string;
  name: string;
  age: number;
  location: string;
  timeElapsed: string;
  priority: "high" | "medium" | "critical";
  photo: string;
  status: string;
  isNew?: boolean;
}

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  user: {
    name: string;
    avatar: string;
  };
  caseId: string;
  status: string;
}

interface PriorityAlertProps {
  alert: Alert;
  onPress: () => void;
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

  const getPriorityColor = (): [string, string] => {
    switch (alert.priority) {
      case "critical":
        return ["#FF5252", "#FF1744"];
      case "high":
        return ["#FF9800", "#F57C00"];
      case "medium":
        return ["#4CAF50", "#388E3C"];
      default:
        return ["#2196F3", "#1976D2"];
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
      <View style={styles.alertContainer}>
        {alert.isNew && (
          <Animated.View
            style={[
              styles.alertPulseBorder,
              {
                borderColor: getPriorityColor()[0],
                opacity: borderOpacity,
                transform: [{ scale: borderScale }],
              },
            ]}
          />
        )}

        <View style={styles.alertContentContainer}>
          <View style={styles.alertPhotoContainer}>
            <Image source={{ uri: alert.photo }} style={styles.alertPhoto} />
            <LinearGradient
              colors={getPriorityColor()}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.alertPriorityBadge}
            >
              <Text style={styles.alertPriorityText}>{getPriorityLabel()}</Text>
            </LinearGradient>
            </View>

          <View style={styles.alertInfoContainer}>
            <Text style={styles.alertName}>
              {alert.name}, {alert.age}
            </Text>
            <View style={styles.alertLocationContainer}>
              <Ionicons name="location-outline" size={14} color="#666" />
              <Text style={styles.alertLocation}>{alert.location}</Text>
            </View>
            <View style={styles.alertTimeContainer}>
              <Ionicons name="time-outline" size={14} color="#666" />
              <Text style={styles.alertTime}>Missing for {alert.timeElapsed}</Text>
            </View>
            <View style={styles.alertStatusContainer}>
              <Text style={styles.alertStatusLabel}>Status:</Text>
              <Text style={styles.alertStatusValue}>{alert.status}</Text>
            </View>
          </View>
        </View>

        {isExpanded && (
          <MotiView
            from={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ type: "timing", duration: 300 }}
            style={styles.alertExpandedContent}
          >
            <View style={styles.alertActionButtons}>
              <TouchableOpacity style={styles.alertActionButton} onPress={() => handleActionPress("view")}>
                <Ionicons name="eye-outline" size={18} color="#5e72e4" />
                <Text style={styles.alertActionText}>View Details</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.alertActionButton} onPress={() => handleActionPress("update")}>
                <Feather name="edit" size={18} color="#4CAF50" />
                <Text style={styles.alertActionText}>Update</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.alertActionButton} onPress={() => handleActionPress("share")}>
                <Ionicons name="share-social-outline" size={18} color="#FF9800" />
                <Text style={styles.alertActionText}>Share</Text>
              </TouchableOpacity>
            </View>
          </MotiView>
        )}

        <View style={styles.alertExpandIconContainer}>
          <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color="#999" />
        </View>
      </View>
    </Pressable>
  )
}

interface ActivityItemProps {
  activity: {
    id: string;
    type: string;
    title: string;
    description: string;
    time: string;
    user: {
      name: string;
      avatar: string;
    };
    caseId: string;
    status: string;
    icon?: string;
    iconColor?: string;
  };
  onPress: () => void;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity, onPress }) => {
  const getActivityIcon = (): keyof typeof Ionicons.glyphMap => {
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
  };

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
    <TouchableOpacity style={styles.activityContainer} onPress={onPress}>
      <View style={[styles.activityIconContainer, { backgroundColor: `${getActivityIconColor()}20` }]}>
        <Ionicons name={getActivityIcon()} size={20} color={getActivityIconColor()} />
      </View>

      <View style={styles.activityContentContainer}>
        <View style={styles.activityHeaderContainer}>
          <Text style={styles.activityTitle}>{activity.title}</Text>
          <Text style={styles.activityTime}>{activity.time}</Text>
        </View>

        <Text style={styles.activityDescription}>{activity.description}</Text>

        <View style={styles.activityFooterContainer}>
          <View style={styles.activityUserContainer}>
            <Image source={{ uri: activity.user.avatar }} style={styles.activityAvatar} />
            <Text style={styles.activityUserName}>{activity.user.name}</Text>
          </View>

          {activity.caseId && (
            <View style={styles.activityCaseContainer}>
              <Feather name="folder" size={12} color="#666" />
              <Text style={styles.activityCaseId}>Case #{activity.caseId}</Text>
            </View>
          )}

          {activity.status && (
            <View style={styles.activityStatusContainer}>
              <View
                style={[
                  styles.activityStatusDot,
                  { backgroundColor: activity.status === "completed" ? "#4CAF50" : "#FF9800" },
                ]}
              />
              <Text style={styles.activityStatusText}>
                {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}

interface StatisticCardProps {
  statistic: typeof mockStatistics[0];
  onPress: () => void;
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
    <TouchableOpacity style={styles.statContainer} onPress={onPress}>
      <View style={styles.statHeader}>
        <View style={[styles.statIconContainer, { backgroundColor: `${statistic.color}20` }]}>
          <Ionicons name={statistic.icon} size={20} color={statistic.color} />
        </View>
        <Text style={styles.statTitle}>{statistic.title}</Text>
      </View>

      <Text style={styles.statValue}>{statistic.value}</Text>

      <View style={styles.statProgressContainer}>
        <Animated.View
          style={[
            styles.statProgressBar,
            {
              width: progressWidth,
              backgroundColor: statistic.color,
            },
          ]}
        />
      </View>

      <View style={styles.statFooter}>
        <View style={styles.statChangeContainer}>
          <MaterialIcons name={getTrendIcon()} size={16} color={getTrendColor()} />
          <Text style={[styles.statChangeText, { color: getTrendColor() }]}>{statistic.change}%</Text>
        </View>
        <Text style={styles.statPeriod}>{statistic.period}</Text>
      </View>
    </TouchableOpacity>
  )
}

interface CommunityUpdateProps {
  update: typeof mockCommunityUpdates[0];
  onPress: () => void;
}

const CommunityUpdate: React.FC<CommunityUpdateProps> = ({ update, onPress }) => {
  return (
    <TouchableOpacity style={styles.updateContainer} onPress={onPress}>
      <View style={styles.updateHeader}>
        <View style={styles.updateSourceContainer}>
          <Image source={{ uri: update.sourceIcon }} style={styles.updateSourceIcon} />
          <Text style={styles.updateSource}>{update.source}</Text>
        </View>
        <Text style={styles.updateTime}>{update.time}</Text>
        {update.isUnread && <View style={styles.updateUnreadDot} />}
      </View>

      <Text style={styles.updateTitle}>{update.title}</Text>
      <Text style={styles.updateContent} numberOfLines={3}>
        {update.content}
      </Text>

      {update.image && <Image source={{ uri: update.image }} style={styles.updateImage} />}

      <View style={styles.updateFooter}>
        <View style={styles.updateStatContainer}>
          <Ionicons name="heart-outline" size={16} color="#666" />
          <Text style={styles.updateStatText}>{update.likes}</Text>
        </View>

        <View style={styles.updateStatContainer}>
          <Ionicons name="chatbubble-outline" size={16} color="#666" />
          <Text style={styles.updateStatText}>{update.comments}</Text>
        </View>

        <View style={styles.updateStatContainer}>
          <Ionicons name="share-social-outline" size={16} color="#666" />
          <Text style={styles.updateStatText}>{update.shares}</Text>
        </View>

        <TouchableOpacity style={styles.updateMoreButton}>
          <Feather name="more-horizontal" size={16} color="#666" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

interface QuickActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
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
          <View style={styles.quickActionContainer}>
            <View style={[styles.quickActionIconContainer, { backgroundColor: `${color}20` }]}>
              <Ionicons name={icon} size={24} color={color} />
                  </View>
            <Text style={styles.quickActionLabel}>{label}</Text>
                  </View>
        </MotiView>
      )}
    </Pressable>
  )
}

interface TabBarProps {
  tabs: typeof TABS;
  activeTab: string;
  onTabPress: (key: string) => void;
}

const TabBar: React.FC<TabBarProps> = ({ tabs, activeTab, onTabPress }) => {
  const getIconName = (baseName: keyof typeof Ionicons.glyphMap, isActive: boolean): keyof typeof Ionicons.glyphMap => {
    return (isActive ? baseName : `${baseName}-outline`) as keyof typeof Ionicons.glyphMap;
  };

  return (
    <View style={styles.tabBarContainer}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity key={tab.key} style={styles.tabBarTab} onPress={() => onTabPress(tab.key)}>
            <View style={styles.tabBarContent}>
              {isActive && (
                <MotiView
                  from={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "timing", duration: 300 }}
                  style={styles.tabBarActiveBackground}
                />
              )}
              <Ionicons
                name={getIconName(tab.icon, isActive)}
                size={22}
                color={isActive ? "#5e72e4" : "#999"}
              />
              <Text style={[styles.tabBarLabel, isActive && styles.tabBarActiveLabel]}>{tab.label}</Text>
                </View>
            </TouchableOpacity>
        );
      })}
    </View>
  );
};

// Main HomeScreen Component
export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [refreshing, setRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [statistics, setStatistics] = useState<typeof mockStatistics>([])
  const [communityUpdates, setCommunityUpdates] = useState<typeof mockCommunityUpdates>([])
  const [nearbyMarkers, setNearbyMarkers] = useState<typeof mockNearbyMarkers>([])

  const scrollY = useRef(new Animated.Value(0)).current
  const refreshAnim = useRef(new Animated.Value(0)).current

  // Simulate data loading
  useEffect(() => {
    const loadData = async () => {
      // Simulate network request
      setTimeout(() => {
        setAlerts(mockAlerts)
        setActivities(mockActivities)
        setStatistics(mockStatistics)
        setCommunityUpdates(mockCommunityUpdates)
        setNearbyMarkers(mockNearbyMarkers)
        setIsLoading(false)
      }, 1500)
    }

    loadData()
  }, [])

  const onRefresh = React.useCallback(() => {
    setRefreshing(true)

    // Animate the refresh indicator
    Animated.timing(refreshAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      refreshAnim.setValue(0)
    })

    // Simulate refreshing data
    setTimeout(() => {
      // Update with new data
      setAlerts([...mockAlerts])
      setActivities([...mockActivities])
      setStatistics([...mockStatistics])
      setCommunityUpdates([...mockCommunityUpdates])
      setRefreshing(false)

      // Provide haptic feedback when refresh completes
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    }, 1500)
  }, [])

  // Header animation based on scroll position
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [120, 70],
    extrapolate: "clamp",
  })

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80, 120],
    outputRange: [1, 0.5, 0],
    extrapolate: "clamp",
  })

  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [0, 80, 120],
    outputRange: [0, 0.5, 1],
    extrapolate: "clamp",
  })

  const renderHeader = () => (
    <Animated.View style={[styles.header, { height: headerHeight }]}>
      <Animated.View style={[styles.headerContent, { opacity: headerOpacity }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.userName}>Officer Johnson</Text>
                </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#333" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
              </View>
            </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>You have {alerts.length} high priority alerts today</Text>
          </Animated.View>

      <Animated.View style={[styles.compactHeader, { opacity: headerTitleOpacity }]}>
        <Text style={styles.compactHeaderTitle}>Missing Persons Dashboard</Text>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={22} color="#333" />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>3</Text>
          </View>
            </TouchableOpacity>
          </Animated.View>
    </Animated.View>
  )

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <QuickActionButton
        icon="add-circle-outline"
        label="New Case"
        color="#4CAF50"
        onPress={() => router.push("/PersonalInfoScreen")}
      />
      <QuickActionButton
        icon="search-outline"
        label="Search"
        color="#2196F3"
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
      />
      <QuickActionButton
        icon="alert-circle-outline"
        label="Report"
        color="#FF9800"
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
      />
      <QuickActionButton
        icon="people-outline"
        label="Volunteers"
        color="#9C27B0"
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
      />
        </View>
  )

  const renderPriorityAlerts = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Priority Alerts</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      {alerts.map((alert, index) => (
        <MotiView
          key={alert.id}
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: "timing",
            duration: 400,
            delay: index * 100,
            easing: Easing.out(Easing.ease),
          }}
        >
          <PriorityAlert alert={alert} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} />
        </MotiView>
      ))}
    </View>
  )

  const renderStatistics = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Statistics Overview</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>Details</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statisticsScrollContent}
      >
        {statistics.map((stat, index) => (
          <MotiView
            key={stat.id}
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "timing",
              duration: 400,
              delay: index * 100,
              easing: Easing.out(Easing.ease),
            }}
          >
            <StatisticCard statistic={stat} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} />
          </MotiView>
        ))}
      </ScrollView>
    </View>
  )

  const renderNearbyMap = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Nearby Cases</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>Full Map</Text>
        </TouchableOpacity>
      </View>

      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: "timing", duration: 600 }}
        style={styles.mapContainer}
      >
        <MapView
          provider={Platform.OS === 'ios' ? undefined : PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {nearbyMarkers.map((marker) => (
            <Marker
              key={marker.id}
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
              title={marker.title}
              description={marker.description}
            />
          ))}
        </MapView>
        <LinearGradient colors={["rgba(255,255,255,0.9)", "transparent"]} style={styles.mapGradient} />
        <View style={styles.mapOverlay}>
          <Text style={styles.mapOverlayText}>{nearbyMarkers.length} active cases nearby</Text>
          <TouchableOpacity style={styles.mapButton}>
            <Text style={styles.mapButtonText}>Navigate</Text>
        </TouchableOpacity>
        </View>
      </MotiView>
    </View>
  )

  const renderRecentActivity = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      {activities.map((activity, index) => (
        <MotiView
          key={activity.id}
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: "timing",
            duration: 400,
            delay: index * 100,
            easing: Easing.out(Easing.ease),
          }}
        >
          <ActivityItem activity={activity} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} />
        </MotiView>
      ))}
    </View>
  )

  const renderCommunityUpdates = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Community Updates</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      {communityUpdates.map((update, index) => (
        <MotiView
          key={update.id}
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: "timing",
            duration: 400,
            delay: index * 100,
            easing: Easing.out(Easing.ease),
          }}
        >
          <CommunityUpdate update={update} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} />
        </MotiView>
      ))}
    </View>
  )

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#5e72e4" />
      <Text style={styles.loadingText}>Loading dashboard...</Text>
    </View>
  )

  const renderRefreshAnimation = () => (
    <Animated.View
      style={[
        styles.refreshAnimation,
        {
          opacity: refreshAnim,
          transform: [
            {
              rotate: refreshAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0deg", "360deg"],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.refreshCircle}>
        <Feather name="refresh-cw" size={24} color="#5e72e4" />
      </View>
    </Animated.View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {renderHeader()}

      {isLoading ? (
        renderLoadingState()
      ) : (
        <Animated.ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="transparent"
              colors={["transparent"]}
              style={{ backgroundColor: "transparent" }}
            />
          }
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
          scrollEventThrottle={16}
        >
          {renderQuickActions()}
          {renderPriorityAlerts()}
          {renderStatistics()}
          {renderNearbyMap()}
          {renderRecentActivity()}
          {renderCommunityUpdates()}
        </Animated.ScrollView>
      )}

      {refreshing && renderRefreshAnimation()}

      <TabBar
        tabs={TABS}
        activeTab={activeTab}
        onTabPress={(tab) => {
          setActiveTab(tab)
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 0 : 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 10,
  },
  headerContent: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 14,
    color: "#666",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FF5252",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  notificationBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  compactHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  compactHeaderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  quickActionContainer: {
    alignItems: "center",
  },
  quickActionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
  },
  sectionContainer: {
    backgroundColor: "#fff",
    marginBottom: 8,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  seeAllText: {
    fontSize: 14,
    color: "#5e72e4",
    fontWeight: "500",
  },
  statisticsScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  mapContainer: {
    height: 200,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  mapOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mapOverlayText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  mapButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#5e72e4",
    borderRadius: 4,
  },
  mapButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  refreshAnimation: {
    position: "absolute",
    top: 120,
    alignSelf: "center",
    zIndex: 1000,
  },
  refreshCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // Alert styles
  alertContainer: {
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
  alertPulseBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderRadius: 12,
  },
  alertContentContainer: {
    flexDirection: "row",
  },
  alertPhotoContainer: {
    position: "relative",
    marginRight: 12,
  },
  alertPhoto: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  alertPriorityBadge: {
    position: "absolute",
    bottom: -6,
    left: -6,
    right: -6,
    paddingVertical: 4,
    alignItems: "center",
    borderRadius: 4,
  },
  alertPriorityText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  alertInfoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  alertName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  alertLocationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  alertLocation: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  alertTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  alertTime: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  alertStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  alertStatusLabel: {
    fontSize: 12,
    color: "#666",
    marginRight: 4,
  },
  alertStatusValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  alertExpandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  alertActionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  alertActionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  alertActionText: {
    fontSize: 12,
    color: "#333",
    marginLeft: 4,
  },
  alertExpandIconContainer: {
    position: "absolute",
    bottom: 4,
    right: 8,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  // Activity styles
  activityContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  activityContentContainer: {
    flex: 1,
  },
  activityHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  activityTime: {
    fontSize: 12,
    color: "#999",
    marginLeft: 8,
  },
  activityDescription: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
    lineHeight: 18,
  },
  activityFooterContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  activityUserContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  activityAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 4,
  },
  activityUserName: {
    fontSize: 12,
    color: "#666",
  },
  activityCaseContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  activityCaseId: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  activityStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  activityStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  activityStatusText: {
    fontSize: 12,
    color: "#666",
  },
  // Statistic styles
  statContainer: {
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
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  statTitle: {
    fontSize: 13,
    color: "#666",
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  statProgressContainer: {
    height: 4,
    backgroundColor: "#f0f0f0",
    borderRadius: 2,
    marginBottom: 12,
    overflow: "hidden",
  },
  statProgressBar: {
    height: "100%",
    borderRadius: 2,
  },
  statFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statChangeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statChangeText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 2,
  },
  statPeriod: {
    fontSize: 12,
    color: "#999",
  },
  // Update styles
  updateContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  updateHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  updateSourceContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  updateSourceIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  updateSource: {
    fontSize: 13,
    fontWeight: "500",
    color: "#333",
  },
  updateTime: {
    fontSize: 12,
    color: "#999",
    marginRight: 8,
  },
  updateUnreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#5e72e4",
  },
  updateTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },
  updateContent: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  updateImage: {
    width: "100%",
    height: 160,
    borderRadius: 8,
    marginBottom: 12,
  },
  updateFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  updateStatContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  updateStatText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  updateMoreButton: {
    marginLeft: "auto",
    padding: 4,
  },
  // TabBar styles
  tabBarContainer: {
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
  tabBarTab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabBarContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    position: "relative",
  },
  tabBarActiveBackground: {
    position: "absolute",
    top: -6,
    left: -16,
    right: -16,
    bottom: -6,
    backgroundColor: "#f0f2ff",
    borderRadius: 8,
    zIndex: -1,
  },
  tabBarLabel: {
    fontSize: 10,
    color: "#999",
    marginTop: 2,
  },
  tabBarActiveLabel: {
    color: "#5e72e4",
    fontWeight: "500",
  },
})

