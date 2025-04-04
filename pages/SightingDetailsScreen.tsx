"use client"

import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Platform,
  ActivityIndicator,
  Alert,
  Clipboard,
  Dimensions,
} from "react-native"
import { Feather, Ionicons, FontAwesome5 } from "@expo/vector-icons"
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps"
import useAuthStore from "../store/auth"

const { width } = Dimensions.get("window")

interface MissingPerson {
  id: number
  case_number: string
  name: string
  age_when_missing: number
  date_of_birth: string
  gender: string
  blood_group: string
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

interface SightingData {
  id: number
  missing_person: MissingPerson | null
  missing_person_name: string
  reporter: number
  reporter_name: string
  reporter_contact: string
  timestamp: string
  location: string
  latitude: string
  longitude: string
  location_details: string
  direction_headed: string
  description: string
  wearing: string
  accompanied_by: string
  photo: string | null
  additional_photos: string[]
  video: string | null
  verification_status: "PENDING" | "VERIFIED" | "REJECTED"
  verified_by: number | null
  verified_by_name: string | null
  verification_notes: string
  confidence_level: "LOW" | "MEDIUM" | "HIGH"
  facial_match_confidence: number
  ml_analysis_results: any
  created_at: string
  updated_at: string
  ip_address: string | null
  device_info: any
  is_notified: boolean
  location_type: "INDOOR" | "OUTDOOR"
  crowd_density: "LOW" | "MEDIUM" | "HIGH"
  observed_behavior: string
  confidence_level_numeric: number
  willing_to_contact: boolean
  companions: "ALONE" | "WITH_ADULTS" | "WITH_CHILDREN" | "UNKNOWN"
}

// Format date and time
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(date)
}

// Format relative time
const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

// Get color for verification status
const getStatusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case "VERIFIED":
      return {
        bg: "rgba(72, 187, 120, 0.1)",
        text: "#48BB78",
        border: "rgba(72, 187, 120, 0.2)",
      }
    case "REJECTED":
      return {
        bg: "rgba(245, 101, 101, 0.1)",
        text: "#F56565",
        border: "rgba(245, 101, 101, 0.2)",
      }
    default:
      return {
        bg: "rgba(237, 137, 54, 0.1)",
        text: "#ED8936",
        border: "rgba(237, 137, 54, 0.2)",
      }
  }
}

// Get color for confidence level
const getConfidenceColor = (level: string) => {
  switch (level.toUpperCase()) {
    case "HIGH":
      return {
        bg: "rgba(72, 187, 120, 0.1)",
        text: "#48BB78",
        border: "rgba(72, 187, 120, 0.2)",
      }
    case "MEDIUM":
      return {
        bg: "rgba(237, 137, 54, 0.1)",
        text: "#ED8936",
        border: "rgba(237, 137, 54, 0.2)",
      }
    default:
      return {
        bg: "rgba(160, 174, 192, 0.1)",
        text: "#A0AEC0",
        border: "rgba(160, 174, 192, 0.2)",
      }
  }
}

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const colors = getStatusColor(status)
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
        },
      ]}
    >
      <Feather
        name={status.toUpperCase() === "VERIFIED" ? "check" : status.toUpperCase() === "REJECTED" ? "x" : "clock"}
        size={12}
        color={colors.text}
      />
      <Text style={[styles.badgeText, { color: colors.text }]}>
        {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
      </Text>
    </View>
  )
}

// Confidence badge component
const ConfidenceBadge = ({ level }: { level: string }) => {
  const colors = getConfidenceColor(level)
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
        },
      ]}
    >
      <Feather name="shield" size={12} color={colors.text} />
      <Text style={[styles.badgeText, { color: colors.text }]}>{level} Confidence</Text>
    </View>
  )
}

type RootStackParamList = {
  SightingDetails: {
    id: number
  }
  PersonDetails: {
    id: number
  }
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

// Main component
export default function SightingDetailsScreen() {
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute<RouteProp<RootStackParamList, "SightingDetails">>()
  const [sighting, setSighting] = useState<SightingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("details")
  const { tokens } = useAuthStore()

  const tabs = [
    { id: "details", label: "Details", icon: "file-text" },
    { id: "location", label: "Location", icon: "map-pin" },
    { id: "evidence", label: "Evidence", icon: "camera" },
    { id: "actions", label: "Actions", icon: "check-circle" },
  ]

  // Fetch sighting details
  const fetchSightingDetails = async () => {
    try {
      const id = route.params?.id
      if (!id) return

      const response = await fetch(`https://15e1-150-107-18-153.ngrok-free.app/api/sightings/sightings/${id}/`, {
        headers: {
          Authorization: `Bearer ${tokens?.access}`,
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch sighting details")
      }

      const data = await response.json()
      setSighting(data)
    } catch (error) {
      console.error("Error fetching sighting details:", error)
      Alert.alert("Error", "Failed to load sighting details")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSightingDetails()
  }, [route.params?.id])

  const handleVerifySighting = async () => {
    if (!sighting) return

    try {
      const response = await fetch(
        `https://15e1-150-107-18-153.ngrok-free.app/api/sightings/sightings/${sighting.id}/verify/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokens?.access}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        throw new Error("Failed to verify sighting")
      }

      Alert.alert("Success", "Sighting verified successfully")
      fetchSightingDetails()
    } catch (error) {
      console.error("Error verifying sighting:", error)
      Alert.alert("Error", "Failed to verify sighting")
    }
  }

  const handleRejectSighting = async () => {
    if (!sighting) return

    try {
      const response = await fetch(
        `https://15e1-150-107-18-153.ngrok-free.app/api/sightings/sightings/${sighting.id}/reject/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokens?.access}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        throw new Error("Failed to reject sighting")
      }

      Alert.alert("Success", "Sighting rejected successfully")
      fetchSightingDetails()
    } catch (error) {
      console.error("Error rejecting sighting:", error)
      Alert.alert("Error", "Failed to reject sighting")
    }
  }

  if (loading || !sighting) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5e72e4" />
        <Text style={styles.loadingText}>Loading sighting details...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Sighting #{sighting.id}</Text>
              <Text style={styles.headerSubtitle}>{formatRelativeTime(sighting.timestamp)}</Text>
              </View>
              </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerAction}>
              <Ionicons name="share-outline" size={22} color="#fff" />
            </TouchableOpacity>
            </View>
              </View>
              </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Feather
              name={tab.icon as any}
              size={18}
              color={activeTab === tab.id ? "#5e72e4" : "#64748b"}
              style={styles.tabIcon}
            />
            <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
            </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Missing Person Card */}
        {sighting.missing_person && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Missing Person</Text>
              <StatusBadge status={sighting.missing_person.status} />
          </View>

          <View style={styles.missingPersonContainer}>
              <Image
                source={{
                  uri: sighting.missing_person.recent_photo || "https://via.placeholder.com/150",
                }}
                style={styles.missingPersonPhoto}
              />
            <View style={styles.missingPersonInfo}>
                <Text style={styles.missingPersonName}>{sighting.missing_person.name}</Text>
                <View style={styles.missingPersonDetail}>
                  <Feather name="user" size={14} color="#64748b" style={styles.detailIcon} />
                  <Text style={styles.detailText}>
                    {sighting.missing_person.age_when_missing} years • {sighting.missing_person.gender}
                  </Text>
                </View>
                <View style={styles.missingPersonDetail}>
                  <Feather name="map-pin" size={14} color="#64748b" style={styles.detailIcon} />
                  <Text style={styles.detailText} numberOfLines={1}>
                    {sighting.missing_person.last_seen_location}
                  </Text>
                </View>
                <View style={styles.missingPersonDetail}>
                  <Feather name="calendar" size={14} color="#64748b" style={styles.detailIcon} />
                  <Text style={styles.detailText}>
                    Missing since {new Date(sighting.missing_person.last_seen_date).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>

              <TouchableOpacity
                style={styles.viewProfileButton}
              onPress={() => {
                if (sighting.missing_person) {
                  navigation.navigate("PersonDetails", { id: sighting.missing_person.id })
                }
              }}
            >
              <Text style={styles.viewProfileText}>View Full Profile</Text>
              <Feather name="chevron-right" size={16} color="#5e72e4" />
              </TouchableOpacity>
            </View>
        )}

        {/* Tab Content */}
        {activeTab === "details" && (
          <>
            {/* Sighting Overview */}
          <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Sighting Overview</Text>
                <View style={styles.badgeContainer}>
                  <StatusBadge status={sighting.verification_status} />
                  <ConfidenceBadge level={sighting.confidence_level} />
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Reported By</Text>
                  <Text style={styles.infoValue}>{sighting.reporter_name || "Anonymous"}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Date & Time</Text>
                  <Text style={styles.infoValue}>{new Date(sighting.timestamp).toLocaleDateString()}</Text>
                  <Text style={styles.infoSubvalue}>{new Date(sighting.timestamp).toLocaleTimeString()}</Text>
                </View>
            </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Location</Text>
                  <Text style={styles.infoValue}>{sighting.location}</Text>
                  {sighting.location_details && <Text style={styles.infoSubvalue}>{sighting.location_details}</Text>}
              </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Description</Text>
                  <Text style={styles.infoValue}>{sighting.description}</Text>
                </View>
              </View>
            </View>

            {/* Circumstances */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Circumstances</Text>

              <View style={styles.circumstancesGrid}>
                <View style={styles.circumstanceItem}>
                  <View style={styles.circumstanceIconContainer}>
                    <Ionicons name="people-outline" size={20} color="#5e72e4" />
              </View>
                  <Text style={styles.circumstanceLabel}>Companions</Text>
                  <Text style={styles.circumstanceValue}>{sighting.companions.replace(/_/g, " ").toLowerCase()}</Text>
              </View>

                <View style={styles.circumstanceItem}>
                  <View style={styles.circumstanceIconContainer}>
                    <Ionicons name="location-outline" size={20} color="#5e72e4" />
                  </View>
                  <Text style={styles.circumstanceLabel}>Location Type</Text>
                  <Text style={styles.circumstanceValue}>{sighting.location_type.toLowerCase()}</Text>
            </View>

                <View style={styles.circumstanceItem}>
                  <View style={styles.circumstanceIconContainer}>
                    <Ionicons name="people" size={20} color="#5e72e4" />
              </View>
                  <Text style={styles.circumstanceLabel}>Crowd Density</Text>
                  <Text style={styles.circumstanceValue}>{sighting.crowd_density.toLowerCase()}</Text>
              </View>

                <View style={styles.circumstanceItem}>
                  <View style={styles.circumstanceIconContainer}>
                    <Ionicons name="walk-outline" size={20} color="#5e72e4" />
            </View>
                  <Text style={styles.circumstanceLabel}>Direction</Text>
                  <Text style={styles.circumstanceValue}>{sighting.direction_headed || "Unknown"}</Text>
          </View>
              </View>

              {sighting.observed_behavior && (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.behaviorLabel}>Observed Behavior</Text>
                  <Text style={styles.behaviorText}>{sighting.observed_behavior}</Text>
                </>
              )}

              {sighting.wearing && (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.behaviorLabel}>Clothing Description</Text>
                  <Text style={styles.behaviorText}>{sighting.wearing}</Text>
                </>
              )}
            </View>

            {/* Confidence Level */}
          <View style={styles.card}>
              <Text style={styles.cardTitle}>Identification Confidence</Text>

              <View style={styles.confidenceContainer}>
                <View style={styles.confidenceHeader}>
                  <Text style={styles.confidenceValue}>{sighting.confidence_level_numeric}%</Text>
                  <Text style={styles.confidenceLevel}>{sighting.confidence_level} Confidence</Text>
              </View>

                <View style={styles.confidenceBarContainer}>
                  <View style={styles.confidenceBar}>
              <View
                style={[
                        styles.confidenceFill,
                        { width: `${sighting.confidence_level_numeric}%` },
                        sighting.confidence_level === "HIGH"
                          ? styles.highConfidence
                          : sighting.confidence_level === "MEDIUM"
                            ? styles.mediumConfidence
                            : styles.lowConfidence,
                      ]}
                    />
                  </View>
                  <View style={styles.confidenceLabels}>
                    <Text style={styles.confidenceLabelText}>0%</Text>
                    <Text style={styles.confidenceLabelText}>50%</Text>
                    <Text style={styles.confidenceLabelText}>100%</Text>
                  </View>
            </View>

                {sighting.willing_to_contact && (
                  <View style={styles.willingContainer}>
                    <Ionicons name="checkmark-circle" size={18} color="#48BB78" />
                    <Text style={styles.willingText}>Reporter is willing to be contacted</Text>
              </View>
                )}
            </View>
            </View>
          </>
        )}

        {activeTab === "location" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Location Information</Text>

            {/* Map */}
            <View style={styles.mapContainer}>
              {sighting.latitude && sighting.longitude ? (
                <MapView
                  provider={Platform.OS === "ios" ? undefined : PROVIDER_GOOGLE}
                  style={styles.map}
                  initialRegion={{
                    latitude: Number(sighting.latitude),
                    longitude: Number(sighting.longitude),
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: Number(sighting.latitude),
                      longitude: Number(sighting.longitude),
                    }}
                    title="Sighting Location"
                    description={sighting.location}
                  >
                    <View style={styles.customMarker}>
                      <FontAwesome5 name="map-marker-alt" size={24} color="#5e72e4" />
                  </View>
                  </Marker>
                </MapView>
              ) : (
                <View style={styles.mapPlaceholder}>
                  <Ionicons name="map-outline" size={48} color="#a0aec0" />
                  <Text style={styles.mapPlaceholderText}>Map coordinates not available</Text>
                </View>
              )}
              </View>

            {/* Location Details */}
            <View style={styles.locationDetails}>
              <View style={styles.locationDetail}>
                <View style={styles.locationIconContainer}>
                  <Ionicons name="location-outline" size={20} color="#5e72e4" />
                </View>
                <View>
                  <Text style={styles.locationLabel}>Address</Text>
                  <Text style={styles.locationValue}>{sighting.location}</Text>
                  {sighting.location_details && (
                    <Text style={styles.locationSubvalue}>{sighting.location_details}</Text>
                  )}
                </View>
              </View>

              {sighting.latitude && sighting.longitude && (
                <View style={styles.locationDetail}>
                  <View style={styles.locationIconContainer}>
                    <Ionicons name="navigate-outline" size={20} color="#5e72e4" />
                  </View>
                  <View>
                    <Text style={styles.locationLabel}>Coordinates</Text>
                    <Text style={styles.locationValue}>
                      {sighting.latitude}, {sighting.longitude}
                    </Text>
                  </View>
              </View>
            )}
            </View>

            {/* Location Actions */}
            <View style={styles.locationActions}>
              <TouchableOpacity
                style={[styles.locationAction, !sighting.latitude && styles.disabledAction]}
                disabled={!sighting.latitude}
                onPress={() => {
                  if (sighting.latitude && sighting.longitude) {
                    const lat = Number(sighting.latitude)
                    const lng = Number(sighting.longitude)
                    const url = Platform.select({
                      ios: `maps:0,0?q=${lat},${lng}`,
                      android: `geo:0,0?q=${lat},${lng}`,
                    })
                    if (url) Linking.openURL(url)
                  }
                }}
              >
                <LinearGradient
                  colors={!sighting.latitude ? ["#a0aec0", "#cbd5e0"] : ["#5e72e4", "#324cdd"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.actionGradient}
                >
                  <Ionicons name="navigate-outline" size={18} color="#fff" />
                  <Text style={styles.actionText}>Get Directions</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.locationAction, !sighting.latitude && styles.disabledAction]}
                disabled={!sighting.latitude}
                onPress={() => {
                  if (sighting.latitude && sighting.longitude) {
                    const location = `${sighting.latitude},${sighting.longitude}`
                    Clipboard.setString(location)
                    Alert.alert("Success", "Location coordinates copied to clipboard")
                  }
                }}
              >
                <LinearGradient
                  colors={!sighting.latitude ? ["#a0aec0", "#cbd5e0"] : ["#4a5568", "#2d3748"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.actionGradient}
                >
                  <Ionicons name="copy-outline" size={18} color="#fff" />
                  <Text style={styles.actionText}>Copy Coordinates</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === "evidence" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Photo Evidence</Text>

            {sighting.photo ? (
              <>
                <View style={styles.photoContainer}>
                  <Image source={{ uri: sighting.photo }} style={styles.photo} resizeMode="cover" />
                  <LinearGradient
                    colors={["rgba(0,0,0,0.5)", "transparent"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 0.3 }}
                    style={styles.photoGradient}
                  >
                    <View style={styles.photoHeader}>
                      <View style={styles.photoTimestamp}>
                        <Ionicons name="time-outline" size={14} color="#fff" />
                        <Text style={styles.photoTimestampText}>{formatRelativeTime(sighting.timestamp)}</Text>
                      </View>
                    <TouchableOpacity
                        style={styles.photoAction}
                        onPress={() => sighting.photo && Linking.openURL(sighting.photo)}
                    >
                        <Ionicons name="expand-outline" size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                  </LinearGradient>
                </View>

                <View style={styles.photoInfo}>
                  <View style={styles.photoInfoItem}>
                    <Text style={styles.photoInfoLabel}>Photo Taken</Text>
                    <Text style={styles.photoInfoValue}>{formatDateTime(sighting.timestamp)}</Text>
                </View>

                  <View style={styles.photoInfoItem}>
                    <Text style={styles.photoInfoLabel}>Location</Text>
                    <Text style={styles.photoInfoValue}>{sighting.location}</Text>
                  </View>
                </View>

                <View style={styles.photoActions}>
                  <TouchableOpacity
                    style={styles.photoActionButton}
                    onPress={() => sighting.photo && Linking.openURL(sighting.photo)}
                  >
                    <LinearGradient
                      colors={["#5e72e4", "#324cdd"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.actionGradient}
                    >
                      <Ionicons name="open-outline" size={18} color="#fff" />
                      <Text style={styles.actionText}>View Full Size</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.photoActionButton}
                    onPress={() => {
                      if (sighting.photo) {
                        Clipboard.setString(sighting.photo)
                        Alert.alert("Success", "Photo URL copied to clipboard")
                      }
                    }}
                  >
                    <LinearGradient
                      colors={["#4a5568", "#2d3748"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.actionGradient}
                    >
                      <Ionicons name="share-outline" size={18} color="#fff" />
                      <Text style={styles.actionText}>Share Photo</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.noPhotoContainer}>
                <View style={styles.noPhotoIconContainer}>
                  <Ionicons name="image-outline" size={48} color="#a0aec0" />
                </View>
                <Text style={styles.noPhotoTitle}>No Photo Available</Text>
                <Text style={styles.noPhotoDescription}>
                  This sighting report does not include any photographic evidence
                </Text>
              </View>
            )}
          </View>
        )}

        {activeTab === "actions" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Verification Actions</Text>

            <View style={styles.verificationStatus}>
              <View style={styles.verificationStatusIcon}>
                {sighting.verification_status === "VERIFIED" ? (
                  <Ionicons name="checkmark-circle" size={32} color="#48BB78" />
                ) : sighting.verification_status === "REJECTED" ? (
                  <Ionicons name="close-circle" size={32} color="#F56565" />
                ) : (
                  <Ionicons name="time" size={32} color="#ED8936" />
                )}
                </View>
              <View style={styles.verificationStatusInfo}>
                <Text style={styles.verificationStatusTitle}>
                  {sighting.verification_status === "VERIFIED"
                    ? "Verified Sighting"
                    : sighting.verification_status === "REJECTED"
                      ? "Rejected Sighting"
                      : "Pending Verification"}
                </Text>
                <Text style={styles.verificationStatusDescription}>
                  {sighting.verification_status === "VERIFIED"
                    ? "This sighting has been verified by authorities"
                    : sighting.verification_status === "REJECTED"
                      ? "This sighting has been marked as invalid"
                      : "This sighting is awaiting verification"}
                  </Text>
                </View>
              </View>

            {sighting.verification_status === "PENDING" && (
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.verifyButton} onPress={handleVerifySighting}>
                  <LinearGradient
                    colors={["#48BB78", "#38A169"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.actionGradient}
                  >
                    <Ionicons name="checkmark" size={18} color="#fff" />
                    <Text style={styles.actionText}>Verify Sighting</Text>
                  </LinearGradient>
                  </TouchableOpacity>

                <TouchableOpacity style={styles.rejectButton} onPress={handleRejectSighting}>
                  <LinearGradient
                    colors={["#F56565", "#E53E3E"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.actionGradient}
                  >
                    <Ionicons name="close" size={18} color="#fff" />
                    <Text style={styles.actionText}>Reject Sighting</Text>
                  </LinearGradient>
                  </TouchableOpacity>
              </View>
            )}

            {sighting.verification_status !== "PENDING" && (
              <View style={styles.verificationDetails}>
                {sighting.verified_by_name && (
                  <View style={styles.verificationDetail}>
                    <Text style={styles.verificationDetailLabel}>Verified By</Text>
                    <Text style={styles.verificationDetailValue}>{sighting.verified_by_name}</Text>
                </View>
                )}
                <View style={styles.verificationDetail}>
                  <Text style={styles.verificationDetailLabel}>Verification Date</Text>
                  <Text style={styles.verificationDetailValue}>{formatDateTime(sighting.updated_at)}</Text>
              </View>
                {sighting.verification_notes && (
                  <View style={styles.verificationDetail}>
                    <Text style={styles.verificationDetailLabel}>Notes</Text>
                    <Text style={styles.verificationDetailValue}>{sighting.verification_notes}</Text>
            </View>
                )}
              </View>
            )}

            <View style={styles.divider} />

            <Text style={styles.additionalActionsTitle}>Additional Actions</Text>

            <View style={styles.additionalActions}>
              <TouchableOpacity style={styles.additionalAction}>
                <View style={styles.additionalActionIcon}>
                  <Ionicons name="notifications-outline" size={20} color="#5e72e4" />
                </View>
                <View style={styles.additionalActionContent}>
                  <Text style={styles.additionalActionTitle}>Notify Authorities</Text>
                  <Text style={styles.additionalActionDescription}>Send this sighting report to local authorities</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#a0aec0" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.additionalAction}>
                <View style={styles.additionalActionIcon}>
                  <Ionicons name="people-outline" size={20} color="#5e72e4" />
                </View>
                <View style={styles.additionalActionContent}>
                  <Text style={styles.additionalActionTitle}>Notify Family</Text>
                  <Text style={styles.additionalActionDescription}>
                    Send this sighting report to the missing person's family
                </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#a0aec0" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.additionalAction}>
                <View style={styles.additionalActionIcon}>
                  <Ionicons name="document-text-outline" size={20} color="#5e72e4" />
            </View>
                <View style={styles.additionalActionContent}>
                  <Text style={styles.additionalActionTitle}>Generate Report</Text>
                  <Text style={styles.additionalActionDescription}>Create a detailed PDF report of this sighting</Text>
          </View>
                <Ionicons name="chevron-forward" size={20} color="#a0aec0" />
            </TouchableOpacity>
          </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748b",
  },
  header: {
    backgroundColor: "#1A365D",
    paddingTop: Platform.OS === "ios" ? 60 : 8,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  headerRight: {
    flexDirection: "row",
  },
  headerAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#ebf4ff",
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748b",
  },
  activeTabText: {
    color: "#5e72e4",
  },
  content: {
    flex: 1,
    padding: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a202c",
  },
  badgeContainer: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  missingPersonContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  missingPersonPhoto: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  missingPersonInfo: {
    flex: 1,
    justifyContent: "center",
  },
  missingPersonName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a202c",
    marginBottom: 4,
  },
  missingPersonDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  detailIcon: {
    marginRight: 6,
  },
  detailText: {
    fontSize: 13,
    color: "#4a5568",
  },
  viewProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: "#ebf4ff",
    borderRadius: 8,
  },
  viewProfileText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#5e72e4",
    marginRight: 6,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: "#1a202c",
  },
  infoSubvalue: {
    fontSize: 13,
    color: "#4a5568",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 12,
  },
  circumstancesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
  },
  circumstanceItem: {
    width: "50%",
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  circumstanceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ebf4ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  circumstanceLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 2,
  },
  circumstanceValue: {
    fontSize: 14,
    color: "#1a202c",
    textTransform: "capitalize",
  },
  behaviorLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1a202c",
    marginBottom: 4,
  },
  behaviorText: {
    fontSize: 14,
    color: "#4a5568",
    lineHeight: 20,
  },
  confidenceContainer: {
    marginTop: 4,
  },
  confidenceHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 12,
  },
  confidenceValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a202c",
    marginRight: 8,
  },
  confidenceLevel: {
    fontSize: 14,
    color: "#4a5568",
  },
  confidenceBarContainer: {
    marginBottom: 12,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 4,
  },
  confidenceFill: {
    height: "100%",
    borderRadius: 4,
  },
  highConfidence: {
    backgroundColor: "#48BB78",
  },
  mediumConfidence: {
    backgroundColor: "#ED8936",
  },
  lowConfidence: {
    backgroundColor: "#A0AEC0",
  },
  confidenceLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  confidenceLabelText: {
    fontSize: 12,
    color: "#64748b",
  },
  willingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(72, 187, 120, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  willingText: {
    fontSize: 14,
    color: "#2F855A",
    marginLeft: 8,
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  customMarker: {
    alignItems: "center",
    justifyContent: "center",
  },
  mapPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  mapPlaceholderText: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 8,
  },
  locationDetails: {
    marginBottom: 16,
  },
  locationDetail: {
    flexDirection: "row",
    marginBottom: 12,
  },
  locationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ebf4ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  locationLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 2,
  },
  locationValue: {
    fontSize: 14,
    color: "#1a202c",
  },
  locationSubvalue: {
    fontSize: 13,
    color: "#4a5568",
    marginTop: 2,
  },
  locationActions: {
    flexDirection: "row",
    gap: 12,
  },
  locationAction: {
    flex: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  disabledAction: {
    opacity: 0.6,
  },
  actionGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
    marginLeft: 8,
  },
  photoContainer: {
    height: 240,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
    position: "relative",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  photoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  photoTimestamp: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  photoTimestampText: {
    fontSize: 12,
    color: "#fff",
    marginLeft: 4,
  },
  photoAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  photoInfo: {
    marginBottom: 16,
  },
  photoInfoItem: {
    marginBottom: 8,
  },
  photoInfoLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 2,
  },
  photoInfoValue: {
    fontSize: 14,
    color: "#1a202c",
  },
  photoActions: {
    flexDirection: "row",
    gap: 12,
  },
  photoActionButton: {
    flex: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  noPhotoContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  noPhotoIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  noPhotoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a202c",
    marginBottom: 8,
  },
  noPhotoDescription: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    maxWidth: "80%",
  },
  verificationStatus: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  verificationStatusIcon: {
    marginRight: 16,
  },
  verificationStatusInfo: {
    flex: 1,
  },
  verificationStatusTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a202c",
    marginBottom: 4,
  },
  verificationStatusDescription: {
    fontSize: 14,
    color: "#4a5568",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  verifyButton: {
    flex: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  rejectButton: {
    flex: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  verificationDetails: {
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  verificationDetail: {
    marginBottom: 8,
  },
  verificationDetailLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 2,
  },
  verificationDetailValue: {
    fontSize: 14,
    color: "#1a202c",
  },
  additionalActionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a202c",
    marginBottom: 12,
  },
  additionalActions: {
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    overflow: "hidden",
  },
  additionalAction: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  additionalActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ebf4ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  additionalActionContent: {
    flex: 1,
  },
  additionalActionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1a202c",
    marginBottom: 2,
  },
  additionalActionDescription: {
    fontSize: 12,
    color: "#64748b",
  },
})

