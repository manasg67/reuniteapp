"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native"
import Slider from "@react-native-community/slider"
import { MapPin, Clock, Check } from "lucide-react-native"

export default function FilterPanel({ filters, onApplyFilters }: { filters: any, onApplyFilters: any }) {
  const [localFilters, setLocalFilters] = useState(filters)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const specialties = [
    "Search & Rescue",
    "Medical",
    "Legal",
    "Counseling",
    "Transportation",
    "Housing",
    "Food",
    "Clothing",
    "Investigation",
    "Forensics",
    "Cyber",
    "Surveillance",
  ]

  const handleSpecialtyToggle = (specialty: string) => {
    if (localFilters.specialties.includes(specialty)) {
      setLocalFilters({
        ...localFilters,
        specialties: localFilters.specialties.filter((s: string) => s !== specialty),
      })
    } else {
      setLocalFilters({
        ...localFilters,
        specialties: [...localFilters.specialties, specialty],
      })
    }
  }

  const handleStatusChange = (status: string) => {
    setLocalFilters({
      ...localFilters,
      status,
    })
  }

  const handleVerificationChange = (verification: string) => {
    setLocalFilters({
      ...localFilters,
      verification,
    })
  }

  const handleLocationChange = (value: number) => {
    setLocalFilters({
      ...localFilters,
      location: value,
    })
  }

  const handleResponseTimeChange = (values: number[]) => {
    setLocalFilters({
      ...localFilters,
      responseTime: values,
    })
  }

  const handleApply = () => {
    onApplyFilters(localFilters)
  }

  const handleReset = () => {
    setLocalFilters({
      location: 50,
      specialties: [],
      status: "all",
      verification: "all",
      responseTime: [0, 60],
    })
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Location Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Location Radius</Text>
          <View style={styles.sliderContainer}>
            <MapPin size={20} color="#0F4C81" />
            <Slider
              style={styles.slider}
              minimumValue={5}
              maximumValue={200}
              step={5}
              value={localFilters.location}
              onValueChange={handleLocationChange}
              minimumTrackTintColor="#0F4C81"
              maximumTrackTintColor="#D1D5DB"
              thumbTintColor="#1E88E5"
            />
            <Text style={styles.sliderValue}>{localFilters.location} km</Text>
          </View>
        </View>

        {/* Response Time Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Response Time (minutes)</Text>
          <View style={styles.sliderContainer}>
            <Clock size={20} color="#0F4C81" />
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={120}
              step={5}
              value={localFilters.responseTime[1]}
              onValueChange={(value) => handleResponseTimeChange([0, value])}
              minimumTrackTintColor="#0F4C81"
              maximumTrackTintColor="#D1D5DB"
              thumbTintColor="#1E88E5"
            />
            <Text style={styles.sliderValue}>≤ {localFilters.responseTime[1]} min</Text>
          </View>
        </View>

        {/* Status Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.chipContainer}>
            <TouchableOpacity
              style={[
                styles.chip,
                localFilters.status === "all" && styles.activeChip,
                localFilters.status === "all" && { backgroundColor: '#0F4C81', borderColor: '#0F4C81' }
              ]}
              onPress={() => handleStatusChange("all")}
            >
              <Text style={[styles.chipText, localFilters.status === "all" && styles.activeChipText]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.chip,
                localFilters.status === "active" && styles.activeChip,
                localFilters.status === "active" && { backgroundColor: '#43A047', borderColor: '#43A047' }
              ]}
              onPress={() => handleStatusChange("active")}
            >
              <Text style={[styles.chipText, localFilters.status === "active" && styles.activeChipText]}>Active</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.chip,
                localFilters.status === "pending" && styles.activeChip,
                localFilters.status === "pending" && { backgroundColor: '#FFB300', borderColor: '#FFB300' }
              ]}
              onPress={() => handleStatusChange("pending")}
            >
              <Text style={[styles.chipText, localFilters.status === "pending" && styles.activeChipText]}>Pending</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.chip,
                localFilters.status === "inactive" && styles.activeChip,
                localFilters.status === "inactive" && { backgroundColor: '#9E9E9E', borderColor: '#9E9E9E' }
              ]}
              onPress={() => handleStatusChange("inactive")}
            >
              <Text style={[styles.chipText, localFilters.status === "inactive" && styles.activeChipText]}>Inactive</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Verification Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Verification</Text>
          <View style={styles.chipContainer}>
            <TouchableOpacity
              style={[
                styles.chip,
                localFilters.verification === "all" && styles.activeChip,
                localFilters.verification === "all" && { backgroundColor: '#0F4C81', borderColor: '#0F4C81' }
              ]}
              onPress={() => handleVerificationChange("all")}
            >
              <Text style={[styles.chipText, localFilters.verification === "all" && styles.activeChipText]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.chip,
                localFilters.verification === "verified" && styles.activeChip,
                localFilters.verification === "verified" && { backgroundColor: '#43A047', borderColor: '#43A047' }
              ]}
              onPress={() => handleVerificationChange("verified")}
            >
              <View style={styles.chipIconContainer}>
                <Check size={16} color={localFilters.verification === "verified" ? "#FFFFFF" : "#4B5563"} />
                <Text style={[styles.chipText, localFilters.verification === "verified" && styles.activeChipText]}>
                  Verified
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.chip,
                localFilters.verification === "pending" && styles.activeChip,
                localFilters.verification === "pending" && { backgroundColor: '#FFB300', borderColor: '#FFB300' }
              ]}
              onPress={() => handleVerificationChange("pending")}
            >
              <Text style={[styles.chipText, localFilters.verification === "pending" && styles.activeChipText]}>
                Pending
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Specialties Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Specialties</Text>
          <View style={styles.chipContainer}>
            {specialties.map((specialty) => (
              <TouchableOpacity
                key={specialty}
                style={[
                  styles.chip,
                  localFilters.specialties.includes(specialty) && styles.activeChip,
                  localFilters.specialties.includes(specialty) && { backgroundColor: '#7E57C2', borderColor: '#7E57C2' }
                ]}
                onPress={() => handleSpecialtyToggle(specialty)}
              >
                <Text style={[
                  styles.chipText,
                  localFilters.specialties.includes(specialty) && styles.activeChipText
                ]}>
                  {specialty}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
          <Text style={styles.applyButtonText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 16,
  },
  scrollView: {
    maxHeight: 300,
  },
  filterSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 8,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 8,
  },
  sliderValue: {
    minWidth: 50,
    textAlign: 'right',
    color: '#4B5563',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: 'white',
  },
  activeChip: {
    borderColor: '#0F4C81',
  },
  chipText: {
    color: '#4B5563',
  },
  activeChipText: {
    color: 'white',
  },
  chipIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  resetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  resetButtonText: {
    color: '#4B5563',
    fontWeight: '500',
  },
  applyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#0F4C81',
  },
  applyButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});

