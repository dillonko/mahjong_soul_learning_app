// ============================================
// Shared Types for Mahjong Soul Learning App
// ============================================

// --- User & Auth ---
export interface User {
  id: number;
  email: string;
  username: string;
  createdAt: string;
}

export interface GuestSession {
  id: number;
  sessionToken: string;
  createdAt: string;
  expiresAt: string;
}

export interface AuthResponse {
  token: string;
  user?: User;
  guest?: GuestSession;
  isGuest: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

// --- Modules ---
export type ModuleType = 'lesson' | 'quiz' | 'practice';

export interface Module {
  id: number;
  title: string;
  description: string;
  order: number;
  content: string;
  type: ModuleType;
  createdAt: string;
}

// --- Progress ---
export interface Progress {
  id: number;
  userId: number | null;
  guestId: number | null;
  moduleId: number;
  completed: boolean;
  score: number;
  lastAccessed: string;
}

export interface ProgressUpdate {
  moduleId: number;
  completed?: boolean;
  score?: number;
}

// --- Keywords ---
export type KeywordCategory = 'tiles' | 'yaku' | 'gameplay' | 'scoring' | 'strategy' | 'etiquette';

export interface Keyword {
  id: number;
  term: string;
  definition: string;
  category: KeywordCategory;
  examples: string;
}

// --- Strategies ---
export type StrategyDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Strategy {
  id: number;
  title: string;
  description: string;
  difficulty: StrategyDifficulty;
  content: string;
  createdAt: string;
}

// --- API Response Wrappers ---
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
