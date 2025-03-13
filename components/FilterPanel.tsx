"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { MotiView } from "moti"
import Slider from "@react-native-community/slider"

interface FilterPanelProps {
  onClose: () => void
  onApplyFilters: (filters: any) => void
}

interface Interest {
  name: string;
  selected: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onClose, onApplyFilters }) => {
  const [ageRange, setAgeRange] = useState([18, 45])
  const [distance, setDistance] = useState(25)
  const [activeFilters, setActiveFilters] = useState({
    hasPhoto: true,
    onlineNow: false,
    verified: true,
  })
  const [interests, setInterests] = useState<Interest[]>([
    { name: "Travel", selected: false },
    { name: "Music", selected: false },
    { name: "Sports", selected: false },
    { name: "Reading", selected: false },
    { name: "Cooking", selected: false },
    { name: "Movies", selected: false },
    { name: "Art", selected: false },
    { name: "Photography", selected: false },
  ])

  const handleToggleFilter = (key: 'hasPhoto' | 'onlineNow' | 'verified') => {
    setActiveFilters({
      ...activeFilters,
      [key]: !activeFilters[key],
    })
  }

  const handleToggleInterest = (index: number) => {
    const updatedInterests = [...interests]
    updatedInterests[index].selected = !updatedInterests[index].selected
    setInterests(updatedInterests)
  }

  const handleApplyFilters = () => {
    const selectedInterests = interests.filter((interest) => interest.selected).map((interest) => interest.name)

    onApplyFilters({
      ageRange,
      distance,
      ...activeFilters,
      interests: selectedInterests,
    })
  }

  const handleReset = () => {
    setAgeRange([18, 45])
    setDistance(25)
    setActiveFilters({
      hasPhoto: true,
      onlineNow: false,
      verified: true,
    })
    setInterests(interests.map((interest) => ({ ...interest, selected: false })))
  }

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 350 }}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Filters</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Age Range */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Age Range</Text>
          <Text style={styles.rangeText}>
            {ageRange[0]} - {ageRange[1]}
          </Text>

          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={18}
              maximumValue={80}
              step={1}
              value={ageRange[0]}
              onValueChange={(value) => setAgeRange([value, ageRange[1]])}
              minimumTrackTintColor="#5e72e4"
              maximumTrackTintColor="#d1d1d1"
              thumbTintColor="#5e72e4"
            />
            <Slider
              style={styles.slider}
              minimumValue={18}
              maximumValue={80}
              step={1}
              value={ageRange[1]}
              onValueChange={(value) => setAgeRange([ageRange[0], value])}
              minimumTrackTintColor="#5e72e4"
              maximumTrackTintColor="#d1d1d1"
              thumbTintColor="#5e72e4"
            />
          </View>
        </View>

        {/* Distance */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Distance</Text>
          <Text style={styles.rangeText}>Within {distance} miles</Text>

          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={100}
            step={1}
            value={distance}
            onValueChange={setDistance}
            minimumTrackTintColor="#5e72e4"
            maximumTrackTintColor="#d1d1d1"
            thumbTintColor="#5e72e4"
          />
        </View>

        {/* Toggle Filters */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.toggleContainer}>
            <View style={styles.toggleItem}>
              <Text style={styles.toggleLabel}>Has Profile Photo</Text>
              <Switch
                value={activeFilters.hasPhoto}
                onValueChange={() => handleToggleFilter("hasPhoto")}
                trackColor={{ false: "#d1d1d1", true: "#5e72e4" }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.toggleItem}>
              <Text style={styles.toggleLabel}>Online Now</Text>
              <Switch
                value={activeFilters.onlineNow}
                onValueChange={() => handleToggleFilter("onlineNow")}
                trackColor={{ false: "#d1d1d1", true: "#5e72e4" }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.toggleItem}>
              <Text style={styles.toggleLabel}>Verified Profile</Text>
              <Switch
                value={activeFilters.verified}
                onValueChange={() => handleToggleFilter("verified")}
                trackColor={{ false: "#d1d1d1", true: "#5e72e4" }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* Interests */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Interests</Text>

          <View style={styles.interestsContainer}>
            {interests.map((interest, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.interestBadge, interest.selected && styles.interestBadgeSelected]}
                onPress={() => handleToggleInterest(index)}
              >
                <Text style={[styles.interestText, interest.selected && styles.interestTextSelected]}>
                  {interest.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters}>
          <Text style={styles.applyButtonText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </MotiView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    maxHeight: 500,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  content: {
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  rangeText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  sliderContainer: {
    marginBottom: 8,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  toggleContainer: {
    marginTop: 8,
  },
  toggleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  toggleLabel: {
    fontSize: 14,
    color: "#666",
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  interestBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
    marginBottom: 8,
  },
  interestBadgeSelected: {
    backgroundColor: "#5e72e4",
  },
  interestText: {
    fontSize: 14,
    color: "#666",
  },
  interestTextSelected: {
    color: "#fff",
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d1d1d1",
    borderRadius: 8,
    marginRight: 8,
  },
  resetButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  applyButton: {
    flex: 2,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5e72e4",
    borderRadius: 8,
    marginLeft: 8,
  },
  applyButtonText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
})

export default FilterPanel

