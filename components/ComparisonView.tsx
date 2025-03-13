"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { MotiView } from "moti"

const { width } = Dimensions.get("window")

interface Profile {
  age: number
  location: string
  distance: string
  matchPercentage: number
  lastActive: string
  interests: string[]
  education: string
  occupation: string
  about: string
  name: string
  photos: string[]
}

interface ComparisonProps {
  profiles: Profile[]
  onClose: () => void
}

interface ComparisonItem {
  label: string
  value1: string | number
  value2: string | number
}

interface ComparisonRowProps {
  label: string;
  value1: string | number;
  value2: string | number;
  highlight?: boolean;
}

const ComparisonView: React.FC<ComparisonProps> = ({ profiles, onClose }) => {
  const [currentSection, setCurrentSection] = useState("basic")

  if (profiles.length !== 2) {
    return null
  }

  const sections = [
    { id: "basic", label: "Basic Info" },
    { id: "interests", label: "Interests" },
    { id: "details", label: "Details" },
  ]

  const renderBasicInfo = () => (
    <View style={styles.comparisonSection}>
      <ComparisonRow label="Age" value1={profiles[0].age.toString()} value2={profiles[1].age.toString()} />
      <ComparisonRow label="Location" value1={profiles[0].location} value2={profiles[1].location} />
      <ComparisonRow label="Distance" value1={profiles[0].distance} value2={profiles[1].distance} />
      <ComparisonRow
        label="Match %"
        value1={`${profiles[0].matchPercentage}%`}
        value2={`${profiles[1].matchPercentage}%`}
        highlight={true}
      />
      <ComparisonRow label="Last Active" value1={profiles[0].lastActive} value2={profiles[1].lastActive} />
    </View>
  )

  const renderInterests = () => (
    <View style={styles.comparisonSection}>
      <View style={styles.interestsComparison}>
        <View style={styles.interestColumn}>
          {profiles[0].interests.map((interest: string, index: number) => (
            <View key={index} style={styles.interestBadge}>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))}
        </View>

        <View style={styles.interestColumn}>
          {profiles[1].interests.map((interest: string, index: number) => (
            <View key={index} style={styles.interestBadge}>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.commonInterests}>
        <Text style={styles.commonInterestsTitle}>Common Interests</Text>
        <View style={styles.commonInterestsList}>
          {profiles[0].interests
            .filter((interest: string) => profiles[1].interests.includes(interest))
            .map((interest: string, index: number) => (
              <View key={index} style={styles.commonInterestBadge}>
                <Text style={styles.commonInterestText}>{interest}</Text>
              </View>
            ))}
        </View>
      </View>
    </View>
  )

  const renderDetails = () => (
    <View style={styles.comparisonSection}>
      <ComparisonRow label="Education" value1={profiles[0].education} value2={profiles[1].education} />
      <ComparisonRow label="Occupation" value1={profiles[0].occupation} value2={profiles[1].occupation} />
      <View style={styles.aboutComparison}>
        <View style={styles.aboutColumn}>
          <Text style={styles.aboutTitle}>About {profiles[0].name}</Text>
          <Text style={styles.aboutText}>{profiles[0].about}</Text>
        </View>
        <View style={styles.aboutColumn}>
          <Text style={styles.aboutTitle}>About {profiles[1].name}</Text>
          <Text style={styles.aboutText}>{profiles[1].about}</Text>
        </View>
      </View>
    </View>
  )

  const renderComparisonItem = ({ label, value1, value2 }: ComparisonItem) => (
    <View style={styles.comparisonRow}>
      <View style={styles.labelColumn}>
        <Text style={styles.rowLabel}>{label}</Text>
      </View>

      <View style={styles.valueColumn}>
        <Text style={[styles.rowValue, value1 === value2 && styles.highlightValue]}>{value1}</Text>
      </View>

      <View style={styles.valueColumn}>
        <Text style={[styles.rowValue, value1 === value2 && styles.highlightValue]}>{value2}</Text>
      </View>

      {value1 === value2 && (
        <View style={styles.matchIndicator}>
          <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
        </View>
      )}
    </View>
  )

  return (
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: "timing", duration: 300 }}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Compare Matches</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.profilesContainer}>
        <View style={styles.profileColumn}>
          <Image source={{ uri: profiles[0].photos[0] }} style={styles.profileImage} />
          <Text style={styles.profileName}>{profiles[0].name}</Text>
        </View>

        <View style={styles.vsContainer}>
          <View style={styles.vsCircle}>
            <Text style={styles.vsText}>VS</Text>
          </View>
        </View>

        <View style={styles.profileColumn}>
          <Image source={{ uri: profiles[1].photos[0] }} style={styles.profileImage} />
          <Text style={styles.profileName}>{profiles[1].name}</Text>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        {sections.map((section) => (
          <TouchableOpacity
            key={section.id}
            style={[styles.tabButton, currentSection === section.id && styles.tabButtonActive]}
            onPress={() => setCurrentSection(section.id)}
          >
            <Text style={[styles.tabButtonText, currentSection === section.id && styles.tabButtonTextActive]}>
              {section.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.contentContainer}>
        {currentSection === "basic" && renderBasicInfo()}
        {currentSection === "interests" && renderInterests()}
        {currentSection === "details" && renderDetails()}
      </ScrollView>
    </MotiView>
  )
}

const ComparisonRow: React.FC<ComparisonRowProps> = ({ label, value1, value2, highlight = false }) => {
  const isSame = value1 === value2

  return (
    <View style={styles.comparisonRow}>
      <View style={styles.labelColumn}>
        <Text style={styles.rowLabel}>{label}</Text>
      </View>

      <View style={styles.valueColumn}>
        <Text style={[styles.rowValue, highlight && styles.highlightValue]}>{value1}</Text>
      </View>

      <View style={styles.valueColumn}>
        <Text style={[styles.rowValue, highlight && styles.highlightValue]}>{value2}</Text>
      </View>

      {isSame && (
        <View style={styles.matchIndicator}>
          <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    zIndex: 1000,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  profilesContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  profileColumn: {
    alignItems: "center",
    flex: 2,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  vsContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  vsCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#5e72e4",
    alignItems: "center",
    justifyContent: "center",
  },
  vsText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#5e72e4",
  },
  tabButtonText: {
    fontSize: 14,
    color: "#666",
  },
  tabButtonTextActive: {
    color: "#5e72e4",
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
  },
  comparisonSection: {
    padding: 16,
  },
  comparisonRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    position: "relative",
  },
  labelColumn: {
    width: "30%",
  },
  valueColumn: {
    width: "35%",
    paddingHorizontal: 8,
  },
  rowLabel: {
    fontSize: 14,
    color: "#666",
  },
  rowValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  highlightValue: {
    color: "#5e72e4",
    fontWeight: "bold",
  },
  matchIndicator: {
    position: "absolute",
    right: 0,
  },
  interestsComparison: {
    flexDirection: "row",
    marginBottom: 16,
  },
  interestColumn: {
    flex: 1,
    padding: 8,
  },
  interestBadge: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
    alignItems: "center",
  },
  interestText: {
    fontSize: 13,
    color: "#666",
  },
  commonInterests: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  commonInterestsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  commonInterestsList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  commonInterestBadge: {
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  commonInterestText: {
    fontSize: 13,
    color: "#4CAF50",
  },
  aboutComparison: {
    flexDirection: "row",
    marginTop: 16,
  },
  aboutColumn: {
    flex: 1,
    padding: 8,
  },
  aboutTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
})

export default ComparisonView

