import { create } from 'zustand';
import { LogEntry, CategoryLogs, AnalysisProgress, LogDetailModal, LogCategory } from '@/types/analysis-log';

interface AnalysisStore {
  // 상태
  logs: CategoryLogs;
  progress: AnalysisProgress;
  detailModal: LogDetailModal;
  
  // 액션
  addLog: (category: LogCategory, title: string, content: string, progressContribution?: number) => void;
  updateProgress: () => void;
  openDetailModal: (category: LogCategory) => void;
  closeDetailModal: () => void;
  resetAnalysis: () => void;
  getLatestLogs: () => { preference?: LogEntry; profile?: LogEntry; considerations?: LogEntry };
}

const initialState = {
  logs: {
    preference: [],
    profile: [],
    considerations: []
  },
  progress: {
    overall: 0,
    preference: 0,
    profile: 0,
    considerations: 0
  },
  detailModal: {
    isOpen: false,
    category: null,
    logs: []
  }
};

export const useAnalysisStore = create<AnalysisStore>((set, get) => ({
  ...initialState,
  
  addLog: (category, title, content, progressContribution = 10) => {
    const newLog: LogEntry = {
      id: `${category}-${Date.now()}`,
      timestamp: new Date(),
      category,
      title,
      content,
      isLatest: true
    };
    
    set((state) => {
      // 기존 로그들의 isLatest를 false로 변경
      const updatedLogs = {
        ...state.logs,
        [category]: [
          ...state.logs[category].map(log => ({ ...log, isLatest: false })),
          newLog
        ]
      };
      
      return { logs: updatedLogs };
    });
    
    // 진행률 업데이트
    get().updateProgress();
  },
  
  updateProgress: () => {
    const { logs } = get();
    
    // 각 카테고리별 진행률 계산 (로그 개수 기반, 최대 100%)
    const preferenceProgress = Math.min(logs.preference.length * 15, 100);
    const profileProgress = Math.min(logs.profile.length * 20, 100);
    const considerationsProgress = Math.min(logs.considerations.length * 25, 100);
    
    // 전체 진행률 계산 (가중평균)
    const overall = Math.round(
      (preferenceProgress * 0.4 + profileProgress * 0.35 + considerationsProgress * 0.25)
    );
    
    set({
      progress: {
        overall,
        preference: preferenceProgress,
        profile: profileProgress,
        considerations: considerationsProgress
      }
    });
  },
  
  openDetailModal: (category) => {
    const { logs } = get();
    set({
      detailModal: {
        isOpen: true,
        category,
        logs: logs[category]
      }
    });
  },
  
  closeDetailModal: () => {
    set({
      detailModal: {
        isOpen: false,
        category: null,
        logs: []
      }
    });
  },
  
  resetAnalysis: () => {
    set(initialState);
  },
  
  getLatestLogs: () => {
    const { logs } = get();
    return {
      preference: logs.preference.find(log => log.isLatest),
      profile: logs.profile.find(log => log.isLatest),
      considerations: logs.considerations.find(log => log.isLatest)
    };
  }
})); 