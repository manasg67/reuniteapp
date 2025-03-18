import React, { useState, useRef } from "react"
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

// Mock data for missing persons
const mockMissingPersons = [
  {
    id: "MP-2023-0089",
    name: "Sarah Johnson",
    age: 28,
    lastSeen: "2 days ago",
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
    isRecent: true,
  },
  {
    id: "MP-2023-0076",
    name: "Michael Chen",
    age: 34,
    lastSeen: "5 days ago",
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
    isRecent: true,
  },
  {
    id: "MP-2023-0102",
    name: "David Wilson",
    age: 17,
    lastSeen: "1 week ago",
    photo: "https://randomuser.me/api/portraits/men/67.jpg",
    isRecent: true,
  },
  {
    id: "MP-2023-0065",
    name: "Emily Rodriguez",
    age: 22,
    lastSeen: "2 weeks ago",
    photo: "https://randomuser.me/api/portraits/women/33.jpg",
    isRecent: false,
  },
  {
    id: "MP-2023-0054",
    name: "James Thompson",
    age: 41,
    lastSeen: "3 weeks ago",
    photo: "https://randomuser.me/api/portraits/men/45.jpg",
    isRecent: false,
  },
]

interface Photo {
  id: string;
  uri: string;
}

interface FormData {
  missingPerson: any;
  dateTime: Date;
  location: string;
  useCurrentLocation: boolean;
  isEmergency: boolean;
  photos: Photo[];
  description: string;
  appearance: string;
  companions: string;
  behavior: string[];
  confidenceLevel: number;
  reporterName: string;
  reporterContact: string;
  isAnonymous: boolean;
  allowFollowUp: boolean;
  locationType: string;
  crowdDensity: string;
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
  const [formData, setFormData] = useState<FormData>({
    missingPerson: null,
    dateTime: new Date(),
    location: "",
    useCurrentLocation: true,
    isEmergency: false,
    photos: [],
    description: "",
    appearance: "",
    companions: "alone",
    behavior: [],
    confidenceLevel: 70,
    reporterName: "",
    reporterContact: "",
    isAnonymous: false,
    allowFollowUp: true,
    locationType: "",
    crowdDensity: "",
  })

  const [searchQuery, setSearchQuery] = useState("")
  const [showCamera, setShowCamera] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [filteredPersons, setFilteredPersons] = useState(mockMissingPersons)
  const [userLocation, setUserLocation] = useState<Region | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied')
        return
      }

      let location = await Location.getCurrentPositionAsync({})
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      })
      
      // Update formData with coordinates if using current location
      if (formData.useCurrentLocation) {
        updateFormData('location', `${location.coords.latitude}, ${location.coords.longitude}`)
      }
    })()
  }, [])

  // Filter missing persons based on search query
  React.useEffect(() => {
    if (searchQuery) {
      const filtered = mockMissingPersons.filter(
        (person) =>
          person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          person.id.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredPersons(filtered)
    } else {
      setFilteredPersons(mockMissingPersons)
    }
  }, [searchQuery])

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
      updateFormData("dateTime", selectedDate)
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
    if (formData.behavior.includes(behavior)) {
      updateFormData("behavior", formData.behavior.filter((b) => b !== behavior))
    } else {
      updateFormData("behavior", [...formData.behavior, behavior])
    }
  }

  // Handle form submission
  const handleSubmit = () => {
    // In a real app, this would send the data to a server
    console.log("Submitting report:", formData)

    // Animate to confirmation screen
    Animated.timing(slideAnim, {
      toValue: -300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCurrentStep(7) // Go to confirmation step
      slideAnim.setValue(300)

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start()
    })
  }

  // Format date for display
  const formatDate = (date: any) => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    })
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
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
                      placeholder="Search by name or ID..."
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
                    {mockMissingPersons
                      .filter((p) => p.isRecent)
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
                          <Image source={{ uri: person.photo }} style={styles.personPhoto} />
                          <Text style={styles.personName} numberOfLines={1}>
                            {person.name}
                          </Text>
                          <Text style={styles.personAge}>{person.age} years old</Text>
                          <Text style={styles.personLastSeen}>Last seen: {person.lastSeen}</Text>
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
                        <Image source={{ uri: person.photo }} style={styles.personListPhoto} />
                        <View style={styles.personListInfo}>
                          <Text style={styles.personListName}>{person.name}</Text>
                          <Text style={styles.personListId}>{person.id}</Text>
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
                        updateFormData("isEmergency", !formData.isEmergency)
                      }}
                    >
                      <View style={[styles.checkboxBox, formData.isEmergency && styles.checkboxChecked]}>
                        {formData.isEmergency && <Feather name="check" size={12} color="white" />}
                      </View>
                      <Text style={styles.checkboxLabel}>
                        This is an emergency situation requiring immediate attention
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Date and Time</Text>

                  <TouchableOpacity style={styles.dateTimeButton} onPress={() => setShowDatePicker(true)}>
                    <Text style={styles.dateTimeLabel}>When did you see this person?</Text>
                    <View style={styles.dateTimeDisplay}>
                      <Text style={styles.dateTimeText}>{formatDate(formData.dateTime)}</Text>
                      <Feather name="calendar" size={16} color="#1A365D" />
                    </View>
                  </TouchableOpacity>

                  {showDatePicker && (
                    <DateTimePicker
                      value={formData.dateTime}
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
                      <TouchableOpacity key={direction} style={styles.directionButton} activeOpacity={0.7}>
                        <Text style={styles.directionButtonText}>{direction}</Text>
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
                      onPress={() => updateFormData("locationType", "indoor")}
                    >
                      <View style={styles.radioButton}>
                        {formData.locationType === "indoor" && <View style={styles.radioButtonSelected} />}
                      </View>
                      <Text style={styles.radioLabel}>Indoor</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.radioOption}
                      onPress={() => updateFormData("locationType", "outdoor")}
                    >
                      <View style={styles.radioButton}>
                        {formData.locationType === "outdoor" && <View style={styles.radioButtonSelected} />}
                      </View>
                      <Text style={styles.radioLabel}>Outdoor</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.sectionTitle}>Crowd Density</Text>
                  <View style={styles.radioGroup}>
                    <TouchableOpacity
                      style={styles.radioOption}
                      onPress={() => updateFormData("crowdDensity", "empty")}
                    >
                      <View style={styles.radioButton}>
                        {formData.crowdDensity === "empty" && <View style={styles.radioButtonSelected} />}
                      </View>
                      <Text style={styles.radioLabel}>Empty/Few People</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.radioOption}
                      onPress={() => updateFormData("crowdDensity", "moderate")}
                    >
                      <View style={styles.radioButton}>
                        {formData.crowdDensity === "moderate" && <View style={styles.radioButtonSelected} />}
                      </View>
                      <Text style={styles.radioLabel}>Moderately Crowded</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.radioOption}
                      onPress={() => updateFormData("crowdDensity", "crowded")}
                    >
                      <View style={styles.radioButton}>
                        {formData.crowdDensity === "crowded" && <View style={styles.radioButtonSelected} />}
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
                      value={formData.appearance}
                      onChangeText={(text) => updateFormData("appearance", text)}
                      multiline
                      numberOfLines={3}
                      placeholderTextColor="#64748B"
                    />
                  </View>

                  <Text style={styles.sectionTitle}>Companions</Text>
                  <View style={styles.radioGroup}>
                    <TouchableOpacity style={styles.radioOption} onPress={() => updateFormData("companions", "alone")}>
                      <View style={styles.radioButton}>
                        {formData.companions === "alone" && <View style={styles.radioButtonSelected} />}
                      </View>
                      <Text style={styles.radioLabel}>Person was alone</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.radioOption}
                      onPress={() => updateFormData("companions", "with-adults")}
                    >
                      <View style={styles.radioButton}>
                        {formData.companions === "with-adults" && <View style={styles.radioButtonSelected} />}
                      </View>
                      <Text style={styles.radioLabel}>With other adults</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.radioOption}
                      onPress={() => updateFormData("companions", "with-children")}
                    >
                      <View style={styles.radioButton}>
                        {formData.companions === "with-children" && <View style={styles.radioButtonSelected} />}
                      </View>
                      <Text style={styles.radioLabel}>With children</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.radioOption}
                      onPress={() => updateFormData("companions", "unknown")}
                    >
                      <View style={styles.radioButton}>
                        {formData.companions === "unknown" && <View style={styles.radioButtonSelected} />}
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
                            style={[styles.checkboxBox, formData.behavior.includes(behavior) && styles.checkboxChecked]}
                          >
                            {formData.behavior.includes(behavior) && <Feather name="check" size={12} color="white" />}
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
                      value={formData.confidenceLevel}
                      onValueChange={(value) => updateFormData("confidenceLevel", value)}
                      minimumTrackTintColor="#2B6CB0"
                      maximumTrackTintColor="#E2E8F0"
                      thumbTintColor="#2B6CB0"
                    />
                    <Text style={styles.confidenceLabel}>High</Text>
                  </View>
                  <Text style={styles.confidenceValue}>{formData.confidenceLevel}% confident in identification</Text>
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
                      onPress={() => {
                        const newValue = !formData.isAnonymous
                        updateFormData("isAnonymous", newValue)
                        if (newValue) {
                          updateFormData("reporterName", "")
                          updateFormData("reporterContact", "")
                          updateFormData("allowFollowUp", false)
                        } else {
                          updateFormData("allowFollowUp", true)
                        }
                      }}
                    >
                      <View style={[styles.checkboxBox, formData.isAnonymous && styles.checkboxChecked]}>
                        {formData.isAnonymous && <Feather name="check" size={12} color="white" />}
                      </View>
                      <Text style={styles.checkboxLabel}>I wish to remain anonymous</Text>
                    </TouchableOpacity>
                  </View>

                  {!formData.isAnonymous && (
                    <>
                      <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Your Name</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="Enter your full name"
                          value={formData.reporterName}
                          onChangeText={(text) => updateFormData("reporterName", text)}
                          placeholderTextColor="#64748B"
                        />
                      </View>

                      <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Contact Information (phone or email)</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="Enter your phone number or email address"
                          value={formData.reporterContact}
                          onChangeText={(text) => updateFormData("reporterContact", text)}
                          placeholderTextColor="#64748B"
                        />
                        <Text style={styles.inputHelp}>
                          This will only be used for follow-up questions about this sighting.
                        </Text>
                      </View>
                    </>
                  )}

                  <View style={styles.checkboxContainer}>
                    <TouchableOpacity
                      style={styles.checkbox}
                      onPress={() => updateFormData("allowFollowUp", !formData.allowFollowUp)}
                      disabled={formData.isAnonymous}
                    >
                      <View
                        style={[
                          styles.checkboxBox,
                          formData.allowFollowUp && !formData.isAnonymous && styles.checkboxChecked,
                          formData.isAnonymous && styles.checkboxDisabled,
                        ]}
                      >
                        {formData.allowFollowUp && !formData.isAnonymous && (
                          <Feather name="check" size={12} color="white" />
                        )}
                      </View>
                      <Text style={[styles.checkboxLabel, formData.isAnonymous && styles.disabledText]}>
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
  submitButton: {
    backgroundColor: "#48BB78",
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
  reviewSection: {
    marginBottom: 20,
  },
  reviewSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  reviewSectionTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#1A365D",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0F2FE",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  editButtonText: {
    fontSize: 14,
    color: "#2B6CB0",
    marginLeft: 5,
  },
  reviewContent: {
    padding: 15,
    backgroundColor: "#F9FAFB",
    borderRadius: 6,
  },
  reviewEmptyText: {
    fontSize: 16,
    color: "#6B7280",
    fontStyle: "italic",
  },
  reviewPersonInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewPersonPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  reviewPersonName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1A365D",
  },
  reviewPersonId: {
    fontSize: 14,
    color: "#6B7280",
  },
  reviewDateTime: {
    marginTop: 10,
  },
  reviewDateTimeLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1A365D",
  },
  reviewDateTimeValue: {
    fontSize: 14,
    color: "#4B5563",
  },
  reviewLocationInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewLocationIcon: {
    marginRight: 10,
  },
  reviewLocationText: {
    fontSize: 16,
    color: "#4B5563",
  },
  reviewPhotosCount: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 5,
  },
  reviewPhotosContainer: {
    marginTop: 5,
  },
  reviewPhotoThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginRight: 10,
  },
  reviewDescription: {
    fontSize: 16,
    color: "#4B5563",
    marginBottom: 10,
  },
  reviewDetail: {
    marginBottom: 8,
  },
  reviewDetailLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1A365D",
  },
  reviewDetailText: {
    fontSize: 14,
    color: "#4B5563",
  },
  reviewBehaviorTags: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  reviewBehaviorTag: {
    backgroundColor: "#E0F2FE",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  reviewBehaviorTagText: {
    fontSize: 14,
    color: "#2B6CB0",
  },
  reviewConfidenceBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  reviewConfidenceFill: {
    height: "100%",
    backgroundColor: "#2B6CB0",
  },
  reviewConfidenceValue: {
    fontSize: 14,
    color: "#4B5563",
    marginTop: 5,
  },
  reviewReporterInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  reviewReporterIcon: {
    marginRight: 8,
  },
  reviewReporterName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1A365D",
  },
  reviewReporterContact: {
    fontSize: 14,
    color: "#4B5563",
  },
  reviewFollowUp: {
    fontSize: 14,
    color: "#4B5563",
  },
  emergencyFlag: {
    flexDirection: "row",
    alignItems: "center",
  },
  emergencyText: {
    fontSize: 14,
    color: "#F56565",
    marginLeft: 5,
  },
  currentLocationFlag: {
    flexDirection: "row",
    alignItems: "center",
  },
  currentLocationText: {
    fontSize: 14,
    color: "#2B6CB0",
    marginLeft: 5,
  },
})

