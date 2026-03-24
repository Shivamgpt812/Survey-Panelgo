export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: "user" | "admin";
  points: number;
  surveysCompleted: number;
  memberSince: string;
  avatar?: string;
}

export interface PreScreenerQuestion {
  id: string;
  question: string;
  type: "text" | "number" | "boolean";
  condition: "equals" | "greater_than" | "less_than" | "not_equals";
  value: string | number | boolean;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  link?: string;
  isExternal: boolean;
  pointsReward: number;
  timeEstimate: number;
  status: "active" | "inactive";
  category: string;
  difficulty: "easy" | "medium" | "hard";
  isNew?: boolean;
  isPopular?: boolean;
  preScreener: PreScreenerQuestion[];
  questions?: Question[];
}

export interface Question {
  id: string;
  surveyId: string;
  type: "mcq" | "text" | "rating";
  question: string;
  options?: string[];
  required?: boolean;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  image?: string;
  category: "giftcard" | "cash" | "product";
  inStock: boolean;
}

export interface Answer {
  questionId: string;
  value: string | number;
}

export interface PreScreenerAnswer {
  questionId: string;
  value: string | number | boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Vendor {
  id: string;
  name: string;
  redirectLinks: {
    complete: string;
    terminate: string;
    quotaFull: string;
  };
}

export interface SurveyResponseRecord {
  id: string;
  surveyId: string;
  vendorId?: string;
  userId?: string;
  status: "complete" | "terminate" | "quota_full";
  timestamp: string;
  preScreenerAnswers?: PreScreenerAnswer[];
}

export interface ActivityLogEntry {
  id: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
  timestamp: string;
  metadata?: Record<string, unknown>;
}
