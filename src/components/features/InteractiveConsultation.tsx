import React, { useState, useRef, useEffect } from 'react';
import { FlaskConical } from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { useTypingAnimation } from '@/hooks/useTypingAnimation';
import { Button } from '@/components/ui/Button';
import { AnalysisProgress } from './AnalysisProgress';
import { AnalysisLogs, LogDetailModal } from './AnalysisLogs';
import { RecommendationResults } from './RecommendationResults';
import { parseAnalysisLogs, generateAutoLogs } from '@/utils/log-parser';

interface InteractiveConsultationProps {
  onStartChat: () => void;
}

export function InteractiveConsultation({ onStartChat }: InteractiveConsultationProps) {
  const { messages, isLoading, sendMessage, conversationState, recommendations } = useChatStore();
  const { addLog, forceCompleteProgress } = useAnalysisStore();
  const [inputValue, setInputValue] = useState('');
  const [isStarting, setIsStarting] = useState(false);

  const { 
    typingText, 
    isTyping, 
    exampleAnswers 
  } = useTypingAnimation();

  // AI 응답이 업데이트될 때마다 로그 파싱 및 저장
  useEffect(() => {
    if (messages.length < 2) return; // 최소 2개 메시지 필요
    
    const lastMessage = messages[messages.length - 1];
    const previousMessage = messages[messages.length - 2];
    
    // 마지막이 봇 메시지이고, 이전이 사용자 메시지인 경우에만 로그 파싱
    if (lastMessage?.type === 'bot' && lastMessage?.content && 
        previousMessage?.type === 'user' && previousMessage?.content) {
      
      // 먼저 구조화된 로그를 파싱 시도
      const parsedLogs = parseAnalysisLogs(lastMessage.content);
      
      if (parsedLogs.length > 0) {
        // 구조화된 로그가 있으면 사용
        parsedLogs.forEach(log => {
          addLog(log.category, log.title, log.content, log.progressContribution);
        });
      } else {
        // 구조화된 로그가 없으면 자동 생성
        const autoLogs = generateAutoLogs(previousMessage.content, lastMessage.content);
        autoLogs.forEach(log => {
          addLog(log.category, log.title, log.content, log.progressContribution);
        });
      }
    }
  }, [messages, addLog]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue.trim();
    setInputValue('');
    
    try {
      await sendMessage(message);
    } catch (error) {
      console.error('메시지 전송 실패:', error);
    }
  };

  const handleStartChat = async () => {
    setIsStarting(true);
    try {
      await onStartChat();
    } finally {
      setIsStarting(false);
    }
  };

  // 추천 결과 표시 여부 확인
  const shouldShowRecommendations = recommendations && conversationState.stage === 'recommendation_ready';

  // 추천이 준비되면 진행률을 100%로 설정
  useEffect(() => {
    if (shouldShowRecommendations) {
      forceCompleteProgress();
    }
  }, [shouldShowRecommendations, forceCompleteProgress]);

  return (
    <div className="relative max-w-6xl mx-auto mb-16">
      {/* AI 질문 섹션 - 여백 줄임 */}
      <div className="mb-6">
        {/* AI 현재 질문 - 타이핑 애니메이션 */}
        <div className="text-center">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-2xl md:text-4xl font-bold text-mono-900 leading-relaxed min-h-[3rem] decoration-4 underline decoration-mono-700/50 underline-offset-8">
              {typingText}
              {isTyping && <span className="animate-pulse">|</span>}
            </h3>
          </div>
        </div>
      </div>

      {/* 진행률 표시 */}
      <AnalysisProgress />

      {/* 예시 답안 섹션 - recommendation_ready 단계에서는 숨김 */}
      {conversationState.stage !== 'recommendation_ready' && (
        <div className="mb-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-4">
              <p className="text-sm text-mono-500">💡 이런 식으로 답변해보세요</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-6 px-4">
              {exampleAnswers.length > 0 ? (
                exampleAnswers.map((example, index) => (
                  <div 
                    key={index}
                    onClick={() => setInputValue(example)}
                    className="bg-white/5 border border-gray-600/20 rounded-full px-3 md:px-4 py-2 md:py-2 py-3 text-xs md:text-sm text-mono-600 hover:bg-white/10 hover:text-mono-700 cursor-pointer transition-all duration-200 text-center"
                  >
                    "{example}"
                  </div>
                ))
              ) : (
                <>
                  <div 
                    onClick={() => setInputValue('샤넬 블루 드 샤넬, 톰포드 네롤리 포르토피노')}
                    className="bg-white/5 border border-gray-600/20 rounded-full px-3 md:px-4 py-2 md:py-2 py-3 text-xs md:text-sm text-mono-600 hover:bg-white/10 hover:text-mono-700 cursor-pointer transition-all duration-200 text-center"
                  >
                    "샤넬 블루 드 샤넬, 톰포드 네롤리 포르토피노"
                  </div>
                  <div 
                    onClick={() => setInputValue('디올 소바쥬, 구찌 블룸')}
                    className="bg-white/5 border border-gray-600/20 rounded-full px-3 md:px-4 py-2 md:py-2 py-3 text-xs md:text-sm text-mono-600 hover:bg-white/10 hover:text-mono-700 cursor-pointer transition-all duration-200 text-center"
                  >
                    "디올 소바쥬, 구찌 블룸"
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 입력 폼 - recommendation_ready 단계에서는 숨김 */}
      {conversationState.stage !== 'recommendation_ready' && (
        <div className="max-w-4xl mx-auto mb-8 px-4">
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={isLoading ? "정밀 취향 분석 중입니다... 잠시만 기다려 주세요" : "답변을 입력해주세요..."}
                className="w-full px-6 py-4 md:py-4 py-6 pr-16 md:pr-6 bg-white/10 border border-gray-600/30 rounded-lg text-mono-900 placeholder-mono-500 focus:outline-none focus:ring-2 focus:ring-mono-700 focus:border-transparent backdrop-blur-sm text-base"
                disabled={isLoading}
              />
              
              {/* 모바일용 입력창 내부 전송 버튼 */}
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="md:hidden absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-mono-700 hover:bg-mono-800 disabled:bg-gray-400 rounded-full flex items-center justify-center transition-colors duration-200"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
              
              {/* 두꺼운 막대 로딩바 */}
              {isLoading && (
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-gray-200/30 rounded-b-lg overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-mono-700 to-mono-900 animate-loading-bar"></div>
                </div>
              )}
            </div>
            
            {/* 데스크톱용 전송 버튼 */}
            <Button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="hidden md:flex px-8 py-4 text-base font-medium"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  분석중
                </div>
              ) : '전송'}
            </Button>
          </form>
          
          {/* 로딩 상태 표시 */}
          {isLoading && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 border border-gray-600/20 rounded-full text-sm text-mono-600">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-mono-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                  <div className="w-2 h-2 bg-mono-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                  <div className="w-2 h-2 bg-mono-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                </div>
                정밀한 취향 분석 중입니다. 페이지를 벗어나지 마세요!
              </div>
            </div>
          )}
        </div>
      )}

      {/* 추천 결과 표시 */}
      {shouldShowRecommendations && (
        <RecommendationResults recommendationText={recommendations} />
      )}

      {/* 분석 로그 섹션 - 입력 폼 아래로 이동 */}
      <AnalysisLogs />

      {/* 로그 상세보기 모달 */}
      <LogDetailModal />
    </div>
  );
} 