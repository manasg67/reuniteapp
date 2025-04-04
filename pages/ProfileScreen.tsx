"use client"

import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Linking,
  Platform,
  Dimensions,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons, FontAwesome5 } from "@expo/vector-icons"
import * as Location from "expo-location"
import MapView, { Marker, type Region } from "react-native-maps"
import type { StackNavigationProp } from "@react-navigation/stack"
import { useNavigation } from "@react-navigation/native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  withRepeat,
} from "react-native-reanimated"
import useAuthStore from "../store/auth";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import useProfileStore from '../store/profile';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Define navigation params type
type RootStackParamList = {
  Map: { location: { latitude: number; longitude: number } }
  ProfileScreen: undefined
}

const { width, height } = Dimensions.get("window")

const virtualFamilyData = [
  {
    id: "1",
    name: "John Doe",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    status: "Safe",
    location: { latitude: 37.78825, longitude: -122.4324 },
    lastUpdated: "10 min ago",
  },
  {
    id: "2",
    name: "Jane Smith",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    status: "At Risk",
    location: { latitude: 37.7952, longitude: -122.4028 },
    lastUpdated: "25 min ago",
  },
  {
    id: "3",
    name: "David Lee",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    status: "Safe",
    location: { latitude: 37.7749, longitude: -122.4194 },
    lastUpdated: "1 hour ago",
  },
  {
    id: "4",
    name: "Emily Chen",
    avatar: "https://randomuser.me/api/portraits/women/4.jpg",
    status: "Safe",
    location: { latitude: 37.7833, longitude: -122.4233 },
    lastUpdated: "2 hours ago",
  },
  {
    id: "5",
    name: "Michael Brown",
    avatar: "https://randomuser.me/api/portraits/men/5.jpg",
    status: "At Risk",
    location: { latitude: 37.7992, longitude: -122.4428 },
    lastUpdated: "3 hours ago",
  },
]

const emergencyContacts = [
  { name: "Police", number: "911", icon: "shield" },
  { name: "Fire Department", number: "911", icon: "fire" },
  { name: "Ambulance", number: "911", icon: "ambulance" },
  { name: "Mom", number: "123-456-7890", icon: "heart" },
]

const recentReports = [
  {
    id: "1",
    title: "Power Outage",
    description: "Power outage affecting 3 blocks in the downtown area. Estimated restoration time: 2 hours.",
    time: "2 hours ago",
    severity: "medium",
    icon: "flash-off",
  },
  {
    id: "2",
    title: "Suspicious Activity",
    description:
      "Suspicious person reported near Central Park playground. Police have been notified and are investigating.",
    time: "4 hours ago",
    severity: "high",
    icon: "alert-circle",
  },
  {
    id: "3",
    title: "Road Closure",
    description: "Main Street closed between 5th and 7th Avenue due to construction. Expected to reopen tomorrow.",
    time: "Yesterday",
    severity: "low",
    icon: "car",
  },
]

const missingPersonAlert = {
  name: "John Doe",
  age: 70,
  location: "Central Park",
  details: "Last seen wearing a blue jacket and black pants. Has Alzheimer's and may appear confused.",
  contact: "123-456-7890",
  lastSeen: "Yesterday, 4:30 PM",
  image: "https://randomuser.me/api/portraits/men/65.jpg",
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Safe":
      return "#28a745"
    case "At Risk":
      return "#dc3545"
    default:
      return "#6c757d"
  }
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "high":
      return "#dc3545"
    case "medium":
      return "#ffc107"
    case "low":
      return "#28a745"
    default:
      return "#6c757d"
  }
}

interface VirtualFamilyMember {
  id: string;
  name: string;
  avatar: string;
  status: string;
  location: {
    latitude: number;
    longitude: number;
  };
  lastUpdated: string;
}

interface FamilyMember {
  id: number;
  user: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    profile_picture: string | null;
    latitude: string | null;
    longitude: string | null;
    city: string;
    state: string;
  };
  role: string;
  relationship: string;
  joined_at: string;
}

// Add MissingPerson interface
interface MissingPerson {
  id: number;
  case_number: string;
  name: string;
  age_when_missing: number;
  recent_photo: string | null;
  last_seen_location: string;
  last_seen_date: string;
  status: string;
  emergency_contact_phone: string;
}

// New FamilyMember component to handle animation
const FamilyMember = ({
  item,
  onViewMap,
  index,
}: {
  item: VirtualFamilyMember;
  onViewMap: (location: { latitude: number; longitude: number }) => void;
  index: number;
}) => {
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(50)
  const scale = useSharedValue(0.8)
  const pulseAnim = useSharedValue(1)

  useEffect(() => {
    const delay = index * 150
    opacity.value = withDelay(delay, withTiming(1, { duration: 600 }))
    translateY.value = withDelay(delay, withSpring(0, { damping: 12, stiffness: 100 }))
    scale.value = withDelay(delay, withSpring(1, { damping: 12, stiffness: 100 }))

    if (item.status === "At Risk") {
      pulseAnim.value = withRepeat(
        withSequence(withTiming(1.05, { duration: 800 }), withTiming(1, { duration: 800 })),
        -1,
        true,
      )
    }
  }, [index])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value * (item.status === "At Risk" ? pulseAnim.value : 1) },
    ],
  }))

  return (
    <Animated.View style={[styles.familyCard, animatedStyle]}>
      <LinearGradient
        colors={[
          item.status === "Safe" ? "rgba(240, 255, 244, 0.9)" : "rgba(255, 240, 240, 0.9)",
          "rgba(255, 255, 255, 0.95)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.familyCardGradient}
      >
      <View style={styles.familyRow}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]} />
          </View>
        <View style={styles.familyInfo}>
          <Text style={styles.familyName}>{item.name}</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
              <Text style={[styles.familyStatus, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
            <Text style={styles.lastUpdated}>{item.lastUpdated}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.locationInfoContainer}>
          <Ionicons name="navigate" size={14} color="#757575" style={styles.locationInfoIcon} />
          <Text style={styles.locationInfoText}>
            {`${item.location.latitude ? item.location.latitude : 40.712800}° N, ${item.location.longitude ? item.location.longitude : -74.006000}° W`}
          </Text>
        </View>

        <TouchableOpacity style={styles.locationButton} onPress={() => onViewMap(item.location)}>
          <LinearGradient
            colors={[item.status === "Safe" ? "#28a745" : "#dc3545", item.status === "Safe" ? "#218838" : "#c82333"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.locationButtonGradient}
          >
            <Ionicons name="location" size={16} color="#fff" />
            <Text style={styles.locationButtonText}>View Location</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  )
}

// Emergency Contact Component
const EmergencyContactItem = ({
  contact,
  index,
  onCall,
}: {
  contact: (typeof emergencyContacts)[0]
  index: number
  onCall: (number: string) => void
}) => {
  const opacity = useSharedValue(0)
  const translateX = useSharedValue(-30)

  useEffect(() => {
    const delay = index * 100
    opacity.value = withDelay(delay, withTiming(1, { duration: 500 }))
    translateX.value = withDelay(delay, withSpring(0, { damping: 12 }))
  }, [index])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }))

  const getIconName = (iconType: string) => {
    switch (iconType) {
      case "shield":
        return "shield"
      case "fire":
        return "fire"
      case "ambulance":
        return "ambulance"
      case "heart":
        return "heart"
      default:
        return "call"
    }
  }

  return (
    <Animated.View style={[styles.emergencyContactContainer, animatedStyle]}>
      <TouchableOpacity style={styles.emergencyContact} onPress={() => onCall(contact.number)} activeOpacity={0.7}>
        <View style={styles.emergencyIconContainer}>
          <FontAwesome5 name={getIconName(contact.icon)} size={18} color="#fff" />
      </View>
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{contact.name}</Text>
          <Text style={styles.contactNumber}>{contact.number}</Text>
        </View>
        <View style={styles.callButtonContainer}>
          <LinearGradient colors={["#28a745", "#218838"]} style={styles.callButton}>
            <Ionicons name="call" size={20} color="#fff" />
          </LinearGradient>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

// Report Item Component
const ReportItem = ({
  report,
  index,
}: {
  report: (typeof recentReports)[0]
  index: number
}) => {
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(20)

  useEffect(() => {
    const delay = 300 + index * 150
    opacity.value = withDelay(delay, withTiming(1, { duration: 500 }))
    translateY.value = withDelay(delay, withSpring(0, { damping: 12 }))
  }, [index])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }))

  return (
    <Animated.View style={[styles.reportItemContainer, animatedStyle]}>
      <View style={styles.reportItem}>
        <View style={[styles.reportSeverityIndicator, { backgroundColor: getSeverityColor(report.severity) }]} />
        <View style={styles.reportIconContainer}>
          <Ionicons name={report.icon as any} size={24} color={getSeverityColor(report.severity)} />
        </View>
        <View style={styles.reportContent}>
          <View style={styles.reportHeader}>
            <Text style={styles.reportTitle}>{report.title}</Text>
            <Text style={styles.reportTime}>{report.time}</Text>
          </View>
          <Text style={styles.reportDescription}>{report.description}</Text>
        </View>
      </View>
    </Animated.View>
  )
}

const ProfileScreen = () => {
  const { tokens } = useAuthStore();
  const { profile, setProfile } = useProfileStore();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [location, setLocation] = useState<Location.LocationObject | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [mapRegion, setMapRegion] = useState<Region | null>(null)
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const [activeTab, setActiveTab] = useState("family")
  const router = useRouter();
  const [missingPersons, setMissingPersons] = useState<MissingPerson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sharingPosterId, setSharingPosterId] = useState<number | null>(null);

  // Animation values
  const headerScale = useSharedValue(0.9)
  const headerOpacity = useSharedValue(0)
  const mapScale = useSharedValue(0.95)
  const mapOpacity = useSharedValue(0)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (!tokens?.access) {
          console.log('No access token available');
          router.replace('/login');
        return;
      }

        console.log('Fetching user profile...');
        const response = await fetch('https://15e1-150-107-18-153.ngrok-free.app/api/accounts/users/me/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${tokens.access}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Profile data received:', {
          id: data.id,
          name: `${data.first_name} ${data.last_name}`,
          families: data.families
        });
        setProfile(data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        Alert.alert(
          "Error",
          "Failed to load profile. Please check your connection and try again."
        );
      }
    };

    fetchUserProfile();
  }, [tokens]);

  // Separate useEffect for fetching family members
  useEffect(() => {
    const fetchFamilyMembers = async () => {
      try {
        if (!tokens?.access || !profile?.families?.[0]?.id) {
          console.log('Cannot fetch family members:', {
            hasToken: !!tokens?.access,
            hasProfile: !!profile,
            hasFamilies: !!profile?.families,
            familyId: profile?.families?.[0]?.id
          });
          return;
        }

        console.log('Fetching family members for family:', {
          familyId: profile.families[0].id,
          familyName: profile.families[0].name
        });

        const response = await fetch(`https://15e1-150-107-18-153.ngrok-free.app/api/accounts/families/${profile.families[0].id}/members/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${tokens.access}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Family members received:', {
          count: data.length,
          members: data.map((member: FamilyMember) => ({
            id: member.id,
            name: `${member.user.first_name} ${member.user.last_name}`,
            role: member.role
          }))
        });
        setFamilyMembers(data);
      } catch (error) {
        console.error('Error fetching family members:', error);
        Alert.alert(
          "Error",
          "Failed to load family members. Please check your connection and try again."
        );
      }
    };

    if (profile?.families && profile.families.length > 0) {
      console.log('Profile has families, fetching members...');
      fetchFamilyMembers();
    } else {
      console.log('No families found in profile:', {
        hasProfile: !!profile,
        familiesLength: profile?.families?.length || 0
      });
    }
  }, [profile, tokens]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await fetchMissingPersons();
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const fetchMissingPersons = async () => {
    try {
      const response = await fetch('https://15e1-150-107-18-153.ngrok-free.app/api/missing-persons/missing-persons/', {
        headers: {
          'Authorization': `Bearer ${tokens?.access}`,
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
      });
      const data = await response.json();
      setMissingPersons(data);
    } catch (error) {
      console.error('Error fetching missing persons:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Animate components
  headerScale.value = withTiming(1, { duration: 800 });
  headerOpacity.value = withTiming(1, { duration: 800 });
  mapScale.value = withDelay(600, withSpring(1, { damping: 12 }));
  mapOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ scale: headerScale.value }],
  }));

  const mapAnimatedStyle = useAnimatedStyle(() => ({
    opacity: mapOpacity.value,
    transform: [{ scale: mapScale.value }],
  }));

  const getMapRegion = (): Region | undefined => {
    if (profile?.latitude && profile?.longitude) {
      return {
        latitude: parseFloat(profile.latitude),
        longitude: parseFloat(profile.longitude),
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }
    return undefined;
  };

  const handleCallEmergencyContact = (number: string) => {
    let phoneNumber = number
    if (Platform.OS !== "android") {
      phoneNumber = `telprompt:${number}`
    } else {
      phoneNumber = `tel:${number}`
    }
    Linking.canOpenURL(phoneNumber)
      .then((supported) => {
        if (!supported) {
          console.log("Phone number is not available")
        } else {
          return Linking.openURL(phoneNumber)
        }
      })
      .catch((err) => console.log(err))
  }

  const handleViewMap = (location: { latitude: number; longitude: number }) => {
    navigation.navigate("Map", { location })
  }

  const renderFamilyMember = ({ item, index }: { item: FamilyMember; index: number }) => {
    const getStatusFromRole = (role: string) => {
      return role === 'ADMIN' ? 'Safe' : 'Safe';
    };

    const status = getStatusFromRole(item.role);
    const defaultImage = "https://randomuser.me/api/portraits/men/1.jpg";
    const profilePicture = item.user.profile_picture 
      ? `https://15e1-150-107-18-153.ngrok-free.app${item.user.profile_picture}`
      : defaultImage;
    
    return (
      <FamilyMember
        item={{
          id: item.id.toString(),
          name: `${item.user.first_name} ${item.user.last_name}`,
          avatar: profilePicture,
          status: status,
          location: {
            latitude: item.user.latitude ? parseFloat(item.user.latitude) : 40.712800,
            longitude: item.user.longitude ? parseFloat(item.user.longitude) : -74.006000
          },
          lastUpdated: new Date(item.joined_at).toLocaleDateString()
        }}
        onViewMap={handleViewMap}
        index={index}
      />
    );
  };

  const createAndSharePoster = async (person: MissingPerson) => {
    try {
      // Set the sharing poster ID to show loading state for this specific poster
      setSharingPosterId(person.id);
      
      // Get the image URL - using the same format as in the missing person card
      const imageUrl = person.recent_photo;
      
      // Create HTML content for the poster
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              body { 
                font-family: 'Helvetica'; 
                margin: 0;
                padding: 0;
                background: white;
              }
              .header {
                position: relative;
                background: white;
                padding: 20px;
                text-align: center;
                margin-bottom: 20px;
              }
              .black-bar {
                background: black;
                height: 50px;
                width: 100%;
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                z-index: 1;
              }
              .missing-text {
                font-size: 72px;
                font-weight: bold;
                color: #dc3545;
                position: relative;
                z-index: 2;
                margin: 0;
              }
              .qr-code {
                position: absolute;
                top: 10px;
                right: 10px;
                width: 100px;
                height: 100px;
                z-index: 3;
              }
              .qr-text {
                color: #dc3545;
                font-size: 10px;
                text-align: center;
                margin-top: 5px;
              }
              .photo-container {
                text-align: center;
                margin: 20px auto;
                max-width: 400px;
              }
              .photo {
                width: 100%;
                height: auto;
                border-radius: 8px;
                object-fit: cover;
              }
              .details {
                display: flex;
                justify-content: space-around;
                margin: 20px;
                font-size: 24px;
                font-weight: bold;
              }
              .missing-since {
                background: black;
                color: white;
                text-align: center;
                padding: 15px;
                font-size: 24px;
                font-weight: bold;
                margin: 20px 0;
              }
              .contact {
                background: #dc3545;
                color: white;
                text-align: center;
                padding: 20px;
                margin-top: 20px;
              }
              .please-help {
                font-size: 36px;
                margin-bottom: 10px;
              }
              .phone {
                font-size: 48px;
                font-weight: bold;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="black-bar"></div>
              <h1 class="missing-text">MISSING</h1>
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=http://localhost:5173/listing" class="qr-code" />
              <div class="qr-text">If any info found, scan this<br/>QR code to report</div>
            </div>

            <div class="photo-container">
              ${imageUrl ? 
                `<img src="${imageUrl}" class="photo" alt="${person.name}" />`
                : '<div style="width: 100%; height: 300px; background: #eee; display: flex; align-items: center; justify-content: center;">No Photo Available</div>'
              }
            </div>

            <h2 style="text-align: center; font-size: 48px; margin: 20px 0; color: #dc3545;">
              ${person.name}
            </h2>

            <div class="details">
              <div>Age: ${person.age_when_missing}</div>
              <div>Height: 5'10"</div>
              <div>Weight: 160 lbs</div>
            </div>

            <div class="missing-since">
              MISSING SINCE ${formatDate(person.last_seen_date)}
            </div>

            <div class="contact">
              <div class="please-help">Please Help</div>
              <div class="phone">CALL: ${person.emergency_contact_phone}</div>
            </div>
          </body>
        </html>
      `;

      // Generate PDF file
      const { uri: pdfUri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false
      });

      // Create form data
      const formData = new FormData();
      formData.append('pdf_file', {
        uri: pdfUri,
        name: 'poster.pdf',
        type: 'application/pdf'
      } as any);
      formData.append('person_name', person.name);
      
      // Add the image URL to the form data
      if (imageUrl) {
        formData.append('image_url', imageUrl);
      }

      // Upload to API
      const response = await fetch('https://15e1-150-107-18-153.ngrok-free.app/api/missing-persons/missing-persons/convert-and-post/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens?.access}`,
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
          'ngrok-skip-browser-warning': 'true'
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to share on Instagram');
      }

      // Get the response data which should include the URL of the shared poster
      const responseData = await response.json();
      const posterUrl = responseData.poster_url || responseData.url;

      // Open WhatsApp with the poster URL
      const message = `Missing Person Alert: ${person.name}%0A%0APlease help find this person. Last seen at: ${person.last_seen_location}%0A%0AContact: ${person.emergency_contact_phone}`;
      const whatsappUrl = Platform.select({
        ios: `whatsapp://send?text=${message}`,
        android: `whatsapp://send?text=${message}`,
      });

      if (!whatsappUrl) {
        throw new Error('Platform not supported');
      }

      const canOpenWhatsApp = await Linking.canOpenURL(whatsappUrl);
      
      if (canOpenWhatsApp) {
        await Linking.openURL(whatsappUrl);
      } else {
        // If WhatsApp is not installed, show an alert with options
        Alert.alert(
          'WhatsApp Not Installed',
          'Would you like to share via other apps?',
          [
            {
              text: 'Share via SMS',
              onPress: async () => {
                const smsUrl = Platform.select({
                  ios: `sms:&body=${message}`,
                  android: `sms:?body=${message}`,
                });
                if (smsUrl) {
                  await Linking.openURL(smsUrl);
                }
              }
            },
            {
              text: 'Share via Email',
              onPress: async () => {
                const emailUrl = `mailto:?subject=Missing Person Alert&body=${message}`;
                await Linking.openURL(emailUrl);
              }
            },
            {
              text: 'Cancel',
              style: 'cancel'
            }
          ]
        );
      }

      Alert.alert(
        'Success',
        'Poster has been shared on Instagram successfully!'
      );

      // Clean up the temporary PDF file
      await FileSystem.deleteAsync(pdfUri);

    } catch (error) {
      console.error('Error sharing poster:', error);
      Alert.alert(
        'Error',
        'Failed to share the poster. Please try again.'
      );
    } finally {
      // Reset the sharing poster ID
      setSharingPosterId(null);
    }
  };

  const handleWhatsAppShare = async (person: MissingPerson) => {
    try {
      // Create a more detailed message
      const message = `Missing Person Alert: ${person.name}%0A%0A` +
        `Age: ${person.age_when_missing}%0A` +
        `Last seen: ${person.last_seen_location}%0A` +
        `Date: ${formatDate(person.last_seen_date)}%0A%0A` +
        `Contact: ${person.emergency_contact_phone}%0A%0A` +
        `Please help find this person.`;

      // For iOS, we need to use a different URL scheme
      const whatsappUrl = Platform.select({
        ios: `whatsapp://send?text=${message}`,
        android: `whatsapp://send?text=${message}`,
      });

      if (!whatsappUrl) {
        throw new Error('Platform not supported');
      }

      // First check if WhatsApp is installed
      const canOpenWhatsApp = await Linking.canOpenURL(whatsappUrl);
      
      if (canOpenWhatsApp) {
        // Try to open WhatsApp
        const opened = await Linking.openURL(whatsappUrl);
        if (!opened) {
          throw new Error('Failed to open WhatsApp');
        }
      } else {
        // If WhatsApp is not installed, show an alert with options
        Alert.alert(
          'WhatsApp Not Installed',
          'Would you like to share via other apps?',
          [
            {
              text: 'Share via SMS',
              onPress: async () => {
                const smsUrl = Platform.select({
                  ios: `sms:&body=${message}`,
                  android: `sms:?body=${message}`,
                });
                if (smsUrl) {
                  await Linking.openURL(smsUrl);
                }
              }
            },
            {
              text: 'Share via Email',
              onPress: async () => {
                const emailUrl = `mailto:?subject=Missing Person Alert&body=${message}`;
                await Linking.openURL(emailUrl);
              }
            },
            {
              text: 'Cancel',
              style: 'cancel'
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share. Please try again.');
    }
  };

  // Add a skeleton loader component
  const SkeletonLoader = () => {
    return (
      <View style={styles.skeletonContainer}>
        <View style={styles.skeletonHeader}>
          <View style={styles.skeletonProfileImage} />
          <View style={styles.skeletonTextContainer}>
            <View style={styles.skeletonName} />
            <View style={styles.skeletonLocation} />
            <View style={styles.skeletonStatus} />
        </View>
      </View>
        
        <View style={styles.skeletonTabs}>
          <View style={styles.skeletonTab} />
          <View style={styles.skeletonTab} />
          <View style={styles.skeletonTab} />
        </View>
        
        <View style={styles.skeletonSection}>
          <View style={styles.skeletonSectionHeader} />
          <View style={styles.skeletonCard}>
            <View style={styles.skeletonCardHeader} />
            <View style={styles.skeletonCardContent}>
              <View style={styles.skeletonImage} />
              <View style={styles.skeletonCardText}>
                <View style={styles.skeletonCardTitle} />
                <View style={styles.skeletonCardSubtitle} />
                <View style={styles.skeletonCardStatus} />
              </View>
            </View>
            <View style={styles.skeletonCardActions}>
              <View style={styles.skeletonButton} />
              <View style={styles.skeletonButton} />
              <View style={styles.skeletonButton} />
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {isLoading ? (
        <SkeletonLoader />
      ) : (
        <>
    <LinearGradient
            colors={["#1A365D", "#2B6CB0"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <Animated.View style={[styles.header, headerAnimatedStyle]}>
              <View style={styles.profileImageContainer}>
            <Image
                  source={{ 
                    uri: profile?.profile_picture 
                      ? `https://15e1-150-107-18-153.ngrok-free.app${profile.profile_picture}`
                      : "https://randomuser.me/api/portraits/men/8.jpg" 
                  }} 
                  style={styles.profileImage} 
                />
                <View style={styles.onlineIndicator} />
                </View>

              <View style={styles.headerText}>
                <Text style={styles.name}>
                  {profile ? `${profile.first_name} ${profile.last_name}` : 'Loading...'}
                </Text>
                <View style={styles.locationRow}>
                  <Ionicons name="location" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.location}>
                    {profile ? `${profile.city}, ${profile.state}` : 'Loading...'}
                  </Text>
            </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>{profile?.role || 'Loading...'}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.settingsButton}>
                <Ionicons name="settings-outline" size={24} color="#fff" />
              </TouchableOpacity>
              </Animated.View>
          </LinearGradient>

          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "family" && styles.activeTab]}
              onPress={() => setActiveTab("family")}
            >
              <Ionicons name="people" size={20} color={activeTab === "family" ? "#2B6CB0" : "#64748B"} />
              <Text style={[styles.tabText, activeTab === "family" && styles.activeTabText]}>Family</Text>
                </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "alerts" && styles.activeTab]}
              onPress={() => setActiveTab("alerts")}
            >
              <Ionicons name="warning" size={20} color={activeTab === "alerts" ? "#2B6CB0" : "#64748B"} />
              <Text style={[styles.tabText, activeTab === "alerts" && styles.activeTabText]}>Alerts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "map" && styles.activeTab]}
              onPress={() => setActiveTab("map")}
            >
              <Ionicons name="map" size={20} color={activeTab === "map" ? "#2B6CB0" : "#64748B"} />
              <Text style={[styles.tabText, activeTab === "map" && styles.activeTabText]}>Map</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            {/* Emergency Contacts Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <Ionicons name="alert-circle" size={20} color="#dc3545" />
                  <Text style={styles.sectionTitle}>Emergency Contacts</Text>
                </View>
                <TouchableOpacity style={styles.sectionAction}>
                  <Text style={styles.sectionActionText}>Edit</Text>
              </TouchableOpacity>
            </View>

              <View style={styles.emergencyContactsContainer}>
                {emergencyContacts.map((contact, index) => (
                  <EmergencyContactItem key={index} contact={contact} index={index} onCall={handleCallEmergencyContact} />
                ))}
              </View>
            </View>

            {/* Virtual Family Section */}
            {activeTab === "family" && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleContainer}>
                    <Ionicons name="people" size={20} color="#2B6CB0" />
                    <Text style={styles.sectionTitle}>Virtual Family ({familyMembers.length})</Text>
                  </View>
                  <TouchableOpacity style={styles.sectionAction}>
                    <Text style={styles.sectionActionText}>View All</Text>
              </TouchableOpacity>
            </View>

                {familyMembers.length > 0 ? (
          <FlatList
                    horizontal
                    data={familyMembers}
                    keyExtractor={(item) => item.id.toString()}
            renderItem={renderFamilyMember}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.familyList}
                  />
                ) : (
                  <View style={[styles.familyCard, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ color: '#64748B' }}>No family members found</Text>
                  </View>
                )}
              </View>
            )}

            {/* Recent Reports Section */}
            {activeTab === "alerts" && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleContainer}>
                    <Ionicons name="newspaper" size={20} color="#2B6CB0" />
                    <Text style={styles.sectionTitle}>Missing Person Reports ({missingPersons.length})</Text>
            </View>
            </View>

                <ScrollView 
                  style={styles.missingPersonsScrollView}
                  showsVerticalScrollIndicator={false}
                >
                  {missingPersons.map((person) => (
                    <View key={person.id} style={styles.alertCard}>
                      <View style={styles.alertHeader}>
                        <View style={styles.alertTitleContainer}>
                          <Ionicons 
                            name={person.status === 'FOUND' ? "checkmark-circle" : "warning"} 
                            size={22} 
                            color={person.status === 'FOUND' ? "#28a745" : "#856404"} 
                          />
                          <Text style={[
                            styles.alertTitle,
                            { color: person.status === 'FOUND' ? "#28a745" : "#856404" }
                          ]}>
                            Case #{person.case_number}
            </Text>
                        </View>
                        <Text style={styles.alertTime}>
                          Last seen: {formatDate(person.last_seen_date)}
                        </Text>
                      </View>

                      <View style={styles.alertContent}>
                        {person.recent_photo ? (
                          <Image 
                            source={{ uri: person.recent_photo }} 
                            style={styles.missingPersonImage}
                            resizeMode="cover" 
                          />
                        ) : (
                          <View style={styles.noPhotoPlaceholder}>
                            <Ionicons name="person" size={40} color="#ccc" />
                          </View>
                        )}

                        <View style={styles.alertDetails}>
                          <Text style={styles.alertName}>
                            {person.name}, {person.age_when_missing}
                          </Text>
                          <Text style={styles.alertLocation}>
                            <Ionicons name="location" size={14} color="#856404" /> {person.last_seen_location}
                          </Text>
                          <View style={[
                            styles.statusBadge,
                            { backgroundColor: person.status === 'FOUND' ? '#d4edda' : '#fff3cd' }
                          ]}>
                            <Text style={[
                              styles.statusText,
                              { color: person.status === 'FOUND' ? "#28a745" : "#856404" }
                            ]}>
                              {person.status}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.alertActions}>
                        <TouchableOpacity
                          style={styles.alertAction}
                          onPress={() => handleWhatsAppShare(person)}
                        >
                <LinearGradient
                            colors={["#25D366", "#128C7E"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.alertActionButton}
                          >
                            <FontAwesome5 name="whatsapp" size={16} color="#fff" />
                            <Text style={styles.alertActionText}>WhatsApp</Text>
                </LinearGradient>
            </TouchableOpacity>

                        <TouchableOpacity 
                          style={styles.alertAction}
                          onPress={() => createAndSharePoster(person)}
                          disabled={sharingPosterId === person.id}
                        >
                          <LinearGradient
                            colors={["#28a745", "#218838"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.alertActionButton}
                          >
                            {sharingPosterId === person.id ? (
                              <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color="#fff" />
                                <Text style={styles.alertActionText}>Sharing...</Text>
                              </View>
                            ) : (
                              <>
                                <Ionicons name="share-social" size={16} color="#fff" />
                                <Text style={styles.alertActionText}>Share</Text>
                              </>
                            )}
    </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.alertAction}>
                          <LinearGradient
                            colors={["#28a745", "#218838"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.alertActionButton}
                          >
                            <Ionicons name="information-circle" size={16} color="#fff" />
                            <Text style={styles.alertActionText}>Details</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Map Section */}
            {activeTab === "map" && (
              <View style={styles.mapContainer}>
                <MapView 
                  style={styles.map}
                  initialRegion={{
                    latitude: profile?.latitude ? parseFloat(profile.latitude) : 40.712800,
                    longitude: profile?.longitude ? parseFloat(profile.longitude) : -74.006000,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                  }}
                  showsUserLocation={true}
                  showsMyLocationButton={true}
                >
                  {/* User's own marker */}
                  {profile?.latitude && profile?.longitude && (
                    <Marker
                      coordinate={{
                        latitude: parseFloat(profile.latitude),
                        longitude: parseFloat(profile.longitude)
                      }}
                      title={`${profile.first_name}'s Location`}
                      description={`${profile.city}, ${profile.state}`}
                    >
                      <View style={styles.familyMarkerContainer}>
                        <Image 
                          source={{ 
                            uri: profile.profile_picture 
                              ? `https://15e1-150-107-18-153.ngrok-free.app${profile.profile_picture}`
                              : "https://randomuser.me/api/portraits/men/8.jpg" 
                          }}
                          style={[styles.familyMarkerImage, { borderColor: '#2B6CB0' }]} 
                        />
                        <View style={[styles.familyMarkerStatus, { backgroundColor: '#28a745' }]} />
                      </View>
                    </Marker>
                  )}

                  {/* Family members markers */}
                  {familyMembers.map((member) => (
                    member.user.latitude && member.user.longitude ? (
                      <Marker
                        key={member.id}
                        coordinate={{
                          latitude: parseFloat(member.user.latitude),
                          longitude: parseFloat(member.user.longitude)
                        }}
                        title={`${member.user.first_name} ${member.user.last_name}`}
                        description={`${member.user.city}, ${member.user.state}`}
                      >
                        <View style={styles.familyMarkerContainer}>
                          <Image 
                            source={{ 
                              uri: member.user.profile_picture 
                                ? `https://15e1-150-107-18-153.ngrok-free.app${member.user.profile_picture}`
                                : "https://randomuser.me/api/portraits/men/1.jpg" 
                            }}
                            style={styles.familyMarkerImage} 
                          />
                          <View style={[styles.familyMarkerStatus, { backgroundColor: getStatusColor('Safe') }]} />
                        </View>
                      </Marker>
                    ) : null
                  ))}
                </MapView>
              </View>
            )}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  )
}

const mapStyle = [
  {
    elementType: "geometry",
    stylers: [
      {
        color: "#f5f5f5",
      },
    ],
  },
  {
    elementType: "labels.icon",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#616161",
      },
    ],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#f5f5f5",
      },
    ],
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#bdbdbd",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [
      {
        color: "#eeeeee",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#757575",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [
      {
        color: "#e5e5e5",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#9e9e9e",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [
      {
        color: "#ffffff",
      },
    ],
  },
  {
    featureType: "road.arterial",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#757575",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [
      {
        color: "#dadada",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#616161",
      },
    ],
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#9e9e9e",
      },
    ],
  },
  {
    featureType: "transit.line",
    elementType: "geometry",
    stylers: [
      {
        color: "#e5e5e5",
      },
    ],
  },
  {
    featureType: "transit.station",
    elementType: "geometry",
    stylers: [
      {
        color: "#eeeeee",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [
      {
        color: "#c9c9c9",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#9e9e9e",
      },
    ],
  },
]

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 0 : StatusBar.currentHeight,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 15,
  },
  profileImageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#28a745",
    borderWidth: 2,
    borderColor: "#fff",
  },
  headerText: {
    marginLeft: 15,
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  location: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginLeft: 4,
  },
  statusBadge: {
    marginTop: 8,
    backgroundColor: "rgba(40, 167, 69, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(40, 167, 69, 0.3)",
  },
  statusBadgeText: {
    color: "#28a745",
    fontSize: 12,
    fontWeight: "600",
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginHorizontal: 20,
    marginTop: -20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    justifyContent: "space-between",
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: "rgba(43, 108, 176, 0.1)",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
    marginLeft: 6,
  },
  activeTabText: {
    color: "#2B6CB0",
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 15,
  },
  sectionContainer: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A365D",
    marginLeft: 8,
  },
  sectionAction: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 15,
    backgroundColor: "rgba(43, 108, 176, 0.1)",
  },
  sectionActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2B6CB0",
  },
  emergencyContactsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emergencyContactContainer: {
    marginBottom: 10,
  },
  emergencyContact: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  emergencyIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#dc3545",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A365D",
    marginBottom: 2,
  },
  contactNumber: {
    fontSize: 14,
    color: "#64748B",
  },
  callButtonContainer: {
    marginLeft: 10,
  },
  callButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  familyList: {
    paddingRight: 20,
    paddingBottom: 10,
  },
  familyCard: {
    width: 180,
    height: 200,
    borderRadius: 12,
    marginRight: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  familyCardGradient: {
    flex: 1,
    padding: 15,
    justifyContent: "space-between",
  },
  familyRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#fff",
  },
  statusIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#fff",
  },
  familyInfo: {
    flex: 1,
  },
  familyName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A365D",
    marginBottom: 2,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  familyStatus: {
    fontSize: 12,
    fontWeight: "600",
  },
  lastUpdated: {
    fontSize: 11,
    color: "#64748B",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
    marginVertical: 10,
  },
  locationInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  locationInfoIcon: {
    marginRight: 5,
  },
  locationInfoText: {
    fontSize: 12,
    color: "#64748B",
  },
  locationButton: {
    borderRadius: 20,
    overflow: "hidden",
  },
  locationButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  locationButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 5,
  },
  reportsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reportItemContainer: {
    marginBottom: 15,
  },
  reportItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  reportSeverityIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  reportIconContainer: {
    marginRight: 12,
    alignSelf: "flex-start",
    marginTop: 2,
  },
  reportContent: {
    flex: 1,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A365D",
  },
  reportTime: {
    fontSize: 12,
    color: "#64748B",
  },
  reportDescription: {
    fontSize: 14,
    color: "#4A5568",
    lineHeight: 20,
  },
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  alertTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#856404",
    marginLeft: 8,
  },
  alertTime: {
    fontSize: 12,
    color: "#856404",
    opacity: 0.8,
  },
  alertContent: {
    flexDirection: "row",
    marginBottom: 15,
  },
  missingPersonImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  alertDetails: {
    flex: 1,
  },
  alertName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#856404",
    marginBottom: 5,
  },
  alertLocation: {
    fontSize: 14,
    color: "#856404",
    marginBottom: 5,
  },
  alertActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  alertAction: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 20,
    overflow: "hidden",
  },
  alertActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  alertActionText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 5,
  },
  mapContainer: {
    height: 400,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  mapTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A365D",
    marginLeft: 8,
  },
  mapUpdated: {
    fontSize: 12,
    color: "#64748B",
  },
  mapWrapper: {
    position: "relative",
    height: 300,
  },
  mapOverlay: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "column",
  },
  mapActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(43, 108, 176, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  mapFooter: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  mapLegendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  mapLegendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  mapLegendText: {
    fontSize: 12,
    color: "#64748B",
  },
  markerContainer: {
    position: "relative",
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  markerInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0, 123, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  markerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#007bff",
  },
  markerRipple: {
    position: "absolute",
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0, 123, 255, 0.15)",
  },
  familyMarkerContainer: {
    position: "relative",
  },
  familyMarkerImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#fff",
  },
  familyMarkerStatus: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#fff",
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 5,
  },
  bottomBarButton: {
    padding: 10,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#dc3545",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fff",
  },
  notificationBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  sosButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    marginTop: -25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  sosButtonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  sosButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  missingPersonsScrollView: {
    maxHeight: height * 0.7, // 70% of screen height
  },
  noPhotoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  missingPersonStatusBadge: {
    marginTop: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#fff3cd',
    alignSelf: 'flex-start',
  },
  // Skeleton loader styles
  skeletonContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  skeletonHeader: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#1A365D',
    alignItems: 'center',
  },
  skeletonProfileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  skeletonTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  skeletonName: {
    height: 20,
    width: '70%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonLocation: {
    height: 16,
    width: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonStatus: {
    height: 16,
    width: '30%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
  },
  skeletonTabs: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  skeletonTab: {
    height: 30,
    flex: 1,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginHorizontal: 5,
  },
  skeletonSection: {
    padding: 15,
  },
  skeletonSectionHeader: {
    height: 24,
    width: '60%',
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 15,
  },
  skeletonCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  skeletonCardHeader: {
    height: 20,
    width: '40%',
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 15,
  },
  skeletonCardContent: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  skeletonImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  skeletonCardText: {
    flex: 1,
    marginLeft: 15,
  },
  skeletonCardTitle: {
    height: 18,
    width: '80%',
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonCardSubtitle: {
    height: 16,
    width: '60%',
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonCardStatus: {
    height: 16,
    width: '40%',
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
  },
  skeletonCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skeletonButton: {
    height: 36,
    flex: 1,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginHorizontal: 5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default ProfileScreen

