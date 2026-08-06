import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    TextInput,
    Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ScreenWrapper } from '../../components/bottomNavTab/ScreenWrapper';
import {
    pickMediaFromGallery,
    captureMediaFromCamera,
    uploadSkillProof,
    getSkillMediaLogs,
    MediaLog,
} from '../../services/mediaService';

export default function SkillProofScreen() {
    const { id: skillId, skillName } = useLocalSearchParams<{ id: string; skillName?: string }>();
    const router = useRouter();
    const { theme } = useTheme();
    const { userProfile } = useAuth();

    const [logs, setLogs] = useState<MediaLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (skillId) loadLogs();
    }, [skillId]);

    const loadLogs = async () => {
        try {
            setLoading(true);
            const data = await getSkillMediaLogs(skillId);
            console.log('📦 FETCHED LOGS DATA:', JSON.stringify(data, null, 2));
            setLogs(data);
        } catch (err: any) {
            console.error('Failed to load proof logs:', err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddProof = () => {
        if (!userProfile?.$id || !skillId) return;

        Alert.alert('Add Skill Proof', 'Choose source:', [
            {
                text: '📷 Take Photo / Video',
                onPress: async () => {
                    const asset = await captureMediaFromCamera();
                    if (asset) processUpload(asset);
                },
            },
            {
                text: '🖼️ Gallery',
                onPress: async () => {
                    const asset = await pickMediaFromGallery();
                    if (asset) processUpload(asset);
                },
            },
            { text: 'Cancel', style: 'cancel' },
        ]);
    };

    const processUpload = async (asset: any) => {
        try {
            setUploading(true);
            await uploadSkillProof(userProfile!.$id, skillId as string, asset, notes);
            setNotes('');
            Alert.alert('Success', 'Proof added successfully!');
            loadLogs();
        } catch (err: any) {
            Alert.alert('Upload Failed', err.message || 'Something went wrong.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <ScreenWrapper style={{ backgroundColor: theme.background }}>
            <ScrollView contentContainerStyle={styles.container}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={{ color: theme.accent, fontWeight: 'bold', marginTop: 30


                     }}>← Back to Skills</Text>
                </TouchableOpacity>

                <Text style={[styles.title, { color: theme.text }]}>
                    {skillName || 'Skill'} Portfolio
                </Text>
                <Text style={[styles.subtitle, { color: theme.subtext }]}>
                    Visual proof and progression history
                </Text>

                {/* Upload Form Box */}
                <View style={[styles.uploadBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <TextInput
                        placeholder="Add notes (e.g., 'Day 14 attempt', 'Clean execution')"
                        placeholderTextColor={theme.subtext}
                        style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                        value={notes}
                        onChangeText={setNotes}
                    />
                    <TouchableOpacity
                        style={[styles.uploadBtn, { backgroundColor: theme.accent }]}
                        onPress={handleAddProof}
                        disabled={uploading}
                    >
                        {uploading ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <Text style={styles.uploadBtnText}>+ Add Photo / Video Proof</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Media Timeline Gallery */}
                {loading ? (
                    <ActivityIndicator size="large" color={theme.accent} style={{ marginTop: 20 }} />
                ) : logs.length === 0 ? (
                    <View style={[styles.emptyBox, { borderColor: theme.border }]}>
                        <Text style={{ color: theme.subtext }}>No media proof added yet.</Text>
                    </View>
                ) : (
                    logs.map((item) => (
                        <View key={item.$id} style={[styles.mediaCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            {item.mediaType === 'image' ? (
                                <Image
                                    source={{ uri: item.mediaUrl }}
                                    style={{
                                        width: '100%',
                                        height: 200, // Explicit height is REQUIRED for remote URIs
                                        borderRadius: 8,
                                        backgroundColor: '#e2e8f0', // Placeholder color while loading
                                    }}
                                    resizeMode="cover"
                                    onError={(e) => console.log('🔴 Image Error:', e.nativeEvent.error)}
                                />
                            ) : (
                                <View style={[styles.mediaPreview, styles.videoPlaceholder]}>
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>🎬 Video Proof</Text>
                                </View>
                            )}
                            <View style={styles.mediaInfo}>
                                <Text style={{ color: theme.subtext, fontSize: 11 }}>
                                    Logged: {new Date(item.completedAt).toLocaleDateString()}
                                </Text>
                                {item.proofNotes ? (
                                    <Text style={[styles.notesText, { color: theme.text }]}>{item.proofNotes}</Text>
                                ) : null}
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16 },
    backBtn: { marginBottom: 12 },
    title: { fontSize: 22, fontWeight: 'bold' },
    subtitle: { fontSize: 13, marginBottom: 16 },
    uploadBox: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 20 },
    input: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 10, fontSize: 13 },
    uploadBtn: { paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    uploadBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
    emptyBox: { padding: 24, borderWidth: 1, borderRadius: 12, alignItems: 'center' },
    mediaCard: { borderRadius: 12, borderWidth: 1, overflow: 'hidden', marginBottom: 16 },
    mediaPreview: { width: '100%', height: 200 },
    videoPlaceholder: { backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center' },
    mediaInfo: { padding: 12 },
    notesText: { fontSize: 14, marginTop: 4, fontWeight: '500' },
});