/**
 * Location card component with map integration
 */

import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';
import { InfoCard } from './InfoCard';
import { RoadmapColors, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import * as Haptics from 'expo-haptics';

interface LocationCardProps {
  locationName?: string | null;
  locationAddress?: string | null;
  locationPhone?: string | null;
}

export function LocationCard({
  locationName,
  locationAddress,
  locationPhone,
}: LocationCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleCallLocation = async (phone: string) => {
    try {
      const url = `tel:${phone}`;
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('Error opening phone dialer:', error);
    }
  };

  const handleGetDirections = async () => {
    if (!locationAddress) return;

    try {
      const encodedAddress = encodeURIComponent(locationAddress);
      let url: string;

      if (Platform.OS === 'ios') {
        url = `http://maps.apple.com/?daddr=${encodedAddress}`;
      } else {
        url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      }

      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.error('Error opening maps:', error);
    }
  };

  if (!locationName && !locationAddress && !locationPhone) {
    return null;
  }

  return (
    <InfoCard
      title="Location"
      icon={
        <Ionicons
          name="location-outline"
          size={20}
          color={isDark ? '#9BA1A6' : '#687076'}
        />
      }
    >
      {locationName && (
        <ThemedText style={styles.locationName}>{locationName}</ThemedText>
      )}

      {locationAddress && (
        <View style={styles.addressContainer}>
          <ThemedText style={styles.address}>{locationAddress}</ThemedText>
          <TouchableOpacity
            style={styles.directionsButton}
            onPress={handleGetDirections}
            accessibilityRole="button"
            accessibilityLabel="Get directions to location"
            accessibilityHint="Opens maps app with directions"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="navigate-outline"
              size={18}
              color={RoadmapColors.light.completed}
            />
            <ThemedText
              style={[
                styles.directionsText,
                {
                  color: RoadmapColors.light.completed,
                },
              ]}
            >
              Get Directions
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {locationPhone && (
        <TouchableOpacity
          style={styles.phoneButton}
          onPress={() => handleCallLocation(locationPhone)}
          accessibilityRole="button"
          accessibilityLabel={`Call location at ${locationPhone}`}
          accessibilityHint="Opens phone dialer"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="call-outline" size={18} color={RoadmapColors.light.completed} />
          <ThemedText
            style={[
              styles.phoneText,
              {
                color: RoadmapColors.light.completed,
              },
            ]}
          >
            {locationPhone}
          </ThemedText>
        </TouchableOpacity>
      )}
    </InfoCard>
  );
}

const styles = StyleSheet.create({
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  addressContainer: {
    marginTop: Spacing.xs,
  },
  address: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
    marginBottom: Spacing.sm,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  directionsText: {
    fontSize: 14,
    fontWeight: '600',
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  phoneText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

