export interface User {
  id: string;
  email: string;
  name?: string;
  locale: 'en' | 'hi';
  preferences: {
    lowDataMode: boolean;
    aiLiteInsights: boolean;
    scrapbookView: boolean;
    darkMode: boolean;
  };
  streak: number;
  role?: 'user' | 'admin'; // Added role for RBAC
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  feeling?: string;
  emoji?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  userId: string; // Critical: Every entry must be associated with a user
  createdAt: string;
  updatedAt: string;
  steps: {
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    step5: string;
    step6: string;
    step7: string;
  };
  sentiment?: {
    score: number;
    label: 'Negative' | 'Neutral' | 'Positive';
  };
  media?: Media[];
  scrapbookLayout?: {
    items: ScrapbookItem[];
    orientation?: 'landscape' | 'portrait';
    proportion?: number;
  };
  isSync: boolean;
}

export interface Media {
  id: string;
  entryId: string; // Links media to specific journal entry
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnail?: string;
  createdAt: string;
  position?: { x: number; y: number };
  rotation?: number;
  scale?: number;
  zIndex?: number;
  isPlaying?: boolean;
  frameStyle?: 'circle' | 'square' | 'polaroid' | 'vintage';
  originalSize?: boolean;
}

export interface ScrapbookItem {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  position: { x: number; y: number };
  rotation: number;
  scale: number;
  zIndex: number;
  isPlaying?: boolean;
  frameStyle?: 'circle' | 'square' | 'polaroid' | 'vintage';
  originalSize?: boolean;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserPreferences: (preferences: Partial<User['preferences']>) => Promise<void>;
  validateSession: () => boolean; // Added session validation
}

export interface JournalContextType {
  entries: JournalEntry[];
  isLoading: boolean;
  error: string | null;
  getEntries: () => Promise<void>;
  getEntry: (id: string) => Promise<JournalEntry | undefined>;
  createEntry: (entry: Partial<JournalEntry>) => Promise<JournalEntry>;
  updateEntry: (id: string, entry: Partial<JournalEntry>) => Promise<JournalEntry>;
  deleteEntry: (id: string) => Promise<void>;
  analyzeSentiment: (text: string) => Promise<JournalEntry['sentiment']>;
  uploadMedia: (entryId: string, file: File) => Promise<Media>;
  deleteMedia: (mediaId: string) => Promise<void>;
}

export interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

// Security-related types
export interface SecurityEvent {
  event: string;
  data: any;
  timestamp: string;
  userId?: string;
  service?: string;
}

export interface SecurityViolation {
  violation: string;
  data: any;
  timestamp: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  service: string;
}

export interface SessionData {
  token: string;
  userId: string;
  email: string;
  role: string;
  loginTime: number;
  expiresAt: number;
}