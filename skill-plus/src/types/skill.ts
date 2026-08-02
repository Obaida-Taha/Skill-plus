export interface Skill {
  $id: string;
  title: string;
  category: string;
  xp: number;
  level: number;
  difficultyMultiplier: number; // e.g., 1.0 (Easy), 1.5 (Medium), 2.0 (Hard)
  color: string;
}

export interface UserStats {
  username: string;
  totalXp: number;
  currentLevel: number;
  streakDays: number;
}