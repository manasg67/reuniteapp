import React, { useState } from 'react';
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
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import useAuthStore from '../store/auth';
import * as Location from 'expo-location';

const formSections = {
  BASIC: 'Basic Info',
  PHYSICAL: 'Physical Details',
  LOCATION: 'Last Seen',
  MEDICAL: 'Medical Info',
  CONTACTS: 'Emergency Contacts',
  DOCUMENTS: 'Documents',
};

const COMPLEXION_OPTIONS = [
  { label: 'Select Complexion', value: '' },
  { label: 'Fair', value: 'FAIR' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'Dark', value: 'DARK' },
  { label: 'Unknown', value: 'UNKNOWN' },
];

export default function MissingPersonForm() {
  const { tokens } = useAuthStore();
  const [activeSection, setActiveSection] = useState(formSections.BASIC);
  const [formData, setFormData] = useState<{
    [key: string]: any;
    name: string;
    age_when_missing: string;
    date_of_birth: Date;
    gender: string;
    height: string;
    weight: string;
    complexion: string;
    last_seen_location: string;
    last_seen_date: Date;
    last_seen_details: string;
    last_seen_wearing: string;
    possible_locations: string[];
    fir_number: string;
    status: string;
    priority_level: string;
    medical_conditions: string;
    medications: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    emergency_contact_relation: string;
    secondary_contact_name: string;
    secondary_contact_phone: string;
    blood_group: string;
    nationality: string;
    identifying_marks: string;
    physical_attributes: {
      hair_color: string;
      eye_color: string;
      build: string;
    };
    last_known_latitude: string;
    last_known_longitude: string;
    aadhaar_number: string;
    recent_photo: any;
    additional_photos: any[];
    documents: any[];
  }>({
    name: '',
    age_when_missing: '',
    date_of_birth: new Date(),
    gender: '',
    height: '',
    weight: '',
    complexion: '',
    last_seen_location: '',
    last_seen_date: new Date(),
    last_seen_details: '',
    last_seen_wearing: '',
    possible_locations: [],
    fir_number: '',
    status: 'MISSING',
    priority_level: '5',
    medical_conditions: '',
    medications: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
    secondary_contact_name: '',
    secondary_contact_phone: '',
    blood_group: '',
    nationality: '',
    identifying_marks: '',
    physical_attributes: {
      hair_color: '',
      eye_color: '',
      build: '',
    },
    last_known_latitude: '',
    last_known_longitude: '',
    aadhaar_number: '',
    recent_photo: null,
    additional_photos: [],
    documents: [],
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerField, setDatePickerField] = useState('');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showComplexionPicker, setShowComplexionPicker] = useState(false);

  const handleSubmit = async () => {
    try {
      if (!tokens?.access) {
        Alert.alert('Error', 'No access token available. Please login again.');
        return;
      }

      const formDataObj = new FormData();
      
      // Format dates in YYYY-MM-DD format
      const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
      };

      // Format coordinates to limit digits
      const formatCoordinate = (coord: string) => {
        return Number(coord).toFixed(6);
      };

      Object.keys(formData).forEach((key) => {
        if (key !== 'documents' && key !== 'additional_photos' && key !== 'recent_photo') {
          if (key === 'physical_attributes' || key === 'possible_locations') {
            formDataObj.append(key, JSON.stringify(formData[key]));
          } else if (key === 'date_of_birth' || key === 'last_seen_date') {
            formDataObj.append(key, formatDate(formData[key]));
          } else if (key === 'last_known_latitude' || key === 'last_known_longitude') {
            formDataObj.append(key, formatCoordinate(formData[key]));
          } else {
            formDataObj.append(key, formData[key]);
          }
        }
      });

      if (formData.recent_photo) {
        const photoFile = {
          uri: formData.recent_photo.uri,
          type: 'image/jpeg',
          name: 'photo.jpg'
        } as any;
        formDataObj.append('recent_photo', photoFile);
      }

      formData.additional_photos.forEach((photo, index) => {
        const photoFile = {
          uri: photo.uri,
          type: 'image/jpeg',
          name: `photo${index}.jpg`
        } as any;
        formDataObj.append(`additional_photos[${index}]`, photoFile);
      });

      formData.documents.forEach((doc, index) => {
        formDataObj.append(`documents[${index}][document_type]`, doc.document_type);
        formDataObj.append(`documents[${index}][description]`, doc.description);
        formDataObj.append(`documents[${index}][file]`, doc.file);
      });

      console.log('Making API request...');
      const response = await fetch('https://6a84-106-193-251-230.ngrok-free.app/api/missing-persons/missing-persons/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.access}`,
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
          'ngrok-skip-browser-warning': 'true'
        },
        body: formDataObj,
      });

      const responseData = await response.json();
      console.log('API Response:', responseData);

      if (!response.ok) {
        throw new Error(`Failed to submit form: ${JSON.stringify(responseData)}`);
      }

      Alert.alert('Success', 'Missing person report submitted successfully');
    } catch (error) {
      console.error('Error submitting form:', error);
      Alert.alert(
        'Error',
        'Failed to submit form. Please check your internet connection and try again. ' + 
        (error instanceof Error ? error.message : '')
      );
    }
  };

  const handleDateChange = (event: any, selectedDate: any) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData((prev) => ({
        ...prev,
        [datePickerField]: selectedDate,
      }));
    }
  };

  const pickImage = async (field: any) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      if (field === 'recent_photo') {
        setFormData((prev) => ({
          ...prev,
          recent_photo: result.assets[0],
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          additional_photos: [...prev.additional_photos, result.assets[0]],
        }));
      }
    }
  };

  const getDeviceLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setFormData(prev => ({
        ...prev,
        last_known_latitude: location.coords.latitude.toString(),
        last_known_longitude: location.coords.longitude.toString()
      }));
    } catch (error) {
      setLocationError('Error getting location');
      console.error(error);
    }
  };

  const renderComplexionPicker = () => {
    if (Platform.OS === 'ios') {
      return (
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Complexion</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowComplexionPicker(true)}
          >
            <Text style={styles.pickerButtonText}>
              {COMPLEXION_OPTIONS.find(option => option.value === formData.complexion)?.label || 'Select Complexion'}
            </Text>
          </TouchableOpacity>

          <Modal
            visible={showComplexionPicker}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.pickerHeader}>
                  <TouchableOpacity
                    onPress={() => setShowComplexionPicker(false)}
                    style={styles.doneButton}
                  >
                    <Text style={styles.doneButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
                <Picker
                  selectedValue={formData.complexion}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, complexion: value }));
                    setShowComplexionPicker(false);
                  }}
                  style={styles.picker}
                >
                  {COMPLEXION_OPTIONS.map((option) => (
                    <Picker.Item
                      key={option.value}
                      label={option.label}
                      value={option.value}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </Modal>
        </View>
      );
    }

    return (
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Complexion</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={formData.complexion}
            onValueChange={(value) => setFormData(prev => ({ ...prev, complexion: value }))}
            style={styles.picker}
            mode="dropdown"
          >
            {COMPLEXION_OPTIONS.map((option) => (
              <Picker.Item
                key={option.value}
                label={option.label}
                value={option.value}
              />
            ))}
          </Picker>
        </View>
      </View>
    );
  };

  const renderBasicInfo = () => (
    <View style={styles.section}>
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#A0AEC0"
        value={formData.name}
        onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Age when missing"
        placeholderTextColor="#A0AEC0"
        value={formData.age_when_missing}
        onChangeText={(text) => setFormData((prev) => ({ ...prev, age_when_missing: text }))}
        keyboardType="numeric"
      />
      <TouchableOpacity
        style={styles.dateInput}
        onPress={() => {
          setDatePickerField('date_of_birth');
          setShowDatePicker(true);
        }}
      >
        <Text style={styles.dateInputText}>
          Date of Birth: {formData.date_of_birth.toLocaleDateString()}
        </Text>
        <Ionicons name="calendar-outline" size={20} color="#2B6CB0" />
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Gender (M/F/O)"
        placeholderTextColor="#A0AEC0"
        value={formData.gender}
        onChangeText={(text) => setFormData((prev) => ({ ...prev, gender: text }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Nationality"
        placeholderTextColor="#A0AEC0"
        value={formData.nationality}
        onChangeText={(text) => setFormData((prev) => ({ ...prev, nationality: text }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Aadhaar Number"
        placeholderTextColor="#A0AEC0"
        value={formData.aadhaar_number}
        onChangeText={(text) => setFormData((prev) => ({ ...prev, aadhaar_number: text }))}
      />
    </View>
  );

  const renderPhysicalDetails = () => (
    <View style={styles.section}>
      <TextInput
        style={styles.input}
        placeholder="Height (cm)"
        placeholderTextColor="#A0AEC0"
        value={formData.height}
        onChangeText={(text) => setFormData((prev) => ({ ...prev, height: text }))}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Weight (kg)"
        placeholderTextColor="#A0AEC0"
        value={formData.weight}
        onChangeText={(text) => setFormData((prev) => ({ ...prev, weight: text }))}
        keyboardType="numeric"
      />
      {renderComplexionPicker()}
      <TextInput
        style={styles.input}
        placeholder="Identifying Marks"
        placeholderTextColor="#A0AEC0"
        value={formData.identifying_marks}
        onChangeText={(text) => setFormData((prev) => ({ ...prev, identifying_marks: text }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Hair Color"
        placeholderTextColor="#A0AEC0"
        value={formData.physical_attributes.hair_color}
        onChangeText={(text) =>
          setFormData((prev) => ({
            ...prev,
            physical_attributes: { ...prev.physical_attributes, hair_color: text },
          }))
        }
      />
      <TextInput
        style={styles.input}
        placeholder="Eye Color"
        placeholderTextColor="#A0AEC0"
        value={formData.physical_attributes.eye_color}
        onChangeText={(text) =>
          setFormData((prev) => ({
            ...prev,
            physical_attributes: { ...prev.physical_attributes, eye_color: text },
          }))
        }
      />
    </View>
  );

  const renderLastSeen = () => (
    <View style={styles.section}>
      <TextInput
        style={styles.input}
        placeholder="Last Seen Location"
        placeholderTextColor="#A0AEC0"
        value={formData.last_seen_location}
        onChangeText={(text) => setFormData((prev) => ({ ...prev, last_seen_location: text }))}
      />
      <TouchableOpacity
        style={styles.dateInput}
        onPress={() => {
          setDatePickerField('last_seen_date');
          setShowDatePicker(true);
        }}
      >
        <Text style={styles.dateInputText}>
          Last Seen Date: {formData.last_seen_date.toLocaleDateString()}
        </Text>
        <Ionicons name="calendar-outline" size={20} color="#2B6CB0" />
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Last Seen Details"
        placeholderTextColor="#A0AEC0"
        value={formData.last_seen_details}
        onChangeText={(text) => setFormData((prev) => ({ ...prev, last_seen_details: text }))}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Last Seen Wearing"
        placeholderTextColor="#A0AEC0"
        value={formData.last_seen_wearing}
        onChangeText={(text) => setFormData((prev) => ({ ...prev, last_seen_wearing: text }))}
      />
      <TouchableOpacity 
        style={styles.uploadButton} 
        onPress={getDeviceLocation}
      >
        <Text style={styles.uploadButtonText}>Get Current Location</Text>
        <Ionicons name="location" size={20} color="#fff" style={styles.uploadIcon} />
      </TouchableOpacity>
      {locationError && <Text style={styles.errorText}>{locationError}</Text>}
      <TextInput
        style={styles.input}
        placeholder="Last Known Latitude"
        placeholderTextColor="#A0AEC0"
        value={formData.last_known_latitude}
        onChangeText={(text) => setFormData((prev) => ({ ...prev, last_known_latitude: text }))}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Last Known Longitude"
        placeholderTextColor="#A0AEC0"
        value={formData.last_known_longitude}
        onChangeText={(text) => setFormData((prev) => ({ ...prev, last_known_longitude: text }))}
        keyboardType="numeric"
      />
    </View>
  );

  const renderMedicalInfo = () => (
    <View style={styles.section}>
      <TextInput
        style={styles.input}
        placeholder="Blood Group"
        placeholderTextColor="#A0AEC0"
        value={formData.blood_group}
        onChangeText={(text) => setFormData((prev) => ({ ...prev, blood_group: text }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Medical Conditions"
        placeholderTextColor="#A0AEC0"
        value={formData.medical_conditions}
        onChangeText={(text) => setFormData((prev) => ({ ...prev, medical_conditions: text }))}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Medications"
        placeholderTextColor="#A0AEC0"
        value={formData.medications}
        onChangeText={(text) => setFormData((prev) => ({ ...prev, medications: text }))}
        multiline
      />
    </View>
  );

  const renderEmergencyContacts = () => (
    <View style={styles.section}>
      <TextInput
        style={styles.input}
        placeholder="Emergency Contact Name"
        placeholderTextColor="#A0AEC0"
        value={formData.emergency_contact_name}
        onChangeText={(text) => setFormData((prev) => ({ ...prev, emergency_contact_name: text }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Emergency Contact Phone"
        placeholderTextColor="#A0AEC0"
        value={formData.emergency_contact_phone}
        onChangeText={(text) => setFormData((prev) => ({ ...prev, emergency_contact_phone: text }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Emergency Contact Relation"
        placeholderTextColor="#A0AEC0"
        value={formData.emergency_contact_relation}
        onChangeText={(text) => setFormData((prev) => ({ ...prev, emergency_contact_relation: text }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Secondary Contact Name"
        placeholderTextColor="#A0AEC0"
        value={formData.secondary_contact_name}
        onChangeText={(text) => setFormData((prev) => ({ ...prev, secondary_contact_name: text }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Secondary Contact Phone"
        placeholderTextColor="#A0AEC0"
        value={formData.secondary_contact_phone}
        onChangeText={(text) => setFormData((prev) => ({ ...prev, secondary_contact_phone: text }))}
      />
    </View>
  );

  const renderDocuments = () => (
    <View style={styles.section}>
      <TouchableOpacity style={styles.uploadButton} onPress={() => pickImage('recent_photo')}>
        <Text style={styles.uploadButtonText}>Upload Recent Photo</Text>
        <Ionicons name="cloud-upload-outline" size={20} color="#fff" style={styles.uploadIcon} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.uploadButton} onPress={() => pickImage('additional_photos')}>
        <Text style={styles.uploadButtonText}>Upload Additional Photos</Text>
        <Ionicons name="cloud-upload-outline" size={20} color="#fff" style={styles.uploadIcon} />
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="FIR Number"
        placeholderTextColor="#A0AEC0"
        value={formData.fir_number}
        onChangeText={(text) => setFormData((prev) => ({ ...prev, fir_number: text }))}
      />
    </View>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case formSections.BASIC:
        return renderBasicInfo();
      case formSections.PHYSICAL:
        return renderPhysicalDetails();
      case formSections.LOCATION:
        return renderLastSeen();
      case formSections.MEDICAL:
        return renderMedicalInfo();
      case formSections.CONTACTS:
        return renderEmergencyContacts();
      case formSections.DOCUMENTS:
        return renderDocuments();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
        {Object.entries(formSections).map(([key, value]) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, activeSection === value && styles.activeTab]}
            onPress={() => setActiveSection(value)}
          >
            <Text style={[styles.tabText, activeSection === value && styles.activeTabText]}>
              {value}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.formContainer}>
        {renderActiveSection()}
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={formData[datePickerField]}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Report</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: '#F7FAFC', // Light gray background for a clean look
  },
  tabsContainer: {
    flexGrow: 0,
    paddingVertical: 20,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    marginTop: 30,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 25,
    backgroundColor: '#EDF2F7',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeTab: {
    backgroundColor: 'linear-gradient(90deg, #2B6CB0, #4A90E2)', // Gradient for active tab
    borderColor: '#2B6CB0',
    shadowColor: '#2B6CB0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  tabText: {
    color: '#4A5568',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'Roboto-Medium',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '700',
  },
  formContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F7FAFC',
  },
  section: {
    marginBottom: 25,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
    color: '#2D3748',
    backgroundColor: '#F7FAFC',
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'Roboto',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#F7FAFC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dateInputText: {
    fontSize: 16,
    color: '#2D3748',
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'Roboto',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2B6CB0',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#2B6CB0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'Roboto-Medium',
  },
  uploadIcon: {
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: '#28A745',
    padding: 16,
    borderRadius: 12,
    margin: 20,
    alignItems: 'center',
    shadowColor: '#28A745',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'Roboto-Bold',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
  },
  pickerButton: {
    flex: 1,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 14,
    backgroundColor: '#F7FAFC',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#2D3748',
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'Roboto',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  doneButton: {
    padding: 5,
  },
  doneButtonText: {
    color: '#2B6CB0',
    fontSize: 16,
    fontWeight: '600',
  },
  pickerWrapper: {
    flex: 1,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    backgroundColor: '#F7FAFC',
    overflow: 'hidden',
    height: 50,
  },
  picker: {
    height: 50,
    marginBottom:10,
    width: '100%',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom:40,
  },
  label: {
    fontSize: 16,
    color: '#2D3748',
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'Roboto',
    width: 100,
  },
});