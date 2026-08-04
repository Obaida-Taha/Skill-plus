export function calculateUpdatedStreak(
  currentStreak: number,
  lastPracticeDateStr?: string | null
): { newStreak: number; updated: boolean } {
  const today = new Date();
  
  if (!lastPracticeDateStr) {
    return { newStreak: 1, updated: true };
  }

  const lastDate = new Date(lastPracticeDateStr);
  
  // Normalize dates to midnight to calculate day difference cleanly
  const todayTimestamp = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const lastTimestamp = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate()).getTime();

  const diffInDays = Math.floor((todayTimestamp - lastTimestamp) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    // Already practiced today
    return { newStreak: currentStreak, updated: false };
  } else if (diffInDays === 1) {
    // Consecutive day
    return { newStreak: currentStreak + 1, updated: true };
  } else {
    // Streak broken
    return { newStreak: 1, updated: true };
  }
}