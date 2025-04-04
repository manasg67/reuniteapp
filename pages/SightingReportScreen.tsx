import React, { useState, useRef, useEffect } from "react"
import MapView, { Marker, Region } from 'react-native-maps'
import * as Location from 'expo-location'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Switch,
  Alert,
  Animated,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from "react-native"
import { Feather } from "@expo/vector-icons"
import { router } from 'expo-router'
import { SafeAreaView } from "react-native-safe-area-context"
import * as ImagePicker from "expo-image-picker"
import Slider from "@react-native-community/slider"
import DateTimePicker from "@react-native-community/datetimepicker"
import useAuthStore from "../store/auth"
import useProfileStore from "../store/profile"

interface MissingPersonData {
  id: number;
  case_number: string;
  name: string;
  age_when_missing: number;
  recent_photo: string | null;
  last_seen_location: string;
  last_seen_date: string;
  status: string;
  emergency_contact_phone: string;
  last_seen_details: string;
  last_seen_wearing: string;
  created_at: string;
}

interface Photo {
  id: string;
  uri: string;
}

interface FormData {
  missingPerson: MissingPersonData | null;
  location: string;
  latitude: string;
  longitude: string;
  location_type: "INDOOR" | "OUTDOOR";
  crowd_density: "LOW" | "MEDIUM" | "HIGH";
  observed_behavior: string;
  confidence_level_numeric: number;
  willing_to_contact: boolean;
  companions: "ALONE" | "WITH_ADULTS" | "WITH_CHILDREN" | "UNKNOWN";
  timestamp: Date;
  description: string;
  photos: Photo[];
  location_details: string;
  direction_headed: string;
  wearing: string;
  useCurrentLocation: boolean;
}

// Step component
const Step = ({ number, title, isActive, isCompleted }: { number: number, title: string, isActive: boolean, isCompleted: boolean }) => {
  return (
    <View style={styles.stepContainer}>
      <View style={[styles.stepCircle, isActive && styles.activeStepCircle, isCompleted && styles.completedStepCircle]}>
        {isCompleted ? (
          <Feather name="check" size={16} color="white" />
        ) : (
          <Text style={[styles.stepNumber, (isActive || isCompleted) && styles.activeStepNumber]}>{number}</Text>
        )}
      </View>
      <Text
        style={[
          styles.stepTitle,
          isActive && styles.activeStepTitle,
          !isActive && !isCompleted && styles.inactiveStepTitle,
        ]}
      >
        {title}
      </Text>
    </View>
  )
}

// Main component
export default function SightingReportScreen() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    missingPerson: null,
    location: "",
    latitude: "",
    longitude: "",
    location_type: "OUTDOOR",
    crowd_density: "MEDIUM",
    observed_behavior: "",
    confidence_level_numeric: 85,
    willing_to_contact: true,
    companions: "ALONE",
    timestamp: new Date(),
    description: "",
    photos: [],
    location_details: "",
    direction_headed: "",
    wearing: "",
    useCurrentLocation: true,
  })

  const [searchQuery, setSearchQuery] = useState("")
  const [showCamera, setShowCamera] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [missingPersons, setMissingPersons] = useState<MissingPersonData[]>([])
  const [filteredPersons, setFilteredPersons] = useState<MissingPersonData[]>([])
  const [userLocation, setUserLocation] = useState<Region | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const { tokens } = useAuthStore();
  const { profile } = useProfileStore();

  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current

  // Fetch missing persons data
  useEffect(() => {
    const fetchMissingPersons = async () => {
      try {
        const response = await fetch('https://15e1-150-107-18-153.ngrok-free.app/api/missing-persons/missing-persons/list_all/', {
          headers: {
            'Authorization': `Bearer ${tokens?.access}`,
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
        });
        const data = await response.json();
        setMissingPersons(data.results);
        setFilteredPersons(data.results);
      } catch (error) {
        console.error('Error fetching missing persons:', error);
        Alert.alert('Error', 'Failed to load missing persons data');
      }
    };

    fetchMissingPersons();
  }, []);

  // Filter missing persons based on search query
  React.useEffect(() => {
    if (searchQuery) {
      const filtered = missingPersons.filter(
        (person) =>
          person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          person.case_number.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredPersons(filtered)
    } else {
      setFilteredPersons(missingPersons)
    }
  }, [searchQuery, missingPersons])

  // Handle step transitions with animation
  const goToNextStep = () => {
    if (currentStep < 6) {
      // Start slide out animation
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStep(currentStep + 1)
        slideAnim.setValue(300)

        // Start slide in animation
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start()
      })
    }
  }

  const goToPrevStep = () => {
    if (currentStep > 1) {
      // Start slide out animation
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStep(currentStep - 1)
        slideAnim.setValue(-300)

        // Start slide in animation
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start()
      })
    }
  }

  // Handle form field changes
  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Handle missing person selection
  const selectMissingPerson = (person: any) => {
    updateFormData("missingPerson", person)
  }

  // Handle date time change
  const handleDateChange = (event: any, selectedDate: any) => {
    setShowDatePicker(false)
    if (selectedDate) {
      updateFormData("timestamp", selectedDate)
    }
  }

  // Handle photo capture
  const takePicture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()

    if (status !== "granted") {
      Alert.alert("Permission needed", "Camera permission is required to take photos")
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    })

    if (!result.canceled) {
      const newPhoto = {
        id: Date.now().toString(),
        uri: result.assets[0].uri,
      }
      updateFormData("photos", [...formData.photos, newPhoto])
    }
  }

  // Handle photo removal
  const removePhoto = (photoId: string) => {
    updateFormData("photos", formData.photos.filter((photo: Photo) => photo.id !== photoId))
  }

  // Handle behavior toggle
  const toggleBehavior = (behavior: string) => {
    const currentBehavior = formData.observed_behavior;
    const behaviors = currentBehavior ? currentBehavior.split(', ') : [];
    
    if (behaviors.includes(behavior)) {
      updateFormData(
        "observed_behavior",
        behaviors.filter(b => b !== behavior).join(', ')
      );
    } else {
      updateFormData(
        "observed_behavior",
        behaviors.length > 0 ? `${currentBehavior}, ${behavior}` : behavior
      );
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const formDataToSend = new FormData();
      
      // Add missing person ID if selected
      if (formData.missingPerson) {
        formDataToSend.append('missing_person', formData.missingPerson.id.toString());
      }

      // Format and validate location details
      if (!formData.location) {
        Alert.alert('Error', 'Please provide a location description');
        return;
      }
      if (!formData.location_details) {
        Alert.alert('Error', 'Please provide location details');
        return;
      }

      // Format coordinates to have max 9 digits total
      const formatCoordinate = (coord: string) => {
        const num = parseFloat(coord);
        return num.toFixed(6); // Format to 6 decimal places to stay within 9 total digits
      };

      // Add location details
      formDataToSend.append('location', formData.location);
      formDataToSend.append('latitude', formData.useCurrentLocation 
        ? formatCoordinate(userLocation?.latitude?.toString() || '') 
        : formatCoordinate(formData.latitude));
      formDataToSend.append('longitude', formData.useCurrentLocation 
        ? formatCoordinate(userLocation?.longitude?.toString() || '') 
        : formatCoordinate(formData.longitude));
      formDataToSend.append('location_type', formData.location_type);
      formDataToSend.append('crowd_density', formData.crowd_density);
      formDataToSend.append('location_details', formData.location_details);
      formDataToSend.append('direction_headed', formData.direction_headed || '');

      // Add behavioral details
      formDataToSend.append('observed_behavior', formData.observed_behavior || '');
      formDataToSend.append('confidence_level_numeric', formData.confidence_level_numeric.toString());
      formDataToSend.append('companions', formData.companions);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('wearing', formData.wearing || '');

      // Add timestamp
      formDataToSend.append('timestamp', formData.timestamp.toISOString());

      // Add willing to contact
      formDataToSend.append('willing_to_contact', formData.willing_to_contact.toString());

      // Add photo if available
      if (formData.photos.length > 0) {
        const photo = formData.photos[0];
        const photoName = photo.uri.split('/').pop() || 'photo.jpg';
        const photoFile = {
          uri: photo.uri,
          type: 'image/jpeg',
          name: photoName,
        };
        formDataToSend.append('photo', photoFile as any);
      }

      console.log('Submitting form data:', Object.fromEntries(formDataToSend));

      const response = await fetch('https://15e1-150-107-18-153.ngrok-free.app/api/sightings/sightings/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens?.access}`,
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        body: formDataToSend,
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('Server response:', responseData);
        const errorMessages = Object.entries(responseData)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');
        throw new Error(`Validation errors:\n${errorMessages}`);
      }

      // Show success message and navigate
      Alert.alert('Success', 'Sighting report submitted successfully');
      router.push("/sightlist");

    } catch (error) {
      console.error('Error submitting sighting report:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to submit sighting report. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Add location handling
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005
      };
      setUserLocation(region);
      
      // Update form data with location
      if (formData.useCurrentLocation) {
        updateFormData('latitude', location.coords.latitude.toString());
        updateFormData('longitude', location.coords.longitude.toString());
      }
    })();
  }, [formData.useCurrentLocation]);

  // Add SkeletonLoader component
  const SkeletonLoader = () => (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonSubtitle} />
      </View>
      
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonRow}>
          <View style={styles.skeletonLabel} />
          <View style={styles.skeletonValue} />
        </View>
        <View style={styles.skeletonRow}>
          <View style={styles.skeletonLabel} />
          <View style={styles.skeletonValue} />
        </View>
        <View style={styles.skeletonRow}>
          <View style={styles.skeletonLabel} />
          <View style={styles.skeletonValue} />
        </View>
        <View style={styles.skeletonRow}>
          <View style={styles.skeletonLabel} />
          <View style={styles.skeletonValue} />
        </View>
      </View>

      <View style={styles.skeletonFooter}>
        <View style={styles.skeletonButton} />
        <View style={styles.skeletonButton} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        {isSubmitting ? (
          <SkeletonLoader />
        ) : (
          <>
            <View style={styles.progressContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stepsContainer}>
                <Step number={1} title="Missing Person" isActive={currentStep === 1} isCompleted={currentStep > 1} />
                <View style={styles.stepDivider} />
                <Step number={2} title="Location" isActive={currentStep === 2} isCompleted={currentStep > 2} />
                <View style={styles.stepDivider} />
                <Step number={3} title="Evidence" isActive={currentStep === 3} isCompleted={currentStep > 3} />
                <View style={styles.stepDivider} />
                <Step number={4} title="Details" isActive={currentStep === 4} isCompleted={currentStep > 4} />
                <View style={styles.stepDivider} />
                <Step number={5} title="Reporter Info" isActive={currentStep === 5} isCompleted={currentStep > 5} />
                <View style={styles.stepDivider} />
                <Step number={6} title="Review" isActive={currentStep === 6} isCompleted={currentStep > 6} />
              </ScrollView>
            </View>
          </>
        )}

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View style={[styles.formContainer, { transform: [{ translateX: slideAnim }] }]}>
            {/* Step 1: Missing Person Selection */}
            {currentStep === 1 && (
              <View style={styles.stepContent}>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Select Missing Person</Text>

                  <View style={styles.searchContainer}>
                    <Feather name="search" size={16} color="#64748B" style={styles.searchIcon} />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search by name or case number..."
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

                  <Text style={styles.sectionTitle}>Recent Cases</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.recentCasesContainer}
                  >
                    {filteredPersons
                      .filter(p => new Date(p.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // Last 7 days
                      .map((person) => (
                        <TouchableOpacity
                          key={person.id}
                          style={[
                            styles.personCard,
                            formData.missingPerson?.id === person.id && styles.selectedPersonCard,
                          ]}
                          onPress={() => selectMissingPerson(person)}
                          activeOpacity={0.7}
                        >
                          <Image 
                            source={{ uri: person.recent_photo || 'https://via.placeholder.com/150' }} 
                            style={styles.personPhoto} 
                          />
                          <Text style={styles.personName} numberOfLines={1}>
                            {person.name}
                          </Text>
                          <Text style={styles.personAge}>{person.age_when_missing} years old</Text>
                          <Text style={styles.personLastSeen}>Last seen: {formatDate(person.last_seen_date)}</Text>
                        </TouchableOpacity>
                      ))}
                  </ScrollView>

                  <Text style={styles.sectionTitle}>All Missing Persons</Text>
                  <View style={styles.allPersonsContainer}>
                    {filteredPersons.map((person) => (
                      <TouchableOpacity
                        key={person.id}
                        style={[
                          styles.personListItem,
                          formData.missingPerson?.id === person.id && styles.selectedPersonListItem,
                        ]}
                        onPress={() => selectMissingPerson(person)}
                        activeOpacity={0.7}
                      >
                        <Image 
                          source={{ uri: person.recent_photo || 'https://via.placeholder.com/150' }} 
                          style={styles.personListPhoto} 
                        />
                        <View style={styles.personListInfo}>
                          <Text style={styles.personListName}>{person.name}</Text>
                          <Text style={styles.personListId}>Case #{person.case_number}</Text>
                          <Text style={styles.personListDetails}>
                            Last seen: {formatDate(person.last_seen_date)} at {person.last_seen_location}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.infoBox}>
                    <Feather name="info" size={20} color="#F59E0B" style={styles.infoIcon} />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoTitle}>Don't see the person?</Text>
                      <Text style={styles.infoText}>
                        You can still report a sighting without selecting a specific person.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.checkboxContainer}>
                    <TouchableOpacity
                      style={styles.checkbox}
                      onPress={() => {
                        updateFormData("missingPerson", null)
                        updateFormData("willing_to_contact", false)
                      }}
                    >
                      <View style={[styles.checkboxBox, !formData.willing_to_contact && styles.checkboxChecked]}>
                        {!formData.willing_to_contact && <Feather name="check" size={12} color="white" />}
                      </View>
                      <Text style={styles.checkboxLabel}>
                        I am not willing to be contacted for follow-up questions
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Date and Time</Text>

                  <TouchableOpacity style={styles.dateTimeButton} onPress={() => setShowDatePicker(true)}>
                    <Text style={styles.dateTimeLabel}>When did you see this person?</Text>
                    <View style={styles.dateTimeDisplay}>
                      <Text style={styles.dateTimeText}>{formatDate(formData.timestamp.toISOString())}</Text>
                      <Feather name="calendar" size={16} color="#1A365D" />
                    </View>
                  </TouchableOpacity>

                  {showDatePicker && (
                    <DateTimePicker
                      value={formData.timestamp}
                      mode="datetime"
                      display="default"
                      style={{ marginTop: 20 }}
                      onChange={handleDateChange}
                    />
                  )}
                </View>

                <View style={styles.navigationButtons}>
                  <TouchableOpacity style={styles.nextButton} onPress={goToNextStep}>
                    <Text style={styles.nextButtonText}>Next Step</Text>
                    <Feather name="arrow-right" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Step 2: Location Details */}
            {currentStep === 2 && (
              <View style={styles.stepContent}>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Location Information</Text>

                  <View style={styles.mapContainer}>
                    {userLocation ? (
                      <MapView
                        style={styles.map}
                        initialRegion={userLocation}
                        showsUserLocation={true}
                        showsMyLocationButton={true}
                        onRegionChangeComplete={(region) => {
                          if (!formData.useCurrentLocation) {
                            updateFormData('location', `${region.latitude}, ${region.longitude}`)
                          }
                        }}
                      >
                        <Marker
                          coordinate={{
                            latitude: userLocation.latitude,
                            longitude: userLocation.longitude,
                          }}
                          title="Current Location"
                        />
                      </MapView>
                    ) : errorMsg ? (
                      <View style={styles.mapPlaceholder}>
                        <Feather name="alert-triangle" size={32} color="#EF4444" />
                        <Text style={styles.mapPlaceholderText}>{errorMsg}</Text>
                      </View>
                    ) : (
                      <View style={styles.mapPlaceholder}>
                        <Feather name="map-pin" size={32} color="#2B6CB0" />
                        <Text style={styles.mapPlaceholderText}>Loading Map...</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Address or Description</Text>
                    <TextInput
                      style={styles.textArea}
                      placeholder="Enter the address or describe the location..."
                      value={formData.location}
                      onChangeText={(text) => updateFormData("location", text)}
                      multiline
                      numberOfLines={3}
                      placeholderTextColor="#64748B"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>
                      Location Details
                      <Text style={styles.requiredLabel}> (required)</Text>
                    </Text>
                    <TextInput
                      style={styles.textArea}
                      placeholder="Provide specific details about the location (e.g., near which store, which floor, specific landmarks)..."
                      value={formData.location_details}
                      onChangeText={(text) => updateFormData("location_details", text)}
                      multiline
                      numberOfLines={3}
                      placeholderTextColor="#64748B"
                    />
                    <Text style={styles.inputHelp}>
                      Include any landmarks, specific areas, or details that would help locate the exact spot
                    </Text>
                  </View>

                  <View style={styles.switchContainer}>
                    <Text style={styles.switchLabel}>Use my current location</Text>
                    <Switch
                      value={formData.useCurrentLocation}
                      onValueChange={(value) => updateFormData("useCurrentLocation", value)}
                      trackColor={{ false: "#E2E8F0", true: "#2B6CB0" }}
                      thumbColor="white"
                    />
                  </View>

                  <Text style={styles.sectionTitle}>Direction of Travel</Text>
                  <View style={styles.directionGrid}>
                    {[
                      "North",
                      "East",
                      "South",
                      "West",
                      "Northeast",
                      "Northwest",
                      "Southeast",
                      "Southwest",
                      "Unknown",
                    ].map((direction) => (
                      <TouchableOpacity 
                        key={direction} 
                        style={[
                          styles.directionButton,
                          formData.direction_headed === direction && styles.selectedDirectionButton
                        ]} 
                        onPress={() => updateFormData("direction_headed", direction)}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.directionButtonText,
                          formData.direction_headed === direction && styles.selectedDirectionButtonText
                        ]}>
                          {direction}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Environment</Text>

                  <Text style={styles.sectionTitle}>Location Type</Text>
                  <View style={styles.radioGroup}>
                    <TouchableOpacity
                      style={styles.radioOption}
                      onPress={() => updateFormData("location_type", "INDOOR")}
                    >
                      <View style={styles.radioButton}>
                        {formData.location_type === "INDOOR" && <View style={styles.radioButtonSelected} />}
                      </View>
                      <Text style={styles.radioLabel}>Indoor</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.radioOption}
                      onPress={() => updateFormData("location_type", "OUTDOOR")}
                    >
                      <View style={styles.radioButton}>
                        {formData.location_type === "OUTDOOR" && <View style={styles.radioButtonSelected} />}
                      </View>
                      <Text style={styles.radioLabel}>Outdoor</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.sectionTitle}>Crowd Density</Text>
                  <View style={styles.radioGroup}>
                    <TouchableOpacity
                      style={styles.radioOption}
                      onPress={() => updateFormData("crowd_density", "LOW")}
                    >
                      <View style={styles.radioButton}>
                        {formData.crowd_density === "LOW" && <View style={styles.radioButtonSelected} />}
                      </View>
                      <Text style={styles.radioLabel}>Empty/Few People</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.radioOption}
                      onPress={() => updateFormData("crowd_density", "MEDIUM")}
                    >
                      <View style={styles.radioButton}>
                        {formData.crowd_density === "MEDIUM" && <View style={styles.radioButtonSelected} />}
                      </View>
                      <Text style={styles.radioLabel}>Moderately Crowded</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.radioOption}
                      onPress={() => updateFormData("crowd_density", "HIGH")}
                    >
                      <View style={styles.radioButton}>
                        {formData.crowd_density === "HIGH" && <View style={styles.radioButtonSelected} />}
                      </View>
                      <Text style={styles.radioLabel}>Very Crowded</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.navigationButtons}>
                  <TouchableOpacity style={styles.backButton} onPress={goToPrevStep}>
                    <Feather name="arrow-left" size={16} color="#1A365D" />
                    <Text style={styles.backButtonText}>Previous</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.nextButton}
                    onPress={goToNextStep}
                    disabled={!formData.location && !formData.useCurrentLocation}
                  >
                    <Text style={styles.nextButtonText}>Next Step</Text>
                    <Feather name="arrow-right" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Step 3: Visual Evidence */}
            {currentStep === 3 && (
              <View style={styles.stepContent}>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Visual Evidence</Text>

                  {showCamera ? (
                    <View style={styles.cameraContainer}>
                      <View style={styles.cameraPlaceholder}>
                        <Feather name="camera" size={48} color="white" />
                        <Text style={styles.cameraPlaceholderText}>Camera Preview</Text>
                      </View>

                      <View style={styles.cameraControls}>
                        <TouchableOpacity style={styles.cameraButton} onPress={() => setShowCamera(false)}>
                          <Feather name="x" size={24} color="white" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                          <View style={styles.captureButtonInner} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cameraButton} onPress={() => console.log("Switch camera")}>
                          <Feather name="refresh-cw" size={24} color="white" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View>
                      {formData.photos.length > 0 ? (
                        <View>
                          <View style={styles.photosGrid}>
                            {formData.photos.map((photo) => (
                              <View key={photo.id} style={styles.photoItem}>
                                <Image source={{ uri: photo.uri }} style={styles.photoThumbnail} />
                                <TouchableOpacity
                                  style={styles.removePhotoButton}
                                  onPress={() => removePhoto(photo.id)}
                                >
                                  <Feather name="x" size={12} color="white" />
                                </TouchableOpacity>
                              </View>
                            ))}
                          </View>

                          <TouchableOpacity style={styles.addPhotoButton} onPress={() => setShowCamera(true)}>
                            <Feather name="camera" size={16} color="#1A365D" />
                            <Text style={styles.addPhotoButtonText}>Take Another Photo</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View style={styles.noPhotosContainer}>
                          <Feather name="camera" size={32} color="#64748B" />
                          <Text style={styles.noPhotosTitle}>No Photos Yet</Text>
                          <Text style={styles.noPhotosDescription}>
                            Photos can help verify the sighting and assist in the search
                          </Text>
                          <TouchableOpacity style={styles.takePhotoButton} onPress={() => setShowCamera(true)}>
                            <Feather name="camera" size={16} color="white" />
                            <Text style={styles.takePhotoButtonText}>Take a Photo</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  )}

                  <View style={styles.infoBox}>
                    <Feather name="info" size={20} color="#2B6CB0" style={styles.infoIcon} />
                    <Text style={styles.infoText}>
                      Photos are optional but highly encouraged. They can help verify the sighting and assist in the
                      search efforts.
                    </Text>
                  </View>
                </View>

                <View style={styles.card}>
                  <Text style={styles.cardTitle}>No Photo Option</Text>

                  <Text style={styles.noPhotoText}>
                    If you were unable to take a photo, you can still submit a text-only report with detailed
                    description.
                  </Text>

                  <TouchableOpacity style={styles.continueWithoutPhotoButton} onPress={goToNextStep}>
                    <Text style={styles.continueWithoutPhotoText}>Continue Without Photo</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.navigationButtons}>
                  <TouchableOpacity style={styles.backButton} onPress={goToPrevStep}>
                    <Feather name="arrow-left" size={16} color="#1A365D" />
                    <Text style={styles.backButtonText}>Previous</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.nextButton} onPress={goToNextStep}>
                    <Text style={styles.nextButtonText}>Next Step</Text>
                    <Feather name="arrow-right" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Step 4: Description & Details */}
            {currentStep === 4 && (
              <View style={styles.stepContent}>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Description & Details</Text>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>
                      Detailed Description
                      <Text style={styles.requiredLabel}> (required)</Text>
                    </Text>
                    <TextInput
                      style={[styles.textArea, styles.largeTextArea]}
                      placeholder="Describe what you saw in as much detail as possible. Include clothing, behavior, and any other notable details..."
                      value={formData.description}
                      onChangeText={(text) => updateFormData("description", text)}
                      multiline
                      numberOfLines={5}
                      placeholderTextColor="#64748B"
                    />
                    <Text style={styles.inputHelp}>
                      Be specific about clothing, physical appearance, and any distinguishing features.
                    </Text>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Appearance Details</Text>
                    <TextInput
                      style={styles.textArea}
                      placeholder="Describe the person's appearance, clothing, and any distinguishing features..."
                      value={formData.wearing}
                      onChangeText={(text) => updateFormData("wearing", text)}
                      multiline
                      numberOfLines={3}
                      placeholderTextColor="#64748B"
                    />
                  </View>

                  <Text style={styles.sectionTitle}>Companions</Text>
                  <View style={styles.radioGroup}>
                    <TouchableOpacity style={styles.radioOption} onPress={() => updateFormData("companions", "ALONE")}>
                      <View style={styles.radioButton}>
                        {formData.companions === "ALONE" && <View style={styles.radioButtonSelected} />}
                      </View>
                      <Text style={styles.radioLabel}>Person was alone</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.radioOption}
                      onPress={() => updateFormData("companions", "WITH_ADULTS")}
                    >
                      <View style={styles.radioButton}>
                        {formData.companions === "WITH_ADULTS" && <View style={styles.radioButtonSelected} />}
                      </View>
                      <Text style={styles.radioLabel}>With other adults</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.radioOption}
                      onPress={() => updateFormData("companions", "WITH_CHILDREN")}
                    >
                      <View style={styles.radioButton}>
                        {formData.companions === "WITH_CHILDREN" && <View style={styles.radioButtonSelected} />}
                      </View>
                      <Text style={styles.radioLabel}>With children</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.radioOption}
                      onPress={() => updateFormData("companions", "UNKNOWN")}
                    >
                      <View style={styles.radioButton}>
                        {formData.companions === "UNKNOWN" && <View style={styles.radioButtonSelected} />}
                      </View>
                      <Text style={styles.radioLabel}>Unsure</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.sectionTitle}>Observed Behavior</Text>
                  <View style={styles.checkboxGrid}>
                    {["distressed", "calm", "confused", "agitated", "fearful", "normal", "intoxicated", "injured"].map(
                      (behavior) => (
                        <TouchableOpacity
                          key={behavior}
                          style={styles.behaviorCheckbox}
                          onPress={() => toggleBehavior(behavior)}
                        >
                          <View
                            style={[styles.checkboxBox, formData.observed_behavior.includes(behavior) && styles.checkboxChecked]}
                          >
                            {formData.observed_behavior.includes(behavior) && <Feather name="check" size={12} color="white" />}
                          </View>
                          <Text style={styles.checkboxLabel}>
                            {behavior.charAt(0).toUpperCase() + behavior.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ),
                    )}
                  </View>

                  <Text style={styles.sectionTitle}>Confidence Level</Text>
                  <View style={styles.confidenceContainer}>
                    <Text style={styles.confidenceLabel}>Low</Text>
                    <Slider
                      style={styles.confidenceSlider}
                      minimumValue={0}
                      maximumValue={100}
                      step={10}
                      value={formData.confidence_level_numeric}
                      onValueChange={(value) => updateFormData("confidence_level_numeric", value)}
                      minimumTrackTintColor="#2B6CB0"
                      maximumTrackTintColor="#E2E8F0"
                      thumbTintColor="#2B6CB0"
                    />
                    <Text style={styles.confidenceLabel}>High</Text>
                  </View>
                  <Text style={styles.confidenceValue}>{formData.confidence_level_numeric}% confident in identification</Text>
                </View>

                <View style={styles.navigationButtons}>
                  <TouchableOpacity style={styles.backButton} onPress={goToPrevStep}>
                    <Feather name="arrow-left" size={16} color="#1A365D" />
                    <Text style={styles.backButtonText}>Previous</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.nextButton} onPress={goToNextStep} disabled={!formData.description}>
                    <Text style={styles.nextButtonText}>Next Step</Text>
                    <Feather name="arrow-right" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Step 5: Reporter Information */}
            {currentStep === 5 && (
              <View style={styles.stepContent}>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Reporter Information</Text>

                  <View style={styles.infoBox}>
                    <Feather name="info" size={20} color="#2B6CB0" style={styles.infoIcon} />
                    <Text style={styles.infoText}>
                      Your information helps us verify sightings and may be crucial for follow-up. We respect your
                      privacy and will only use this information for the purpose of this investigation.
                    </Text>
                  </View>

                  <View style={styles.checkboxContainer}>
                    <TouchableOpacity
                      style={styles.checkbox}
                      onPress={() => updateFormData("willing_to_contact", !formData.willing_to_contact)}
                    >
                      <View style={[styles.checkboxBox, formData.willing_to_contact && styles.checkboxChecked]}>
                        {formData.willing_to_contact && <Feather name="check" size={12} color="white" />}
                      </View>
                      <Text style={styles.checkboxLabel}>
                        I am willing to be contacted for follow-up questions
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.divider} />

                  <Text style={styles.legalText}>By submitting this report, you confirm that:</Text>
                  <View style={styles.legalList}>
                    <View style={styles.legalItem}>
                      <View style={styles.legalBullet} />
                      <Text style={styles.legalItemText}>
                        The information provided is accurate to the best of your knowledge
                      </Text>
                    </View>
                    <View style={styles.legalItem}>
                      <View style={styles.legalBullet} />
                      <Text style={styles.legalItemText}>
                        You understand that filing a false report may have legal consequences
                      </Text>
                    </View>
                    <View style={styles.legalItem}>
                      <View style={styles.legalBullet} />
                      <Text style={styles.legalItemText}>You are willing to assist in the investigation if needed</Text>
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={[styles.submitButton, !formData.description && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={!formData.description}
                  >
                    <Text style={styles.submitButtonText}>Submit Report</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.navigationButtons}>
                  <TouchableOpacity style={styles.backButton} onPress={goToPrevStep}>
                    <Feather name="arrow-left" size={16} color="#1A365D" />
                    <Text style={styles.backButtonText}>Previous</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.nextButton} onPress={goToNextStep}>
                    <Text style={styles.nextButtonText}>Review Report</Text>
                    <Feather name="arrow-right" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Step 6: Review & Submit */}
            {currentStep === 6 && (
              <View style={styles.stepContent}>
                <View style={styles.confirmationContainer}>
                  <View style={styles.confirmationIcon}>
                    <Feather name="check" size={32} color="#48BB78" />
                  </View>

                  <Text style={styles.confirmationTitle}>Report Submitted</Text>
                  <Text style={styles.confirmationDescription}>
                    Thank you for your report. Your information has been received and will be reviewed promptly.
                  </Text>

                  <View style={styles.confirmationNumber}>
                    <Text style={styles.confirmationNumberLabel}>Confirmation Number</Text>
                    <Text style={styles.confirmationNumberValue}>
                      SR-
                      {Math.floor(Math.random() * 10000)
                        .toString()
                        .padStart(4, "0")}
                    </Text>
                  </View>

                  <Text style={styles.nextStepsTitle}>What happens next?</Text>
                  <View style={styles.nextStepsList}>
                    <View style={styles.nextStepsItem}>
                      <View style={styles.nextStepsBullet} />
                      <Text style={styles.nextStepsText}>Your report will be reviewed by our team</Text>
                    </View>
                    <View style={styles.nextStepsItem}>
                      <View style={styles.nextStepsBullet} />
                      <Text style={styles.nextStepsText}>
                        The information will be cross-referenced with our database
                      </Text>
                    </View>
                    <View style={styles.nextStepsItem}>
                      <View style={styles.nextStepsBullet} />
                      <Text style={styles.nextStepsText}>
                        If you provided contact information, you may be contacted for follow-up
                      </Text>
                    </View>
                    <View style={styles.nextStepsItem}>
                      <View style={styles.nextStepsBullet} />
                      <Text style={styles.nextStepsText}>
                        The missing person's family will be notified if appropriate
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={styles.returnButton} 
                    onPress={() => router.push("/sightlist")}
                  >
                    <Text style={styles.returnButtonText}>Return to Sightings List</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  progressContainer: {
    backgroundColor: "white",
    marginTop: 40,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  stepsContainer: {
    paddingHorizontal: 20,
    alignItems: "center",
  },
  stepContainer: {
    alignItems: "center",
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  activeStepCircle: {
    borderColor: "#2B6CB0",
    backgroundColor: "#E0F2FE",
  },
  completedStepCircle: {
    backgroundColor: "#48BB78",
    borderColor: "#48BB78",
  },
  stepNumber: {
    fontSize: 14,
    color: "#6B7280",
  },
  activeStepNumber: {
    color: "#2B6CB0",
  },
  stepTitle: {
    fontSize: 12,
    marginTop: 5,
    color: "#6B7280",
  },
  activeStepTitle: {
    color: "#2B6CB0",
    fontWeight: "bold",
  },
  inactiveStepTitle: {
    color: "#9CA3AF",
  },
  stepDivider: {
    width: 20,
    height: 1,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 10,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  formContainer: {
    width: Dimensions.get("window").width,
    paddingHorizontal: 20,
  },
  stepContent: {
    paddingVertical: 20,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A365D",
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    height: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 10,
  },
  recentCasesContainer: {
    paddingVertical: 10,
  },
  personCard: {
    width: 120,
    marginRight: 15,
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedPersonCard: {
    backgroundColor: "#E0F2FE",
    borderColor: "#2B6CB0",
  },
  personPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  personName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    textAlign: "center",
  },
  personAge: {
    fontSize: 12,
    color: "#6B7280",
  },
  personLastSeen: {
    fontSize: 12,
    color: "#6B7280",
  },
  allPersonsContainer: {
    marginTop: 10,
  },
  personListItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 6,
    backgroundColor: "#F9FAFB",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedPersonListItem: {
    backgroundColor: "#E0F2FE",
    borderColor: "#2B6CB0",
  },
  personListPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  personListInfo: {
    flex: 1,
  },
  personListName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  personListId: {
    fontSize: 14,
    color: "#6B7280",
  },
  personListDetails: {
    fontSize: 14,
    color: "#6B7280",
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#FFFBEB",
    padding: 15,
    borderRadius: 6,
    marginTop: 20,
  },
  infoIcon: {
    marginRight: 10,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1A365D",
    marginBottom: 3,
  },
  infoText: {
    fontSize: 14,
    color: "#4B5563",
  },
  checkboxContainer: {
    marginTop: 20,
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: "#2B6CB0",
    borderColor: "#2B6CB0",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#374151",
  },
  dateTimeButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
    padding: 15,
    marginTop: 10,
  },
  dateTimeLabel: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom:5,

  },
  dateTimeDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateTimeText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1A365D",
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },
  nextButton: {
    backgroundColor: "#2B6CB0",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    marginRight: 8,
  },
  backButton: {
    backgroundColor: "#E5E7EB",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  backButtonText: {
    color: "#1A365D",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  mapContainer: {
    height: 200,
    borderRadius: 6,
    marginTop: 10,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject, // Fills the container
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  mapPlaceholderText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2B6CB0',
    marginTop: 5,
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 5,
  },
  currentLocationMarker: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -15 }, { translateY: -15 }],
  },
  currentLocationDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#2B6CB0",
    alignItems: "center",
    justifyContent: "center",
  },
  currentLocationInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "white",
  },
  currentLocationRing: {
    position: "absolute",
    top: -5,
    left: -5,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(43, 108, 176, 0.3)",
  },
  inputContainer: {
    marginTop: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#374151",
  },
  textArea: {
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#374151",
    textAlignVertical: "top",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
  },
  switchLabel: {
    fontSize: 16,
    color: "#374151",
  },
  directionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  directionButton: {
    width: "30%",
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  directionButtonText: {
    fontSize: 14,
    color: "#374151",
  },
  radioGroup: {
    marginTop: 10,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#2B6CB0",
  },
  radioLabel: {
    fontSize: 16,
    color: "#374151",
  },
  cameraContainer: {
    backgroundColor: "#1F2937",
    borderRadius: 8,
    overflow: "hidden",
  },
  cameraPlaceholder: {
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraPlaceholderText: {
    fontSize: 16,
    color: "white",
    marginTop: 10,
  },
  cameraControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 15,
  },
  cameraButton: {
    backgroundColor: "#374151",
    borderRadius: 999,
    padding: 12,
  },
  captureButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  captureButtonInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#374151",
  },
  photosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  photoItem: {
    width: "30%",
    marginRight: "3.33%",
    marginBottom: 10,
    position: "relative",
  },
  photoThumbnail: {
    width: "100%",
    height: 100,
    borderRadius: 6,
  },
  removePhotoButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 999,
    padding: 3,
  },
  addPhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginTop: 10,
  },
  addPhotoButtonText: {
    fontSize: 16,
    color: "#1A365D",
    marginLeft: 8,
  },
  noPhotosContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  noPhotosTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#374151",
    marginTop: 10,
  },
  noPhotosDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 5,
  },
  takePhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2B6CB0",
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginTop: 20,
  },
  takePhotoButtonText: {
    fontSize: 16,
    color: "white",
    marginLeft: 8,
  },
  noPhotoText: {
    fontSize: 16,
    color: "#374151",
    textAlign: "center",
    marginBottom: 20,
  },
  continueWithoutPhotoButton: {
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 25,
    alignItems: "center",
  },
  continueWithoutPhotoText: {
    fontSize: 16,
    color: "#1A365D",
  },
  requiredLabel: {
    color: "#EF4444",
  },
  inputHelp: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 5,
  },
  largeTextArea: {
    height: 120,
  },
  checkboxGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  behaviorCheckbox: {
    width: "45%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  confidenceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  confidenceLabel: {
    fontSize: 14,
    color: "#374151",
    width: 40,
  },
  confidenceSlider: {
    flex: 1,
    marginHorizontal: 10,
  },
  confidenceValue: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: "#48BB78",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  confirmationContainer: {
    alignItems: "center",
  },
  confirmationIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  confirmationTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1A365D",
    marginBottom: 10,
  },
  confirmationDescription: {
    fontSize: 16,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 20,
  },
  confirmationNumber: {
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
    padding: 15,
    marginBottom: 20,
  },
  confirmationNumberLabel: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 5,
  },
  confirmationNumberValue: {
    fontSize: 18,
    fontWeight: "500",
    color: "#1A365D",
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#1A365D",
    marginTop: 20,
    marginBottom: 10,
  },
  nextStepsList: {
    marginLeft: 20,
  },
  nextStepsItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  nextStepsBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4B5563",
    marginTop: 6,
    marginRight: 8,
  },
  nextStepsText: {
    fontSize: 14,
    color: "#4B5563",
  },
  returnButton: {
    backgroundColor: "#2B6CB0",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 6,
    marginTop: 30,
  },
  returnButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "500",
  },
  skeletonContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  skeletonHeader: {
    marginBottom: 30,
  },
  skeletonTitle: {
    height: 24,
    width: '60%',
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonSubtitle: {
    height: 16,
    width: '40%',
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  skeletonContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  skeletonLabel: {
    height: 16,
    width: '30%',
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  skeletonValue: {
    height: 16,
    width: '60%',
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  skeletonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  skeletonButton: {
    height: 44,
    width: '45%',
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
  },
  disabledText: {
    color: "#9CA3AF",
  },
  checkboxDisabled: {
    backgroundColor: "#F3F4F6",
    borderColor: "#F3F4F6",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 20,
  },
  legalText: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 10,
  },
  legalList: {
    marginLeft: 20,
  },
  legalItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  legalBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4B5563",
    marginTop: 6,
    marginRight: 8,
  },
  legalItemText: {
    fontSize: 14,
    color: "#4B5563",
  },
  selectedDirectionButton: {
    backgroundColor: "#2B6CB0",
  },
  selectedDirectionButtonText: {
    color: "white",
    fontWeight: "500",
  },
})

