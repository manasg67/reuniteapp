    import { useState, useEffect } from "react"
    import { View, Text, ScrollView, TouchableOpacity, TextInput, Animated, StyleSheet } from "react-native"
    import { Search, Filter, Shield, Users, User, Grid, List } from "lucide-react-native"
    import { StatusBar } from "expo-status-bar"
    import FilterPanel from "../components/filter-panel"
    import OrganizationCard from "../components/organization-card"
    import { mockData } from "../data/mock-data"

    export default function DirectoryPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [activeTab, setActiveTab] = useState("all")
    const [viewMode, setViewMode] = useState("grid")
    const [filteredData, setFilteredData] = useState(mockData)
    const [selectedFilters, setSelectedFilters] = useState({
        location: 50, // default radius in km
        specialties: [],
        status: "all",
        verification: "all",
        responseTime: [0, 60], // in minutes
    })

    const filterAnimation = new Animated.Value(0)

    useEffect(() => {
        Animated.timing(filterAnimation, {
        toValue: isFilterOpen ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
        }).start()
    }, [isFilterOpen])

    const filterHeight = filterAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 350],
    })

    const handleSearch = (text: string) => {
        setSearchQuery(text)
        if (text.length > 0) {
        const filtered = mockData.filter(
            (item) =>
            item.name.toLowerCase().includes(text.toLowerCase()) ||
            item.location.toLowerCase().includes(text.toLowerCase()) ||
            (item.specialties && item.specialties.some((s) => s.toLowerCase().includes(text.toLowerCase()))),
        )
        setFilteredData(filtered)
        } else {
        setFilteredData(mockData)
        }
    }

    const handleTabChange = (tab: string) => {
        setActiveTab(tab)
        if (tab === "all") {
        setFilteredData(mockData)
        } else {
        const filtered = mockData.filter((item) => item.type === tab)
        setFilteredData(filtered)
        }
    }

    const toggleFilterPanel = () => {
        setIsFilterOpen(!isFilterOpen)
    }

    const applyFilters = (filters: any) => {
        setSelectedFilters(filters)

        // Apply filters to data
        let filtered = mockData

        // Filter by type if not 'all'
        if (activeTab !== "all") {
        filtered = filtered.filter((item) => item.type === activeTab)
        }

        // Filter by status
        if (filters.status !== "all") {
        filtered = filtered.filter((item) => item.status === filters.status)
        }

        // Filter by verification
        if (filters.verification !== "all") {
        filtered = filtered.filter((item) => item.verification === filters.verification)
        }

        // Filter by specialties if any selected
        if (filters.specialties.length > 0) {
        filtered = filtered.filter(
            (item) => item.specialties && item.specialties.some((s) => filters.specialties.includes(s)),
        )
        }

        // Filter by response time
        filtered = filtered.filter(
        (item) => item.responseTime >= filters.responseTime[0] && item.responseTime <= filters.responseTime[1],
        )

        setFilteredData(filtered)
        setIsFilterOpen(false)
    }

    const getIconForTab = (tab: string) => {
        switch (tab) {
        case "lawEnforcement":
            return <Shield className="h-5 w-5 text-primary" />
        case "ngo":
            return <Users className="h-5 w-5 text-tertiary" />
        case "volunteer":
            return <User className="h-5 w-5 text-secondary" />
        default:
            return null
        }
    }

    return (
        <View style={styles.container}>
        <StatusBar style="dark" />
        {/* Search and Filter Bar */}
        <View style={styles.searchBarContainer}>
            <View style={styles.searchInputContainer}>
            <Search style={styles.searchIcon} />
            <TextInput
                style={styles.searchInput}
                placeholder="Search by name, location, or specialty"
                value={searchQuery}
                onChangeText={handleSearch}
            />
            </View>

            <View style={styles.tabContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                style={[styles.tab, activeTab === "all" && styles.activeTab]}
                onPress={() => handleTabChange("all")}
                >
                <Text style={[styles.tabText, activeTab === "all" && styles.activeTabText]}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                style={[styles.tab, activeTab === "lawEnforcement" && styles.activeTab]}
                onPress={() => handleTabChange("lawEnforcement")}
                >
                <View style={styles.tabContent}>
                    <Shield style={styles.tabIcon} />
                    <Text style={[styles.tabText, activeTab === "lawEnforcement" && styles.activeTabText]}>
                    Law Enforcement
                    </Text>
                </View>
                </TouchableOpacity>
                <TouchableOpacity
                style={[styles.tab, activeTab === "ngo" && styles.activeTab]}
                onPress={() => handleTabChange("ngo")}
                >
                <View style={styles.tabContent}>
                    <Users style={styles.tabIcon} />
                    <Text style={[styles.tabText, activeTab === "ngo" && styles.activeTabText]}>NGOs</Text>
                </View>
                </TouchableOpacity>
                <TouchableOpacity
                style={[styles.tab, activeTab === "volunteer" && styles.activeTab]}
                onPress={() => handleTabChange("volunteer")}
                >
                <View style={styles.tabContent}>
                    <User style={styles.tabIcon} />
                    <Text style={[styles.tabText, activeTab === "volunteer" && styles.activeTabText]}>
                    Volunteers
                    </Text>
                </View>
                </TouchableOpacity>
            </ScrollView>

            <View style={styles.viewControls}>
                <TouchableOpacity
                style={[styles.viewModeButton, viewMode === "grid" && styles.activeViewMode]}
                onPress={() => setViewMode("grid")}
                >
                <Grid 
                    color={viewMode === "grid" ? styles.activeViewModeIcon.color : styles.viewModeIcon.color} 
                    size={20} 
                />
                </TouchableOpacity>
                <TouchableOpacity
                style={[styles.viewModeButton, viewMode === "list" && styles.activeViewMode]}
                onPress={() => setViewMode("list")}
                >
                <List 
                    color={viewMode === "list" ? styles.activeViewModeIcon.color : styles.viewModeIcon.color}
                    size={20}
                />
                </TouchableOpacity>
                <TouchableOpacity
                style={[styles.viewModeButton, isFilterOpen && styles.activeViewMode]}
                onPress={toggleFilterPanel}
                >
                <Filter 
                    color={isFilterOpen ? styles.activeViewModeIcon.color : styles.viewModeIcon.color}
                    size={20}
                />
                </TouchableOpacity>
            </View>
            </View>
        </View>

        {/* Filter Panel */}
        <Animated.View style={[{ height: filterHeight, overflow: "hidden" }]}>
            <FilterPanel filters={selectedFilters} onApplyFilters={applyFilters} />
        </Animated.View>

        {/* Results Count */}
        <View style={styles.resultsContainer}>
            <Text style={styles.resultsText}>{filteredData.length} results</Text>
        </View>

        {/* Directory Content */}
        <ScrollView
            style={styles.directoryContent}
            contentContainerStyle={[
            styles.directoryContentContainer,
            viewMode === "grid" && styles.gridContainer
            ]}
        >
            {filteredData.length > 0 ? (
            filteredData.map((item) => <OrganizationCard key={item.id} data={item} viewMode={viewMode} />)
            ) : (
            <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsTitle}>No results found</Text>
                <Text style={styles.noResultsText}>
                Try adjusting your search or filters to find what you're looking for
                </Text>
            </View>
            )}
        </ScrollView>
        </View>
    )
    }

    const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFC',
    },
    searchBarContainer: {
        padding: 16,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 3,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F2F5',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 12,
    },
    searchIcon: {
        height: 20,
        width: 20,
        color: '#6B7280',
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        fontWeight: 'normal',
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    tab: {
        marginRight: 16,
        paddingVertical: 8,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#0F4C81',
    },
    tabContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tabIcon: {
        height: 16,
        width: 16,
        marginRight: 4,
        color: '#6B7280',
    },
    tabText: {
        fontWeight: '500',
        color: '#6B7280',
    },
    activeTabText: {
        color: '#0F4C81',
    },
    viewControls: {
        flexDirection: 'row',
    },
    viewModeButton: {
        marginLeft: 8,
        padding: 8,
        borderRadius: 9999,
        backgroundColor: 'transparent',
    },
    activeViewMode: {
        backgroundColor: '#F0F2F5',
    },
    viewModeIcon: {
        height: 20,
        width: 20,
        color: '#6B7280',
    },
    activeViewModeIcon: {
        color: '#0F4C81',
    },
    resultsContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    resultsText: {
        color: '#6B7280',
        fontWeight: '500',
    },
    directoryContent: {
        flex: 1,
        padding: 16,
    },
    directoryContentContainer: {
        paddingBottom: 20,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    noResultsContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    noResultsTitle: {
        fontSize: 18,
        color: '#6B7280',
        marginBottom: 8,
    },
    noResultsText: {
        color: '#9CA3AF',
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    });

