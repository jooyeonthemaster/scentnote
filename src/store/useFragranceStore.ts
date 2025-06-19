import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  FragranceJourney,
  FragranceJourneyStep,
  FragranceFeedback,
  FragrancePreference,
  FragranceAnalysis,
  Fragrance
} from '@/types';

interface FragranceState {
  // 현재 진행 중인 여정
  currentJourney: FragranceJourney | null;
  
  // 선택된 향수들
  selectedFragrances: string[];
  
  // 피드백 데이터
  feedbacks: FragranceFeedback[];
  
  // 선호도 데이터
  preferences: FragrancePreference[];
  
  // AI 분석 결과
  analysis: FragranceAnalysis | null;
  
  // 로딩 상태
  isLoading: boolean;
  
  // 에러 상태
  error: string | null;
}

interface FragranceActions {
  // 여정 관리
  startNewJourney: (userId: string) => void;
  updateJourneyStep: (step: FragranceJourneyStep) => void;
  completeJourney: () => void;
  
  // 향수 선택
  selectFragrance: (fragranceId: string) => void;
  unselectFragrance: (fragranceId: string) => void;
  clearSelectedFragrances: () => void;
  
  // 피드백 관리
  addFeedback: (feedback: FragranceFeedback) => void;
  updateFeedback: (fragranceId: string, feedback: Partial<FragranceFeedback>) => void;
  removeFeedback: (fragranceId: string) => void;
  clearFeedbacks: () => void;
  
  // 선호도 관리
  addPreference: (preference: FragrancePreference) => void;
  updatePreference: (fragranceId: string, preference: Partial<FragrancePreference>) => void;
  removePreference: (fragranceId: string) => void;
  clearPreferences: () => void;
  
  // 분석 결과 관리
  setAnalysis: (analysis: FragranceAnalysis) => void;
  clearAnalysis: () => void;
  
  // 상태 관리
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // 전체 리셋
  resetStore: () => void;
}

const initialState: FragranceState = {
  currentJourney: null,
  selectedFragrances: [],
  feedbacks: [],
  preferences: [],
  analysis: null,
  isLoading: false,
  error: null,
};

export const useFragranceStore = create<FragranceState & FragranceActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // 여정 관리
      startNewJourney: (userId: string) => {
        const journey: FragranceJourney = {
          id: `journey_${Date.now()}`,
          userId,
          currentStep: 'selection',
          data: {},
          createdAt: new Date(),
          updatedAt: new Date(),
          isCompleted: false,
        };
        
        set({
          currentJourney: journey,
          selectedFragrances: [],
          feedbacks: [],
          preferences: [],
          analysis: null,
          error: null,
        });
      },
      
      updateJourneyStep: (step: FragranceJourneyStep) => {
        const { currentJourney } = get();
        if (currentJourney) {
          set({
            currentJourney: {
              ...currentJourney,
              currentStep: step,
              updatedAt: new Date(),
            }
          });
        }
      },
      
      completeJourney: () => {
        const { currentJourney } = get();
        if (currentJourney) {
          set({
            currentJourney: {
              ...currentJourney,
              currentStep: 'complete',
              isCompleted: true,
              updatedAt: new Date(),
            }
          });
        }
      },
      
      // 향수 선택
      selectFragrance: (fragranceId: string) => {
        const { selectedFragrances } = get();
        if (!selectedFragrances.includes(fragranceId)) {
          set({
            selectedFragrances: [...selectedFragrances, fragranceId]
          });
        }
      },
      
      unselectFragrance: (fragranceId: string) => {
        const { selectedFragrances } = get();
        set({
          selectedFragrances: selectedFragrances.filter(id => id !== fragranceId)
        });
      },
      
      clearSelectedFragrances: () => {
        set({ selectedFragrances: [] });
      },
      
      // 피드백 관리
      addFeedback: (feedback: FragranceFeedback) => {
        const { feedbacks } = get();
        const existingIndex = feedbacks.findIndex(f => f.fragranceId === feedback.fragranceId);
        
        if (existingIndex >= 0) {
          const newFeedbacks = [...feedbacks];
          newFeedbacks[existingIndex] = feedback;
          set({ feedbacks: newFeedbacks });
        } else {
          set({ feedbacks: [...feedbacks, feedback] });
        }
      },
      
      updateFeedback: (fragranceId: string, feedback: Partial<FragranceFeedback>) => {
        const { feedbacks } = get();
        const updatedFeedbacks = feedbacks.map(f =>
          f.fragranceId === fragranceId ? { ...f, ...feedback } : f
        );
        set({ feedbacks: updatedFeedbacks });
      },
      
      removeFeedback: (fragranceId: string) => {
        const { feedbacks } = get();
        set({
          feedbacks: feedbacks.filter(f => f.fragranceId !== fragranceId)
        });
      },
      
      clearFeedbacks: () => {
        set({ feedbacks: [] });
      },
      
      // 선호도 관리
      addPreference: (preference: FragrancePreference) => {
        const { preferences } = get();
        const existingIndex = preferences.findIndex(p => p.fragranceId === preference.fragranceId);
        
        if (existingIndex >= 0) {
          const newPreferences = [...preferences];
          newPreferences[existingIndex] = preference;
          set({ preferences: newPreferences });
        } else {
          set({ preferences: [...preferences, preference] });
        }
      },
      
      updatePreference: (fragranceId: string, preference: Partial<FragrancePreference>) => {
        const { preferences } = get();
        const updatedPreferences = preferences.map(p =>
          p.fragranceId === fragranceId ? { ...p, ...preference } : p
        );
        set({ preferences: updatedPreferences });
      },
      
      removePreference: (fragranceId: string) => {
        const { preferences } = get();
        set({
          preferences: preferences.filter(p => p.fragranceId !== fragranceId)
        });
      },
      
      clearPreferences: () => {
        set({ preferences: [] });
      },
      
      // 분석 결과 관리
      setAnalysis: (analysis: FragranceAnalysis) => {
        set({ analysis });
      },
      
      clearAnalysis: () => {
        set({ analysis: null });
      },
      
      // 상태 관리
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
      
      setError: (error: string | null) => {
        set({ error });
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      // 전체 리셋
      resetStore: () => {
        set(initialState);
      },
    }),
    {
      name: 'fragrance-store',
      // 민감한 정보는 저장하지 않음
      partialize: (state) => ({
        currentJourney: state.currentJourney,
        selectedFragrances: state.selectedFragrances,
        feedbacks: state.feedbacks,
        preferences: state.preferences,
        // analysis는 제외 (크기가 클 수 있음)
      }),
    }
  )
); 