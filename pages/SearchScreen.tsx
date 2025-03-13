import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Dimensions, 
  TouchableOpacity, 
  Animated, 
  TextInput,
  Image,
  FlatList,
  ActivityIndicator,
  Platform,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';
import { Audio } from 'expo-av';
import { BlurView } from 'expo-blur';
import { FlashList } from '@shopify/flash-list';

import SearchBar from '../components/SearchBar';
import MatchCard from '../components/MatchCard';
import FilterPanel from '../components/FilterPanel';
import VoiceSearch from '../components/VoiceSearch';
import EmptyState from '../components/EmptyState';
import ComparisonView from '../components/ComparisonView';
import { mockProfiles } from '../data/mockData';

const { width } = Dimensions.get('window');

interface Profile {
  id: string;
  name: string;
  age: number;
  location: string;
  distance: string;
  matchPercentage: number;
  lastActive: string;
  interests: string[];
  education: string;
  occupation: string;
  about: string;
  photos: string[];
}

interface Filters {
  age?: number;
  location?: string;
  distance?: number;
  // add other filter properties as needed
}

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isVoiceSearchActive, setIsVoiceSearchActive] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Profile[]>([]);
  const [selectedProfiles, setSelectedProfiles] = useState<Profile[]>([]);
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [sortOption, setSortOption] = useState('relevance');
  const [activeFilters, setActiveFilters] = useState<Filters>({});
  
  const searchAnimation = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Simulate search results loading
  const performSearch = (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    
    setIsLoading(true);
    
    // Simulate network request
    setTimeout(() => {
      // Filter mock data based on query
      const filtered = mockProfiles.filter(profile => 
        profile.name.toLowerCase().includes(query.toLowerCase()) ||
        profile.location.toLowerCase().includes(query.toLowerCase()) ||
        profile.interests.some(interest => 
          interest.toLowerCase().includes(query.toLowerCase())
        )
      );
      
      setResults(filtered);
      setIsLoading(false);
    }, 1200);
  };
  
  // Debounce search input
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      performSearch(searchQuery);
    }, 500);
    
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);
  
  // Expand/collapse search bar animation
  useEffect(() => {
    Animated.timing(searchAnimation, {
      toValue: isSearchFocused ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isSearchFocused]);
  
  const searchBarWidth = searchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [width - 120, width - 32]
  });
  
  const filterOpacity = searchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0]
  });
  
  const handleVoiceSearch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsVoiceSearchActive(true);
  };
  
  const handleFilterToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsFilterVisible(!isFilterVisible);
  };
  
  const handleSelectProfile = (profile: Profile) => {
    if (selectedProfiles.some(p => p.id === profile.id)) {
      setSelectedProfiles(selectedProfiles.filter(p => p.id !== profile.id));
    } else {
      if (selectedProfiles.length < 2) {
        setSelectedProfiles([...selectedProfiles, profile]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    }
  };
  
  const handleCompareProfiles = () => {
    if (selectedProfiles.length === 2) {
      setIsComparisonMode(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };
  
  const handleCloseComparison = () => {
    setIsComparisonMode(false);
    setSelectedProfiles([]);
  };
  
  const renderItem = ({ item, index }: { item: Profile; index: number }) => {
    const isSelected = selectedProfiles.some(p => p.id === item.id);
    
    return (
      <Animated.View
        style={[
          styles.itemContainer,
          {
            opacity: scrollY.interpolate({
              inputRange: [index * 350, (index + 1) * 350],
              outputRange: [1, 0.5],
              extrapolate: 'clamp',
            }),
            transform: [{
              translateY: scrollY.interpolate({
                inputRange: [index * 350, (index + 1) * 350],
                outputRange: [0, 50],
                extrapolate: 'clamp',
              }),
            }],
          },
        ]}
      >
        <MatchCard 
          profile={item} 
          onSelect={() => handleSelectProfile(item)}
          isSelected={isSelected}
        />
      </Animated.View>
    );
  };
  
  const renderHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.resultsCount}>
        {results.length} {results.length === 1 ? 'match' : 'matches'} found
      </Text>
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <TouchableOpacity style={styles.sortButton}>
          <Text style={styles.sortButtonText}>
            {sortOption === 'relevance' ? 'Relevance' : 
             sortOption === 'recent' ? 'Most Recent' : 'Match %'}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={18} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );
  
  const renderEmpty = () => (
    <EmptyState 
      query={searchQuery} 
      isLoading={isLoading} 
    />
  );

  return (
    <SafeAreaView style={styles.container}>
        
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Matches</Text>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Animated.View style={[styles.searchBarContainer, { width: searchBarWidth }]}>
          <SearchBar 
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            onClear={() => setSearchQuery('')}
            onSubmit={() => performSearch(searchQuery)}
            onVoiceSearch={handleVoiceSearch}
            voiceActive={isVoiceSearchActive}
          />
        </Animated.View>
        
        <Animated.View style={[styles.actionButtons, { opacity: filterOpacity }]}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleVoiceSearch}
            disabled={isSearchFocused}
          >
            <Ionicons name="mic-outline" size={22} color="#333" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.iconButton, 
              isFilterVisible && styles.iconButtonActive
            ]}
            onPress={handleFilterToggle}
            disabled={isSearchFocused}
          >
            <Feather 
              name="sliders" 
              size={22} 
              color={isFilterVisible ? "#fff" : "#333"} 
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
      
      {/* Filter Panel */}
      {isFilterVisible && (
        <FilterPanel 
          onClose={handleFilterToggle}
          onApplyFilters={(filters: Filters) => {
            setActiveFilters(filters);
            setIsFilterVisible(false);
          }}
        />
      )}
      
      {/* Voice Search Modal */}
      {isVoiceSearchActive && (
        <VoiceSearch 
          onClose={() => setIsVoiceSearchActive(false)}
          onResult={(text) => {
            setSearchQuery(text);
            setIsVoiceSearchActive(false);
          }}
        />
      )}
      
      {/* Comparison Mode */}
      {isComparisonMode && (
        <ComparisonView 
          profiles={selectedProfiles}
          onClose={handleCloseComparison}
        />
      )}
      
      {/* Selected Profiles Bar */}
      {selectedProfiles.length > 0 && !isComparisonMode && (
        <View style={styles.selectedBar}>
          <View style={styles.selectedProfiles}>
            {selectedProfiles.map((profile) => (
              <View key={profile.id} style={styles.selectedProfileItem}>
                <Image 
                  source={{ uri: profile.photos[0] }} 
                  style={styles.selectedProfileImage} 
                />
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => handleSelectProfile(profile)}
                >
                  <Ionicons name="close-circle" size={20} color="#333" />
                </TouchableOpacity>
              </View>
            ))}
            {selectedProfiles.length === 1 && (
              <View style={styles.addMoreContainer}>
                <Text style={styles.addMoreText}>Select one more to compare</Text>
              </View>
            )}
          </View>
          
          {selectedProfiles.length === 2 && (
            <TouchableOpacity 
              style={styles.compareButton}
              onPress={handleCompareProfiles}
            >
              <Text style={styles.compareButtonText}>Compare</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {/* Results List */}
      <View style={styles.resultsContainer}>
        {searchQuery.length > 0 ? (
          <FlashList
            data={results}
            renderItem={renderItem}
            estimatedItemSize={350}
            ListHeaderComponent={results.length > 0 ? renderHeader : null}
            ListEmptyComponent={renderEmpty}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true }
            )}
          />
        ) : (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateTitle}>Find Your Missing Person</Text>
            <Text style={styles.emptyStateText}>
              Start typing to search for missing person based on name, location, or interests
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBarContainer: {
    height: 50,
  },
  actionButtons: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  iconButtonActive: {
    backgroundColor: '#5e72e4',
  },
  resultsContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 8,
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sortButtonText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyStateImage: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  selectedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedProfiles: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedProfileItem: {
    marginRight: 12,
    position: 'relative',
  },
  selectedProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#5e72e4',
  },
  removeButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  addMoreContainer: {
    flex: 1,
  },
  addMoreText: {
    fontSize: 14,
    color: '#666',
  },
  compareButton: {
    backgroundColor: '#5e72e4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  compareButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  itemContainer: {
    // Add any necessary styles for the item container
  },
});
