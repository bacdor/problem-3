import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ChatScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          AI Guidance
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Chat with your AI care assistant
        </ThemedText>
        <ThemedText style={styles.note}>
          This screen will be implemented in Phase 3
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.7,
  },
  note: {
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.5,
    fontStyle: 'italic',
  },
});

