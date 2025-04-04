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
  Modal,
  FlatList,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons, MaterialIcons, Feather, FontAwesome5 } from "@expo/vector-icons"
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"
import { MotiView } from "moti"
import { Easing } from "react-native-reanimated"
import { router } from "expo-router"
import useAuthStore from "../store/auth"
import { BlurView } from "expo-blur"

const { width, height } = Dimensions.get("window")

const mockStatistics = [
  {
    id: "1",
    title: "Active Cases",
    value: 42,
    change: 8,
    period: "vs last month",
    icon: "search-outline" as keyof typeof Ionicons.glyphMap,
    color: "#5e72e4",
    trend: "up" as const,
  },
  {
    id: "2",
    title: "Cases Resolved",
    value: 28,
    change: 12,
    period: "vs last month",
    icon: "checkmark-circle-outline" as keyof typeof Ionicons.glyphMap,
    color: "#2DCE89",
    trend: "up" as const,
  },
  {
    id: "3",
    title: "Volunteer Hours",
    value: 1240,
    change: 23,
    period: "vs last month",
    icon: "people-outline" as keyof typeof Ionicons.glyphMap,
    color: "#FB6340",
    trend: "up" as const,
  },
  {
    id: "4",
    title: "Avg. Response Time",
    value: 18,
    change: 5,
    period: "vs last month",
    icon: "time-outline" as keyof typeof Ionicons.glyphMap,
    color: "#11CDEF",
    trend: "down" as const,
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
  id: string
  name: string
  age: number
  location: string
  timeElapsed: string
  priority: "high" | "medium" | "critical"
  photo: string
  status: string
  isNew?: boolean
}

interface Activity {
  id: string
  type: string
  title: string
  description: string
  time: string
  user: {
    name: string
    avatar: string
  }
  caseId: string
  status: string
}

interface PriorityAlertProps {
  alert: Alert
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

  const getPriorityColor = (): [string, string] => {
    switch (alert.priority) {
      case "critical":
        return ["#FF5252", "#FF1744"]
      case "high":
        return ["#FF9800", "#F57C00"]
      case "medium":
        return ["#4CAF50", "#388E3C"]
      default:
        return ["#2196F3", "#1976D2"]
    }
  }

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
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 300 }}
        style={styles.alertContainer}
      >
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
      </MotiView>
    </Pressable>
  )
}

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
    caseId: string
    status: string
    icon?: string
    iconColor?: string
  }
  onPress: () => void
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity, onPress }) => {
  const getActivityIcon = (): keyof typeof Ionicons.glyphMap => {
    if (activity.icon) {
      return activity.icon as keyof typeof Ionicons.glyphMap
    }

    switch (activity.type) {
      case "update":
        return "refresh-circle-outline" as keyof typeof Ionicons.glyphMap
      case "comment":
        return "chatbubble-outline" as keyof typeof Ionicons.glyphMap
      case "assignment":
        return "person-add-outline" as keyof typeof Ionicons.glyphMap
      case "location":
        return "location-outline" as keyof typeof Ionicons.glyphMap
      case "evidence":
        return "document-text-outline" as keyof typeof Ionicons.glyphMap
      default:
        return "information-circle-outline" as keyof typeof Ionicons.glyphMap
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
  statistic: (typeof mockStatistics)[0]
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
  update: (typeof mockCommunityUpdates)[0]
  onPress: () => void
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
          <LinearGradient
            colors={[`${color}20`, `${color}40`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.quickActionContainer}
          >
            <View style={[styles.quickActionIconContainer, { backgroundColor: `${color}30` }]}>
              <Ionicons name={icon} size={24} color={color} />
            </View>
            <Text style={[styles.quickActionLabel, { color: color }]}>{label}</Text>
          </LinearGradient>
        </MotiView>
      )}
    </Pressable>
  )
}

interface TabBarProps {
  tabs: typeof TABS
  activeTab: string
  onTabPress: (key: string) => void
}

const TabBar: React.FC<TabBarProps> = ({ tabs, activeTab, onTabPress }) => {
  const getIconName = (baseName: keyof typeof Ionicons.glyphMap, isActive: boolean): keyof typeof Ionicons.glyphMap => {
    return (isActive ? baseName : `${baseName}-outline`) as keyof typeof Ionicons.glyphMap
  }

  return (
    <BlurView intensity={80} tint="light" style={styles.tabBarBlur}>
      <View style={styles.tabBarContainer}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key
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
                <Ionicons name={getIconName(tab.icon, isActive)} size={22} color={isActive ? "#5e72e4" : "#999"} />
                <Text style={[styles.tabBarLabel, isActive && styles.tabBarActiveLabel]}>{tab.label}</Text>
              </View>
              </TouchableOpacity>
          )
        })}
            </View>
    </BlurView>
  )
}

// Define interfaces for API response
interface DashboardUser {
  id: number
  name: string
  role: string
  organization: string
  profile_picture: string
}

interface Notification {
  id: number
  title: string
  message: string
  priority: string
  created_at: string
  expires_at: string
}

interface MissingPerson {
  id: number
  case_number: string
  name: string
  age_when_missing: number
  date_of_birth: string | null
  gender: string
  blood_group: string | null
  nationality: string
  height: number
  weight: number
  complexion: string
  identifying_marks: string
  physical_attributes: {
    hair_color: string
    eye_color: string
    build: string
  }
  recent_photo: string | null
  additional_photos: string[]
  last_seen_location: string
  last_seen_date: string
  last_seen_details: string
  last_seen_wearing: string
  possible_locations: string[]
  fir_number: string
  poster_image: string | null
  status: string
  priority_level: number
  medical_conditions: string
  medications: string
  emergency_contact_name: string
  emergency_contact_phone: string
  emergency_contact_relation: string
  secondary_contact_name: string
  secondary_contact_phone: string
  reporter: number | null
  assigned_officer: number | null
  assigned_ngo: number | null
  documents: {
    id: number
    document_type: string
    description: string
    file: string
    uploaded_at: string
  }[]
  last_known_latitude: string | null
  last_known_longitude: string | null
  aadhaar_number: string | null
  aadhaar_photo: string | null
  family_group: number | null
  distance: string | null
  family_members: any[]
  aadhaar_number_hash: string | null
  reporter_type: string
  created_at: string
  updated_at: string
}

interface Statistics {
  active_cases: {
    count: number
    change: number
  }
  resolved_cases: {
    count: number
    change: number
  }
  total_ngos: number
  total_police: number
  total_sightings: number
  verification_rate: {
    verified: number
    pending: number
  }
}

interface RecentActivity {
  type: string
  message: string
  time_ago: string
  case_id: number
}

interface DashboardData {
  user: DashboardUser
  notifications: Notification[]
  nearby_cases: MissingPerson[]
  random_cases: MissingPerson[]
  statistics: Statistics
  recent_activity: RecentActivity[]
}

// Convert API data to UI format
const convertToAlert = (person: MissingPerson): Alert => {
  return {
    id: person.id.toString(),
    name: person.name,
    age: person.age_when_missing,
    location: person.last_seen_location,
    timeElapsed: formatTimeAgo(person.last_seen_date),
    priority: getPriorityFromLevel(person.priority_level),
    photo: person.recent_photo
      ? person.recent_photo.startsWith("http")
        ? person.recent_photo
        : `https://15e1-150-107-18-153.ngrok-free.app${person.recent_photo}`
      : "https://via.placeholder.com/150?text=No+Photo",
    status: person.status,
    isNew: isRecentCase(person.created_at),
  }
}

const convertToActivity = (activity: RecentActivity): Activity => {
  return {
    id: `${activity.case_id}-${activity.type}`,
    type: activity.type.toLowerCase(),
    title: activity.message,
    description: `Case #${activity.case_id}`,
    time: activity.time_ago,
    user: {
      name: "System",
      avatar: "https://via.placeholder.com/150?text=System",
    },
    caseId: activity.case_id.toString(),
    status: "in-progress",
  }
}

const convertToStatistic = (stats: Statistics) => {
  return [
    {
      id: "1",
      title: "Active Cases",
      value: stats.active_cases.count,
      change: stats.active_cases.change,
      period: "vs last month",
      icon: "search-outline" as keyof typeof Ionicons.glyphMap,
      color: "#5e72e4",
      trend: stats.active_cases.change >= 0 ? ("up" as const) : ("down" as const),
    },
    {
      id: "2",
      title: "Cases Resolved",
      value: stats.resolved_cases.count,
      change: stats.resolved_cases.change,
      period: "vs last month",
      icon: "checkmark-circle-outline" as keyof typeof Ionicons.glyphMap,
      color: "#2DCE89",
      trend: stats.resolved_cases.change >= 0 ? ("up" as const) : ("down" as const),
    },
    {
      id: "3",
      title: "Total NGOs",
      value: stats.total_ngos,
      change: 0,
      period: "total",
      icon: "people-outline" as keyof typeof Ionicons.glyphMap,
      color: "#FB6340",
      trend: "up" as const,
    },
    {
      id: "4",
      title: "Total Sightings",
      value: stats.total_sightings,
      change: 0,
      period: "total",
      icon: "time-outline" as keyof typeof Ionicons.glyphMap,
      color: "#11CDEF",
      trend: "up" as const,
    },
  ]
}

const convertToNearbyMarkers = (cases: MissingPerson[]) => {
  return cases
    .map((case_) => ({
      id: case_.id.toString(),
      latitude: case_.last_known_latitude ? Number.parseFloat(case_.last_known_latitude) : 0,
      longitude: case_.last_known_longitude ? Number.parseFloat(case_.last_known_longitude) : 0,
      title: case_.name,
      description: `Last seen ${formatTimeAgo(case_.last_seen_date)}`,
      priority: getPriorityFromLevel(case_.priority_level),
    }))
    .filter((marker) => marker.latitude !== 0 && marker.longitude !== 0)
}

// Helper functions
const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 60) {
    return `${diffMins} minutes ago`
  } else if (diffHours < 24) {
    return `${diffHours} hours ago`
  } else {
    return `${diffDays} days ago`
  }
}

const getPriorityFromLevel = (level: number): "high" | "medium" | "critical" => {
  if (level >= 4) return "critical"
  if (level >= 2) return "high"
  return "medium"
}

const isRecentCase = (createdAt: string): boolean => {
  const createdDate = new Date(createdAt)
  const now = new Date()
  const diffMs = now.getTime() - createdDate.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  return diffHours < 24 // Consider cases created in the last 24 hours as new
}

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
  const [userName, setUserName] = useState("User")
  const [userProfilePic, setUserProfilePic] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const { tokens } = useAuthStore()

  const scrollY = useRef(new Animated.Value(0)).current
  const refreshAnim = useRef(new Animated.Value(0)).current

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      if (!tokens || !tokens.access) {
        console.error("No tokens found in auth store")
        setIsLoading(false)
        return
      }

      const response = await fetch("https://15e1-150-107-18-153.ngrok-free.app/api/accounts/dashboard/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${tokens.access}`,
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data")
      }

      const data: DashboardData = await response.json()

      // Update user info
      setUserName(data.user.name)
      setUserProfilePic(data.user.profile_picture)

      // Set notifications
      setNotifications(data.notifications)

      // Convert and set alerts from random cases only
      const randomAlerts = data.random_cases.map(convertToAlert)
      setAlerts(randomAlerts)

      // Convert and set activities
      const activitiesData = data.recent_activity.map(convertToActivity)
      setActivities(activitiesData)

      // Convert and set statistics
      const statisticsData = convertToStatistic(data.statistics)
      setStatistics(statisticsData)

      // Convert and set nearby markers
      const markersData = convertToNearbyMarkers(data.nearby_cases)
      setNearbyMarkers(markersData)

      // Keep community updates as is for now
      setCommunityUpdates(mockCommunityUpdates)

      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setIsLoading(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchDashboardData()
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

    // Fetch fresh data
    fetchDashboardData().finally(() => {
      setRefreshing(false)
      // Provide haptic feedback when refresh completes
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    })
  }, [])

  // Header animation based on scroll position
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [150, 70],
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
              <LinearGradient
            colors={["#1A365D", "#2B6CB0"]}
            start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <Animated.View style={[styles.headerContent, { opacity: headerOpacity }]}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.profileButton} onPress={() => setShowProfileModal(true)}>
              {userProfilePic ? (
                <Image source={{ uri: userProfilePic }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Text style={styles.profileImagePlaceholderText}>{userName.charAt(0).toUpperCase()}</Text>
                  </View>
              )}
            </TouchableOpacity>
            <View style={styles.greetingContainer}>
              <Text style={styles.userName}>{userName}</Text>
                  </View>
            <TouchableOpacity style={styles.notificationButton} onPress={() => setShowNotifications(true)}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              {notifications.length > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{notifications.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>You have {alerts.length} high priority alerts today</Text>
          </Animated.View>

        <Animated.View style={[styles.compactHeader, { opacity: headerTitleOpacity }]}>
          <Text style={styles.compactHeaderTitle}>Missing Persons Dashboard</Text>
          <TouchableOpacity style={styles.notificationButton} onPress={() => setShowNotifications(true)}>
            <Ionicons name="notifications-outline" size={22} color="#fff" />
            {notifications.length > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{notifications.length}</Text>
                </View>
            )}
            </TouchableOpacity>
          </Animated.View>
      </LinearGradient>
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
        onPress={() => router.push("/sightlist")}
      />
      <QuickActionButton
        icon="alert-circle-outline"
        label="Report"
        color="#FF9800"
        onPress={() => router.push("/sightreport")}
      />
      <QuickActionButton
        icon="people-outline"
        label="Volunteers"
        color="#9C27B0"
        onPress={() => router.push("/volunter")}
      />
    </View>
  )

  const renderPriorityAlerts = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Ionicons name="alert-circle" size={20} color="#FF5252" style={styles.sectionIcon} />
          <Text style={styles.sectionTitle}>Priority Alerts</Text>
        </View>
        <TouchableOpacity style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>See All</Text>
          <Ionicons name="chevron-forward" size={16} color="#5e72e4" />
            </TouchableOpacity>
        </View>

      {alerts.length > 0 ? (
        alerts.map((alert, index) => (
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
        ))
      ) : (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ccc" />
          <Text style={styles.emptyStateText}>No priority alerts at the moment</Text>
        </View>
      )}
    </View>
  )

  const renderStatistics = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Ionicons name="stats-chart" size={20} color="#5e72e4" style={styles.sectionIcon} />
          <Text style={styles.sectionTitle}>Statistics Overview</Text>
        </View>
        <TouchableOpacity style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>Details</Text>
          <Ionicons name="chevron-forward" size={16} color="#5e72e4" />
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
        <View style={styles.sectionTitleContainer}>
          <Ionicons name="location" size={20} color="#FF9800" style={styles.sectionIcon} />
          <Text style={styles.sectionTitle}>Nearby Cases</Text>
        </View>
        <TouchableOpacity style={styles.seeAllButton} onPress={() => router.push("/nearbysightings")}>
          <Text style={styles.seeAllText}>Full Map</Text>
          <Ionicons name="chevron-forward" size={16} color="#5e72e4" />
        </TouchableOpacity>
      </View>

      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: "timing", duration: 600 }}
        style={styles.mapContainer}
      >
        <MapView
          provider={Platform.OS === "ios" ? undefined : PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: nearbyMarkers.length > 0 ? nearbyMarkers[0].latitude : 37.78825,
            longitude: nearbyMarkers.length > 0 ? nearbyMarkers[0].longitude : -122.4324,
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
            >
              <View
                style={[
                  styles.customMarker,
                  {
                    backgroundColor:
                      marker.priority === "critical" ? "#FF5252" : marker.priority === "high" ? "#FF9800" : "#4CAF50",
                  },
                ]}
              >
                <FontAwesome5 name="map-marker-alt" size={16} color="#fff" />
              </View>
            </Marker>
          ))}
        </MapView>
        <LinearGradient colors={["rgba(255,255,255,0.9)", "transparent"]} style={styles.mapGradient} />
        <View style={styles.mapOverlay}>
          <View style={styles.mapOverlayContent}>
            <Text style={styles.mapOverlayText}>{nearbyMarkers.length} active cases nearby</Text>
            <TouchableOpacity style={styles.mapButton} onPress={() => router.push("/nearbysightings")}>
              <Text style={styles.mapButtonText}>Navigate</Text>
              <Ionicons name="navigate" size={14} color="#fff" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
          </View>
        </View>
      </MotiView>
    </View>
  )

  const renderRecentActivity = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Ionicons name="time" size={20} color="#4CAF50" style={styles.sectionIcon} />
          <Text style={styles.sectionTitle}>Recent Activity</Text>
        </View>
        <TouchableOpacity style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>See All</Text>
          <Ionicons name="chevron-forward" size={16} color="#5e72e4" />
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
        <View style={styles.sectionTitleContainer}>
          <Ionicons name="people" size={20} color="#9C27B0" style={styles.sectionIcon} />
          <Text style={styles.sectionTitle}>Community Updates</Text>
        </View>
        <TouchableOpacity style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>See All</Text>
          <Ionicons name="chevron-forward" size={16} color="#5e72e4" />
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

  const renderSkeletonLoader = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {/* Header Skeleton */}
      <View style={styles.skeletonHeader}>
        <View>
          <View style={styles.skeletonText} />
          <View style={[styles.skeletonText, { width: "60%", marginTop: 8 }]} />
        </View>
        <View style={styles.skeletonNotificationButton} />
      </View>
      <View style={[styles.skeletonText, { width: "80%", marginTop: 8, marginBottom: 16 }]} />

      {/* Quick Actions Skeleton */}
      <View style={styles.quickActionsContainer}>
        {[1, 2, 3, 4].map((item) => (
          <View key={item} style={styles.skeletonQuickAction}>
            <View style={styles.skeletonQuickActionIcon} />
            <View style={[styles.skeletonText, { width: "60%", marginTop: 8 }]} />
          </View>
        ))}
      </View>

      {/* Priority Alerts Skeleton */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <View style={[styles.skeletonText, { width: "40%" }]} />
          <View style={[styles.skeletonText, { width: "20%" }]} />
        </View>
        {[1, 2].map((item) => (
          <View key={item} style={styles.skeletonAlert}>
            <View style={styles.skeletonAlertPhoto} />
            <View style={{ flex: 1 }}>
              <View style={[styles.skeletonText, { width: "70%" }]} />
              <View style={[styles.skeletonText, { width: "50%", marginTop: 8 }]} />
              <View style={[styles.skeletonText, { width: "60%", marginTop: 8 }]} />
            </View>
          </View>
        ))}
      </View>

      {/* Statistics Skeleton */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <View style={[styles.skeletonText, { width: "40%" }]} />
          <View style={[styles.skeletonText, { width: "20%" }]} />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statisticsScrollContent}
        >
          {[1, 2, 3, 4].map((item) => (
            <View key={item} style={styles.skeletonStat}>
              <View style={styles.skeletonStatHeader}>
                <View style={styles.skeletonStatIcon} />
                <View style={[styles.skeletonText, { width: "60%" }]} />
              </View>
              <View style={[styles.skeletonText, { width: "40%", height: 24, marginTop: 8 }]} />
              <View style={styles.skeletonStatProgress} />
              <View style={styles.skeletonStatFooter}>
                <View style={[styles.skeletonText, { width: "30%" }]} />
                <View style={[styles.skeletonText, { width: "30%" }]} />
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Map Skeleton */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <View style={[styles.skeletonText, { width: "40%" }]} />
          <View style={[styles.skeletonText, { width: "20%" }]} />
        </View>
        <View style={styles.skeletonMap} />
      </View>

      {/* Recent Activity Skeleton */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <View style={[styles.skeletonText, { width: "40%" }]} />
          <View style={[styles.skeletonText, { width: "20%" }]} />
        </View>
        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.skeletonActivity}>
            <View style={styles.skeletonActivityIcon} />
            <View style={{ flex: 1 }}>
              <View style={[styles.skeletonText, { width: "80%" }]} />
              <View style={[styles.skeletonText, { width: "60%", marginTop: 8 }]} />
              <View style={styles.skeletonActivityFooter}>
                <View style={[styles.skeletonText, { width: "30%" }]} />
                <View style={[styles.skeletonText, { width: "20%" }]} />
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  )

  const renderNotificationsModal = () => (
    <Modal
      visible={showNotifications}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowNotifications(false)}
    >
      <BlurView intensity={80} tint="dark" style={styles.modalOverlay}>
        <MotiView
          from={{ opacity: 0, translateY: 50 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 300 }}
          style={styles.modalContent}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Notifications</Text>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowNotifications(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {notifications.length > 0 ? (
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id.toString()}
              style={styles.notificationsList}
              renderItem={({ item, index }) => (
                <MotiView
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{
                    type: "timing",
                    duration: 300,
                    delay: index * 50,
                  }}
                >
                  <View style={[styles.notificationItem, item.priority === "HIGH" && styles.highPriorityNotification]}>
                    <View style={styles.notificationHeader}>
                      <View style={styles.notificationTitleContainer}>
                        <Ionicons
                          name={item.priority === "HIGH" ? "alert-circle" : "information-circle"}
                          size={20}
                          color={item.priority === "HIGH" ? "#FF5252" : "#5e72e4"}
                          style={{ marginRight: 8 }}
                        />
                        <Text style={styles.notificationTitle}>{item.title}</Text>
                      </View>
                      <Text style={styles.notificationTime}>{formatTimeAgo(item.created_at)}</Text>
                    </View>
                    <Text style={styles.notificationMessage}>{item.message}</Text>
                    <View style={styles.notificationActions}>
                      <TouchableOpacity style={styles.notificationAction}>
                        <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
                        <Text style={[styles.notificationActionText, { color: "#4CAF50" }]}>Mark as Read</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.notificationAction}>
                        <Ionicons name="arrow-forward-circle-outline" size={16} color="#5e72e4" />
                        <Text style={[styles.notificationActionText, { color: "#5e72e4" }]}>View Details</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </MotiView>
              )}
            />
          ) : (
            <View style={styles.emptyNotificationsContainer}>
              <Ionicons name="notifications-off-outline" size={48} color="#ccc" />
              <Text style={styles.emptyNotificationsText}>No notifications</Text>
              <Text style={styles.emptyNotificationsSubtext}>
                You'll receive notifications about case updates and alerts here
              </Text>
            </View>
          )}
        </MotiView>
      </BlurView>
    </Modal>
  )

  const renderProfileModal = () => (
    <Modal
      visible={showProfileModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowProfileModal(false)}
    >
      <BlurView intensity={80} tint="dark" style={styles.modalOverlay}>
        <MotiView
          from={{ opacity: 0, translateY: 50 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 300 }}
          style={styles.profileModalContent}
        >
          <View style={styles.profileModalHeader}>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowProfileModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileModalBody}>
            <View style={styles.profileImageContainer}>
              {userProfilePic ? (
                <Image source={{ uri: userProfilePic }} style={styles.profileModalImage} />
              ) : (
                <View style={styles.profileModalImagePlaceholder}>
                  <Text style={styles.profileModalImagePlaceholderText}>{userName.charAt(0).toUpperCase()}</Text>
                </View>
              )}
              <TouchableOpacity style={styles.editProfileImageButton}>
                <Ionicons name="camera" size={16} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.profileName}>{userName}</Text>
            <Text style={styles.profileRole}>Volunteer</Text>

            <View style={styles.profileStats}>
              <View style={styles.profileStat}>
                <Text style={styles.profileStatValue}>12</Text>
                <Text style={styles.profileStatLabel}>Cases</Text>
              </View>
              <View style={styles.profileStatDivider} />
              <View style={styles.profileStat}>
                <Text style={styles.profileStatValue}>48</Text>
                <Text style={styles.profileStatLabel}>Hours</Text>
              </View>
              <View style={styles.profileStatDivider} />
              <View style={styles.profileStat}>
                <Text style={styles.profileStatValue}>3</Text>
                <Text style={styles.profileStatLabel}>Resolved</Text>
              </View>
            </View>

            <View style={styles.profileMenuContainer}>
              <TouchableOpacity style={styles.profileMenuItem}>
                <View style={styles.profileMenuItemIcon}>
                  <Ionicons name="person-outline" size={20} color="#5e72e4" />
                </View>
                <Text style={styles.profileMenuItemText}>Edit Profile</Text>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.profileMenuItem}>
                <View style={styles.profileMenuItemIcon}>
                  <Ionicons name="settings-outline" size={20} color="#5e72e4" />
                </View>
                <Text style={styles.profileMenuItemText}>Settings</Text>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.profileMenuItem}>
                <View style={styles.profileMenuItemIcon}>
                  <Ionicons name="help-circle-outline" size={20} color="#5e72e4" />
                </View>
                <Text style={styles.profileMenuItemText}>Help & Support</Text>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.profileMenuItem}>
                <View style={styles.profileMenuItemIcon}>
                  <Ionicons name="shield-outline" size={20} color="#5e72e4" />
                </View>
                <Text style={styles.profileMenuItemText}>Privacy & Security</Text>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={20} color="#FF5252" style={{ marginRight: 8 }} />
              <Text style={styles.logoutButtonText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </MotiView>
      </BlurView>
    </Modal>
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
      <StatusBar barStyle="light-content" />

      {renderHeader()}

      {isLoading ? (
        renderSkeletonLoader()
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

      {renderNotificationsModal()}
      {renderProfileModal()}

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
    paddingTop: Platform.OS === "ios" ? 0 : 16,
    shadowColor: "#000",
    
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
    overflow: "hidden",
  
  },
  headerGradient: {
    flex: 1,
    paddingHorizontal: 10,
  },
  headerContent: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: 30,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  greetingContainer: {
    flex: 1,
    marginLeft: 12,
  },
  greeting: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 20,
  },
  profileImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileImagePlaceholderText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
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
    borderColor: "#5e72e4",
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
  },
  compactHeaderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
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
    marginBottom: 30,
    borderRadius: 16,
    marginHorizontal: 3,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  quickActionContainer: {
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
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
    fontWeight: "600",
  },
  sectionContainer: {
    backgroundColor: "#fff",
    marginBottom: 8,
    paddingVertical: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    fontSize: 14,
    color: "#5e72e4",
    fontWeight: "500",
    marginRight: 4,
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
  customMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
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
  },
  mapOverlayContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mapOverlayText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  mapButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#5e72e4",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  mapButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
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
    borderWidth: 1,
    borderColor: "#f0f0f0",
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
    borderWidth: 1,
    borderColor: "#f0f0f0",
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
  tabBarBlur: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBarContainer: {
    flexDirection: "row",
    paddingBottom: Platform.OS === "ios" ? 20 : 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
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
    backgroundColor: "rgba(94, 114, 228, 0.1)",
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
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    textAlign: "center",
  },
  // Skeleton loader styles
  skeletonText: {
    height: 16,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    width: "80%",
  },
  skeletonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  skeletonNotificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
  },
  skeletonQuickAction: {
    alignItems: "center",
  },
  skeletonQuickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#e0e0e0",
  },
  skeletonAlert: {
    flexDirection: "row",
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  skeletonAlertPhoto: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#e0e0e0",
    marginRight: 12,
  },
  skeletonStat: {
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
  skeletonStatHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  skeletonStatIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e0e0e0",
    marginRight: 8,
  },
  skeletonStatProgress: {
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    marginBottom: 12,
  },
  skeletonStatFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  skeletonMap: {
    height: 200,
    marginHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#e0e0e0",
  },
  skeletonActivity: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  skeletonActivityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
    marginRight: 12,
  },
  skeletonActivityFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  // Notification modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationsList: {
    padding: 16,
    maxHeight: height * 0.6,
  },
  notificationItem: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  highPriorityNotification: {
    borderLeftWidth: 4,
    borderLeftColor: "#FF5252",
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  notificationTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  notificationTime: {
    fontSize: 12,
    color: "#999",
  },
  notificationMessage: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  notificationActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
  },
  notificationAction: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
  },
  notificationActionText: {
    fontSize: 12,
    marginLeft: 4,
  },
  emptyNotificationsContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyNotificationsText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    fontWeight: "600",
  },
  emptyNotificationsSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 20,
  },

  // Profile modal styles
  profileModalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  profileModalHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
  },
  profileModalBody: {
    alignItems: "center",
    paddingBottom: 30,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileModalImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#fff",
  },
  profileModalImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#5e72e4",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  profileModalImagePlaceholderText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
  },
  editProfileImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#5e72e4",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  profileStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  profileStat: {
    alignItems: "center",
    flex: 1,
  },
  profileStatValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  profileStatLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  profileStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#f0f0f0",
  },
  profileMenuContainer: {
    width: "100%",
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  profileMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  profileMenuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(94, 114, 228, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  profileMenuItemText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: "rgba(255, 82, 82, 0.1)",
    marginTop: 16,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF5252",
  },
})

