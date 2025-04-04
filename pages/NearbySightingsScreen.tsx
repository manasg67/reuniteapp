import { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import useAuthStore from "../store/auth";

interface NearbySighting {
  id: number;
  location: string;
  latitude: number;
  longitude: number;
  missing_person_name: string;
  timestamp: string;
  verification_status: string;
}

export default function NearbySightingsScreen() {
  const [loading, setLoading] = useState(true);
  const [sightings, setSightings] = useState<NearbySighting[]>([]);
  const [region, setRegion] = useState({
    latitude: 12.971600,
    longitude: 77.594600,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const { tokens } = useAuthStore();

  useEffect(() => {
    (async () => {
      try {
        // Request location permissions
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Please enable location services to view nearby sightings.');
          setLoading(false);
          return;
        }

        // Get current location
        let location = await Location.getCurrentPositionAsync({});
        const newRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        setRegion(newRegion);

        // Fetch nearby sightings
        const response = await fetch(
          `https://15e1-150-107-18-153.ngrok-free.app/api/sightings/sightings/nearby/?latitude=${location.coords.latitude}&longitude=${location.coords.longitude}&radius=5`,
          {
            headers: {
              'Authorization': `Bearer ${tokens?.access}`,
              'Accept': 'application/json',
              'ngrok-skip-browser-warning': 'true'
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch nearby sightings');
        }

        const data = await response.json();
        setSightings(data);
      } catch (error) {
        console.error('Error:', error);
        Alert.alert('Error', 'Failed to load nearby sightings');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2B6CB0" />
          <Text style={styles.loadingText}>Loading nearby sightings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#1A365D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nearby Sightings</Text>
      </View>

      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {sightings.map((sighting) => (
          <Marker
            key={sighting.id}
            coordinate={{
              latitude: sighting.latitude,
              longitude: sighting.longitude,
            }}
            pinColor={sighting.verification_status === 'VERIFIED' ? '#48BB78' : '#A0AEC0'}
          >
            <Callout
              onPress={() => router.push({
                pathname: "/sightdetails",
                params: { id: sighting.id }
              })}
            >
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{sighting.missing_person_name}</Text>
                <Text style={styles.calloutText}>{sighting.location}</Text>
                <Text style={styles.calloutMeta}>
                  {new Date(sighting.timestamp).toLocaleDateString()}
                </Text>
                <Text style={styles.calloutLink}>Tap to view details</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A365D',
  },
  map: {
    flex: 1,
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
  callout: {
    padding: 8,
    minWidth: 200,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A365D',
    marginBottom: 4,
  },
  calloutText: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 4,
  },
  calloutMeta: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  calloutLink: {
    fontSize: 12,
    color: '#2B6CB0',
    fontWeight: '500',
  },
}); 