import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
}

export interface ConversationState {
  stage: 'initial' | 'experience_gathering' | 'preference_analysis' | 'recommendation_ready';
  collectedData: {
    experiencedFragrances: string[];
    preferences: string[];
    occasions: string[];
    avoidances: string[];
    personalityTraits: string[];
  };
}

interface ChatState {
  // 채팅 메시지
  messages: ChatMessage[];
  
  // 대화 상태
  conversationState: ConversationState;
  
  // UI 상태
  isLoading: boolean;
  
  // 에러 상태
  error: string | null;
  
  // 분석 결과
  analysisResult: any | null;
  
  // 추천 결과
  recommendations: string | null;
}

interface ChatActions {
  // 메시지 관리
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  
  // 대화 상태 관리
  updateConversationState: (state: ConversationState) => void;
  setStage: (stage: ConversationState['stage']) => void;
  
  // UI 상태 관리
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // 분석 및 추천 결과
  setAnalysisResult: (result: any) => void;
  setRecommendations: (recommendations: string) => void;
  
  // 전체 리셋
  resetChat: () => void;
  
  // AI와 대화하기
  sendMessage: (content: string) => Promise<void>;
}

const initialState: ChatState = {
  messages: [],
  conversationState: {
    stage: 'initial',
    collectedData: {
      experiencedFragrances: [],
      preferences: [],
      occasions: [],
      avoidances: [],
      personalityTraits: []
    }
  },
  isLoading: false,
  error: null,
  analysisResult: null,
  recommendations: null,
};

export const useChatStore = create<ChatState & ChatActions>()((set, get) => ({
  ...initialState,
  
  // 메시지 관리
  addMessage: (message: ChatMessage) => {
    set(state => ({
      messages: [...state.messages, message]
    }));
  },
  
  clearMessages: () => {
    set({
      messages: [] // 모든 메시지 삭제
    });
  },
  
  // 대화 상태 관리
  updateConversationState: (conversationState: ConversationState) => {
    set({ conversationState });
  },
  
  setStage: (stage: ConversationState['stage']) => {
    set(state => ({
      conversationState: {
        ...state.conversationState,
        stage
      }
    }));
  },
  
  // UI 상태 관리
  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },
  
  setError: (error: string | null) => {
    set({ error });
  },
  
  // 분석 및 추천 결과
  setAnalysisResult: (analysisResult: any) => {
    set({ analysisResult });
  },
  
  setRecommendations: (recommendations: string) => {
    set({ recommendations });
  },
  
  // 전체 리셋
  resetChat: () => {
    set({
      ...initialState
    });
  },
  
  // AI와 대화하기
  sendMessage: async (content: string) => {
    const { messages, setLoading, setError, addMessage, updateConversationState } = get();
    
    // 사용자 메시지 추가
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date(),
    };
    
    addMessage(userMessage);
    setLoading(true);
    setError(null);
    
    try {
      // API 호출
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });
      
      if (!response.ok) {
        throw new Error('AI 응답을 받는데 실패했습니다.');
      }
      
      const data = await response.json();
      
      // API 응답 디버깅
      console.log('🔍 Chat API 응답 데이터:', data);
      console.log('🔍 data.content:', data.content);
      console.log('🔍 data.content 타입:', typeof data.content);
      
      // AI 응답 메시지 추가 - content 안전장치 추가
      const botMessage: ChatMessage = {
        id: `bot_${Date.now()}`,
        type: 'bot',
        content: data.content || '응답을 처리하는 중 오류가 발생했습니다.',
        timestamp: new Date(),
      };
      
      addMessage(botMessage);
      
      // 대화 상태 업데이트
      if (data.stage && data.collectedData) {
        updateConversationState({
          stage: data.stage,
          collectedData: data.collectedData
        });
      }
      
      // 추천 단계에서 결과 저장
      if (data.stage === 'recommendation_ready') {
        // 추천 결과가 포함된 응답인지 확인
        if (data.content && data.content.includes('RECOMMENDATION_START')) {
          set({ recommendations: data.content });
        }
      }
      
    } catch (error) {
      console.error('메시지 전송 오류:', error);
      setError('메시지 전송 중 오류가 발생했습니다.');
      
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        type: 'bot',
        content: '죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요.',
        timestamp: new Date(),
      };
      
      addMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  },
})); 