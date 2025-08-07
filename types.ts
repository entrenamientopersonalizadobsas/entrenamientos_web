export type CheckinQuality = 'bien' | 'regular' | 'mal' | null;

export interface CheckinData {
  sueño: CheckinQuality;
  comida: CheckinQuality;
  energia: CheckinQuality;
}

export interface PlannedWarmup {
  id: string;
  joint: string;
  exercise: string;
}

export interface PlannedExercise {
  id:string;
  muscleGroup: string;
  pattern: string;
  exercise: string;
  observations: string;
}

export interface DailyPlan {
  day: number;
  isDeload: boolean;
  didNotTrain?: boolean; // New property
  checkin: CheckinData;
  warmups: PlannedWarmup[];
  exercises: PlannedExercise[];
}

export interface WeeklyPlan {
  [day: number]: DailyPlan;
}

export interface WorkoutPlan {
  [week: number]: WeeklyPlan;
}

export interface LoggedSet {
  id: string; // For React keys
  weight: number;
  reps: number;
  rir: number;
  rpe: number;
}

export interface LoggedExerciseData {
  sets: LoggedSet[];
}


export interface DailyLog {
  [exerciseId: string]: LoggedExerciseData;
}

export interface WeeklyLog {
  [day: number]: DailyLog;
}

export interface WorkoutLog {
  [week: number]: WeeklyLog;
}

export interface MonthlyGoals {
  [month: number]: string; // Directly maps a month number to its goal string
}

export interface WeeklyGoals {
  [week: number]: string;
}

// Types for custom exercise lists
export type ExerciseList = { [key: string]: string[] };
export type MainExerciseData = { [key:string]: { [key: string]: string[] } };

// Types for Body Composition tracking
export interface CompositionRecord {
    month: number;
    year: number;
    perimeters: { [key: string]: number | '' };
    composition: { [key: string]: number | '' };
}

export interface CompositionLog {
    [year: string]: {
        [month: string]: CompositionRecord;
    };
}

// --- NEW MULTI-USER TYPES ---

export interface UserProfile {
    username: string;
    email: string;
    name: string;
    password?: string; // Only for new user creation, should not be stored in plain text
}

export interface UserData {
    profile: UserProfile;
    plan: WorkoutPlan;
    log: WorkoutLog;
    monthlyGoals: MonthlyGoals;
    weeklyGoals: WeeklyGoals;
    customWarmupExercises: ExerciseList;
    customMainExercises: MainExerciseData;
    compositionLog: CompositionLog;
}

export interface AllUsersData {
    [username: string]: UserData;
}
