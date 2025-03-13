import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  Pressable,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

interface MatchCardProps {
  profile: any;
  onSelect: () => void;
  isSelected: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({ profile, onSelect, isSelected }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const expandAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(0)).current;
  
  // Separate scale animation for high match profiles
  React.useEffect(() => {
    let pulseAnimationLoop: Animated.CompositeAnimation | null = null;
    
    if (profile.matchPercentage >= 90) {
      pulseAnimationLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      
      pulseAnimationLoop.start();
    }

    // Cleanup function
    return () => {
      if (pulseAnimationLoop) {
        pulseAnimationLoop.stop();
      }
      pulseAnimation.setValue(0);
    };
  }, [profile.matchPercentage]);
  
  const handleExpand = () => {
    setIsExpanded(!isExpanded);
    
    Animated.timing(expandAnimation, {
      toValue: isExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false, // Must be false for height animation
    }).start();
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  
  const handleSave = () => {
    setIsSaved(!isSaved);
    
    if (!isSaved) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };
  
  const handleNextPhoto = () => {
    if (currentPhotoIndex < profile.photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    } else {
      setCurrentPhotoIndex(0);
    }
  };
  
  const handlePrevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    } else {
      setCurrentPhotoIndex(profile.photos.length - 1);
    }
  };
  
  const expandedHeight = expandAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [220, 400],
  });
  
  const pulseScale = pulseAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.03],
  });
  
  const borderColor = isSelected ? '#5e72e4' : 'transparent';
  const borderWidth = isSelected ? 3 : 0;
  
  // Determine match color based on percentage
  const getMatchColor = (): [string, string] => {
    if (profile.matchPercentage >= 90) return ['#4CAF50', '#8BC34A'];
    if (profile.matchPercentage >= 75) return ['#8BC34A', '#CDDC39'];
    if (profile.matchPercentage >= 60) return ['#FFEB3B', '#FFC107'];
    return ['#FFC107', '#FF9800'];
  };

  return (
    <Animated.View
      style={[
        profile.matchPercentage >= 90 && {
          transform: [{ scale: pulseScale }]
        }
      ]}
    >
      <Animated.View
        style={[
          styles.container,
          {
            height: expandedHeight,
            borderColor,
            borderWidth,
          },
        ]}
      >
        {/* Photo Gallery */}
        <Pressable onPress={handleExpand}>
          <View style={styles.photoContainer}>
            <Image
              source={{ uri: profile.photos[currentPhotoIndex] }}
              style={styles.photo}
            />
            
            {/* Photo Navigation */}
            <View style={styles.photoNavigation}>
              <TouchableOpacity 
                style={styles.photoNavButton} 
                onPress={handlePrevPhoto}
              >
                <Ionicons name="chevron-back" size={24} color="#fff" />
              </TouchableOpacity>
              
              <View style={styles.photoIndicators}>
                {profile.photos.map((_: string, index: number) => (
                  <View 
                    key={index} 
                    style={[
                      styles.photoIndicator,
                      currentPhotoIndex === index && styles.photoIndicatorActive
                    ]} 
                  />
                ))}
              </View>
              
              <TouchableOpacity 
                style={styles.photoNavButton} 
                onPress={handleNextPhoto}
              >
                <Ionicons name="chevron-forward" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            
            {/* Match Percentage */}
            <LinearGradient
              colors={getMatchColor()}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.matchBadge}
            >
              <Text style={styles.matchText}>{profile.matchPercentage}% Match</Text>
            </LinearGradient>
            
            {/* Last Active */}
            <View style={styles.lastActiveBadge}>
              <View style={styles.activeIndicator} />
              <Text style={styles.lastActiveText}>{profile.lastActive}</Text>
            </View>
            
            {/* Photo Overlay Gradient */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.photoGradient}
            />
            
            {/* Basic Info */}
            <View style={styles.basicInfo}>
              <View style={styles.nameAgeContainer}>
                <Text style={styles.name}>{profile.name}</Text>
                <Text style={styles.age}>{profile.age}</Text>
              </View>
              
              <View style={styles.locationContainer}>
                <Ionicons name="location-outline" size={16} color="#fff" />
                <Text style={styles.location}>{profile.location}</Text>
                {profile.distance && (
                  <Text style={styles.distance}> • {profile.distance} away</Text>
                )}
              </View>
            </View>
          </View>
        </Pressable>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={onSelect}
          >
            <Ionicons 
              name={isSelected ? "checkmark-circle" : "checkmark-circle-outline"} 
              size={24} 
              color={isSelected ? "#5e72e4" : "#666"} 
            />
            <Text style={[styles.actionText, isSelected && styles.actionTextActive]}>
              {isSelected ? 'Selected' : 'Select'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleSave}
          >
            <Ionicons 
              name={isSaved ? "heart" : "heart-outline"} 
              size={24} 
              color={isSaved ? "#e91e63" : "#666"} 
            />
            <Text style={[styles.actionText, isSaved && styles.savedText]}>
              {isSaved ? 'Saved' : 'Save'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Feather name="share" size={22} color="#666" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>
        
        {/* Expanded Content */}
        {isExpanded && (
          <MotiView
            from={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ type: 'timing', duration: 300 }}
            style={styles.expandedContent}
          >
            <Text style={styles.aboutTitle}>About</Text>
            <Text style={styles.aboutText}>{profile.about}</Text>
            
            <Text style={styles.interestsTitle}>Interests</Text>
            <View style={styles.interestsContainer}>
              {profile.interests.map((interest: string, index: number) => (
                <View key={index} style={styles.interestBadge}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
            
            <View style={styles.detailsContainer}>
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="school-outline" size={18} color="#666" />
                <Text style={styles.detailText}>{profile.education}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="briefcase-outline" size={18} color="#666" />
                <Text style={styles.detailText}>{profile.occupation}</Text>
              </View>
            </View>
          </MotiView>
        )}
        
        {/* Expand Button */}
        <TouchableOpacity 
          style={styles.expandButton}
          onPress={handleExpand}
        >
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#666" 
          />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  photoContainer: {
    height: 220,
    width: '100%',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  basicInfo: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  nameAgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 8,
  },
  age: {
    fontSize: 20,
    color: '#fff',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 4,
  },
  distance: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  matchBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  matchText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  lastActiveBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginRight: 4,
  },
  lastActiveText: {
    color: '#fff',
    fontSize: 12,
  },
  photoNavigation: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  photoNavButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoIndicators: {
    flexDirection: 'row',
    position: 'absolute',
    top: 12,
    left: 0,
    right: 0,
    justifyContent: 'center',
  },
  photoIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 2,
  },
  photoIndicatorActive: {
    backgroundColor: '#fff',
    width: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  actionTextActive: {
    color: '#5e72e4',
  },
  savedText: {
    color: '#e91e63',
  },
  expandedContent: {
    padding: 16,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  interestsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  interestBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    fontSize: 13,
    color: '#666',
  },
  detailsContainer: {
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  expandButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
});

export default MatchCard;
