
export enum TutorPersonality {
  FRIENDLY = 'Friendly',
  STRICT = 'Strict',
  MOTIVATIONAL = 'Motivational',
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  // Optional: if we want to display the sent image in the chat. For now, not used directly in bubble.
  // userImagePreview?: string; 
}

export enum SupportedLanguage {
  ENGLISH = 'en',
  PIDGIN = 'pcm',
  HAUSA = 'ha',
  IGBO = 'ig',
  YORUBA = 'yo',
}

export enum Subject {
  MATHEMATICS = 'Mathematics',
  ENGLISH_LANGUAGE = 'English Language',
  PHYSICS = 'Physics',
  CHEMISTRY = 'Chemistry',
  BIOLOGY = 'Biology',
  ECONOMICS = 'Economics',
  GOVERNMENT = 'Government',
}

export interface PastQuestionOption {
  id: string;
  text: string;
}

export interface PastQuestion {
  id: string;
  subject: Subject;
  questionText: string;
  options: PastQuestionOption[];
  correctOptionId: string;
  explanation?: string; // AI can fill this
  year?: number; // Optional: WAEC/NECO year
}

export interface UserProgress {
  subjectPerformance: Record<Subject, { score: number; questionsAttempted: number }>;
  overallScore: number;
  weakTopics: Subject[]; // Simplified
}

export type AppView = 'tutor' | 'exam_prep' | 'progress';

export interface LocalizedStrings {
  [key: string]: string;
}

export interface AllTranslations {
  [langCode: string]: LocalizedStrings;
}

// For Gemini API
export interface GeminiChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

// For image upload
export interface ImageFileState {
  file: File;
  previewUrl: string; // data URL for preview
  base64Data: string; // pure base64 data for API
  mimeType: string;
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}