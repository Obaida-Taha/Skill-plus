export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'reps' | 'time' | 'mastery' | 'streak';
  target: number;
  current: number;
  isUnlocked: boolean;
  progressRatio: number;
};

export function calculateAchievements(skills: any[], streakCount: number = 0): Achievement[] {
  // Aggregate totals
  const totalReps = skills.reduce((sum, s) => sum + (s.reps || 0), 0);
  const totalSeconds = skills.reduce((sum, s) => sum + (s.timeSpentSeconds || 0), 0);
  const totalHours = Math.floor(totalSeconds / 3600);
  const completedSkillsCount = skills.filter((s) => s.status === 'Completed').length;

  const definitions = [
    // --- 1. REPS ACHIEVEMENTS (5) ---
    {
      id: 'reps_10',
      title: 'First Step',
      description: 'Reach 10 total reps',
      icon: '🌱',
      category: 'reps' as const,
      target: 10,
      current: totalReps,
    },
    {
      id: 'reps_100',
      title: 'Centurion',
      description: 'Reach 100 total reps',
      icon: '🎯',
      category: 'reps' as const,
      target: 100,
      current: totalReps,
    },
    {
      id: 'reps_500',
      title: 'Rep Machine',
      description: 'Reach 500 total reps',
      icon: '🏋️',
      category: 'reps' as const,
      target: 500,
      current: totalReps,
    },
    {
      id: 'reps_1000',
      title: 'Kilorep Club',
      description: 'Reach 1,000 total reps',
      icon: '🔥',
      category: 'reps' as const,
      target: 1000,
      current: totalReps,
    },
    {
      id: 'reps_5000',
      title: 'Unstoppable Force',
      description: 'Reach 5,000 total reps',
      icon: '⚡',
      category: 'reps' as const,
      target: 5000,
      current: totalReps,
    },

    // --- 2. TIME ACHIEVEMENTS (5) ---
    {
      id: 'time_15m',
      title: 'Getting Warm',
      description: 'Practice for 15 minutes',
      icon: '⏱️',
      category: 'time' as const,
      target: 15,
      current: Math.floor(totalSeconds / 60), // in minutes
    },
    {
      id: 'time_1h',
      title: 'Clocking In',
      description: 'Log 1 hour of total practice',
      icon: '⌛',
      category: 'time' as const,
      target: 1,
      current: totalHours,
    },
    {
      id: 'time_5h',
      title: 'Deep Work',
      description: 'Log 5 hours of total practice',
      icon: '🔋',
      category: 'time' as const,
      target: 5,
      current: totalHours,
    },
    {
      id: 'time_20h',
      title: 'Dedicated Master',
      description: 'Log 20 hours of total practice',
      icon: '🧠',
      category: 'time' as const,
      target: 20,
      current: totalHours,
    },
    {
      id: 'time_100h',
      title: '100 Hour Club',
      description: 'Log 100 hours of practice',
      icon: '👑',
      category: 'time' as const,
      target: 100,
      current: totalHours,
    },

    // --- 3. MASTERY ACHIEVEMENTS (5) ---
    {
      id: 'mastery_1',
      title: 'First Mastery',
      description: 'Complete 1 skill',
      icon: '🏆',
      category: 'mastery' as const,
      target: 1,
      current: completedSkillsCount,
    },
    {
      id: 'mastery_3',
      title: 'Hat Trick',
      description: 'Complete 3 skills',
      icon: '🎩',
      category: 'mastery' as const,
      target: 3,
      current: completedSkillsCount,
    },
    {
      id: 'mastery_5',
      title: 'Skill Collector',
      description: 'Complete 5 skills',
      icon: '🎖️',
      category: 'mastery' as const,
      target: 5,
      current: completedSkillsCount,
    },
    {
      id: 'mastery_10',
      title: 'Polymath',
      description: 'Complete 10 skills',
      icon: '🌟',
      category: 'mastery' as const,
      target: 10,
      current: completedSkillsCount,
    },
    {
      id: 'mastery_25',
      title: 'Grandmaster',
      description: 'Complete 25 skills',
      icon: '⚜️',
      category: 'mastery' as const,
      target: 25,
      current: completedSkillsCount,
    },

    // --- 4. STREAK ACHIEVEMENTS (5) ---
    {
      id: 'streak_1',
      title: 'Sparking Up',
      description: 'Start a 1-day practice streak',
      icon: '🕯️',
      category: 'streak' as const,
      target: 1,
      current: streakCount,
    },
    {
      id: 'streak_3',
      title: 'Building Heat',
      description: 'Maintain a 3-day streak',
      icon: '💥',
      category: 'streak' as const,
      target: 3,
      current: streakCount,
    },
    {
      id: 'streak_7',
      title: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      icon: '🚀',
      category: 'streak' as const,
      target: 7,
      current: streakCount,
    },
    {
      id: 'streak_14',
      title: 'Fortnight Focus',
      description: 'Maintain a 14-day streak',
      icon: '🛡️',
      category: 'streak' as const,
      target: 14,
      current: streakCount,
    },
    {
      id: 'streak_30',
      title: 'Monthly Ironclad',
      description: 'Maintain a 30-day streak',
      icon: '💎',
      category: 'streak' as const,
      target: 30,
      current: streakCount,
    },
  ];

  return definitions.map((item) => {
    const isUnlocked = item.current >= item.target;
    const progressRatio = Math.min(1, item.current / item.target);
    return {
      ...item,
      isUnlocked,
      progressRatio,
    };
  });
}