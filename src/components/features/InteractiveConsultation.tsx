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
  const { addLog } = useAnalysisStore();
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
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {exampleAnswers.length > 0 ? (
                exampleAnswers.map((example, index) => (
                  <div 
                    key={index}
                    onClick={() => setInputValue(example)}
                    className="bg-white/5 border border-gray-600/20 rounded-full px-4 py-2 text-sm text-mono-600 hover:bg-white/10 hover:text-mono-700 cursor-pointer transition-all duration-200"
                  >
                    "{example}"
                  </div>
                ))
              ) : (
                <>
                  <div 
                    onClick={() => setInputValue('샤넬 블루 드 샤넬, 톰포드 네롤리 포르토피노')}
                    className="bg-white/5 border border-gray-600/20 rounded-full px-4 py-2 text-sm text-mono-600 hover:bg-white/10 hover:text-mono-700 cursor-pointer transition-all duration-200"
                  >
                    "샤넬 블루 드 샤넬, 톰포드 네롤리 포르토피노"
                  </div>
                  <div 
                    onClick={() => setInputValue('디올 소바쥬, 구찌 블룸')}
                    className="bg-white/5 border border-gray-600/20 rounded-full px-4 py-2 text-sm text-mono-600 hover:bg-white/10 hover:text-mono-700 cursor-pointer transition-all duration-200"
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
        <div className="max-w-4xl mx-auto mb-8">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={isLoading ? "AI가 분석 중입니다..." : "답변을 입력해주세요..."}
                className="w-full px-6 py-4 bg-white/10 border border-gray-600/30 rounded-lg text-mono-900 placeholder-mono-500 focus:outline-none focus:ring-2 focus:ring-mono-700 focus:border-transparent backdrop-blur-sm"
                disabled={isLoading}
              />
              
              {/* 왼쪽에서 오른쪽으로 채워지는 물결 로딩 애니메이션 */}
              {isLoading && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
                  <div 
                    className="h-full bg-mono-800/20 animate-wave-fill"
                    style={{
                      background: `linear-gradient(90deg, 
                        transparent 0%, 
                        rgba(0,0,0,0.1) 25%, 
                        rgba(0,0,0,0.15) 50%, 
                        rgba(0,0,0,0.1) 75%, 
                        transparent 100%
                      )`,
                      clipPath: `polygon(
                        0% 100%, 
                        5% 85%, 
                        10% 90%, 
                        15% 75%, 
                        20% 80%, 
                        25% 70%, 
                        30% 75%, 
                        35% 65%, 
                        40% 70%, 
                        45% 60%, 
                        50% 65%, 
                        55% 55%, 
                        60% 60%, 
                        65% 50%, 
                        70% 55%, 
                        75% 45%, 
                        80% 50%, 
                        85% 40%, 
                        90% 45%, 
                        95% 35%, 
                        100% 40%, 
                        100% 100%
                      )`
                    }}
                  />
                </div>
              )}
            </div>
            <Button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="px-8 py-4"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
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
                AI가 향수 데이터베이스를 분석하고 있습니다...
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