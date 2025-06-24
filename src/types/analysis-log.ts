// 분석 로그 카테고리
export type LogCategory = 'preference' | 'profile' | 'considerations';

// 개별 로그 엔트리
export interface LogEntry {
  id: string;
  timestamp: Date;
  category: LogCategory;
  title: string;
  content: string;
  isLatest: boolean;
}

// 카테고리별 로그 그룹
export interface CategoryLogs {
  preference: LogEntry[];    // 취향 프로파일
  profile: LogEntry[];       // 고객 프로필  
  considerations: LogEntry[]; // 기타 고려사항
}

// 분석 진행률
export interface AnalysisProgress {
  overall: number;           // 전체 진행률 (0-100)
  preference: number;        // 취향 분석 진행률
  profile: number;          // 프로필 분석 진행률
  considerations: number;    // 고려사항 수집 진행률
}

// AI 응답에서 파싱된 로그 데이터
export interface ParsedLogData {
  category: LogCategory;
  title: string;
  content: string;
  progressContribution: number; // 이 로그가 진행률에 기여하는 점수
}

// 로그 상세보기 모달 상태
export interface LogDetailModal {
  isOpen: boolean;
  category: LogCategory | null;
  logs: LogEntry[];
} 