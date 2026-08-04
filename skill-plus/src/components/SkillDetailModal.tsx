import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SkillItem } from './DiscoverSkillCard';

interface SkillDetailModalProps {
  selectedSkill: SkillItem | null;
  onClose: () => void;
  onLearnSkill: (skill: SkillItem) => void;
}

export function SkillDetailModal({ selectedSkill, onClose, onLearnSkill }: SkillDetailModalProps) {
  const { theme, isDark } = useTheme();

  if (!selectedSkill) return null;

  return (
    <Modal visible={!!selectedSkill} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>{selectedSkill.name}</Text>

          <View style={styles.tagRow}>
            <View style={[styles.tag, { backgroundColor: theme.border }]}>
              <Text style={[styles.tagText, { color: theme.accent }]}>{selectedSkill.difficulty}</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: theme.border }]}>
              <Text style={[styles.tagText, { color: theme.accent }]}>
                ⏳ {selectedSkill.estimatedHours}
              </Text>
            </View>
          </View>

          <Text style={[styles.modalDescriptionTitle, { color: theme.subtext }]}>Description</Text>
          <Text style={[styles.modalDescription, { color: theme.text }]}>
            {selectedSkill.description}
          </Text>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: theme.border }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelButtonText, { color: theme.text }]}>Close</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.learnButton, { backgroundColor: theme.accent }]}
              onPress={() => onLearnSkill(selectedSkill)}
            >
              <Text style={[styles.learnButtonText, { color: isDark ? '#000000' : '#ffffff' }]}>
                Learn Skill
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.75)', justifyContent: 'flex-end' },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    borderWidth: 1,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  tagRow: { flexDirection: 'row', marginBottom: 16 },
  tag: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6, marginRight: 8 },
  tagText: { fontSize: 12, fontWeight: '600' },
  modalDescriptionTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  modalDescription: { fontSize: 14, lineHeight: 20, marginBottom: 24 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: { fontWeight: 'bold' },
  learnButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  learnButtonText: { fontWeight: 'bold' },
});