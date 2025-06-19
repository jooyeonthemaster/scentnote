// 향수 브랜드 타입
export interface FragranceBrand {
  id: string;
  name: string;
  description?: string;
  country?: string;
}

// 향수 노트 타입
export interface FragranceNote {
  id: string;
  name: string;
  category: 'top' | 'middle' | 'base';
  description?: string;
}

// 향수 정보 타입
export interface Fragrance {
  id: string;
  name: string;
  brand: FragranceBrand;
  description?: string;
  imageUrl?: string;
  notes: {
    top: FragranceNote[];
    middle: FragranceNote[];
    base: FragranceNote[];
  };
  concentration: 'parfum' | 'edp' | 'edt' | 'edc' | 'other';
  releaseYear?: number;
  price?: {
    amount: number;
    currency: string;
  };
}

// 사용자 향수 피드백 타입
export interface FragranceFeedback {
  fragranceId: string;
  rating: number; // 1-5
  longevity: number; // 1-5
  sillage: number; // 1-5
  review?: string;
  usageContext?: string; // 언제, 어디서 사용했는지
  seasonPreference?: ('spring' | 'summer' | 'fall' | 'winter')[];
  occasionPreference?: ('daily' | 'work' | 'date' | 'special' | 'evening')[];
}

// 향수 선호도 타입
export interface FragrancePreference {
  fragranceId: string;
  preferenceLevel: number; // 1-10
  preferredAspects: string[]; // 좋아하는 점들
  dislikedAspects?: string[]; // 싫어하는 점들
  emotionalResponse?: string; // 감정적 반응
}

// AI 분석 결과 타입
export interface FragranceAnalysis {
  userId: string;
  preferredNotes: FragranceNote[];
  avoidedNotes?: FragranceNote[];
  preferredConcentrations: string[];
  preferredBrands: FragranceBrand[];
  personalityProfile: {
    style: 'classic' | 'modern' | 'bold' | 'minimalist' | 'romantic';
    intensity: 'light' | 'moderate' | 'strong';
    complexity: 'simple' | 'complex';
  };
  recommendations: FragranceRecommendation[];
  confidence: number; // 0-1
  generatedAt: Date;
}

// 향수 추천 타입
export interface FragranceRecommendation {
  fragrance: Fragrance;
  score: number; // 0-1
  reasoning: string;
  matchedPreferences: string[];
  potentialConcerns?: string[];
} 