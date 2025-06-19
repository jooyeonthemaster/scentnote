import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { ConversationState } from '@/store/useChatStore';
import { CheckCircle, Circle, Clock, Target } from 'lucide-react';

interface ConversationProgressProps {
  conversationState: ConversationState;
}

export const ConversationProgress: React.FC<ConversationProgressProps> = ({
  conversationState
}) => {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const stages = [
    {
      key: 'initial',
      title: '대화 시작',
      description: '향수 전문가와 인사',
      icon: Clock
    },
    {
      key: 'experience_gathering',
      title: '경험 수집',
      description: '향수 사용 경험 파악',
      icon: Circle
    },
    {
      key: 'preference_analysis',
      title: '선호도 분석',
      description: '취향과 스타일 분석',
      icon: Circle
    },
    {
      key: 'recommendation_ready',
      title: '맞춤 추천',
      description: '개인화된 향수 추천',
      icon: Target
    }
  ];

  const getCurrentStageIndex = () => {
    if (!isClient) return 0; // 서버에서는 항상 0 반환
    return stages.findIndex(stage => stage.key === conversationState.stage);
  };

  const currentStageIndex = getCurrentStageIndex();

  return (
    <Card className="bg-lab-cream/20 border-lab-gray-300">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-mono text-sm font-semibold text-lab-black">
            대화 진행 상황
          </h3>
          <div className="lab-stamp text-xs">
            {currentStageIndex + 1} / {stages.length}
          </div>
        </div>
        
        <div className="space-y-3">
          {stages.map((stage, index) => {
            const isCompleted = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;
            const isUpcoming = index > currentStageIndex;
            
            const IconComponent = isCompleted ? CheckCircle : stage.icon;
            
            return (
              <div
                key={stage.key}
                className={`flex items-center gap-3 p-2 rounded transition-all ${
                  isCurrent 
                    ? 'bg-lab-black/10 border border-lab-black/20' 
                    : 'bg-transparent'
                }`}
              >
                <div className={`flex-shrink-0 ${
                  isCompleted 
                    ? 'text-green-600' 
                    : isCurrent 
                      ? 'text-lab-black' 
                      : 'text-lab-gray-400'
                }`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className={`font-mono text-xs ${
                    isCompleted 
                      ? 'text-green-600 line-through' 
                      : isCurrent 
                        ? 'text-lab-black font-semibold' 
                        : 'text-lab-gray-500'
                  }`}>
                    {stage.title}
                  </div>
                  <div className={`text-xs ${
                    isCompleted 
                      ? 'text-green-500' 
                      : isCurrent 
                        ? 'text-lab-gray-600' 
                        : 'text-lab-gray-400'
                  }`}>
                    {stage.description}
                  </div>
                </div>
                
                {isClient && isCurrent && (
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-lab-black rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* 수집된 데이터 표시 - 클라이언트에서만 렌더링 */}
        {isClient && conversationState.collectedData.experiencedFragrances.length > 0 && (
          <div className="mt-4 pt-4 border-t border-lab-gray-300">
            <div className="lab-stamp text-xs mb-2">COLLECTED DATA</div>
            <div className="space-y-2">
              {conversationState.collectedData.experiencedFragrances.length > 0 && (
                <div>
                  <div className="text-xs font-mono text-lab-gray-600 mb-1">
                    언급된 향수
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {conversationState.collectedData.experiencedFragrances.slice(0, 3).map((fragrance, index) => (
                      <span
                        key={index}
                        className="text-xs bg-lab-black text-lab-white px-2 py-1 rounded font-mono"
                      >
                        {fragrance}
                      </span>
                    ))}
                    {conversationState.collectedData.experiencedFragrances.length > 3 && (
                      <span className="text-xs text-lab-gray-500 px-2 py-1">
                        +{conversationState.collectedData.experiencedFragrances.length - 3}개 더
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 