"use client"

import React, { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  Modal,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Image,
} from "react-native"
import { Ionicons, FontAwesome5 } from "@expo/vector-icons"
import DateTimePicker from "@react-native-community/datetimepicker"
import * as ImagePicker from "expo-image-picker"
import useAuthStore from "../store/auth"
import * as Location from "expo-location"
import { BlurView } from "expo-blur"
import { LinearGradient } from "expo-linear-gradient"
import { router } from "expo-router"

const formSections = {
  BASIC: "Basic Info",
  PHYSICAL: "Physical Details",
  LOCATION: "Last Seen",
  MEDICAL: "Medical Info",
  CONTACTS: "Emergency Contacts",
  DOCUMENTS: "Documents",
}

const COMPLEXION_OPTIONS = [
  { label: "Select Complexion", value: "" },
  { label: "Fair", value: "FAIR" },
  { label: "Medium", value: "MEDIUM" },
  { label: "Dark", value: "DARK" },
  { label: "Unknown", value: "UNKNOWN" },
]

export default function MissingPersonForm() {
  const { tokens } = useAuthStore()
  const [activeSection, setActiveSection] = useState(formSections.BASIC)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [progressValue] = useState(new Animated.Value(0))
  const [formData, setFormData] = useState<{
    [key: string]: any
    name: string
    age_when_missing: string
    date_of_birth: Date
    gender: string
    height: string
    weight: string
    complexion: string
    last_seen_location: string
    last_seen_date: Date
    last_seen_details: string
    last_seen_wearing: string
    possible_locations: string[]
    fir_number: string
    status: string
    priority_level: string
    medical_conditions: string
    medications: string
    emergency_contact_name: string
    emergency_contact_phone: string
    emergency_contact_relation: string
    secondary_contact_name: string
    secondary_contact_phone: string
    blood_group: string
    nationality: string
    identifying_marks: string
    physical_attributes: {
      hair_color: string
      eye_color: string
      build: string
    }
    last_known_latitude: string
    last_known_longitude: string
    aadhaar_number: string
    recent_photo: any
    additional_photos: any[]
    documents: any[]
  }>({
    name: "",
    age_when_missing: "",
    date_of_birth: new Date(),
    gender: "",
    height: "",
    weight: "",
    complexion: "",
    last_seen_location: "",
    last_seen_date: new Date(),
    last_seen_details: "",
    last_seen_wearing: "",
    possible_locations: [],
    fir_number: "",
    status: "MISSING",
    priority_level: "5",
    medical_conditions: "",
    medications: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relation: "",
    secondary_contact_name: "",
    secondary_contact_phone: "",
    blood_group: "",
    nationality: "",
    identifying_marks: "",
    physical_attributes: {
      hair_color: "",
      eye_color: "",
      build: "",
    },
    last_known_latitude: "",
    last_known_longitude: "",
    aadhaar_number: "",
    recent_photo: null,
    additional_photos: [],
    documents: [],
  })

  const [showDatePicker, setShowDatePicker] = useState(false)
  const [datePickerField, setDatePickerField] = useState("")
  const [locationError, setLocationError] = useState<string | null>(null)
  const [showComplexionPicker, setShowComplexionPicker] = useState(false)
  const scrollViewRef = useRef<ScrollView>(null)

  useEffect(() => {
    if (isSubmitting) {
      Animated.timing(progressValue, {
        toValue: 100,
        duration: 2000,
        useNativeDriver: false,
      }).start()
    } else {
      progressValue.setValue(0)
    }
  }, [isSubmitting])

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      if (!tokens?.access) {
        Alert.alert("Error", "No access token available. Please login again.")
        setIsSubmitting(false)
        return
      }

      const formDataObj = new FormData()

      // Format dates in YYYY-MM-DD format
      const formatDate = (date: Date) => {
        return date.toISOString().split("T")[0]
      }

      // Format coordinates to limit digits
      const formatCoordinate = (coord: string) => {
        return Number(coord).toFixed(6)
      }

      Object.keys(formData).forEach((key) => {
        if (key !== "documents" && key !== "additional_photos" && key !== "recent_photo") {
          if (key === "physical_attributes" || key === "possible_locations") {
            formDataObj.append(key, JSON.stringify(formData[key]))
          } else if (key === "date_of_birth" || key === "last_seen_date") {
            formDataObj.append(key, formatDate(formData[key]))
          } else if (key === "last_known_latitude" || key === "last_known_longitude") {
            formDataObj.append(key, formatCoordinate(formData[key]))
          } else {
            formDataObj.append(key, formData[key])
          }
        }
      })

      if (formData.recent_photo) {
        const photoFile = {
          uri: formData.recent_photo.uri,
          type: "image/jpeg",
          name: "photo.jpg",
        } as any
        formDataObj.append("recent_photo", photoFile)
      }

      formData.additional_photos.forEach((photo, index) => {
        const photoFile = {
          uri: photo.uri,
          type: "image/jpeg",
          name: `photo${index}.jpg`,
        } as any
        formDataObj.append(`additional_photos[${index}]`, photoFile)
      })

      formData.documents.forEach((doc, index) => {
        formDataObj.append(`documents[${index}][document_type]`, doc.document_type)
        formDataObj.append(`documents[${index}][description]`, doc.description)
        formDataObj.append(`documents[${index}][file]`, doc.file)
      })

      console.log("Making API request...")

      // Simulate a delay for testing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const response = await fetch("https://15e1-150-107-18-153.ngrok-free.app/api/missing-persons/missing-persons/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokens.access}`,
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
          "ngrok-skip-browser-warning": "true",
        },
        body: formDataObj,
      })

      const responseData = await response.json()
      console.log("API Response:", responseData)

      setIsSubmitting(false)

      if (!response.ok) {
        throw new Error(`Failed to submit form: ${JSON.stringify(responseData)}`)
      }

      Alert.alert("Success", "Missing person report submitted successfully", [
        {
          text: "OK",
          onPress: () => {
            // Redirect to home screen
            router.replace("/home")
          }
        }
      ])
    } catch (error) {
      console.error("Error submitting form:", error)
      setIsSubmitting(false)
      Alert.alert(
        "Error",
        "Failed to submit form. Please check your internet connection and try again. " +
          (error instanceof Error ? error.message : ""),
      )
    }
  }

  const handleDateChange = (event: any, selectedDate: any) => {
    setShowDatePicker(false)
    if (selectedDate) {
      setFormData((prev) => ({
        ...prev,
        [datePickerField]: selectedDate,
      }))
    }
  }

  const pickImage = async (field: any) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })

    if (!result.canceled) {
      if (field === "recent_photo") {
        setFormData((prev) => ({
          ...prev,
          recent_photo: result.assets[0],
        }))
      } else {
        setFormData((prev) => ({
          ...prev,
          additional_photos: [...prev.additional_photos, result.assets[0]],
        }))
      }
    }
  }

  const getDeviceLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        setLocationError("Permission to access location was denied")
        return
      }

      const location = await Location.getCurrentPositionAsync({})
      setFormData((prev) => ({
        ...prev,
        last_known_latitude: location.coords.latitude.toString(),
        last_known_longitude: location.coords.longitude.toString(),
      }))
    } catch (error) {
      setLocationError("Error getting location")
      console.error(error)
    }
  }

  const renderComplexionPicker = () => {
    return (
      <View style={styles.inputGroup}>
        <View style={styles.labelContainer}>
          <FontAwesome5 name="palette" size={18} color="#5e72e4" style={styles.inputIcon} />
          <Text style={styles.label}>Complexion</Text>
        </View>
        <TouchableOpacity style={styles.selectInput} onPress={() => setShowComplexionPicker(true)}>
          <Text style={[styles.selectText, formData.complexion ? styles.activeSelectText : styles.placeholderText]}>
            {COMPLEXION_OPTIONS.find((option) => option.value === formData.complexion)?.label || "Select Complexion"}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#a0aec0" />
        </TouchableOpacity>

        <Modal visible={showComplexionPicker} animationType="slide" transparent={true}>
          <BlurView intensity={15} tint="dark" style={styles.blurOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Complexion</Text>
                  <TouchableOpacity onPress={() => setShowComplexionPicker(false)} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>
                <View style={styles.pickerContainer}>
                  {COMPLEXION_OPTIONS.map(
                    (option) =>
                      option.value && (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            styles.complexionOption,
                            formData.complexion === option.value && styles.selectedComplexion,
                          ]}
                          onPress={() => {
                            setFormData((prev) => ({ ...prev, complexion: option.value }))
                            setShowComplexionPicker(false)
                          }}
                        >
                          <Text
                            style={[
                              styles.complexionText,
                              formData.complexion === option.value && styles.selectedComplexionText,
                            ]}
                          >
                            {option.label}
                          </Text>
                          {formData.complexion === option.value && (
                            <Ionicons name="checkmark-circle" size={20} color="#fff" />
                          )}
                        </TouchableOpacity>
                      ),
                  )}
                </View>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowComplexionPicker(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </Modal>
      </View>
    )
  }

  const renderInputWithIcon = (
    placeholder: string,
    value: string,
    onChangeText: (text: string) => void,
    icon: string,
    keyboardType = "default",
    multiline = false,
  ) => {
    return (
      <View style={styles.inputGroup}>
        <View style={styles.labelContainer}>
          <FontAwesome5 name={icon} size={18} color="#5e72e4" style={styles.inputIcon} />
          <Text style={styles.label}>{placeholder}</Text>
        </View>
        <TextInput
          style={[styles.input, multiline && styles.multilineInput]}
          placeholder={placeholder}
          placeholderTextColor="#a0aec0"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType as any}
          multiline={multiline}
        />
      </View>
    )
  }

  const renderDateInputWithIcon = (placeholder: string, value: Date, dateField: string, icon: string) => {
    return (
      <View style={styles.inputGroup}>
        <View style={styles.labelContainer}>
          <FontAwesome5 name={icon} size={18} color="#5e72e4" style={styles.inputIcon} />
          <Text style={styles.label}>{placeholder}</Text>
        </View>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => {
            setDatePickerField(dateField)
            setShowDatePicker(true)
          }}
        >
          <Text style={styles.dateInputText}>{value.toLocaleDateString()}</Text>
          <Ionicons name="calendar" size={20} color="#5e72e4" />
        </TouchableOpacity>
      </View>
    )
  }

  const renderBasicInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Basic Information</Text>

      {renderInputWithIcon(
        "Full Name",
        formData.name,
        (text) => setFormData((prev) => ({ ...prev, name: text })),
        "user",
      )}

      {renderInputWithIcon(
        "Age when missing",
        formData.age_when_missing,
        (text) => setFormData((prev) => ({ ...prev, age_when_missing: text })),
        "sort-numeric-up",
        "numeric",
      )}

      {renderDateInputWithIcon("Date of Birth", formData.date_of_birth, "date_of_birth", "birthday-cake")}

      {renderInputWithIcon(
        "Gender (M/F/O)",
        formData.gender,
        (text) => setFormData((prev) => ({ ...prev, gender: text })),
        "venus-mars",
      )}

      {renderInputWithIcon(
        "Nationality",
        formData.nationality,
        (text) => setFormData((prev) => ({ ...prev, nationality: text })),
        "flag",
      )}

      {renderInputWithIcon(
        "Aadhaar Number",
        formData.aadhaar_number,
        (text) => setFormData((prev) => ({ ...prev, aadhaar_number: text })),
        "id-card",
      )}
    </View>
  )

  const renderPhysicalDetails = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Physical Details</Text>

      {renderInputWithIcon(
        "Height (cm)",
        formData.height,
        (text) => setFormData((prev) => ({ ...prev, height: text })),
        "ruler-vertical",
        "numeric",
      )}

      {renderInputWithIcon(
        "Weight (kg)",
        formData.weight,
        (text) => setFormData((prev) => ({ ...prev, weight: text })),
        "weight",
        "numeric",
      )}

      {renderComplexionPicker()}

      {renderInputWithIcon(
        "Identifying Marks",
        formData.identifying_marks,
        (text) => setFormData((prev) => ({ ...prev, identifying_marks: text })),
        "fingerprint",
        "default",
        true,
      )}

      {renderInputWithIcon(
        "Hair Color",
        formData.physical_attributes.hair_color,
        (text) =>
          setFormData((prev) => ({
            ...prev,
            physical_attributes: { ...prev.physical_attributes, hair_color: text },
          })),
        "user-alt",
      )}

      {renderInputWithIcon(
        "Eye Color",
        formData.physical_attributes.eye_color,
        (text) =>
          setFormData((prev) => ({
            ...prev,
            physical_attributes: { ...prev.physical_attributes, eye_color: text },
          })),
        "eye",
      )}

      {renderInputWithIcon(
        "Build",
        formData.physical_attributes.build,
        (text) =>
          setFormData((prev) => ({
            ...prev,
            physical_attributes: { ...prev.physical_attributes, build: text },
          })),
        "child",
      )}
    </View>
  )

  const renderLastSeen = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Last Seen Details</Text>

      {renderInputWithIcon(
        "Last Seen Location",
        formData.last_seen_location,
        (text) => setFormData((prev) => ({ ...prev, last_seen_location: text })),
        "map-marker-alt",
      )}

      {renderDateInputWithIcon("Last Seen Date", formData.last_seen_date, "last_seen_date", "calendar-day")}

      {renderInputWithIcon(
        "Last Seen Details",
        formData.last_seen_details,
        (text) => setFormData((prev) => ({ ...prev, last_seen_details: text })),
        "info-circle",
        "default",
        true,
      )}

      {renderInputWithIcon(
        "Last Seen Wearing",
        formData.last_seen_wearing,
        (text) => setFormData((prev) => ({ ...prev, last_seen_wearing: text })),
        "tshirt",
        "default",
        true,
      )}

      <View style={styles.spacer} />

      <TouchableOpacity style={styles.uploadButton} onPress={getDeviceLocation}>
        <LinearGradient
          colors={["#5e72e4", "#324cdd"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          <FontAwesome5 name="map-marker" size={16} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.uploadButtonText}>Get Current Location</Text>
        </LinearGradient>
      </TouchableOpacity>

      {locationError && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={18} color="#FF5252" />
          <Text style={styles.errorText}>{locationError}</Text>
        </View>
      )}

      {renderInputWithIcon(
        "Last Known Latitude",
        formData.last_known_latitude,
        (text) => setFormData((prev) => ({ ...prev, last_known_latitude: text })),
        "map",
        "numeric",
      )}

      {renderInputWithIcon(
        "Last Known Longitude",
        formData.last_known_longitude,
        (text) => setFormData((prev) => ({ ...prev, last_known_longitude: text })),
        "map",
        "numeric",
      )}
    </View>
  )

  const renderMedicalInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Medical Information</Text>

      {renderInputWithIcon(
        "Blood Group",
        formData.blood_group,
        (text) => setFormData((prev) => ({ ...prev, blood_group: text })),
        "heartbeat",
      )}

      {renderInputWithIcon(
        "Medical Conditions",
        formData.medical_conditions,
        (text) => setFormData((prev) => ({ ...prev, medical_conditions: text })),
        "notes-medical",
        "default",
        true,
      )}

      {renderInputWithIcon(
        "Medications",
        formData.medications,
        (text) => setFormData((prev) => ({ ...prev, medications: text })),
        "pills",
        "default",
        true,
      )}
    </View>
  )

  const renderEmergencyContacts = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Emergency Contacts</Text>

      {renderInputWithIcon(
        "Primary Contact Name",
        formData.emergency_contact_name,
        (text) => setFormData((prev) => ({ ...prev, emergency_contact_name: text })),
        "user-friends",
      )}

      {renderInputWithIcon(
        "Primary Contact Phone",
        formData.emergency_contact_phone,
        (text) => setFormData((prev) => ({ ...prev, emergency_contact_phone: text })),
        "phone",
        "phone-pad",
      )}

      {renderInputWithIcon(
        "Relation to Missing Person",
        formData.emergency_contact_relation,
        (text) => setFormData((prev) => ({ ...prev, emergency_contact_relation: text })),
        "user-circle",
      )}

      <View style={styles.divider} />

      {renderInputWithIcon(
        "Secondary Contact Name",
        formData.secondary_contact_name,
        (text) => setFormData((prev) => ({ ...prev, secondary_contact_name: text })),
        "user-friends",
      )}

      {renderInputWithIcon(
        "Secondary Contact Phone",
        formData.secondary_contact_phone,
        (text) => setFormData((prev) => ({ ...prev, secondary_contact_phone: text })),
        "phone",
        "phone-pad",
      )}
    </View>
  )

  const renderDocuments = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Photos & Documents</Text>

      <View style={styles.photoSection}>
        <Text style={styles.photoSectionTitle}>Recent Photo</Text>
        <View style={styles.photoContainer}>
          {formData.recent_photo ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: formData.recent_photo.uri }} style={styles.photoPreview} />
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => setFormData((prev) => ({ ...prev, recent_photo: null }))}
              >
                <Ionicons name="close-circle" size={26} color="#FF5252" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="image" size={40} color="#cbd5e0" />
              <Text style={styles.photoPlaceholderText}>No photo selected</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.uploadButton} onPress={() => pickImage("recent_photo")}>
          <LinearGradient
            colors={["#5e72e4", "#324cdd"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Ionicons name="camera" size={18} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.uploadButtonText}>Select Recent Photo</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.photoSection}>
        <Text style={styles.photoSectionTitle}>Additional Photos</Text>

        {formData.additional_photos.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.additionalPhotosContainer}>
            {formData.additional_photos.map((photo, index) => (
              <View key={index} style={styles.additionalPhotoWrapper}>
                <Image source={{ uri: photo.uri }} style={styles.additionalPhoto} />
                <TouchableOpacity
                  style={styles.removeAdditionalPhotoButton}
                  onPress={() => {
                    const newPhotos = [...formData.additional_photos]
                    newPhotos.splice(index, 1)
                    setFormData((prev) => ({ ...prev, additional_photos: newPhotos }))
                  }}
                >
                  <Ionicons name="close-circle" size={22} color="#FF5252" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.photoPlaceholder}>
            <Ionicons name="images" size={40} color="#cbd5e0" />
            <Text style={styles.photoPlaceholderText}>No additional photos</Text>
          </View>
        )}

        <TouchableOpacity style={styles.uploadButton} onPress={() => pickImage("additional_photos")}>
          <LinearGradient
            colors={["#5e72e4", "#324cdd"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Ionicons name="images" size={18} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.uploadButtonText}>Add More Photos</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {renderInputWithIcon(
        "FIR Number (if available)",
        formData.fir_number,
        (text) => setFormData((prev) => ({ ...prev, fir_number: text })),
        "file-alt",
      )}
    </View>
  )

  const renderActiveSection = () => {
    switch (activeSection) {
      case formSections.BASIC:
        return renderBasicInfo()
      case formSections.PHYSICAL:
        return renderPhysicalDetails()
      case formSections.LOCATION:
        return renderLastSeen()
      case formSections.MEDICAL:
        return renderMedicalInfo()
      case formSections.CONTACTS:
        return renderEmergencyContacts()
      case formSections.DOCUMENTS:
        return renderDocuments()
      default:
        return null
    }
  }

  const renderLoadingOverlay = () => {
    if (!isSubmitting) return null

    return (
      <BlurView intensity={100} tint="light" style={styles.loadingOverlay}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5e72e4" />
          <Text style={styles.loadingText}>Submitting report...</Text>
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressValue.interpolate({
                    inputRange: [0, 100],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.loadingSubtext}>This may take a moment</Text>
        </View>
      </BlurView>
    )
  }

  const renderSkeletonLoader = () => {
    return (
      <View style={styles.skeletonContainer}>
        <View style={styles.skeletonSection}>
          <View style={styles.skeletonHeading} />
          <View style={styles.skeletonInput} />
          <View style={styles.skeletonInput} />
          <View style={styles.skeletonInput} />
          <View style={styles.skeletonInput} />
        </View>
      </View>
    )
  }

  const renderTabItem = (key: string, label: string, iconName: string) => {
    const isActive = activeSection === label
    return (
      <TouchableOpacity
        key={key}
        style={[styles.tab, isActive && styles.activeTab]}
        onPress={() => setActiveSection(label)}
      >
        <LinearGradient
          colors={isActive ? ["#5e72e4", "#324cdd"] : ["#f8fafc", "#f1f5f9"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.tabGradient}
        >
          <FontAwesome5 name={iconName} size={16} color={isActive ? "#fff" : "#64748b"} style={styles.tabIcon} />
          <Text style={[styles.tabText, isActive && styles.activeTabText]}>{label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    )
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>Missing Person Report</Text>
        <Text style={styles.formSubtitle}>Please fill all the details accurately</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContentContainer}
      >
        {renderTabItem("BASIC", formSections.BASIC, "user")}
        {renderTabItem("PHYSICAL", formSections.PHYSICAL, "id-badge")}
        {renderTabItem("LOCATION", formSections.LOCATION, "map-marker-alt")}
        {renderTabItem("MEDICAL", formSections.MEDICAL, "heartbeat")}
        {renderTabItem("CONTACTS", formSections.CONTACTS, "address-book")}
        {renderTabItem("DOCUMENTS", formSections.DOCUMENTS, "file-image")}
      </ScrollView>

      <ScrollView style={styles.formContainer} contentContainerStyle={styles.formContentContainer} ref={scrollViewRef}>
        {isSubmitting ? renderSkeletonLoader() : renderActiveSection()}
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker value={formData[datePickerField]} mode="date" display="default" onChange={handleDateChange} />
      )}

      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <LinearGradient
          colors={isSubmitting ? ["#a0aec0", "#cbd5e0"] : ["#38b2ac", "#319795"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <FontAwesome5 name="paper-plane" size={16} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.submitButtonText}>Submit Report</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {renderLoadingOverlay()}
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  formHeader: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a202c",
    marginBottom: 4,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  formSubtitle: {
    fontSize: 14,
    color: "#718096",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  tabsContainer: {
    backgroundColor: "#fff",
    paddingVertical: 8, // Reduced from 12
    paddingBottom: 4, // Add specific bottom padding
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 10,
  },
  tabsContentContainer: {
    paddingHorizontal: 15,
  },
  tab: {
    marginRight: 10,
    borderRadius: 25,
    overflow: "hidden",
  },
  tabGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
  },
  activeTab: {
    shadowColor: "#5e72e4",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "700",
  },
  formContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
    marginTop: -650, 
    zIndex:10,// Remove any top margin
  },
  formContentContainer: {
    padding: 16,
    paddingTop: 8, // Reduced top padding
    paddingBottom: 100,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginTop: 0, // No top margin
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a202c",
    marginBottom: 20,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  inputIcon: {
    marginRight: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4a5568",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#2d3748",
    backgroundColor: "#f8fafc",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#f8fafc",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dateInputText: {
    fontSize: 15,
    color: "#2d3748",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  selectInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#f8fafc",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectText: {
    fontSize: 15,
    color: "#2d3748",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  activeSelectText: {
    color: "#2d3748",
  },
  placeholderText: {
    color: "#a0aec0",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  errorText: {
    color: "#FF5252",
    fontSize: 14,
    marginLeft: 6,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  spacer: {
    height: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 20,
  },
  uploadButton: {
    borderRadius: 12,
    marginVertical: 8,
    overflow: "hidden",
    shadowColor: "#5e72e4",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  submitButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#38b2ac",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex:10,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  disabledButton: {
    opacity: 0.7,
  },
  blurOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    maxWidth: 360,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2d3748",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f7fafc",
  },
  pickerContainer: {
    padding: 15,
  },
  complexionOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  selectedComplexion: {
    backgroundColor: "#5e72e4",
  },
  complexionText: {
    fontSize: 16,
    color: "#2d3748",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  selectedComplexionText: {
    color: "#fff",
    fontWeight: "600",
  },
  cancelButton: {
    alignItems: "center",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#718096",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  photoSection: {
    marginVertical: 10,
  },
  photoSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4a5568",
    marginBottom: 12,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  photoContainer: {
    marginBottom: 15,
  },
  previewContainer: {
    position: "relative",
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
  },
  photoPreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  removePhotoButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 15,
  },
  additionalPhotosContainer: {
    marginBottom: 15,
  },
  additionalPhotoWrapper: {
    position: "relative",
    marginRight: 10,
  },
  additionalPhoto: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeAdditionalPhotoButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 12,
  },
  photoPlaceholder: {
    width: "100%",
    height: 150,
    borderRadius: 12,
    backgroundColor: "#f7fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  photoPlaceholderText: {
    marginTop: 10,
    fontSize: 14,
    color: "#a0aec0",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingContainer: {
    width: "80%",
    maxWidth: 300,
    padding: 24,
    backgroundColor: "#fff",
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2d3748",
    marginTop: 16,
    marginBottom: 16,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  loadingSubtext: {
    fontSize: 14,
    color: "#718096",
    marginTop: 8,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  progressBarContainer: {
    width: "100%",
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#5e72e4",
  },
  skeletonContainer: {
    marginBottom: 20,
  },
  skeletonSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  skeletonHeading: {
    width: "60%",
    height: 24,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    marginBottom: 24,
  },
  skeletonInput: {
    width: "100%",
    height: 50,
    backgroundColor: "#e2e8f0",
    borderRadius: 12,
    marginBottom: 16,
  },
})

