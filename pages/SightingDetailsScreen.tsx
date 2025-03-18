"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking, Platform } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native"
import { SafeAreaView } from "react-native-safe-area-context"

// Mock data for a sighting if not provided via route
const mockSighting = {
  id: "SID-2023-0472",
  status: "verified",
  timestamp: new Date(2023, 2, 18, 14, 30),
  reportMethod: "app",
  location: {
    address: "Central Park, near Bethesda Fountain, New York, NY",
    coordinates: { lat: 40.7736, lng: -73.9712 },
    accuracyRadius: 15,
    nearbyLandmarks: ["Bethesda Terrace", "The Lake", "Loeb Boathouse"],
  },
  reporter: {
    name: "John Smith",
    phone: "+1 (555) 123-4567",
    email: "john.smith@example.com",
    anonymous: false,
    firstTime: false,
    verificationStatus: "verified",
  },
  description:
    "I saw a woman matching Sarah's description sitting alone on a bench near the Bethesda Fountain. She was wearing a blue jacket and jeans, looking at her phone. She seemed disoriented and was looking around frequently as if searching for someone. When I approached to ask if she needed help, she quickly got up and walked away toward The Lake.",
  circumstances: ["alone", "disoriented", "public place"],
  weather: {
    condition: "Partly Cloudy",
    temperature: "62°F",
    precipitation: "None",
  },
  photos: [
    {
      id: 1,
      url: "https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?q=80&w=1000",
      timestamp: new Date(2023, 2, 18, 14, 28),
    },
    {
      id: 2,
      url: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=1000",
      timestamp: new Date(2023, 2, 18, 14, 29),
    },
  ],
  missingPerson: {
    id: "MP-2023-0089",
    name: "Sarah Johnson",
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
    lastKnownLocation: {
      address: "Broadway and W 79th St, New York, NY",
      coordinates: { lat: 40.7831, lng: -73.98 },
      distanceFromSighting: "0.7 miles",
    },
  },
  communicationLog: [
    {
      id: 1,
      timestamp: new Date(2023, 2, 18, 15, 10),
      type: "call",
      agent: "Officer Rodriguez",
      notes:
        "Called reporter to confirm details. Reporter confirmed the sighting and provided additional details about the direction the missing person was heading.",
    },
    {
      id: 2,
      timestamp: new Date(2023, 2, 18, 16, 45),
      type: "email",
      agent: "Case Manager Thompson",
      notes:
        "Sent follow-up email with additional photos of Sarah to confirm identification. Reporter responded confirming 80% confidence in identification.",
    },
  ],
  confidenceLevel: 80,
  priority: "high",
  familyNotified: true,
  followUpScheduled: new Date(2023, 2, 19, 10, 0),
}

// Format date and time
const formatDateTime = (date: Date) => {
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
const formatRelativeTime = (date: Date) => {
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

// Tab component
const TabView = ({ tabs, activeTab, onTabChange }: { tabs: any[], activeTab: string, onTabChange: (tabId: string) => void }) => {
  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tab, activeTab === tab.id && styles.activeTab]}
          onPress={() => onTabChange(tab.id)}
        >
          <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>{tab.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  return (
    <View style={[styles.badge, status === "verified" ? styles.verifiedBadge : styles.unverifiedBadge]}>
      <Feather
        name={status === "verified" ? "check" : "x"}
        size={12}
        color={status === "verified" ? "#48BB78" : "#A0AEC0"}
      />
      <Text style={[styles.badgeText, { color: status === "verified" ? "#48BB78" : "#A0AEC0" }]}>
        {status === "verified" ? "Verified" : "Unverified"}
      </Text>
    </View>
  )
}

// Priority badge component
const PriorityBadge = ({ priority }: { priority: string }) => {
  const colors = {
    high: { bg: "rgba(245, 101, 101, 0.1)", text: "#F56565", border: "rgba(245, 101, 101, 0.2)" },
    medium: { bg: "rgba(245, 158, 11, 0.1)", text: "#F59E0B", border: "rgba(245, 158, 11, 0.2)" },
    low: { bg: "rgba(43, 108, 176, 0.1)", text: "#2B6CB0", border: "rgba(43, 108, 176, 0.2)" },
  }

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors[priority as keyof typeof colors].bg,
          borderColor: colors[priority as keyof typeof colors].border,
        },
      ]}
    >
      <Feather name="flag" size={12} color={colors[priority as keyof typeof colors].text} />
      <Text style={[styles.badgeText, { color: colors[priority as keyof typeof colors].text }]}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
      </Text>
    </View>
  )
}

// Communication log item component
const CommunicationLogItem = ({ log, isExpanded, onToggle }: { log: any, isExpanded: boolean, onToggle: () => void }   ) => {
  return (
    <TouchableOpacity style={styles.communicationItem} onPress={onToggle} activeOpacity={0.7}>
      <View style={styles.communicationHeader}>
        <View style={styles.communicationMeta}>
          <View
            style={[styles.communicationTypeDot, { backgroundColor: log.type === "call" ? "#48BB78" : "#2B6CB0" }]}
          />
          <Text style={styles.communicationTypeText}>{log.type === "call" ? "Phone Call" : "Email"}</Text>
          <Text style={styles.communicationTime}>{formatRelativeTime(log.timestamp)}</Text>
        </View>
        <Feather name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color="#64748B" />
      </View>

      {isExpanded && (
        <View style={styles.communicationContent}>
          <Text style={styles.communicationAgent}>
            <Text style={styles.communicationLabel}>Agent:</Text> {log.agent}
          </Text>
          <Text style={styles.communicationNotes}>{log.notes}</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

type RootStackParamList = {
  SightingDetails: {
    sighting?: typeof mockSighting;
  };
};

// Main component
export default function SightingDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'SightingDetails'>>();
  const sighting = route.params?.sighting || mockSighting;

  const [activeTab, setActiveTab] = useState("details")
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({})

  const tabs = [
    { id: "details", label: "Details" },
    { id: "location", label: "Location" },
    { id: "evidence", label: "Evidence" },
    { id: "reporter", label: "Reporter" },
  ]

  const toggleLogExpanded = (logId: string) => {
    setExpandedLogs({
      ...expandedLogs,
      [logId]: !expandedLogs[logId],
    })
  }

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`)
  }

  const handleEmail = (email: string ) => {
    Linking.openURL(`mailto:${email}`)
  }

  const handleGetDirections = () => {
    const { lat, lng } = sighting.location.coordinates
    const url = Platform.select({
      ios: `maps:0,0?q=${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}`,
    })
    if (url) {
      Linking.openURL(url)
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Overview Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <View style={styles.idContainer}>
                <Text style={styles.sightingId}>{sighting.id}</Text>
              </View>
              <View style={styles.badgeContainer}>
                <StatusBadge status={sighting.status} />
                <PriorityBadge priority={sighting.priority} />
              </View>
            </View>

            <View style={styles.timeContainer}>
              <View style={styles.timeItem}>
                <Feather name="clock" size={12} color="#64748B" style={styles.timeIcon} />
                <Text style={styles.timeText}>{formatRelativeTime(sighting.timestamp)}</Text>
              </View>
              <View style={styles.timeItem}>
                <Feather name="calendar" size={12} color="#64748B" style={styles.timeIcon} />
                <Text style={styles.timeText}>{formatDateTime(sighting.timestamp)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.missingPersonContainer}>
            <Image source={{ uri: sighting.missingPerson.photo }} style={styles.missingPersonPhoto} />
            <View style={styles.missingPersonInfo}>
              <Text style={styles.missingPersonLabel}>Missing Person</Text>
              <Text style={styles.missingPersonName}>{sighting.missingPerson.name}</Text>
              <TouchableOpacity
                style={styles.viewProfileButton}
                onPress={() => console.log(`View profile for ${sighting.missingPerson.id}`)}
              >
                <Text style={styles.viewProfileText}>View full profile</Text>
                <Feather name="chevron-right" size={12} color="#2B6CB0" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <TabView tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        {activeTab === "details" && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{sighting.description}</Text>

            <Text style={styles.subsectionTitle}>Circumstances</Text>
            <View style={styles.tagsContainer}>
              {sighting.circumstances.map((circumstance: any, index: number) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{circumstance}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.subsectionTitle}>Weather Conditions</Text>
            <View style={styles.weatherContainer}>
              <View style={styles.weatherItem}>
                <Text style={styles.weatherLabel}>Condition</Text>
                <Text style={styles.weatherValue}>{sighting.weather.condition}</Text>
              </View>
              <View style={styles.weatherItem}>
                <Text style={styles.weatherLabel}>Temperature</Text>
                <Text style={styles.weatherValue}>{sighting.weather.temperature}</Text>
              </View>
              <View style={styles.weatherItem}>
                <Text style={styles.weatherLabel}>Precipitation</Text>
                <Text style={styles.weatherValue}>{sighting.weather.precipitation}</Text>
              </View>
            </View>

            <Text style={styles.subsectionTitle}>Identification Confidence</Text>
            <View style={styles.confidenceContainer}>
              <View style={styles.confidenceBar}>
                <View style={[styles.confidenceFill, { width: `${sighting.confidenceLevel}%` }]} />
              </View>
              <View style={styles.confidenceLabels}>
                <Text style={styles.confidenceLabel}>Low confidence</Text>
                <Text style={styles.confidenceValue}>{sighting.confidenceLevel}%</Text>
                <Text style={styles.confidenceLabel}>High confidence</Text>
              </View>
            </View>

            <Text style={styles.subsectionTitle}>Status Information</Text>
            <View style={styles.statusInfoContainer}>
              <View style={styles.statusInfoItem}>
                <View
                  style={[styles.statusDot, { backgroundColor: sighting.familyNotified ? "#48BB78" : "#F56565" }]}
                />
                <Text style={styles.statusInfoText}>
                  Family {sighting.familyNotified ? "Notified" : "Not Notified"}
                </Text>
              </View>
              <View style={styles.statusInfoItem}>
                <View
                  style={[styles.statusDot, { backgroundColor: sighting.followUpScheduled ? "#48BB78" : "#A0AEC0" }]}
                />
                <Text style={styles.statusInfoText}>
                  {sighting.followUpScheduled
                    ? `Follow-up: ${formatDateTime(sighting.followUpScheduled)}`
                    : "No Follow-up Scheduled"}
                </Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === "location" && (
          <View style={styles.card}>
            <View style={styles.mapContainer}>
              <View style={styles.mapPlaceholder}>
                <Feather name="map-pin" size={32} color="#2B6CB0" />
                <Text style={styles.mapPlaceholderText}>Map View</Text>
                <Text style={styles.mapCoordinates}>
                  {sighting.location.coordinates.lat.toFixed(4)}, {sighting.location.coordinates.lng.toFixed(4)}
                </Text>
              </View>

              <View
                style={[
                  styles.accuracyCircle,
                  {
                    width: sighting.location.accuracyRadius * 2,
                    height: sighting.location.accuracyRadius * 2,
                  },
                ]}
              />
            </View>

            <View style={styles.addressContainer}>
              <View style={styles.addressHeader}>
                <Feather name="map-pin" size={16} color="#64748B" />
                <Text style={styles.addressTitle}>Address</Text>
              </View>
              <Text style={styles.addressText}>{sighting.location.address}</Text>
            </View>

            {sighting.missingPerson.lastKnownLocation && (
              <View style={styles.distanceContainer}>
                <Text style={styles.distanceTitle}>Distance from Last Known Location</Text>
                <View style={styles.distanceBarContainer}>
                  <View style={styles.distanceBar}>
                    <View style={styles.distanceBarFill} />
                  </View>
                  <Text style={styles.distanceText}>
                    {sighting.missingPerson.lastKnownLocation.distanceFromSighting}
                  </Text>
                </View>
                <Text style={styles.lastLocationText}>
                  Last seen at: {sighting.missingPerson.lastKnownLocation.address}
                </Text>
              </View>
            )}

            {sighting.location.nearbyLandmarks && (
              <View style={styles.landmarksContainer}>
                <Text style={styles.landmarksTitle}>Nearby Landmarks</Text>
                {sighting.location.nearbyLandmarks.map((landmark: any, index: number) => (
                  <View key={index} style={styles.landmarkItem}>
                    <View style={styles.landmarkDot} />
                    <Text style={styles.landmarkText}>{landmark}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.locationActions}>
              <TouchableOpacity style={styles.locationActionButton} onPress={handleGetDirections}>
                <Feather name="map-pin" size={16} color="#1A365D" />
                <Text style={styles.locationActionText}>Get Directions</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.locationActionButton} onPress={() => console.log("Share location")}>
                <Feather name="share-2" size={16} color="#1A365D" />
                <Text style={styles.locationActionText}>Share Location</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === "evidence" && (
          <View style={styles.card}>
            {sighting.photos && sighting.photos.length > 0 ? (
              <View>
                <View style={styles.photoGalleryContainer}>
                  <Image
                    source={{ uri: sighting.photos[activePhotoIndex].url }}
                    style={styles.mainPhoto}
                    resizeMode="cover"
                  />
                  <View style={styles.photoCounter}>
                    <Text style={styles.photoCounterText}>
                      {activePhotoIndex + 1} / {sighting.photos.length}
                    </Text>
                  </View>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.thumbnailsContainer}
                >
                  {sighting.photos.map((photo: any, index: number) => (
                    <TouchableOpacity
                      key={photo.id}
                      style={[styles.thumbnailButton, index === activePhotoIndex && styles.activeThumbnail]}
                      onPress={() => setActivePhotoIndex(index)}
                    >
                      <Image source={{ uri: photo.url }} style={styles.thumbnail} resizeMode="cover" />
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <View style={styles.photoMetaContainer}>
                  <View style={styles.photoMetaItem}>
                    <Text style={styles.photoMetaLabel}>Photo Taken</Text>
                    <Text style={styles.photoMetaValue}>
                      {formatDateTime(sighting.photos[activePhotoIndex].timestamp)}
                    </Text>
                  </View>
                  <View style={styles.photoMetaItem}>
                    <Text style={styles.photoMetaLabel}>Device</Text>
                    <Text style={styles.photoMetaValue}>iPhone 13 Pro</Text>
                  </View>
                </View>

                <Text style={styles.subsectionTitle}>Photo Comparison</Text>
                <View style={styles.comparisonContainer}>
                  <View style={styles.comparisonItem}>
                    <Image
                      source={{ uri: sighting.photos[activePhotoIndex].url }}
                      style={styles.comparisonPhoto}
                      resizeMode="cover"
                    />
                    <View style={styles.comparisonLabel}>
                      <Text style={styles.comparisonLabelText}>Sighting Photo</Text>
                    </View>
                  </View>
                  <View style={styles.comparisonItem}>
                    <Image
                      source={{ uri: sighting.missingPerson.photo }}
                      style={styles.comparisonPhoto}
                      resizeMode="cover"
                    />
                    <View style={styles.comparisonLabel}>
                      <Text style={styles.comparisonLabelText}>Reference Photo</Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.subsectionTitle}>Visual Match Confidence</Text>
                <View style={styles.confidenceContainer}>
                  <View style={styles.confidenceBar}>
                    <View style={[styles.confidenceFill, { width: `${sighting.confidenceLevel}%` }]} />
                  </View>
                  <View style={styles.confidenceLabels}>
                    <Text style={styles.confidenceLabel}>Low match</Text>
                    <Text style={styles.confidenceValue}>{sighting.confidenceLevel}%</Text>
                    <Text style={styles.confidenceLabel}>High match</Text>
                  </View>
                </View>

                <View style={styles.photoActions}>
                  <TouchableOpacity style={styles.photoActionButton} onPress={() => console.log("View full size")}>
                    <Feather name="external-link" size={16} color="#1A365D" />
                    <Text style={styles.photoActionText}>View Full Size</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.photoActionButton} onPress={() => console.log("Share photo")}>
                    <Feather name="share-2" size={16} color="#1A365D" />
                    <Text style={styles.photoActionText}>Share Photo</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.noPhotosContainer}>
                <View style={styles.noPhotosIcon}>
                  <Feather name="x" size={24} color="#64748B" />
                </View>
                <Text style={styles.noPhotosTitle}>No Photos Available</Text>
                <Text style={styles.noPhotosDescription}>This sighting does not include any photographic evidence</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === "reporter" && (
          <View style={styles.card}>
            <View style={styles.reporterHeader}>
              <Text style={styles.sectionTitle}>Reporter Information</Text>
              <View
                style={[
                  styles.reporterBadge,
                  sighting.reporter.anonymous ? styles.anonymousBadge : styles.identifiedBadge,
                ]}
              >
                <Text
                  style={[
                    styles.reporterBadgeText,
                    sighting.reporter.anonymous ? styles.anonymousBadgeText : styles.identifiedBadgeText,
                  ]}
                >
                  {sighting.reporter.anonymous ? "Anonymous" : "Identified"}
                </Text>
              </View>
            </View>

            {!sighting.reporter.anonymous && (
              <View style={styles.reporterProfile}>
                <View style={styles.reporterAvatar}>
                  <Text style={styles.reporterInitials}>
                    {sighting.reporter.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </Text>
                </View>
                <View style={styles.reporterInfo}>
                  <Text style={styles.reporterName}>{sighting.reporter.name}</Text>
                  <Text style={styles.reporterType}>
                    {sighting.reporter.firstTime ? "First-time reporter" : "Returning reporter"}
                  </Text>
                </View>
              </View>
            )}

            {!sighting.reporter.anonymous && (
              <View style={styles.contactInfoContainer}>
                <View style={styles.contactItem}>
                  <Feather name="phone" size={16} color="#64748B" style={styles.contactIcon} />
                  <View style={styles.contactDetails}>
                    <Text style={styles.contactLabel}>Phone</Text>
                    <Text style={styles.contactValue}>{sighting.reporter.phone}</Text>
                  </View>
                  <TouchableOpacity style={styles.copyButton} onPress={() => console.log("Copy phone")}>
                    <Feather name="copy" size={14} color="#64748B" />
                  </TouchableOpacity>
                </View>

                <View style={styles.contactItem}>
                  <Feather name="message-square" size={16} color="#64748B" style={styles.contactIcon} />
                  <View style={styles.contactDetails}>
                    <Text style={styles.contactLabel}>Email</Text>
                    <Text style={styles.contactValue}>{sighting.reporter.email}</Text>
                  </View>
                  <TouchableOpacity style={styles.copyButton} onPress={() => console.log("Copy email")}>
                    <Feather name="copy" size={14} color="#64748B" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.verificationContainer}>
              <Text style={styles.subsectionTitle}>Verification Status</Text>
              <View style={styles.verificationStatus}>
                <Feather name="check" size={16} color="#48BB78" />
                <View style={styles.verificationText}>
                  <Text style={styles.verificationTitle}>Reporter verified</Text>
                  <Text style={styles.verificationDescription}>Identity confirmed via app authentication</Text>
                </View>
              </View>
            </View>

            <Text style={styles.subsectionTitle}>Communication Log</Text>
            {sighting.communicationLog.map((log: any) => (
              <CommunicationLogItem
                key={log.id}
                log={log}
                isExpanded={expandedLogs[log.id] || false}
                onToggle={() => toggleLogExpanded(log.id)}
              />
            ))}

            <View style={styles.reporterActions}>
              <TouchableOpacity
                style={styles.reporterActionButton}
                onPress={() => handleCall(sighting.reporter.phone)}
                disabled={sighting.reporter.anonymous}
              >
                <Feather name="phone" size={16} color={sighting.reporter.anonymous ? "#A0AEC0" : "#1A365D"} />
                <Text style={[styles.reporterActionText, sighting.reporter.anonymous && styles.disabledActionText]}>
                  Call Reporter
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.reporterActionButton}
                onPress={() => handleEmail(sighting.reporter.email)}
                disabled={sighting.reporter.anonymous}
              >
                <Feather name="message-square" size={16} color={sighting.reporter.anonymous ? "#A0AEC0" : "#1A365D"} />
                <Text style={[styles.reporterActionText, sighting.reporter.anonymous && styles.disabledActionText]}>
                  Email Reporter
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Action Center */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Action Center</Text>

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryActionButton]}
              onPress={() => console.log("Verify sighting")}
            >
              <Feather name="check" size={16} color="white" />
              <Text style={styles.primaryActionText}>Verify Sighting</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryActionButton]}
              onPress={() => console.log("Mark as invalid")}
            >
              <Feather name="x" size={16} color="#1A365D" />
              <Text style={styles.secondaryActionText}>Mark as Invalid</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryActionButton]}
              onPress={() => console.log("Schedule follow-up")}
            >
              <Feather name="calendar" size={16} color="#1A365D" />
              <Text style={styles.secondaryActionText}>Schedule Follow-up</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryActionButton]}
              onPress={() => console.log("Notify family")}
            >
              <Feather name="thumbs-up" size={16} color="#1A365D" />
              <Text style={styles.secondaryActionText}>Notify Family</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  idContainer: {
    marginBottom: 8,
  },
  sightingId: {
    fontFamily: "monospace",
    fontSize: 14,
    color: "#1A365D",
  },
  badgeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
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
  verifiedBadge: {
    backgroundColor: "rgba(72, 187, 120, 0.1)",
    borderColor: "rgba(72, 187, 120, 0.2)",
  },
  unverifiedBadge: {
    backgroundColor: "rgba(160, 174, 192, 0.1)",
    borderColor: "rgba(160, 174, 192, 0.2)",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  timeContainer: {
    alignItems: "flex-end",
  },
  timeItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  timeIcon: {
    marginRight: 4,
  },
  timeText: {
    fontSize: 12,
    color: "#64748B",
  },
  missingPersonContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  missingPersonPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  missingPersonInfo: {
    flex: 1,
  },
  missingPersonLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  missingPersonName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1A202C",
  },
  viewProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  viewProfileText: {
    fontSize: 12,
    color: "#2B6CB0",
    marginRight: 4,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#E6F0FB",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
  },
  activeTabText: {
    color: "#2B6CB0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#1A202C",
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#4A5568",
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 16,
    marginBottom: 8,
    color: "#1A202C",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 12,
    color: "#4A5568",
  },
  weatherContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  weatherItem: {
    flex: 1,
  },
  weatherLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
  },
  weatherValue: {
    fontSize: 14,
    color: "#1A202C",
  },
  confidenceContainer: {
    marginBottom: 16,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 4,
  },
  confidenceFill: {
    height: "100%",
    backgroundColor: "#2B6CB0",
    borderRadius: 4,
  },
  confidenceLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  confidenceLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  confidenceValue: {
    fontSize: 12,
    fontWeight: "500",
    color: "#1A202C",
  },
  statusInfoContainer: {
    gap: 8,
  },
  statusInfoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusInfoText: {
    fontSize: 14,
    color: "#1A202C",
  },
  mapContainer: {
    height: 200,
    backgroundColor: "#E2E8F0",
    borderRadius: 8,
    marginBottom: 16,
    position: "relative",
    overflow: "hidden",
  },
  mapPlaceholder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(26, 54, 93, 0.1)",
  },
  mapPlaceholderText: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 8,
  },
  mapCoordinates: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  accuracyCircle: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -15 }, { translateY: -15 }],
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "rgba(43, 108, 176, 0.5)",
    backgroundColor: "rgba(43, 108, 176, 0.2)",
  },
  addressContainer: {
    marginBottom: 16,
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  addressTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  addressText: {
    fontSize: 14,
    color: "#4A5568",
    marginLeft: 24,
  },
  distanceContainer: {
    marginBottom: 16,
  },
  distanceTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  distanceBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  distanceBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    marginRight: 8,
    overflow: "hidden",
  },
  distanceBarFill: {
    width: "30%",
    height: "100%",
    backgroundColor: "#2B6CB0",
  },
  distanceText: {
    fontSize: 12,
    color: "#64748B",
  },
  lastLocationText: {
    fontSize: 12,
    color: "#64748B",
  },
  landmarksContainer: {
    marginBottom: 16,
  },
  landmarksTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  landmarkItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  landmarkDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#64748B",
    marginRight: 8,
  },
  landmarkText: {
    fontSize: 14,
    color: "#4A5568",
  },
  locationActions: {
    flexDirection: "row",
    gap: 8,
  },
  locationActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
  },
  locationActionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1A365D",
    marginLeft: 8,
  },
  photoGalleryContainer: {
    height: 250,
    backgroundColor: "#E2E8F0",
    borderRadius: 8,
    marginBottom: 16,
    position: "relative",
    overflow: "hidden",
  },
  mainPhoto: {
    width: "100%",
    height: "100%",
  },
  photoCounter: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  photoCounterText: {
    fontSize: 12,
    color: "white",
  },
  thumbnailsContainer: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 8,
  },
  thumbnailButton: {
    width: 64,
    height: 64,
    borderRadius: 4,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  activeThumbnail: {
    borderColor: "#2B6CB0",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  photoMetaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  photoMetaItem: {
    flex: 1,
  },
  photoMetaLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
  },
  photoMetaValue: {
    fontSize: 14,
    color: "#1A202C",
  },
  comparisonContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  comparisonItem: {
    flex: 1,
    height: 120,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  comparisonPhoto: {
    width: "100%",
    height: "100%",
  },
  comparisonLabel: {
    position: "absolute",
    bottom: 4,
    left: 4,
    right: 4,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingVertical: 4,
    borderRadius: 4,
    alignItems: "center",
  },
  comparisonLabelText: {
    fontSize: 12,
    color: "white",
  },
  photoActions: {
    flexDirection: "row",
    gap: 8,
  },
  photoActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
  },
  photoActionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1A365D",
    marginLeft: 8,
  },
  noPhotosContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  noPhotosIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  noPhotosTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  noPhotosDescription: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
  },
  reporterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  reporterBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  anonymousBadge: {
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderColor: "rgba(245, 158, 11, 0.2)",
  },
  identifiedBadge: {
    backgroundColor: "rgba(43, 108, 176, 0.1)",
    borderColor: "rgba(43, 108, 176, 0.2)",
  },
  reporterBadgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  anonymousBadgeText: {
    color: "#F59E0B",
  },
  identifiedBadgeText: {
    color: "#2B6CB0",
  },
  reporterProfile: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  reporterAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1A365D",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  reporterInitials: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  reporterInfo: {
    flex: 1,
  },
  reporterName: {
    fontSize: 16,
    fontWeight: "500",
  },
  reporterType: {
    fontSize: 12,
    color: "#64748B",
  },
  contactInfoContainer: {
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  contactIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  contactDetails: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    color: "#4A5568",
  },
  copyButton: {
    padding: 4,
  },
  verificationContainer: {
    marginBottom: 16,
  },
  verificationStatus: {
    flexDirection: "row",
    backgroundColor: "rgba(72, 187, 120, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(72, 187, 120, 0.2)",
    borderRadius: 8,
    padding: 12,
  },
  verificationText: {
    marginLeft: 12,
    flex: 1,
  },
  verificationTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  verificationDescription: {
    fontSize: 12,
    color: "#4A5568",
  },
  communicationItem: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    marginBottom: 8,
    overflow: "hidden",
  },
  communicationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  communicationMeta: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  communicationTypeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  communicationTypeText: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 8,
  },
  communicationTime: {
    fontSize: 12,
    color: "#64748B",
  },
  communicationContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingLeft: 28,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  communicationAgent: {
    fontSize: 14,
    marginBottom: 4,
  },
  communicationLabel: {
    fontWeight: "500",
  },
  communicationNotes: {
    fontSize: 14,
    color: "#4A5568",
  },
  reporterActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  reporterActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
  },
  reporterActionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1A365D",
    marginLeft: 8,
  },
  disabledActionText: {
    color: "#A0AEC0",
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryActionButton: {
    backgroundColor: "#2B6CB0",
  },
  secondaryActionButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  primaryActionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "white",
    marginLeft: 8,
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1A365D",
    marginLeft: 8,
  },
})

