'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useFragranceStore } from '@/store/useFragranceStore';
import { fragrances } from '@/data/fragrances';
import { Fragrance, FragranceFeedback } from '@/types';

export default function FeedbackPage() {
  const { 
    selectedFragrances, 
    feedbacks,
    addFeedback,
    updateJourneyStep 
  } = useFragranceStore();
  
  const [currentFragranceIndex, setCurrentFragranceIndex] = useState(0);
  const [currentFeedback, setCurrentFeedback] = useState<Partial<FragranceFeedback>>({});
  const [isLoading, setIsLoading] = useState(false);

  // 선택된 향수들 가져오기
  const selectedFragranceObjects = fragrances.filter(f => 
    selectedFragrances.includes(f.id)
  );

  const currentFragrance = selectedFragranceObjects[currentFragranceIndex];

  useEffect(() => {
    if (currentFragrance) {
      // 기존 피드백이 있다면 불러오기
      const existingFeedback = feedbacks.find(f => f.fragranceId === currentFragrance.id);
      if (existingFeedback) {
        setCurrentFeedback(existingFeedback);
      } else {
        setCurrentFeedback({
          fragranceId: currentFragrance.id,
          rating: 3,
          longevity: 3,
          sillage: 3,
          review: '',
          usageContext: '',
          seasonPreference: [],
          occasionPreference: []
        });
      }
    }
  }, [currentFragrance, feedbacks]);

  const handleRatingChange = (field: 'rating' | 'longevity' | 'sillage', value: number) => {
    setCurrentFeedback(prev => ({ ...prev, [field]: value }));
  };

  const handleTextChange = (field: 'review' | 'usageContext', value: string) => {
    setCurrentFeedback(prev => ({ ...prev, [field]: value }));
  };

  const handleSeasonToggle = (season: 'spring' | 'summer' | 'fall' | 'winter') => {
    setCurrentFeedback(prev => {
      const seasons = prev.seasonPreference || [];
      const newSeasons = seasons.includes(season)
        ? seasons.filter(s => s !== season)
        : [...seasons, season];
      return { ...prev, seasonPreference: newSeasons };
    });
  };

  const handleOccasionToggle = (occasion: 'daily' | 'work' | 'date' | 'special' | 'evening') => {
    setCurrentFeedback(prev => {
      const occasions = prev.occasionPreference || [];
      const newOccasions = occasions.includes(occasion)
        ? occasions.filter(o => o !== occasion)
        : [...occasions, occasion];
      return { ...prev, occasionPreference: newOccasions };
    });
  };

  const saveFeedback = () => {
    if (currentFeedback.fragranceId) {
      addFeedback(currentFeedback as FragranceFeedback);
    }
  };

  const handleNext = () => {
    saveFeedback();
    
    if (currentFragranceIndex < selectedFragranceObjects.length - 1) {
      setCurrentFragranceIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    saveFeedback();
    if (currentFragranceIndex > 0) {
      setCurrentFragranceIndex(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    saveFeedback();
    setIsLoading(true);
    
    try {
      updateJourneyStep('preference');
      window.location.href = '/preferences';
    } catch (error) {
      console.error('다음 단계로 이동 중 오류:', error);
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    window.location.href = '/fragrance-selection';
  };

  if (!currentFragrance) {
    return (
      <div className="lab-page">
        <div className="lab-container py-12 text-center">
          <p className="lab-text">선택된 향수가 없습니다.</p>
          <Button onClick={handleBack} className="mt-4">
            향수 선택으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const seasons = [
    { id: 'spring', label: '봄', emoji: '🌸' },
    { id: 'summer', label: '여름', emoji: '☀️' },
    { id: 'fall', label: '가을', emoji: '🍂' },
    { id: 'winter', label: '겨울', emoji: '❄️' }
  ] as const;

  const occasions = [
    { id: 'daily', label: '일상', emoji: '☕' },
    { id: 'work', label: '직장', emoji: '💼' },
    { id: 'date', label: '데이트', emoji: '💕' },
    { id: 'special', label: '특별한 날', emoji: '✨' },
    { id: 'evening', label: '저녁/밤', emoji: '🌙' }
  ] as const;

  return (
    <div className="lab-page">
      <div className="lab-container py-12">
        {/* 헤더 */}
        <div className="text-center mb-12 lab-paper-holes pl-12">
          <div className="lab-stamp inline-block mb-4">
            STEP 02 - FRAGRANCE FEEDBACK
          </div>
          
          <h1 className="lab-heading text-3xl md:text-4xl mb-4">
            향수 피드백
          </h1>
          
          <p className="lab-text max-w-2xl mx-auto text-lg mb-6">
            선택하신 향수들에 대한 상세한 피드백을 남겨주세요. 
            이 정보는 향후 추천에 중요한 데이터가 됩니다.
          </p>
          
          <div className="lab-label">
            {currentFragranceIndex + 1} / {selectedFragranceObjects.length}
          </div>
        </div>

        {/* 현재 향수 정보 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">
              {currentFragrance.name}
            </CardTitle>
            <CardDescription>
              {currentFragrance.brand.name} • {currentFragrance.concentration.toUpperCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="lab-text text-sm mb-4">
              {currentFragrance.description}
            </p>
            <div className="text-xs space-y-1">
              <div>
                <span className="font-semibold">Top:</span>{' '}
                {currentFragrance.notes.top.map(note => note.name).join(', ')}
              </div>
              <div>
                <span className="font-semibold">Middle:</span>{' '}
                {currentFragrance.notes.middle.map(note => note.name).join(', ')}
              </div>
              <div>
                <span className="font-semibold">Base:</span>{' '}
                {currentFragrance.notes.base.map(note => note.name).join(', ')}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 피드백 폼 */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* 평점 섹션 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">평점 및 성능</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 전체 평점 */}
              <div>
                <label className="lab-label block mb-2">
                  전체 평점
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRatingChange('rating', star)}
                      className={`w-8 h-8 text-lg ${
                        (currentFeedback.rating || 0) >= star
                          ? 'text-lab-black' 
                          : 'text-lab-gray-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* 지속력 */}
              <div>
                <label className="lab-label block mb-2">
                  지속력 (얼마나 오래 지속되나요?)
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRatingChange('longevity', star)}
                      className={`w-8 h-8 text-lg ${
                        (currentFeedback.longevity || 0) >= star
                          ? 'text-lab-black' 
                          : 'text-lab-gray-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* 확산력 */}
              <div>
                <label className="lab-label block mb-2">
                  확산력 (얼마나 멀리 퍼지나요?)
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRatingChange('sillage', star)}
                      className={`w-8 h-8 text-lg ${
                        (currentFeedback.sillage || 0) >= star
                          ? 'text-lab-black' 
                          : 'text-lab-gray-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 상세 피드백 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">상세 피드백</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="lab-label block mb-2">
                  리뷰 (자유롭게 작성해주세요)
                </label>
                <textarea
                  value={currentFeedback.review || ''}
                  onChange={(e) => handleTextChange('review', e.target.value)}
                  className="w-full p-3 border border-lab-gray-300 rounded-none bg-lab-paper 
                           focus:border-lab-black focus:outline-none font-mono text-sm"
                  rows={4}
                  placeholder="이 향수에 대한 솔직한 느낌을 알려주세요..."
                />
              </div>

              <div>
                <label className="lab-label block mb-2">
                  사용 상황 (언제, 어디서 사용했나요?)
                </label>
                <Input
                  value={currentFeedback.usageContext || ''}
                  onChange={(e) => handleTextChange('usageContext', e.target.value)}
                  placeholder="예: 직장에서, 데이트할 때, 집에서 편안할 때..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 선호 상황 */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* 계절 선호도 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">어떤 계절에 어울리나요?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {seasons.map((season) => (
                  <button
                    key={season.id}
                    onClick={() => handleSeasonToggle(season.id)}
                    className={`p-3 border border-lab-gray-300 rounded-none text-left transition-colors ${
                      currentFeedback.seasonPreference?.includes(season.id)
                        ? 'bg-lab-gray-100 border-lab-black'
                        : 'hover:bg-lab-gray-50'
                    }`}
                  >
                    <span className="text-lg mr-2">{season.emoji}</span>
                    {season.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 상황별 선호도 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">어떤 상황에 어울리나요?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {occasions.map((occasion) => (
                  <button
                    key={occasion.id}
                    onClick={() => handleOccasionToggle(occasion.id)}
                    className={`w-full p-3 border border-lab-gray-300 rounded-none text-left transition-colors ${
                      currentFeedback.occasionPreference?.includes(occasion.id)
                        ? 'bg-lab-gray-100 border-lab-black'
                        : 'hover:bg-lab-gray-50'
                    }`}
                  >
                    <span className="text-lg mr-2">{occasion.emoji}</span>
                    {occasion.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 네비게이션 */}
        <div className="flex justify-between items-center">
          <Button 
            variant="ghost" 
            onClick={currentFragranceIndex > 0 ? handlePrevious : handleBack}
            disabled={isLoading}
          >
            {currentFragranceIndex > 0 ? '← 이전 향수' : '← 향수 선택'}
          </Button>
          
          <div className="text-center">
            <p className="lab-text text-sm">
              {currentFragranceIndex < selectedFragranceObjects.length - 1 
                ? '다음 향수 피드백을 작성해주세요'
                : '모든 피드백을 완료하면 선호도 분석을 시작합니다'
              }
            </p>
          </div>
          
          <Button 
            variant="primary"
            onClick={handleNext}
            disabled={isLoading}
          >
            {isLoading 
              ? '진행 중...' 
              : currentFragranceIndex < selectedFragranceObjects.length - 1 
                ? '다음 향수 →' 
                : '피드백 완료 →'
            }
          </Button>
        </div>
      </div>
    </div>
  );
} 