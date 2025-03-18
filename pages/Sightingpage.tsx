import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { SafeAreaView } from "react-native-safe-area-context"
import { router } from "expo-router"

export default function HomeScreen() {
  const navigation = useNavigation()

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Missing Persons Sightings</Text>
        
      </View>

      <View style={styles.cardsContainer}>
        <TouchableOpacity style={styles.card} onPress={() => router.push("/sightlist")} activeOpacity={0.7}>
          <View style={[styles.iconContainer, { backgroundColor: "#E6F0FB" }]}>
            <Feather name="list" size={24} color="#2B6CB0" />
          </View>
          <Text style={styles.cardTitle}>View Sightings</Text>
          <Text style={styles.cardDescription}>Browse and filter through reported sightings of missing persons.</Text>
          <View style={styles.buttonContainer}>
            <Text style={[styles.buttonText, { color: "#2B6CB0" }]}>View Sightings</Text>
            <Feather name="arrow-right" size={16} color="#2B6CB0" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => router.push("/sightreport")} activeOpacity={0.7}>
          <View style={[styles.iconContainer, { backgroundColor: "#FFF8E6" }]}>
            <Feather name="plus-circle" size={24} color="#F59E0B" />
          </View>
          <Text style={styles.cardTitle}>Report Sighting</Text>
          <Text style={styles.cardDescription}>
            Submit a new sighting report with details to help locate missing persons.
          </Text>
          <View style={styles.buttonContainer}>
            <Text style={[styles.buttonText, { color: "#F59E0B" }]}>Report Sighting</Text>
            <Feather name="arrow-right" size={16} color="#F59E0B" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/sightdetails")}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, { backgroundColor: "#E7F5E8" }]}>
            <Feather name="file-text" size={24} color="#48BB78" />
          </View>
          <Text style={styles.cardTitle}>Sighting Details</Text>
          <Text style={styles.cardDescription}>View detailed information about specific sighting reports.</Text>
          <View style={styles.buttonContainer}>
            <Text style={[styles.buttonText, { color: "#48BB78" }]}>View Details</Text>
            <Feather name="arrow-right" size={16} color="#48BB78" />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
    paddingTop: 50,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A365D",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  cardsContainer: {
    flex: 1,
    gap: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    alignSelf: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  cardDescription: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 16,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
  },
})

