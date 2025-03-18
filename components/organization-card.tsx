"use client"

import { useState } from "react"
import { View, Text, Image, TouchableOpacity, Animated, StyleSheet } from "react-native"
import {
  MapPin,
  Shield,
  Users,
  User,
  Check,
  Clock,
  Phone,
  Mail,
  Star,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Share,
  AlertTriangle,
} from "lucide-react-native"

export default function OrganizationCard({ data, viewMode }: { data: any, viewMode: string }) {
  const [expanded, setExpanded] = useState(false)
  const expandAnimation = new Animated.Value(0)

  const toggleExpand = () => {
    const newValue = !expanded
    setExpanded(newValue)

    Animated.timing(expandAnimation, {
      toValue: newValue ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }

  const expandHeight = expandAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 150],
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#43A047"
      case "pending":
        return "#FFB300"
      case "inactive":
        return "#9E9E9E"
      default:
        return "#9E9E9E"
    }
  }

  const getVerificationBadge = () => {
    if (data.verification === "verified") {
      return (
        <View className="flex-row items-center bg-[#E8F5E9] px-2 py-1 rounded-full">
          <Check className="h-3 w-3 text-[#43A047] mr-1" />
          <Text className="text-[#43A047] text-xs font-medium">Verified</Text>
        </View>
      )
    } else if (data.verification === "pending") {
      return (
        <View className="flex-row items-center bg-[#FFF8E1] px-2 py-1 rounded-full">
          <AlertTriangle className="h-3 w-3 text-[#FFB300] mr-1" />
          <Text className="text-[#FFB300] text-xs font-medium">Pending</Text>
        </View>
      )
    }
    return null
  }

  const getTypeIcon = () => {
    switch (data.type) {
      case "lawEnforcement":
        return <Shield className="h-5 w-5 text-[#0F4C81]" />
      case "ngo":
        return <Users className="h-5 w-5 text-[#7E57C2]" />
      case "volunteer":
        return <User className="h-5 w-5 text-[#FF6E40]" />
      default:
        return null
    }
  }

  const getResponseTimeColor = (time: number) => {
    if (time <= 15) return "#43A047"
    if (time <= 30) return "#FFB300"
    return "#F44336"
  }

  const renderGridCard = () => (
    <TouchableOpacity
      style={[styles.card, styles.gridCard]}
      onPress={toggleExpand}
      activeOpacity={0.9}
    >
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.headerRow}>
          {getTypeIcon()}
          {getVerificationBadge()}
        </View>

        {data.type === "volunteer" && data.image ? (
          <Image
            source={{ uri: data.image }}
            style={styles.volunteerImage}
            accessibilityLabel={`Profile photo of ${data.name}`}
          />
        ) : data.type !== "volunteer" && data.logo ? (
          <Image
            source={{ uri: data.logo }}
            style={styles.orgLogo}
            accessibilityLabel={`Logo of ${data.name}`}
          />
        ) : (
          <View style={styles.placeholderIcon}>
            {getTypeIcon()}
          </View>
        )}

        <Text style={styles.orgName} numberOfLines={2}>
          {data.name}
        </Text>

        <View style={styles.locationContainer}>
          <MapPin color="#6B7280" size={12} />
          <Text style={styles.locationText} numberOfLines={1}>
            {data.location}
          </Text>
        </View>

        {data.specialties && data.specialties.length > 0 && (
          <View style={styles.specialtiesContainer}>
            {data.specialties.slice(0, 2).map((specialty: string, index: number) => (
              <View key={index} style={styles.specialtyTag}>
                <Text style={styles.specialtyText}>{specialty}</Text>
              </View>
            ))}
            {data.specialties.length > 2 && (
              <View style={styles.specialtyTag}>
                <Text style={styles.specialtyText}>+{data.specialties.length - 2}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Card Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(data.status) }]} />
          <Text style={styles.statusText}>{data.status}</Text>
        </View>

        <View style={styles.responseTimeContainer}>
          <Clock size={12} color={getResponseTimeColor(data.responseTime)} />
          <Text style={[styles.responseTimeText, { color: getResponseTimeColor(data.responseTime) }]}>
            {data.responseTime} min
          </Text>
        </View>
      </View>

      {/* Expandable Content */}
      <Animated.View style={[{ height: expandHeight, overflow: "hidden" }]}>
        <View style={styles.expandedContent}>
          {data.contact && (
            <View style={styles.contactSection}>
              <Text style={styles.sectionTitle}>Contact</Text>
              {data.contact.phone && (
                <View style={styles.contactRow}>
                  <Phone size={16} color="#6B7280" />
                  <Text style={styles.contactText}>{data.contact.phone}</Text>
                </View>
              )}
              {data.contact.email && (
                <View style={styles.contactRow}>
                  <Mail size={16} color="#6B7280" />
                  <Text style={styles.contactText}>{data.contact.email}</Text>
                </View>
              )}
            </View>
          )}

          {data.rating && (
            <View style={styles.ratingContainer}>
              <Text style={styles.sectionTitle}>Rating:</Text>
              <View style={styles.ratingRow}>
                <Star size={16} color="#FFB300" />
                <Text style={styles.ratingText}>{data.rating}/5</Text>
              </View>
            </View>
          )}

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Bookmark size={16} color="#0F4C81" />
              <Text style={styles.actionButtonText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Share size={16} color="#0F4C81" />
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Expand Button */}
      <TouchableOpacity style={styles.expandButton} onPress={toggleExpand}>
        {expanded ? 
          <ChevronUp size={16} color="#6B7280" /> : 
          <ChevronDown size={16} color="#6B7280" />
        }
      </TouchableOpacity>
    </TouchableOpacity>
  )

  const renderListCard = () => (
    <TouchableOpacity
      style={[styles.card, styles.listCard]}
      onPress={toggleExpand}
      activeOpacity={0.9}
    >
      <View style={styles.listCardContent}>
        <View style={styles.listCardRow}>
          {/* Left Column - Image/Logo */}
          <View style={styles.listCardImageContainer}>
            {data.type === "volunteer" && data.image ? (
              <Image
                source={{ uri: data.image }}
                style={styles.listCardImage}
                accessibilityLabel={`Profile photo of ${data.name}`}
              />
            ) : data.type !== "volunteer" && data.logo ? (
              <Image 
                source={{ uri: data.logo }} 
                style={styles.listCardLogo} 
                accessibilityLabel={`Logo of ${data.name}`} 
              />
            ) : (
              <View style={styles.listCardPlaceholder}>
                {getTypeIcon()}
              </View>
            )}
            <View style={styles.verificationBadgeContainer}>
              {getVerificationBadge()}
            </View>
          </View>

          {/* Right Column - Details */}
          <View style={styles.listCardDetails}>
            <View style={styles.listCardHeader}>
              <View style={styles.listCardTitleContainer}>
                <Text style={styles.listCardTitle} numberOfLines={1}>
                  {data.name}
                </Text>
                <View style={styles.listCardLocation}>
                  <MapPin size={12} color="#6B7280" />
                  <Text style={styles.listCardLocationText} numberOfLines={1}>
                    {data.location}
                  </Text>
                </View>
              </View>

              <View style={styles.listCardStatus}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(data.status) }]} />
                <Text style={styles.statusText}>{data.status}</Text>
              </View>
            </View>

            {data.specialties && data.specialties.length > 0 && (
              <View style={styles.listCardSpecialties}>
                {data.specialties.slice(0, 3).map((specialty: string, index: number) => (
                  <View key={index} style={styles.specialtyTag}>
                    <Text style={styles.specialtyText}>{specialty}</Text>
                  </View>
                ))}
                {data.specialties.length > 3 && (
                  <View style={styles.specialtyTag}>
                    <Text style={styles.specialtyText}>+{data.specialties.length - 3}</Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.listCardFooter}>
              <View style={styles.responseTimeContainer}>
                <Clock size={12} color={getResponseTimeColor(data.responseTime)} />
                <Text style={[styles.responseTimeText, { color: getResponseTimeColor(data.responseTime) }]}>
                  {data.responseTime} min response
                </Text>
              </View>

              {data.rating && (
                <View style={styles.ratingRow}>
                  <Star size={12} color="#FFB300" />
                  <Text style={styles.ratingText}>{data.rating}/5</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Expandable Content */}
        <Animated.View style={[{ height: expandHeight, overflow: "hidden" }]}>
          <View style={styles.listExpandedContent}>
            {data.contact && (
              <View style={styles.listContactSection}>
                <Text style={styles.sectionTitle}>Contact</Text>
                <View style={styles.listContactButtons}>
                  {data.contact.phone && (
                    <TouchableOpacity style={styles.listContactButton}>
                      <Phone size={16} color="#0F4C81" />
                      <Text style={styles.listContactButtonText}>{data.contact.phone}</Text>
                    </TouchableOpacity>
                  )}
                  {data.contact.email && (
                    <TouchableOpacity style={styles.listContactButton}>
                      <Mail size={16} color="#0F4C81" />
                      <Text style={styles.listContactButtonText}>{data.contact.email}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {data.description && (
              <View style={styles.descriptionSection}>
                <Text style={styles.sectionTitle}>About</Text>
                <Text style={styles.descriptionText}>{data.description}</Text>
              </View>
            )}

            <View style={styles.listActionButtons}>
              <TouchableOpacity style={styles.listActionButton}>
                <Bookmark size={16} color="#0F4C81" />
                <Text style={styles.listActionButtonText}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.listActionButton}>
                <Share size={16} color="#0F4C81" />
                <Text style={styles.listActionButtonText}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.contactActionButton}>
                <Phone size={16} color="#FFFFFF" />
                <Text style={styles.contactActionButtonText}>Contact</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Expand Button */}
      <TouchableOpacity style={styles.listExpandButton} onPress={toggleExpand}>
        {expanded ? 
          <ChevronUp size={16} color="#6B7280" /> : 
          <ChevronDown size={16} color="#6B7280" />
        }
      </TouchableOpacity>
    </TouchableOpacity>
  )

  return viewMode === "grid" ? renderGridCard() : renderListCard()
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  gridCard: {
    width: '48%',
  },
  listCard: {
    width: '100%',
  },
  cardHeader: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  volunteerImage: {
    height: 64,
    width: 64,
    borderRadius: 32,
    alignSelf: 'center',
    marginVertical: 8,
  },
  orgLogo: {
    height: 48,
    width: 48,
    alignSelf: 'center',
    marginVertical: 8,
  },
  placeholderIcon: {
    height: 48,
    width: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 8,
  },
  orgName: {
    fontWeight: '700',
    textAlign: 'center',
    color: '#1F2937',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 8,
  },
  specialtyTag: {
    backgroundColor: '#F3F4F6',
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 4,
  },
  specialtyText: {
    fontSize: 12,
    color: '#4B5563',
  },
  cardFooter: {
    padding: 12,
    backgroundColor: '#F9FAFB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#4B5563',
    textTransform: 'capitalize',
  },
  responseTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  responseTimeText: {
    fontSize: 12,
    marginLeft: 4,
  },
  expandedContent: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  contactSection: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#0F4C81',
    marginLeft: 4,
  },
  expandButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    padding: 8,
  },
  // List card specific styles
  listCardContent: {
    padding: 16,
  },
  listCardRow: {
    flexDirection: 'row',
  },
  listCardImageContainer: {
    marginRight: 12,
  },
  listCardImage: {
    height: 64,
    width: 64,
    borderRadius: 32,
  },
  listCardLogo: {
    height: 64,
    width: 64,
  },
  listCardPlaceholder: {
    height: 64,
    width: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verificationBadgeContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  listCardDetails: {
    flex: 1,
  },
  listCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  listCardTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  listCardTitle: {
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  listCardLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  listCardLocationText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  listCardStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listCardSpecialties: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  listCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  listExpandedContent: {
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  listContactSection: {
    marginBottom: 8,
  },
  listContactButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  listContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  listContactButtonText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
  },
  descriptionSection: {
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#4B5563',
  },
  listActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  listActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  listActionButtonText: {
    fontSize: 14,
    color: '#0F4C81',
    marginLeft: 4,
  },
  contactActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F4C81',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  contactActionButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  listExpandButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    padding: 8,
  },
});

