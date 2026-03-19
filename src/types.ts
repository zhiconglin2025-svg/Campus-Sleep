export interface SleepRecord {
  id: string;
  date: string; // ISO string
  durationMinutes: number;
  sourceType: 'watch' | 'screentime';
  screenshotUrl?: string;
  analysisConfidence: number;
  notes?: string;
}

export interface DailyCheckIn {
  date: string;
  completed: boolean;
}

export interface UserSettings {
  nickname: string;
  sleepGoalHours: number;
  remindersEnabled: boolean;
  reminderTime: string; // HH:mm
}
