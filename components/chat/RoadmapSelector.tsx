/**
 * Roadmap selector dropdown component for chat screen
 */

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BorderRadius, Shadows, Spacing } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { CareRoadmap } from "@/types/database";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface RoadmapSelectorProps {
  roadmaps: CareRoadmap[];
  selectedRoadmapId: string | null;
  onSelect: (roadmapId: string | null) => void;
}

export function RoadmapSelector({
  roadmaps,
  selectedRoadmapId,
  onSelect,
}: RoadmapSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const backgroundColor = useThemeColor(
    { light: "#FFFFFF", dark: "#1F2937" },
    "background",
  );
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor(
    { light: "#E5E7EB", dark: "#374151" },
    "icon",
  );
  const tintColor = useThemeColor({}, "tint");
  const iconColor = useThemeColor(
    { light: "#687076", dark: "#9BA1A6" },
    "icon",
  );

  const selectedRoadmap = roadmaps.find((r) => r.id === selectedRoadmapId);
  const displayText = selectedRoadmap
    ? selectedRoadmap.title
    : "Select Journey";

  const handleSelect = (roadmapId: string | null) => {
    onSelect(roadmapId);
    setModalVisible(false);
  };

  const getStatusColor = (status: CareRoadmap["status"]) => {
    switch (status) {
      case "active":
        return "#10B981";
      case "completed":
        return "#6B7280";
      case "cancelled":
        return "#EF4444";
      default:
        return iconColor;
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.selector,
          {
            backgroundColor,
            borderColor,
          },
        ]}
        onPress={() => setModalVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={`Selected journey: ${displayText}`}
        accessibilityHint="Double tap to change journey"
      >
        <ThemedText style={styles.selectorText} numberOfLines={1}>
          {displayText}
        </ThemedText>
        <Ionicons name="chevron-down" size={16} color={iconColor} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <ThemedView
            style={[styles.modalContent, { backgroundColor }]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <ThemedText type="title" style={styles.modalTitle}>
                Select Journey
              </ThemedText>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Ionicons name="close" size={24} color={iconColor} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={roadmaps}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const isSelected = item.id === selectedRoadmapId;
                return (
                  <TouchableOpacity
                    style={[
                      styles.option,
                      {
                        backgroundColor: isSelected
                          ? tintColor + "20"
                          : "transparent",
                        borderLeftColor: getStatusColor(item.status),
                      },
                    ]}
                    onPress={() => handleSelect(item.id)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={`${item.title} journey, ${item.status}`}
                  >
                    <View style={styles.optionContent}>
                      <ThemedText
                        style={[
                          styles.optionText,
                          isSelected && { color: tintColor, fontWeight: "600" },
                        ]}
                      >
                        {item.title}
                      </ThemedText>
                      <View style={styles.optionMeta}>
                        <View
                          style={[
                            styles.statusDot,
                            { backgroundColor: getStatusColor(item.status) },
                          ]}
                        />
                        <ThemedText style={styles.optionStatus}>
                          {item.status.charAt(0).toUpperCase() +
                            item.status.slice(1)}
                        </ThemedText>
                      </View>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark" size={20} color={tintColor} />
                    )}
                  </TouchableOpacity>
                );
              }}
              ItemSeparatorComponent={() => (
                <View
                  style={[styles.separator, { backgroundColor: borderColor }]}
                />
              )}
            />

            {/* Option to clear selection (show all journeys) */}
            <TouchableOpacity
              style={[
                styles.option,
                {
                  backgroundColor:
                    selectedRoadmapId === null
                      ? tintColor + "20"
                      : "transparent",
                  borderTopWidth: 1,
                  borderTopColor: borderColor,
                },
              ]}
              onPress={() => handleSelect(null)}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedRoadmapId === null }}
              accessibilityLabel="All journeys"
            >
              <View style={styles.optionContent}>
                <ThemedText
                  style={[
                    styles.optionText,
                    selectedRoadmapId === null && {
                      color: tintColor,
                      fontWeight: "600",
                    },
                  ]}
                >
                  All Journeys
                </ThemedText>
                <ThemedText style={styles.optionStatus}>
                  View all conversations
                </ThemedText>
              </View>
              {selectedRoadmapId === null && (
                <Ionicons name="checkmark" size={20} color={tintColor} />
              )}
            </TouchableOpacity>
          </ThemedView>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    minWidth: 260,
    maxWidth: 400,
  },
  selectorText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
    marginRight: Spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
    borderRadius: BorderRadius.lg,
    ...Shadows.xl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    paddingLeft: Spacing.lg,
    borderLeftWidth: 3,
  },
  optionContent: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    marginBottom: Spacing.xs,
  },
  optionMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  optionStatus: {
    fontSize: 12,
    opacity: 0.7,
    textTransform: "capitalize",
    marginLeft: Spacing.xs,
  },
  separator: {
    height: 1,
    marginLeft: Spacing.lg,
  },
});
