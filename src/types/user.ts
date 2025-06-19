import { FragranceFeedback, FragrancePreference, FragranceAnalysis } from './fragrance';

// 사용자 프로필 타입
export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
  preferences: UserPreferences;
}

// 사용자 선호도 설정
export interface UserPreferences {
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  skinType?: 'dry' | 'oily' | 'combination' | 'sensitive';
  lifestylePreferences?: {
    activeLevel: 'low' | 'moderate' | 'high';
    socialLevel: 'introvert' | 'ambivert' | 'extrovert';
    workEnvironment: 'office' | 'home' | 'outdoor' | 'flexible';
  };
  budgetRange?: {
    min: number;
    max: number;
    currency: string;
  };
  allergies?: string[];
  notesToAvoid?: string[];
}

// 향수 여정 단계
export type FragranceJourneyStep = 
  | 'selection'     // 향수 선택
  | 'feedback'      // 피드백 기록
  | 'preference'    // 선호도 선택
  | 'analysis'      // AI 분석
  | 'recommendation' // 추천 결과
  | 'complete';     // 완료

// 향수 여정 상태
export interface FragranceJourney {
  id: string;
  userId: string;
  currentStep: FragranceJourneyStep;
  data: {
    selectedFragrances?: string[]; // 선택한 향수 ID들
    feedbacks?: FragranceFeedback[];
    preferences?: FragrancePreference[];
    analysis?: FragranceAnalysis;
  };
  createdAt: Date;
  updatedAt: Date;
  isCompleted: boolean;
}

// 사용자 세션 상태
export interface UserSession {
  user: UserProfile | null;
  currentJourney: FragranceJourney | null;
  isLoading: boolean;
  error: string | null;
} 