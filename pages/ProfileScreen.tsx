"use client"

import { useState, useEffect } from "react"
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
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import * as Location from "expo-location"
import MapView, { Marker, Region } from "react-native-maps"
import { StackNavigationProp } from "@react-navigation/stack"
import { useNavigation } from "@react-navigation/native"
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from "react-native-reanimated"

// Define navigation params type
type RootStackParamList = {
  Map: { location: { latitude: number; longitude: number } }
  ProfileScreen: undefined
}

const virtualFamilyData = [
  {
    id: "1",
    name: "John Doe",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    status: "Safe",
    location: { latitude: 37.78825, longitude: -122.4324 },
  },
  {
    id: "2",
    name: "Jane Smith",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    status: "At Risk",
    location: { latitude: 37.7952, longitude: -122.4028 },
  },
  {
    id: "3",
    name: "David Lee",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    status: "Safe",
    location: { latitude: 37.7749, longitude: -122.4194 },
  },
  {
    id: "4",
    name: "Emily Chen",
    avatar: "https://randomuser.me/api/portraits/women/4.jpg",
    status: "Safe",
    location: { latitude: 37.7833, longitude: -122.4233 },
  },
  {
    id: "5",
    name: "Michael Brown",
    avatar: "https://randomuser.me/api/portraits/men/5.jpg",
    status: "At Risk",
    location: { latitude: 37.7992, longitude: -122.4428 },
  },
]

const emergencyContacts = [
  { name: "Police", number: "911" },
  { name: "Fire Department", number: "911" },
  { name: "Ambulance", number: "911" },
  { name: "Mom", number: "123-456-7890" },
]

const recentReports = [
  { id: "1", title: "Power Outage", description: "Power outage in the neighborhood." },
  { id: "2", title: "Suspicious Activity", description: "Suspicious person reported near the park." },
]

const missingPersonAlert = {
  name: "John Doe",
  age: 70,
  location: "Central Park",
  details: "Last seen wearing a blue jacket and black pants.",
  contact: "123-456-7890",
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

// New FamilyMember component to handle animation
const FamilyMember = ({ 
  item, 
  onViewMap 
}: { 
  item: (typeof virtualFamilyData)[0]; 
  onViewMap: (location: { latitude: number; longitude: number }) => void;
}) => {
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(20)

  useEffect(() => {
    const delay = Number.parseInt(item.id) * 200
    setTimeout(() => {
      opacity.value = withTiming(1, { duration: 500 })
      translateY.value = withSpring(0, { damping: 15 })
    }, delay)
  }, [item.id])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }))

  return (
    <Animated.View style={[styles.familyCard, animatedStyle]}>
      <LinearGradient
        colors={[item.status === "Safe" ? "#F0FFF4" : "#FFF0F0", "#FFFFFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.familyCardGradient}
      >
        <View style={styles.familyRow}>
          <Image
            source={{ uri: item.avatar }}
            style={[styles.avatar, { borderColor: getStatusColor(item.status) }]}
          />
          <View style={styles.familyInfo}>
            <Text style={styles.familyName}>{item.name}</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
              <Text style={[styles.familyStatus, { color: getStatusColor(item.status) }]}>{item.status}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.locationButton} onPress={() => onViewMap(item.location)}>
            <Ionicons name="location-outline" size={20} color="#4A90E2" />
          </TouchableOpacity>
        </View>
        <View style={styles.locationInfoContainer}>
          <Ionicons name="navigate" size={14} color="#757575" style={styles.locationInfoIcon} />
          <Text style={styles.locationInfoText}>
            {`${item.location.latitude.toFixed(4)}° N, ${item.location.longitude.toFixed(4)}° W`}
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>
  )
}

const ProfileScreen = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [mapRegion, setMapRegion] = useState<Region | null>(null)
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()

  useEffect(() => {
    ;(async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied")
        return
      }

      const location = await Location.getCurrentPositionAsync({})
      setLocation(location)

      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      })
    })()
  }, [])

  let text = "Waiting..."
  if (errorMsg) {
    text = errorMsg
  } else if (location) {
    text = JSON.stringify(location)
  }

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

  const renderFamilyMember = ({ item }: { item: (typeof virtualFamilyData)[0] }) => (
    <FamilyMember item={item} onViewMap={handleViewMap} />
  )

  const emergencyCardOpacity = useSharedValue(0)
  const emergencyCardTranslateY = useSharedValue(20)

  useEffect(() => {
    setTimeout(() => {
      emergencyCardOpacity.value = withTiming(1, { duration: 500 })
      emergencyCardTranslateY.value = withSpring(0, { damping: 15 })
    }, 200)
  }, [])

  const emergencyCardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: emergencyCardOpacity.value,
    transform: [{ translateY: emergencyCardTranslateY.value }],
  }))

  const familySectionOpacity = useSharedValue(0)
  const familySectionTranslateY = useSharedValue(20)

  useEffect(() => {
    setTimeout(() => {
      familySectionOpacity.value = withTiming(1, { duration: 500 })
      familySectionTranslateY.value = withSpring(0, { damping: 15 })
    }, 300)
  }, [])

  const familySectionAnimatedStyle = useAnimatedStyle(() => ({
    opacity: familySectionOpacity.value,
    transform: [{ translateY: familySectionTranslateY.value }],
  }))

  const reportsCardOpacity = useSharedValue(0)
  const reportsCardTranslateY = useSharedValue(20)

  useEffect(() => {
    setTimeout(() => {
      reportsCardOpacity.value = withTiming(1, { duration: 500 })
      reportsCardTranslateY.value = withSpring(0, { damping: 15 })
    }, 400)
  }, [])

  const reportsCardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: reportsCardOpacity.value,
    transform: [{ translateY: reportsCardTranslateY.value }],
  }))

  const alertCardOpacity = useSharedValue(0)
  const alertCardTranslateY = useSharedValue(20)

  useEffect(() => {
    setTimeout(() => {
      alertCardOpacity.value = withTiming(1, { duration: 500 })
      alertCardTranslateY.value = withSpring(0, { damping: 15 })
    }, 500)
  }, [])

  const alertCardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: alertCardOpacity.value,
    transform: [{ translateY: alertCardTranslateY.value }],
  }))

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Image source={{ uri: "https://randomuser.me/api/portraits/men/8.jpg" }} style={styles.profileImage} />
          <View style={styles.headerText}>
            <Text style={styles.name}>John Doe</Text>
            <Text style={styles.location}>New York, USA</Text>
          </View>
        </View>

        <Animated.View style={[styles.card, styles.emergencyCard, emergencyCardAnimatedStyle]}>
          <Text style={styles.cardTitle}>Emergency Contacts</Text>
          {emergencyContacts.map((contact, index) => (
            <TouchableOpacity
              key={index}
              style={styles.emergencyContact}
              onPress={() => handleCallEmergencyContact(contact.number)}
            >
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactNumber}>{contact.number}</Text>
              </View>
              <Ionicons name="call" size={24} color="#28a745" />
            </TouchableOpacity>
          ))}
        </Animated.View>

        <Animated.View style={[styles.sectionContainer, familySectionAnimatedStyle]}>
          <Text style={styles.sectionTitle}>Virtual Family</Text>
          <FlatList
            horizontal
            data={virtualFamilyData}
            keyExtractor={(item) => item.id}
            renderItem={renderFamilyMember}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.familyList}
          />
        </Animated.View>

        <Animated.View style={[styles.card, styles.reportsCard, reportsCardAnimatedStyle]}>
          <Text style={styles.cardTitle}>Recent Reports</Text>
          {recentReports.map((report) => (
            <View key={report.id} style={styles.reportItem}>
              <Text style={styles.reportTitle}>{report.title}</Text>
              <Text style={styles.reportDescription}>{report.description}</Text>
            </View>
          ))}
        </Animated.View>

        <Animated.View style={[styles.card, styles.alertCard, alertCardAnimatedStyle]}>
          <Text style={styles.cardTitle}>Missing Person Alert</Text>
          <Text style={styles.alertName}>Name: {missingPersonAlert.name}</Text>
          <Text style={styles.alertDetails}>
            Age: {missingPersonAlert.age}, Location: {missingPersonAlert.location}
          </Text>
          <Text style={styles.alertDetails}>Details: {missingPersonAlert.details}</Text>
          <TouchableOpacity onPress={() => handleCallEmergencyContact(missingPersonAlert.contact)}>
            <Text style={styles.alertContact}>Contact: {missingPersonAlert.contact}</Text>
          </TouchableOpacity>
        </Animated.View>

        {mapRegion && (
          <View style={styles.mapContainer}>
            <Text style={styles.mapTitle}>Your Current Location</Text>
            <MapView 
              style={styles.map} 
              region={mapRegion}
            >
              <Marker 
                coordinate={{
                  latitude: mapRegion.latitude,
                  longitude: mapRegion.longitude,
                }} 
                title="Your Location" 
              />
            </MapView>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
  },
  headerText: {
    flexDirection: "column",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
  },
  location: {
    fontSize: 16,
    color: "#777",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emergencyCard: {
    backgroundColor: "#f8d7da",
  },
  reportsCard: {
    backgroundColor: "#e9ecef",
  },
  alertCard: {
    backgroundColor: "#fff3cd",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  emergencyContact: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  contactInfo: {
    flexDirection: "column",
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600",
  },
  contactNumber: {
    fontSize: 14,
    color: "#777",
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  familyList: {
    paddingRight: 20,
  },
  familyCard: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginRight: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  familyCardGradient: {
    flex: 1,
    padding: 10,
  },
  familyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    marginRight: 10,
  },
  familyInfo: {
    flex: 1,
  },
  familyName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  familyStatus: {
    fontSize: 12,
    color: "#28a745",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  locationButton: {
    padding: 5,
    borderRadius: 5,
  },
  locationInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationInfoIcon: {
    marginRight: 5,
  },
  locationInfoText: {
    fontSize: 10,
    color: "#757575",
  },
  reportItem: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  reportDescription: {
    fontSize: 14,
    color: "#555",
  },
  alertName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  alertDetails: {
    fontSize: 14,
    color: "#555",
  },
  alertContact: {
    fontSize: 14,
    color: "#007bff",
    textDecorationLine: "underline",
  },
  mapContainer: {
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: "bold",
    padding: 10,
    backgroundColor: "#fff",
  },
  map: {
    height: 300,
  },
})

export default ProfileScreen