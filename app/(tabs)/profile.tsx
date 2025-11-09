import { StyleSheet, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Profile
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Account Information
          </ThemedText>

          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Name:</ThemedText>
            <ThemedText style={styles.value}>{profile?.full_name || 'Not set'}</ThemedText>
          </View>

          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Email:</ThemedText>
            <ThemedText style={styles.value}>{user?.email || 'Not set'}</ThemedText>
          </View>

          {profile?.phone && (
            <View style={styles.infoRow}>
              <ThemedText style={styles.label}>Phone:</ThemedText>
              <ThemedText style={styles.value}>{profile.phone}</ThemedText>
            </View>
          )}

          {profile?.date_of_birth && (
            <View style={styles.infoRow}>
              <ThemedText style={styles.label}>Date of Birth:</ThemedText>
              <ThemedText style={styles.value}>
                {new Date(profile.date_of_birth).toLocaleDateString()}
              </ThemedText>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    marginBottom: 8,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  label: {
    fontWeight: '600',
    opacity: 0.7,
  },
  value: {
    flex: 1,
    textAlign: 'right',
  },
  signOutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

