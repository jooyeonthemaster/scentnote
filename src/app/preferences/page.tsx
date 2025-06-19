'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useFragranceStore } from '@/store/useFragranceStore';
import { fragrances } from '@/data/fragrances';
import { Fragrance, FragrancePreference } from '@/types';

export default function PreferencesPage() {
  const { 
    selectedFragrances, 
    feedbacks,
    preferences,
    addPreference,
    updateJourneyStep 
  } = useFragranceStore();
  
  const [currentPreferences, setCurrentPreferences] = useState<{[key: string]: Partial<FragrancePreference>}>({});
  const [isLoading, setIsLoading] = useState(false);

  // 선택된 향수들 가져오기 - useMemo로 메모이제이션
  const selectedFragranceObjects = useMemo(() => 
    fragrances.filter(f => selectedFragrances.includes(f.id)),
    [selectedFragrances]
  );

  useEffect(() => {
    // 기존 선호도 데이터가 있다면 불러오기
    const prefsMap: {[key: string]: Partial<FragrancePreference>} = {};
    
    selectedFragranceObjects.forEach(fragrance => {
      const existingPreference = preferences.find(p => p.fragranceId === fragrance.id);
      const feedback = feedbacks.find(f => f.fragranceId === fragrance.id);
      
      if (existingPreference) {
        prefsMap[fragrance.id] = existingPreference;
      } else {
        prefsMap[fragrance.id] = {
          fragranceId: fragrance.id,
          preferenceLevel: feedback?.rating || 5,
          preferredAspects: [],
          dislikedAspects: [],
          emotionalResponse: ''
        };
      }
    });
    
    setCurrentPreferences(prefsMap);
  }, [selectedFragrances, preferences, feedbacks]);

  const handlePreferenceLevelChange = (fragranceId: string, level: number) => {
    setCurrentPreferences(prev => ({
      ...prev,
      [fragranceId]: {
        ...prev[fragranceId],
        preferenceLevel: level
      }
    }));
  };

  const handleAspectToggle = (fragranceId: string, aspect: string, type: 'preferred' | 'disliked') => {
    setCurrentPreferences(prev => {
      const current = prev[fragranceId] || {};
      const aspectsKey = type === 'preferred' ? 'preferredAspects' : 'dislikedAspects';
      const currentAspects = current[aspectsKey] || [];
      
      const newAspects = currentAspects.includes(aspect)
        ? currentAspects.filter(a => a !== aspect)
        : [...currentAspects, aspect];
      
      return {
        ...prev,
        [fragranceId]: {
          ...current,
          [aspectsKey]: newAspects
        }
      };
    });
  };

  const handleEmotionalResponseChange = (fragranceId: string, response: string) => {
    setCurrentPreferences(prev => ({
      ...prev,
      [fragranceId]: {
        ...prev[fragranceId],
        emotionalResponse: response
      }
    }));
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    try {
      // 모든 선호도 데이터 저장
      Object.values(currentPreferences).forEach(preference => {
        if (preference.fragranceId) {
          addPreference(preference as FragrancePreference);
        }
      });
      
      updateJourneyStep('analysis');
      window.location.href = '/analysis';
    } catch (error) {
      console.error('다음 단계로 이동 중 오류:', error);
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    window.location.href = '/feedback';
  };

  const commonAspects = [
    { id: 'scent', label: '향 자체가 좋음', category: 'scent' },
    { id: 'longevity', label: '오래 지속됨', category: 'performance' },
    { id: 'sillage', label: '적당한 확산력', category: 'performance' },
    { id: 'uniqueness', label: '독특하고 개성적', category: 'character' },
    { id: 'elegance', label: '우아하고 세련됨', category: 'character' },
    { id: 'comfort', label: '편안하고 안정감', category: 'emotion' },
    { id: 'confidence', label: '자신감을 줌', category: 'emotion' },
    { id: 'versatility', label: '다양한 상황에 어울림', category: 'versatility' },
    { id: 'season_fit', label: '계절감에 잘 맞음', category: 'versatility' },
    { id: 'complexity', label: '복합적이고 깊이 있음', category: 'complexity' },
    { id: 'simplicity', label: '단순하고 깔끔함', category: 'complexity' },
    { id: 'nostalgia', label: '추억이나 감정을 불러일으킴', category: 'emotion' }
  ];

  // 높은 선호도 향수들 (7점 이상)
  const highPreferenceFragrances = selectedFragranceObjects.filter(fragrance => {
    const preference = currentPreferences[fragrance.id];
    return (preference?.preferenceLevel || 0) >= 7;
  });

  return (
    <div className="lab-page">
      <div className="lab-container py-12">
        {/* 헤더 */}
        <div className="text-center mb-12 lab-paper-holes pl-12">
          <div className="lab-stamp inline-block mb-4">
            STEP 03 - PREFERENCE ANALYSIS
          </div>
          
          <h1 className="lab-heading text-3xl md:text-4xl mb-4">
            선호도 분석
          </h1>
          
          <p className="lab-text max-w-2xl mx-auto text-lg mb-6">
            선택하신 향수들에 대해 더 자세한 선호도를 분석해보겠습니다.
            각 향수에 대한 선호 수준과 구체적인 이유를 알려주세요.
          </p>
          
          <div className="lab-label">
            분석할 향수: {selectedFragranceObjects.length}개
            {highPreferenceFragrances.length > 0 && (
              <span className="ml-4 text-green-600">
                높은 선호도: {highPreferenceFragrances.length}개
              </span>
            )}
          </div>
        </div>

        {/* 향수별 선호도 분석 */}
        <div className="space-y-8 mb-12">
          {selectedFragranceObjects.map((fragrance) => {
            const preference = currentPreferences[fragrance.id] || {};
            const feedback = feedbacks.find(f => f.fragranceId === fragrance.id);
            
            return (
              <Card key={fragrance.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-1">
                        {fragrance.name}
                      </CardTitle>
                      <CardDescription>
                        {fragrance.brand.name} • 평점: {feedback?.rating || 0}/5
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="lab-label text-xs">선호 수준</div>
                      <div className="text-2xl font-bold text-lab-black">
                        {preference.preferenceLevel || 0}/10
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* 선호 수준 슬라이더 */}
                  <div>
                    <label className="lab-label block mb-3">
                      이 향수를 얼마나 좋아하시나요? (1-10)
                    </label>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-lab-gray-500">별로</span>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                          <button
                            key={level}
                            onClick={() => handlePreferenceLevelChange(fragrance.id, level)}
                            className={`w-8 h-8 border border-lab-gray-300 text-xs font-semibold
                              ${(preference.preferenceLevel || 0) >= level
                                ? 'bg-lab-black text-white border-lab-black' 
                                : 'hover:bg-lab-gray-100'
                              }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                      <span className="text-sm text-lab-gray-500">매우 좋음</span>
                    </div>
                  </div>

                  {/* 좋아하는 점들 */}
                  <div>
                    <label className="lab-label block mb-3">
                      이 향수의 어떤 점이 좋으신가요? (복수 선택 가능)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {commonAspects.map((aspect) => (
                        <button
                          key={aspect.id}
                          onClick={() => handleAspectToggle(fragrance.id, aspect.id, 'preferred')}
                          className={`p-2 text-sm border border-lab-gray-300 rounded-none text-left transition-colors
                            ${preference.preferredAspects?.includes(aspect.id)
                              ? 'bg-green-100 border-green-400 text-green-800'
                              : 'hover:bg-lab-gray-50'
                            }`}
                        >
                          {aspect.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 아쉬운 점들 */}
                  <div>
                    <label className="lab-label block mb-3">
                      아쉬운 점이나 싫은 점이 있다면? (선택 사항)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {commonAspects.map((aspect) => (
                        <button
                          key={aspect.id}
                          onClick={() => handleAspectToggle(fragrance.id, aspect.id, 'disliked')}
                          className={`p-2 text-sm border border-lab-gray-300 rounded-none text-left transition-colors
                            ${preference.dislikedAspects?.includes(aspect.id)
                              ? 'bg-red-100 border-red-400 text-red-800'
                              : 'hover:bg-lab-gray-50'
                            }`}
                        >
                          {aspect.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 감정적 반응 */}
                  <div>
                    <label className="lab-label block mb-2">
                      이 향수를 맡으면 어떤 기분이 드시나요?
                    </label>
                    <Input
                      value={preference.emotionalResponse || ''}
                      onChange={(e) => handleEmotionalResponseChange(fragrance.id, e.target.value)}
                      placeholder="예: 자신감이 생긴다, 편안해진다, 특별한 기분이 든다..."
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 요약 섹션 */}
        {highPreferenceFragrances.length > 0 && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg text-green-800">
                높은 선호도 향수 요약
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {highPreferenceFragrances.map(fragrance => (
                  <div key={fragrance.id} className="flex justify-between items-center">
                    <span className="font-medium text-green-800">
                      {fragrance.name}
                    </span>
                    <span className="text-green-600">
                      {currentPreferences[fragrance.id]?.preferenceLevel}/10
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-green-700 mt-4">
                이 정보들을 바탕으로 AI가 당신의 취향을 분석하고 맞춤 향수를 추천해드릴게요!
              </p>
            </CardContent>
          </Card>
        )}

        {/* 네비게이션 */}
        <div className="flex justify-between items-center">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            disabled={isLoading}
          >
            ← 피드백으로 돌아가기
          </Button>
          
          <div className="text-center">
            <p className="lab-text text-sm">
              선호도 분석이 완료되면 AI 취향 분석을 시작합니다
            </p>
          </div>
          
          <Button 
            variant="primary"
            onClick={handleComplete}
            disabled={isLoading || highPreferenceFragrances.length === 0}
          >
            {isLoading ? '분석 중...' : 'AI 분석 시작 →'}
          </Button>
        </div>
      </div>
    </div>
  );
} 