/**
 * Message input component with send button
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Ask about your care journey...',
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const backgroundColor = useThemeColor(
    { light: '#FFFFFF', dark: '#1F2937' },
    'background'
  );
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor(
    { light: '#E5E7EB', dark: '#374151' },
    'icon'
  );
  const tintColor = useThemeColor({}, 'tint');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ThemedView style={[styles.container, { backgroundColor, borderTopColor: borderColor }]}>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { color: textColor, borderColor }]}
            value={message}
            onChangeText={setMessage}
            placeholder={placeholder}
            placeholderTextColor={useThemeColor(
              { light: '#9CA3AF', dark: '#6B7280' },
              'icon'
            )}
            multiline
            maxLength={1000}
            editable={!disabled}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: message.trim() && !disabled ? tintColor : borderColor,
              },
            ]}
            onPress={handleSend}
            disabled={!message.trim() || disabled}
          >
            <Ionicons
              name="send"
              size={20}
              color={message.trim() && !disabled ? '#FFFFFF' : '#9CA3AF'}
            />
          </TouchableOpacity>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    maxHeight: 100,
    minHeight: 44,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

