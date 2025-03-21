"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking, Platform, ActivityIndicator, Alert, Clipboard } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { SafeAreaView } from "react-native-safe-area-context"
import { router } from "expo-router"
import useAuthStore from "../store/auth"
import MapView, { Marker } from 'react-native-maps'

interface SightingData {
  id: number;
  missing_person: {
    id: number;
    case_number: string;
    name: string;
    recent_photo: string | null;
  } | null;
  missing_person_name: string;
  reporter_name: string;
  location: string;
  timestamp: string;
  verification_status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  confidence_level: 'LOW' | 'MEDIUM' | 'HIGH';
  photo: string | null;
  location_type: 'INDOOR' | 'OUTDOOR';
  crowd_density: 'LOW' | 'MEDIUM' | 'HIGH';
  observed_behavior: string;
  confidence_level_numeric: number;
  willing_to_contact: boolean;
  companions: 'ALONE' | 'WITH_ADULTS' | 'WITH_CHILDREN' | 'UNKNOWN';
  created_at: string;
  description: string;
  latitude: string | number;
  longitude: string | number;
}

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

type RootStackParamList = {
  SightingDetails: {
    id: number;
  };
  PersonDetails: {
    id: number;
  };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Main component
export default function SightingDetailsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'SightingDetails'>>();
  const [sighting, setSighting] = useState<SightingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const { tokens } = useAuthStore();

  const tabs = [
    { id: "details", label: "Details" },
    { id: "location", label: "Location" },
    { id: "evidence", label: "Evidence" },
  ];

  // Fetch sighting details
  const fetchSightingDetails = async () => {
    try {
      const id = route.params?.id;
      if (!id) return;

      const response = await fetch(`https://6a84-106-193-251-230.ngrok-free.app/api/sightings/sightings/${id}/`, {
        headers: {
          'Authorization': `Bearer ${tokens?.access}`,
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sighting details');
      }

      const data = await response.json();
      setSighting(data);
    } catch (error) {
      console.error('Error fetching sighting details:', error);
      Alert.alert('Error', 'Failed to load sighting details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSightingDetails();
  }, [route.params?.id]);

  if (loading || !sighting) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2B6CB0" />
          <Text style={styles.loadingText}>Loading sighting details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Overview Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <View style={styles.idContainer}>
                <Text style={styles.sightingId}>#{sighting.id}</Text>
              </View>
              <View style={styles.badgeContainer}>
                <StatusBadge status={sighting.verification_status.toLowerCase()} />
                <PriorityBadge priority={sighting.confidence_level.toLowerCase()} />
              </View>
            </View>

            <View style={styles.timeContainer}>
              <View style={styles.timeItem}>
                <Feather name="clock" size={12} color="#64748B" style={styles.timeIcon} />
                <Text style={styles.timeText}>{formatRelativeTime(new Date(sighting.timestamp))}</Text>
              </View>
              <View style={styles.timeItem}>
                <Feather name="calendar" size={12} color="#64748B" style={styles.timeIcon} />
                <Text style={styles.timeText}>{formatDateTime(new Date(sighting.timestamp))}</Text>
              </View>
            </View>
          </View>

          {sighting.missing_person && (
            <View style={styles.missingPersonContainer}>
              <Image 
                source={{ 
                  uri: sighting.missing_person.recent_photo || 'https://via.placeholder.com/150'
                }} 
                style={styles.missingPersonPhoto} 
              />
              <View style={styles.missingPersonInfo}>
                <Text style={styles.missingPersonLabel}>Missing Person</Text>
                <Text style={styles.missingPersonName}>{sighting.missing_person.name}</Text>
                <TouchableOpacity
                  style={styles.viewProfileButton}
                  onPress={() => {
                    if (sighting.missing_person) {
                      navigation.navigate('PersonDetails', { id: sighting.missing_person.id });
                    }
                  }}
                >
                  <Text style={styles.viewProfileText}>View full profile</Text>
                  <Feather name="chevron-right" size={12} color="#2B6CB0" />
                </TouchableOpacity>
              </View>
            </View>
          )}
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
              <View style={styles.tag}>
                <Text style={styles.tagText}>{sighting.companions.toLowerCase().replace(/_/g, ' ')}</Text>
              </View>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{sighting.location_type.toLowerCase()}</Text>
              </View>
              <View style={styles.tag}>
                <Text style={styles.tagText}>Crowd: {sighting.crowd_density.toLowerCase()}</Text>
              </View>
            </View>

            <Text style={styles.subsectionTitle}>Identification Confidence</Text>
            <View style={styles.confidenceContainer}>
              <View style={styles.confidenceBar}>
                <View style={[styles.confidenceFill, { width: `${sighting.confidence_level_numeric}%` }]} />
              </View>
              <View style={styles.confidenceLabels}>
                <Text style={styles.confidenceLabel}>Low confidence</Text>
                <Text style={styles.confidenceValue}>{sighting.confidence_level_numeric}%</Text>
                <Text style={styles.confidenceLabel}>High confidence</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === "location" && (
          <View style={styles.card}>
            <View style={styles.mapContainer}>
              {(sighting.latitude && sighting.longitude) ? (
                <MapView
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
                  />
                </MapView>
              ) : (
                <View style={styles.mapPlaceholder}>
                  <Feather name="map-pin" size={32} color="#2B6CB0" />
                  <Text style={styles.mapPlaceholderText}>Map View</Text>
                  <Text style={styles.mapCoordinates}>Coordinates not available</Text>
                </View>
              )}
            </View>

            <View style={styles.addressContainer}>
              <View style={styles.addressHeader}>
                <Feather name="map-pin" size={16} color="#64748B" />
                <Text style={styles.addressTitle}>Address</Text>
              </View>
              <Text style={styles.addressText}>{sighting.location || 'Address not available'}</Text>
            </View>

            <View style={styles.locationActions}>
              <TouchableOpacity 
                style={[styles.locationActionButton, (!sighting.latitude || !sighting.longitude) && styles.disabledButton]} 
                disabled={!sighting.latitude || !sighting.longitude}
                onPress={() => {
                  if (sighting.latitude && sighting.longitude) {
                    const lat = Number(sighting.latitude);
                    const lng = Number(sighting.longitude);
                    const url = Platform.select({
                      ios: `maps:0,0?q=${lat},${lng}`,
                      android: `geo:0,0?q=${lat},${lng}`,
                    });
                    if (url) Linking.openURL(url);
                  }
                }}
              >
                <Feather name="map-pin" size={16} color={(!sighting.latitude || !sighting.longitude) ? "#A0AEC0" : "#1A365D"} />
                <Text style={[styles.locationActionText, (!sighting.latitude || !sighting.longitude) && styles.disabledText]}>Get Directions</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.locationActionButton, (!sighting.latitude || !sighting.longitude) && styles.disabledButton]}
                disabled={!sighting.latitude || !sighting.longitude}
                onPress={() => {
                  if (sighting.latitude && sighting.longitude) {
                    const location = `${sighting.latitude},${sighting.longitude}`;
                    Clipboard.setString(location);
                    Alert.alert('Success', 'Location coordinates copied to clipboard');
                  }
                }}
              >
                <Feather name="share-2" size={16} color={(!sighting.latitude || !sighting.longitude) ? "#A0AEC0" : "#1A365D"} />
                <Text style={[styles.locationActionText, (!sighting.latitude || !sighting.longitude) && styles.disabledText]}>Share Location</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === "evidence" && (
          <View style={styles.card}>
            {sighting.photo ? (
              <View>
                <View style={styles.photoGalleryContainer}>
                  <Image
                    source={{ uri: sighting.photo }}
                    style={styles.mainPhoto}
                    resizeMode="cover"
                  />
                </View>

                <View style={styles.photoMetaContainer}>
                  <View style={styles.photoMetaItem}>
                    <Text style={styles.photoMetaLabel}>Photo Taken</Text>
                    <Text style={styles.photoMetaValue}>
                      {formatDateTime(new Date(sighting.timestamp))}
                    </Text>
                  </View>
                </View>

                <View style={styles.photoActions}>
                  <TouchableOpacity 
                    style={styles.photoActionButton} 
                    onPress={() => sighting.photo && Linking.openURL(sighting.photo)}
                  >
                    <Feather name="external-link" size={16} color="#1A365D" />
                    <Text style={styles.photoActionText}>View Full Size</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.photoActionButton} 
                    onPress={() => {
                      if (sighting.photo) {
                        Clipboard.setString(sighting.photo);
                        Alert.alert('Success', 'Photo URL copied to clipboard');
                      }
                    }}
                  >
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

        {/* Action Center */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Action Center</Text>

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryActionButton]}
              onPress={() => {
                fetch(`https://6a84-106-193-251-230.ngrok-free.app/api/sightings/sightings/${sighting.id}/verify/`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${tokens?.access}`,
                    'Accept': 'application/json',
                  },
                })
                .then(response => {
                  if (response.ok) {
                    Alert.alert('Success', 'Sighting verified successfully');
                    // Refresh sighting data
                    fetchSightingDetails();
                  } else {
                    throw new Error('Failed to verify sighting');
                  }
                })
                .catch(error => {
                  console.error('Error verifying sighting:', error);
                  Alert.alert('Error', 'Failed to verify sighting');
                });
              }}
            >
              <Feather name="check" size={16} color="white" />
              <Text style={styles.primaryActionText}>Verify Sighting</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryActionButton]}
              onPress={() => Alert.alert('Coming Soon', 'This feature is not yet implemented')}
            >
              <Feather name="x" size={16} color="#1A365D" />
              <Text style={styles.secondaryActionText}>Mark as Invalid</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
  mapContainer: {
    height: 200,
    backgroundColor: "#E2E8F0",
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
  },
  map: {
    width: '100%',
    height: '100%',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
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
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: "#A0AEC0",
  },
})

