"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  PanResponder,
  Image,
  Dimensions,
  Modal,
  Alert,
  ScrollView,
} from "react-native"
import { Feather } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { SafeAreaView } from "react-native-safe-area-context"
import { FlashList } from "@shopify/flash-list"
import { router } from "expo-router"
import useAuthStore from "../store/auth"

// Define the navigation param list
type RootStackParamList = {
  SightingDetails: { sighting: any };
  SightingReport: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

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
}

interface APIResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SightingData[];
  statistics: {
    total_count: number;
    verified_count: number;
    pending_count: number;
    with_photo_count: number;
  };
}

interface Filters {
  verification_status: 'all' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  confidence_level: 'all' | 'LOW' | 'MEDIUM' | 'HIGH';
  time_period: 'all' | 'today' | 'week' | 'month';
  location_type: 'all' | 'INDOOR' | 'OUTDOOR';
  crowd_density: 'all' | 'LOW' | 'MEDIUM' | 'HIGH';
  willing_to_contact: 'all' | 'true' | 'false';
  start_date?: string;
  end_date?: string;
  latitude?: string;
  longitude?: string;
  distance?: string;
  search?: string;
  ordering?: string;
}

// Mock data for sightings
const mockSightings = [
  {
    id: "SID-2023-0472",
    reporterName: "John Smith",
    anonymous: false,
    location: "Central Park, New York, NY",
    timestamp: new Date(2023, 2, 18, 14, 30),
    missingPerson: {
      id: "MP-2023-0089",
      name: "Sarah Johnson",
      thumbnail: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    status: "verified",
    priority: "high",
    isNew: true,
  },
  {
    id: "SID-2023-0471",
    reporterName: "Anonymous",
    anonymous: true,
    location: "Pike Place Market, Seattle, WA",
    timestamp: new Date(2023, 2, 18, 10, 15),
    missingPerson: {
      id: "MP-2023-0076",
      name: "Michael Chen",
      thumbnail: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    status: "verified",
    priority: "medium",
    isNew: true,
  },
  {
    id: "SID-2023-0470",
    reporterName: "Emily Davis",
    anonymous: false,
    location: "Union Station, Chicago, IL",
    timestamp: new Date(2023, 2, 17, 18, 45),
    missingPerson: {
      id: "MP-2023-0102",
      name: "David Wilson",
      thumbnail: "https://randomuser.me/api/portraits/men/67.jpg",
    },
    status: "unverified",
    priority: "high",
    isNew: false,
  },
  {
    id: "SID-2023-0469",
    reporterName: "Robert Johnson",
    anonymous: false,
    location: "Fisherman's Wharf, San Francisco, CA",
    timestamp: new Date(2023, 2, 17, 12, 20),
    missingPerson: {
      id: "MP-2023-0089",
      name: "Sarah Johnson",
      thumbnail: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    status: "verified",
    priority: "low",
    isNew: false,
  },
  {
    id: "SID-2023-0468",
    reporterName: "Anonymous",
    anonymous: true,
    location: "Times Square, New York, NY",
    timestamp: new Date(2023, 2, 15, 20, 10),
    missingPerson: {
      id: "MP-2023-0076",
      name: "Michael Chen",
      thumbnail: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    status: "unverified",
    priority: "medium",
    isNew: false,
  },
  {
    id: "SID-2023-0467",
    reporterName: "Jessica Williams",
    anonymous: false,
    location: "Millennium Park, Chicago, IL",
    timestamp: new Date(2023, 2, 12, 15, 30),
    missingPerson: {
      id: "MP-2023-0102",
      name: "David Wilson",
      thumbnail: "https://randomuser.me/api/portraits/men/67.jpg",
    },
    status: "verified",
    priority: "high",
    isNew: false,
  },
  {
    id: "SID-2023-0466",
    reporterName: "Thomas Brown",
    anonymous: false,
    location: "Golden Gate Park, San Francisco, CA",
    timestamp: new Date(2023, 2, 10, 9, 45),
    missingPerson: {
      id: "MP-2023-0089",
      name: "Sarah Johnson",
      thumbnail: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    status: "verified",
    priority: "medium",
    isNew: false,
  },
]

// Helper function to group sightings by date
const groupSightingsByDate = (sightings: any[]) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const pastWeekStart = new Date(today)
  pastWeekStart.setDate(pastWeekStart.getDate() - 7)

  const groups: { today: any[], yesterday: any[], pastWeek: any[], earlier: any[] } = {
    today: [],
    yesterday: [],
    pastWeek: [],
    earlier: [],
  }

  sightings.forEach((sighting) => { 
    const sightingDate = new Date(sighting.timestamp)
    sightingDate.setHours(0, 0, 0, 0)

    if (sightingDate.getTime() === today.getTime()) {
        groups.today.push(sighting)
    } else if (sightingDate.getTime() === yesterday.getTime()) {
      groups.yesterday.push(sighting)
    } else if (sighting >= pastWeekStart) {
      groups.pastWeek.push(sighting)
    } else {
      groups.earlier.push(sighting)
    }
  })

  return groups
}

// Helper function to format relative time
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

// Status indicator component
const StatusIndicator = ({ status }: { status: string }) => {
  return (
    <View style={[styles.statusBadge, status === "verified" ? styles.verifiedBadge : styles.unverifiedBadge]}>
      <Feather
        name={status === "verified" ? "check" : "x"}
        size={12}
        color={status === "verified" ? "#48BB78" : "#A0AEC0"}
      />
      <Text style={[styles.statusText, { color: status === "verified" ? "#48BB78" : "#A0AEC0" }]}>
        {status === "verified" ? "Verified" : "Unverified"}
      </Text>
    </View>
  )
}

// Priority indicator component
const PriorityIndicator = ({ priority }: { priority: 'high' | 'medium' | 'low' }) => {
  const colors = {
    high: "#F56565",
    medium: "#F59E0B",
    low: "#2B6CB0",
  }

  return (
    <View style={styles.priorityContainer}>
      <View style={[styles.priorityDot, { backgroundColor: colors[priority] }]} />
      <Text style={styles.priorityText}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</Text>
    </View>
  )
}

// Sighting item component
const SightingItem = ({ sighting, onPress, onSwipeAction }: { sighting: any, onPress: any, onSwipeAction: any }) => {
  const pan = useRef(new Animated.ValueXY()).current
  const [isOpen, setIsOpen] = useState(false)
  
  // Store mutable values for the offsets
  const panXOffset = useRef(0)
  const panYOffset = useRef(0)

  useEffect(() => {
    // Store current value in the offset ref
    const xListener = pan.x.addListener(({value}) => {
      panXOffset.current = value
    })
    const yListener = pan.y.addListener(({value}) => {
      panYOffset.current = value
    })

    return () => {
      pan.x.removeListener(xListener)
      pan.y.removeListener(yListener)
    }
  }, [])

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 5
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: panXOffset.current,
          y: panYOffset.current,
        })
      },
      onPanResponderMove: (evt, gestureState) => {
        // Only allow left swipe (negative dx)
        if (gestureState.dx < 0) {
          pan.x.setValue(gestureState.dx)
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        pan.flattenOffset()

        // If swiped more than 1/3 of the screen width, open the actions
        if (gestureState.dx < -Dimensions.get("window").width / 3) {
          Animated.spring(pan.x, {
            toValue: -100,
            useNativeDriver: false,
          }).start()
          setIsOpen(true)
        } else {
          Animated.spring(pan.x, {
            toValue: 0,
            useNativeDriver: false,
          }).start()
          setIsOpen(false)
        }
      },
    }),
  ).current

  const resetSwipe = () => {
    Animated.spring(pan.x, {
      toValue: 0,
      useNativeDriver: false,
    }).start()
    setIsOpen(false)
  }

  const handleAction = (action: string) => {
    onSwipeAction(sighting.id, action)
    resetSwipe()
  }

  return (
    <View style={styles.sightingItemContainer}>
      {/* Actions revealed on swipe */}
      <View style={styles.swipeActionsContainer}>
        <TouchableOpacity style={[styles.swipeAction, styles.verifyAction]} onPress={() => handleAction("verify")}>
          <Feather name="check" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.swipeAction, styles.flagAction]} onPress={() => handleAction("flag")}>
          <Feather name="flag" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.swipeAction, styles.contactAction]} onPress={() => handleAction("contact")}>
          <Feather name="user" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Main card */}
      <Animated.View
        style={[styles.sightingCard, sighting.isNew && styles.newSighting, { transform: [{ translateX: pan.x }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            if (isOpen) {
              resetSwipe()
            } else {
              onPress(sighting)
            }
          }}
          style={styles.cardContent}
        >
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.sightingId}>{sighting.id}</Text>
              {sighting.isNew && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>New</Text>
                </View>
              )}
              <Text style={styles.locationText}>{sighting.location}</Text>
              <View style={styles.metaContainer}>
                <Text style={styles.metaText}>{formatRelativeTime(sighting.timestamp)}</Text>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.metaText}>{sighting.anonymous ? "Anonymous" : sighting.reporterName}</Text>
              </View>
            </View>
            <View style={styles.statusContainer}>
              <StatusIndicator status={sighting.status} />
              <PriorityIndicator priority={sighting.priority} />
            </View>
          </View>

          <View style={styles.missingPersonContainer}>
            <Image source={{ uri: sighting.missingPerson.thumbnail }} style={styles.thumbnail} />
            <View>
              <Text style={styles.missingPersonLabel}>Missing Person</Text>
              <Text style={styles.missingPersonName}>{sighting.missingPerson.name}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  )
}

// Skeleton loader for sighting items
const SightingItemSkeleton = () => (
  <View style={styles.skeletonCard}>
    <View style={styles.skeletonHeader}>
      <View>
        <View style={[styles.skeletonItem, { width: 100, height: 12 }]} />
        <View style={[styles.skeletonItem, { width: 200, height: 16, marginTop: 8 }]} />
        <View style={[styles.skeletonItem, { width: 150, height: 12, marginTop: 8 }]} />
      </View>
      <View style={styles.skeletonStatus}>
        <View style={[styles.skeletonItem, { width: 80, height: 20 }]} />
        <View style={[styles.skeletonItem, { width: 60, height: 16, marginTop: 8 }]} />
      </View>
    </View>

    <View style={styles.skeletonFooter}>
      <View style={[styles.skeletonItem, { width: 40, height: 40, borderRadius: 20 }]} />
      <View>
        <View style={[styles.skeletonItem, { width: 100, height: 10 }]} />
        <View style={[styles.skeletonItem, { width: 150, height: 14, marginTop: 4 }]} />
      </View>
    </View>
  </View>
)

// Filter modal component
const FilterModal = ({ visible, onClose, filters, onFilterChange }: { visible: boolean, onClose: () => void, filters: Filters, onFilterChange: (filters: Filters) => void }) => {
  const [localFilters, setLocalFilters] = useState<Filters>({ ...filters });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateType, setDateType] = useState<'start' | 'end'>('start');

  const handleApply = () => {
    onFilterChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: Filters = {
      verification_status: "all",
      confidence_level: "all",
      time_period: "all",
      location_type: "all",
      crowd_density: "all",
      willing_to_contact: "all",
      ordering: "-timestamp"
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
    onClose();
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Sightings</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="#1A365D" />
            </TouchableOpacity>
          </View>

          <ScrollView>
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Verification Status</Text>
              <View style={styles.filterOptions}>
                {["all", "PENDING", "VERIFIED", "REJECTED"].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.filterOption, localFilters.verification_status === option && styles.filterOptionSelected]}
                    onPress={() => setLocalFilters({ ...localFilters, verification_status: option as any })}
                  >
                    <Text style={[styles.filterOptionText, localFilters.verification_status === option && styles.filterOptionTextSelected]}>
                      {option === "all" ? "All" : option.charAt(0) + option.slice(1).toLowerCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Confidence Level</Text>
              <View style={styles.filterOptions}>
                {["all", "LOW", "MEDIUM", "HIGH"].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.filterOption, localFilters.confidence_level === option && styles.filterOptionSelected]}
                    onPress={() => setLocalFilters({ ...localFilters, confidence_level: option as any })}
                  >
                    <Text style={[styles.filterOptionText, localFilters.confidence_level === option && styles.filterOptionTextSelected]}>
                      {option === "all" ? "All" : option.charAt(0) + option.slice(1).toLowerCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Time Period</Text>
              <View style={styles.filterOptions}>
                {["all", "today", "week", "month"].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.filterOption, localFilters.time_period === option && styles.filterOptionSelected]}
                    onPress={() => setLocalFilters({ ...localFilters, time_period: option as any })}
                  >
                    <Text style={[styles.filterOptionText, localFilters.time_period === option && styles.filterOptionTextSelected]}>
                      {option === "all" ? "All Time" : option.charAt(0).toUpperCase() + option.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Location Type</Text>
              <View style={styles.filterOptions}>
                {["all", "INDOOR", "OUTDOOR"].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.filterOption, localFilters.location_type === option && styles.filterOptionSelected]}
                    onPress={() => setLocalFilters({ ...localFilters, location_type: option as any })}
                  >
                    <Text style={[styles.filterOptionText, localFilters.location_type === option && styles.filterOptionTextSelected]}>
                      {option === "all" ? "All" : option.charAt(0) + option.slice(1).toLowerCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Crowd Density</Text>
              <View style={styles.filterOptions}>
                {["all", "LOW", "MEDIUM", "HIGH"].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.filterOption, localFilters.crowd_density === option && styles.filterOptionSelected]}
                    onPress={() => setLocalFilters({ ...localFilters, crowd_density: option as any })}
                  >
                    <Text style={[styles.filterOptionText, localFilters.crowd_density === option && styles.filterOptionTextSelected]}>
                      {option === "all" ? "All" : option.charAt(0) + option.slice(1).toLowerCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Contact Preference</Text>
              <View style={styles.filterOptions}>
                {["all", "true", "false"].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.filterOption, localFilters.willing_to_contact === option && styles.filterOptionSelected]}
                    onPress={() => setLocalFilters({ ...localFilters, willing_to_contact: option as any })}
                  >
                    <Text style={[styles.filterOptionText, localFilters.willing_to_contact === option && styles.filterOptionTextSelected]}>
                      {option === "all" ? "All" : option === "true" ? "Willing to Contact" : "Not Willing"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalButton, styles.resetButton]} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Reset Filters</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.applyButton]} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Main component
export default function SightingsListScreen() {
  const navigation = useNavigation<NavigationProp>()
  const [sightings, setSightings] = useState<SightingData[]>([])
  const [filteredSightings, setFilteredSightings] = useState<SightingData[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterModalVisible, setFilterModalVisible] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    verification_status: "all",
    confidence_level: "all",
    time_period: "all",
    location_type: "all",
    crowd_density: "all",
    willing_to_contact: "all",
    ordering: "-timestamp"
  })
  const { tokens } = useAuthStore();

  // Fetch sightings data with filters
  const fetchSightings = async () => {
    try {
      // Build query parameters based on filters
      const queryParams = new URLSearchParams();
      
      if (filters.verification_status !== 'all') {
        queryParams.append('verification_status', filters.verification_status);
      }
      if (filters.confidence_level !== 'all') {
        queryParams.append('confidence_level', filters.confidence_level);
      }
      if (filters.time_period !== 'all') {
        queryParams.append('time_period', filters.time_period);
      }
      if (filters.location_type !== 'all') {
        queryParams.append('location_type', filters.location_type);
      }
      if (filters.crowd_density !== 'all') {
        queryParams.append('crowd_density', filters.crowd_density);
      }
      if (filters.willing_to_contact !== 'all') {
        queryParams.append('willing_to_contact', filters.willing_to_contact);
      }
      if (filters.start_date) {
        queryParams.append('start_date', filters.start_date);
      }
      if (filters.end_date) {
        queryParams.append('end_date', filters.end_date);
      }
      if (filters.latitude) {
        queryParams.append('latitude', filters.latitude);
      }
      if (filters.longitude) {
        queryParams.append('longitude', filters.longitude);
      }
      if (filters.distance) {
        queryParams.append('distance', filters.distance);
      }
      if (searchQuery) {
        queryParams.append('search', searchQuery);
      }
      if (filters.ordering) {
        queryParams.append('ordering', filters.ordering);
      }

      const url = `https://6a84-106-193-251-230.ngrok-free.app/api/sightings/sightings/?${queryParams.toString()}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${tokens?.access}`,
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
      });
      
      const data: APIResponse = await response.json();
      
      // Transform API data to match our UI needs
      const transformedSightings = data.results.map(sighting => ({
        ...sighting,
        isNew: new Date(sighting.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000,
      }));

      setSightings(transformedSightings);
      setFilteredSightings(transformedSightings);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sightings:', error);
      Alert.alert('Error', 'Failed to load sightings data');
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchSightings();
  }, []);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSightings();
    setRefreshing(false);
  };

  // Handle swipe actions
  const handleSwipeAction = async (id: number, action: string) => {
    if (action === "verify") {
      try {
        const response = await fetch(`https://6a84-106-193-251-230.ngrok-free.app/api/sightings/sightings/${id}/verify/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tokens?.access}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          // Refresh the sightings list
          fetchSightings();
        } else {
          Alert.alert('Error', 'Failed to verify sighting');
        }
      } catch (error) {
        console.error('Error verifying sighting:', error);
        Alert.alert('Error', 'Failed to verify sighting');
      }
    }
  };

  // Group sightings by date
  const groupedSightings = groupSightingsByDate(filteredSightings)

  // Prepare data for FlashList
  const prepareListData = () => {
    const data: Array<{ type: string; title?: string; item?: any }> = []

    if (groupedSightings.today.length > 0) {
      data.push({ type: "header", title: "Today" })
      groupedSightings.today.forEach((sighting) => {
        data.push({ type: "sighting", item: sighting })
      })
    }

    if (groupedSightings.yesterday.length > 0) {
      data.push({ type: "header", title: "Yesterday" })
      groupedSightings.yesterday.forEach((sighting) => {
        data.push({ type: "sighting", item: sighting })
      })
    }

    if (groupedSightings.pastWeek.length > 0) {
      data.push({ type: "header", title: "Past Week" })
      groupedSightings.pastWeek.forEach((sighting) => {
        data.push({ type: "sighting", item: sighting })
      })
    }

    if (groupedSightings.earlier.length > 0) {
      data.push({ type: "header", title: "Earlier" })
      groupedSightings.earlier.forEach((sighting) => {
        data.push({ type: "sighting", item: sighting })
      })
    }

    return data
  }

  // Render item for FlashList
  const renderItem = ({ item }: { item: { type: string; title?: string; item?: any } }) => {
    if (item.type === "header") {
      return <Text style={styles.sectionHeader}>{item.title}</Text>
    } else {
      return (
        <SightingItem
          sighting={{
            id: item.item.id,
            reporterName: item.item.reporter_name,
            anonymous: false,
            location: item.item.location,
            timestamp: new Date(item.item.timestamp),
            missingPerson: item.item.missing_person ? {
              id: item.item.missing_person.id,
              name: item.item.missing_person.name,
              thumbnail: item.item.missing_person.recent_photo || 'https://via.placeholder.com/150',
            } : null,
            status: item.item.verification_status.toLowerCase(),
            priority: item.item.confidence_level.toLowerCase(),
            isNew: new Date(item.item.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000,
          }}
          onPress={(sighting: any) => router.push({
            pathname: "/sightdetails",
            params: { id: sighting.id }
          })}
          onSwipeAction={handleSwipeAction}
        />
      )
    }
  }

  // Empty state component
  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Feather name="search" size={48} color="#A0AEC0" />
      <Text style={styles.emptyStateTitle}>No sightings found</Text>
      <Text style={styles.emptyStateDescription}>Try adjusting your filters or search query</Text>
      <TouchableOpacity
        style={styles.resetFiltersButton}
        onPress={() => {
          setFilters({
            verification_status: "all",
            confidence_level: "all",
            time_period: "all",
            location_type: "all",
            crowd_density: "all",
            willing_to_contact: "all",
            ordering: "-timestamp"
          })
          setSearchQuery("")
        }}
      >
        <Text style={styles.resetFiltersText}>Reset all filters</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={16} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by ID, location, or name..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#64748B"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Feather name="x" size={16} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleRefresh} disabled={refreshing}>
            <Feather name="refresh-cw" size={20} color="#1A365D" style={refreshing ? styles.rotating : null} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.filterButton]}
            onPress={() => setFilterModalVisible(true)}
          >
            <Feather name="filter" size={16} color="#1A365D" />
            <Text style={styles.filterButtonText}>Filters</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {filteredSightings.length} {filteredSightings.length === 1 ? "sighting" : "sightings"} found
        </Text>
      </View>

      {loading ? (
        // Skeleton loading state
        <View style={styles.listContainer}>
          {Array.from({ length: 5 }).map((_, i) => (
            <SightingItemSkeleton key={i} />
          ))}
        </View>
      ) : filteredSightings.length === 0 ? (
        // Empty state
        <EmptyState />
      ) : (
        // Sightings list
        <FlashList
          data={prepareListData()}
          renderItem={renderItem}
          estimatedItemSize={120}
          contentContainerStyle={styles.listContent}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          keyExtractor={(item, index) => (item.type === "header" ? `header-${index}` : `sighting-${item.item.id}`)}
        />
      )}

      {/* FAB for adding new sighting */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push("/sightreport")}>
        <Feather name="plus" size={24} color="white" />
      </TouchableOpacity>

      {/* Map button */}
      <TouchableOpacity style={styles.mapButton} onPress={() => router.push("/nearbysightings")}>
        <Feather name="map" size={24} color="white" />
      </TouchableOpacity>

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        filters={filters}
        onFilterChange={setFilters}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#1A202C",
  },
  actionsContainer: {
    flexDirection: "row",
    marginLeft: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  filterButton: {
    flexDirection: "row",
    backgroundColor: "#E6F0FB",
    paddingHorizontal: 12,
    width: "auto",
  },
  filterButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "500",
    color: "#1A365D",
  },
  rotating: {
    transform: [{ rotate: "45deg" }],
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  statsText: {
    fontSize: 14,
    color: "#64748B",
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  listContent: {
    padding: 16,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
    marginBottom: 8,
    marginTop: 16,
  },
  sightingItemContainer: {
    marginBottom: 12,
    position: "relative",
  },
  swipeActionsContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  swipeAction: {
    width: 50,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  verifyAction: {
    backgroundColor: "#48BB78",
  },
  flagAction: {
    backgroundColor: "#F59E0B",
  },
  contactAction: {
    backgroundColor: "#2B6CB0",
  },
  sightingCard: {
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: "hidden",
  },
  newSighting: {
    borderLeftWidth: 3,
    borderLeftColor: "#2B6CB0",
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sightingId: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#64748B",
  },
  newBadge: {
    backgroundColor: "#E6F0FB",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#1A365D",
  },
  locationText: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 4,
    color: "#1A202C",
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#64748B",
  },
  metaDot: {
    fontSize: 12,
    color: "#64748B",
    marginHorizontal: 4,
  },
  statusContainer: {
    alignItems: "flex-end",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 4,
  },
  verifiedBadge: {
    backgroundColor: "rgba(72, 187, 120, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(72, 187, 120, 0.2)",
  },
  unverifiedBadge: {
    backgroundColor: "rgba(160, 174, 192, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(160, 174, 192, 0.2)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  priorityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  priorityText: {
    fontSize: 12,
    color: "#64748B",
  },
  missingPersonContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  missingPersonLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  missingPersonName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1A202C",
  },
  skeletonCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  skeletonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  skeletonStatus: {
    alignItems: "flex-end",
  },
  skeletonFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  skeletonItem: {
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 16,
  },
  resetFiltersButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
  },
  resetFiltersText: {
    fontSize: 14,
    color: "#1A365D",
    fontWeight: "500",
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2B6CB0",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mapButton: {
    position: "absolute",
    left: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2B6CB0",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  filterSection: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A202C",
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "white",
    minWidth: 100,
    alignItems: "center",
  },
  filterOptionSelected: {
    backgroundColor: "#2B6CB0",
    borderColor: "#2B6CB0",
  },
  filterOptionText: {
    fontSize: 14,
    color: "#1A202C",
    textAlign: "center",
  },
  filterOptionTextSelected: {
    color: "white",
    fontWeight: "500",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  resetButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginRight: 8,
  },
  resetButtonText: {
    color: "#1A202C",
    fontWeight: "500",
  },
  applyButton: {
    backgroundColor: "#2B6CB0",
    marginLeft: 8,
  },
  applyButtonText: {
    color: "white",
    fontWeight: "500",
  },
})

