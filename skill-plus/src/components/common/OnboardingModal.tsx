import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Modal,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Query } from 'react-native-appwrite';
import { databases } from '../../lib/appwrite';
import { useTheme } from '../../context/ThemeContext';

const DB_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || 'skills-collection';
const DISCOVERY_COL = 'discover_skills';
const USER_SKILLS_COL = 'user_skills';

interface OnboardingModalProps {
    visible: boolean;
    userId: string;
    onComplete: () => void;
}

const GOALS = [
    { id: 'health', label: '💪 Health & Fitness', desc: 'Build physical discipline and strength' },
    { id: 'career', label: '💼 Career & Coding', desc: 'Level up professional expertise' },
    { id: 'creative', label: '🎨 Creative Outlets', desc: 'Explore music, art, & design' },
    { id: 'life', label: '🌱 Life & Productivity', desc: 'Develop daily productive habits' },
];

const TIME_COMMITMENTS = [
    { id: '5m', label: '⚡ 5 mins/day', desc: 'Quick daily habit building' },
    { id: '15m', label: '🔥 15 mins/day', desc: 'Balanced & steady growth' },
    { id: '30m', label: '🚀 30+ mins/day', desc: 'Accelerated skill mastery' },
];

// Fallback skills if Appwrite discovery database fetch fails or returns empty
const FALLBACK_SKILLS = [
    { $id: 'pushups_1', name: 'Core Push-ups', category: 'Fitness & Sports', subCategory: 'Bodyweight', difficulty: 'Beginner' },
    { $id: 'react_native_1', name: 'React Native Basics', category: 'Technology', subCategory: 'Mobile Dev', difficulty: 'Beginner' },
    { $id: 'guitar_1', name: 'Acoustic Guitar Chords', category: 'Music', subCategory: 'Guitar', difficulty: 'Beginner' },
    { $id: 'spanish_1', name: 'Spanish Greetings', category: 'Languages', subCategory: 'Spanish', difficulty: 'Beginner' },
];

export function OnboardingModal({ visible, userId, onComplete }: OnboardingModalProps) {
    const { theme, isDark } = useTheme();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    const [starterSkills, setStarterSkills] = useState<any[]>([]);
    const [loadingSkills, setLoadingSkills] = useState<boolean>(false);
    const [selectedSkills, setSelectedSkills] = useState<any[]>([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (visible) {
            fetchDiscoverySkills();
        }
    }, [visible]);

    const fetchDiscoverySkills = async () => {
        try {
            setLoadingSkills(true);
            const response = await databases.listDocuments(DB_ID, DISCOVERY_COL, [
                Query.limit(6),
            ]);

            if (response.documents.length > 0) {
                setStarterSkills(response.documents);
            } else {
                setStarterSkills(FALLBACK_SKILLS);
            }
        } catch (error: any) {
            console.error('Error fetching discovery skills for onboarding:', error?.message);
            setStarterSkills(FALLBACK_SKILLS);
        } finally {
            setLoadingSkills(false);
        }
    };

    const toggleSkillSelection = (skill: any) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const isSelected = selectedSkills.some(
            (s) => s.$id === skill.$id || s.name === skill.name
        );

        if (isSelected) {
            setSelectedSkills((prev) =>
                prev.filter((s) => (s.$id ? s.$id !== skill.$id : s.name !== skill.name))
            );
        } else {
            if (selectedSkills.length >= 2) {
                setSelectedSkills([selectedSkills[0], skill]);
            } else {
                setSelectedSkills((prev) => [...prev, skill]);
            }
        }
    };

    const handleFinish = async () => {
        if (!userId) return;
        try {
            setSubmitting(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            for (const skill of selectedSkills) {
                const generatedSkillId =
                    skill.$id || skill.name.toLowerCase().replace(/[^a-z0-9]/g, '_');

                await databases.createDocument(DB_ID, USER_SKILLS_COL, 'unique()', {
                    userId,
                    skillId: generatedSkillId,
                    name: skill.name,
                    category: skill.category || 'General',       // 👈 Preserves actual category from Discovery
                    subCategory: skill.subCategory || 'General', // 👈 Preserves actual subCategory from Discovery
                    difficulty: skill.difficulty || 'Beginner',
                    status: 'In Progress',
                    reps: 0,
                    timeSpentSeconds: 0,
                    isTimerRunning: false,
                });
            }

            onComplete();
        } catch (error: any) {
            console.error('Error saving onboarding skills:', error?.message);
            onComplete();
        } finally {
            setSubmitting(false);
        }
    };
    if (!visible) return null;

    return (
        <Modal visible={visible} animationType="slide" transparent={false}>
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                {/* Step Indicator Bar */}
                <View style={styles.progressBarRow}>
                    {[1, 2, 3].map((s) => (
                        <View
                            key={s}
                            style={[
                                styles.progressSegment,
                                { backgroundColor: s <= step ? theme.accent : theme.border },
                            ]}
                        />
                    ))}
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* STEP 1: GOAL */}
                    {step === 1 && (
                        <View>
                            <Text style={[styles.stepTag, { color: theme.accent }]}>STEP 1 OF 3</Text>
                            <Text style={[styles.heading, { color: theme.text }]}>
                                What is your primary goal?
                            </Text>
                            <Text style={[styles.subheading, { color: theme.subtext }]}>
                                We will personalize your practice experience based on your target area.
                            </Text>

                            {GOALS.map((g) => {
                                const isSelected = selectedGoal === g.id;
                                return (
                                    <TouchableOpacity
                                        key={g.id}
                                        style={[
                                            styles.optionCard,
                                            {
                                                backgroundColor: theme.card,
                                                borderColor: isSelected ? theme.accent : theme.border,
                                                borderWidth: isSelected ? 2 : 1,
                                            },
                                        ]}
                                        onPress={() => {
                                            Haptics.selectionAsync();
                                            setSelectedGoal(g.id);
                                        }}
                                    >
                                        <Text style={[styles.optionTitle, { color: theme.text }]}>
                                            {g.label}
                                        </Text>
                                        <Text style={[styles.optionDesc, { color: theme.subtext }]}>
                                            {g.desc}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}

                    {/* STEP 2: TIME COMMITMENT */}
                    {step === 2 && (
                        <View>
                            <Text style={[styles.stepTag, { color: theme.accent }]}>STEP 2 OF 3</Text>
                            <Text style={[styles.heading, { color: theme.text }]}>
                                How much time can you commit daily?
                            </Text>
                            <Text style={[styles.subheading, { color: theme.subtext }]}>
                                Consistency beats intensity. Small daily practice sessions compound quickly.
                            </Text>

                            {TIME_COMMITMENTS.map((t) => {
                                const isSelected = selectedTime === t.id;
                                return (
                                    <TouchableOpacity
                                        key={t.id}
                                        style={[
                                            styles.optionCard,
                                            {
                                                backgroundColor: theme.card,
                                                borderColor: isSelected ? theme.accent : theme.border,
                                                borderWidth: isSelected ? 2 : 1,
                                            },
                                        ]}
                                        onPress={() => {
                                            Haptics.selectionAsync();
                                            setSelectedTime(t.id);
                                        }}
                                    >
                                        <Text style={[styles.optionTitle, { color: theme.text }]}>
                                            {t.label}
                                        </Text>
                                        <Text style={[styles.optionDesc, { color: theme.subtext }]}>
                                            {t.desc}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}

                    {/* STEP 3: PICK STARTER SKILLS */}
                    {step === 3 && (
                        <View>
                            <Text style={[styles.stepTag, { color: theme.accent }]}>STEP 3 OF 3</Text>
                            <Text style={[styles.heading, { color: theme.text }]}>
                                Pick your first 2 skills
                            </Text>
                            <Text style={[styles.subheading, { color: theme.subtext }]}>
                                Selected skills will be added to your active dashboard immediately. ({selectedSkills.length}/2 selected)
                            </Text>

                            {loadingSkills ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color={theme.accent} />
                                    <Text style={[styles.loadingText, { color: theme.subtext }]}>
                                        Fetching skills from catalog...
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.skillsGrid}>
                                    {starterSkills.map((skill) => {
                                        const isSelected = selectedSkills.some(
                                            (s) => s.$id === skill.$id || s.name === skill.name
                                        );
                                        return (
                                            <TouchableOpacity
                                                key={skill.$id || skill.name}
                                                style={[
                                                    styles.skillChip,
                                                    {
                                                        backgroundColor: isSelected ? theme.accent : theme.card,
                                                        borderColor: isSelected ? theme.accent : theme.border,
                                                    },
                                                ]}
                                                onPress={() => toggleSkillSelection(skill)}
                                            >
                                                <Text
                                                    style={[
                                                        styles.skillName,
                                                        {
                                                            color: isSelected
                                                                ? isDark
                                                                    ? '#000000'
                                                                    : '#FFFFFF'
                                                                : theme.text,
                                                        },
                                                    ]}
                                                >
                                                    {isSelected ? '✓ ' : '+ '}
                                                    {skill.name}
                                                </Text>
                                                <Text
                                                    style={[
                                                        styles.skillCategory,
                                                        {
                                                            color: isSelected
                                                                ? isDark
                                                                    ? '#222222'
                                                                    : '#EEEEEE'
                                                                : theme.subtext,
                                                        },
                                                    ]}
                                                >
                                                    {skill.category || 'General'}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            )}
                        </View>
                    )}
                </ScrollView>

                {/* Footer Navigation */}
                <View style={[styles.footer, { borderColor: theme.border }]}>
                    {step > 1 ? (
                        <TouchableOpacity
                            style={styles.backBtn}
                            onPress={() => setStep((prev) => (prev - 1) as any)}
                        >
                            <Text style={[styles.backBtnText, { color: theme.subtext }]}>Back</Text>
                        </TouchableOpacity>
                    ) : (
                        <View />
                    )}

                    <TouchableOpacity
                        style={[
                            styles.nextBtn,
                            {
                                backgroundColor: theme.accent,
                                opacity:
                                    (step === 1 && !selectedGoal) ||
                                        (step === 2 && !selectedTime) ||
                                        (step === 3 && selectedSkills.length === 0)
                                        ? 0.5
                                        : 1,
                            },
                        ]}
                        disabled={
                            (step === 1 && !selectedGoal) ||
                            (step === 2 && !selectedTime) ||
                            (step === 3 && selectedSkills.length === 0) ||
                            submitting
                        }
                        onPress={() => {
                            if (step < 3) {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                setStep((prev) => (prev + 1) as any);
                            } else {
                                handleFinish();
                            }
                        }}
                    >
                        {submitting ? (
                            <ActivityIndicator color={isDark ? '#000000' : '#FFFFFF'} />
                        ) : (
                            <Text
                                style={[
                                    styles.nextBtnText,
                                    { color: isDark ? '#000000' : '#FFFFFF' },
                                ]}
                            >
                                {step === 3 ? 'Start Learning 🚀' : 'Continue'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 60 },
    progressBarRow: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    progressSegment: {
        flex: 1,
        height: 6,
        borderRadius: 3,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    stepTag: {
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1,
        marginBottom: 4,
    },
    heading: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 6,
    },
    subheading: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 24,
    },
    optionCard: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    optionDesc: {
        fontSize: 13,
    },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 13,
    },
    skillsGrid: {
        gap: 12,
    },
    skillChip: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    skillName: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 2,
    },
    skillCategory: {
        fontSize: 12,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderTopWidth: 1,
    },
    backBtn: { paddingVertical: 12, paddingHorizontal: 16 },
    backBtnText: { fontSize: 16, fontWeight: '600' },
    nextBtn: {
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 20,
    },
    nextBtnText: { fontSize: 16, fontWeight: '700' },
});