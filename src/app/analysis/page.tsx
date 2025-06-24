'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { useFragranceStore } from '@/store/useFragranceStore';
import { fragrances } from '@/data/fragrances';
// API Routes를 통해 Gemini 함수 호출
import { FragranceAnalysis, FragranceRecommendation } from '@/types';
import { FragranceFacts } from '@/components/features/FragranceFacts';
import { useAnalysisStore } from '@/store/useAnalysisStore';

export default function AnalysisPage() {
  const { 
    selectedFragrances, 
    feedbacks,
    preferences,
    analysis,
    setAnalysis,
    updateJourneyStep,
    completeJourney
  } = useFragranceStore();
  
  const { forceCompleteProgress } = useAnalysisStore();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<'analyzing' | 'generating' | 'complete'>('analyzing');
  const [currentAnalysis, setCurrentAnalysis] = useState<FragranceAnalysis | null>(analysis);
  const [error, setError] = useState<string | null>(null);

  // 선택된 향수들 가져오기
  const selectedFragranceObjects = fragrances.filter(f => 
    selectedFragrances.includes(f.id)
  );

  // 높은 선호도 향수들 (7점 이상)
  const highPreferenceFragrances = selectedFragranceObjects.filter(fragrance => {
    const preference = preferences.find(p => p.fragranceId === fragrance.id);
    return (preference?.preferenceLevel || 0) >= 7;
  });

  useEffect(() => {
    if (!analysis && selectedFragrances.length > 0) {
      startAnalysis();
    } else if (analysis) {
      setCurrentAnalysis(analysis);
      // 이미 분석이 완료되어 있어도 사용자가 흥미로운 향수 이야기를 볼 수 있도록 
      // analyzing → generating → complete 순서로 진행
      setAnalysisStep('analyzing');
      
      // 첫 번째 단계: analyzing (4초)
      setTimeout(() => {
        setAnalysisStep('generating');
        
        // 두 번째 단계: generating (6초)
        setTimeout(() => {
          setAnalysisStep('complete');
          forceCompleteProgress();
        }, 6000);
      }, 4000);
    }
  }, [forceCompleteProgress]);

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysisStep('analyzing');

    try {
      // 1단계: 취향 분석 (API Route 호출)
      const analysisResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedbacks,
          preferences
        })
      });

      if (!analysisResponse.ok) {
        throw new Error('분석 요청 실패');
      }

      const analysisData = await analysisResponse.json();
      if (!analysisData.success) {
        throw new Error(analysisData.error || '분석 실패');
      }

      const analysisResult = analysisData.data;

      const completeAnalysis: FragranceAnalysis = {
        userId: 'current-user',
        preferredNotes: analysisResult.preferredNotes || [],
        avoidedNotes: analysisResult.avoidedNotes || [],
        preferredConcentrations: analysisResult.preferredConcentrations || ['edp'],
        preferredBrands: analysisResult.preferredBrands || [],
        personalityProfile: analysisResult.personalityProfile || {
          style: 'modern',
          intensity: 'moderate', 
          complexity: 'complex'
        },
        recommendations: [],
        confidence: analysisResult.confidence || 0.8,
        generatedAt: new Date()
      };
      
      setCurrentAnalysis(completeAnalysis);
      setAnalysis(completeAnalysis);
      setAnalysisStep('generating');
      
      // 사용자가 흥미로운 향수 이야기를 볼 수 있도록 최소 6초 대기
      await new Promise(resolve => setTimeout(resolve, 6000));

      // 2단계: 추천 생성 (API Route 호출) - 올바른 userProfile 형식으로 전송
      const userProfile = {
        preferredNotes: analysisResult.preferredNotes?.map((note: any) => note.name || note).join(', ') || '',
        avoidedNotes: analysisResult.avoidedNotes?.map((note: any) => note.name || note).join(', ') || '',
        preferredBrands: analysisResult.preferredBrands?.map((brand: any) => brand.name || brand) || [],
        style: analysisResult.personalityProfile?.style || 'modern',
        intensity: analysisResult.personalityProfile?.intensity || 'moderate',
        complexity: analysisResult.personalityProfile?.complexity || 'complex',
        budget: analysisResult.personalityProfile?.budget || '5만원',
        gender: '무관',
        ageGroup: '20-30대',
        lifestyle: '일반',
        occasions: '데일리',
        experience: '중급'
      };

      const recommendationResponse = await fetch('/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userProfile
        })
      });

      if (!recommendationResponse.ok) {
        throw new Error('추천 요청 실패');
      }

      const recommendationData = await recommendationResponse.json();
      if (!recommendationData.success) {
        throw new Error(recommendationData.error || '추천 생성 실패');
      }

      const recommendations = recommendationData.data;

      const finalAnalysis: FragranceAnalysis = {
        ...completeAnalysis,
        recommendations
      };

      setCurrentAnalysis(finalAnalysis);
      setAnalysis(finalAnalysis);
      
      // 마지막 향수 이야기들을 볼 수 있도록 추가 대기
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      setAnalysisStep('complete');
      
      // 분석 완료 시 진행률을 100%로 강제 설정
      forceCompleteProgress();

    } catch (error) {
      console.error('AI 분석 중 오류:', error);
      setError('AI 분석 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleComplete = () => {
    updateJourneyStep('complete');
    completeJourney();
    window.location.href = '/';
  };

  const handleRestart = () => {
    window.location.href = '/';
  };

  const handleBack = () => {
    window.location.href = '/preferences';
  };

  if (error) {
    return (
      <div className="lab-page">
        <div className="lab-container py-12 text-center">
          <div className="lab-stamp inline-block mb-4 text-red-600">
            ERROR - ANALYSIS FAILED
          </div>
          <h1 className="lab-heading text-2xl mb-4 text-red-800">
            분석 오류
          </h1>
          <p className="lab-text mb-6">{error}</p>
          <div className="space-x-4">
            <Button onClick={startAnalysis} variant="primary">
              다시 시도
            </Button>
            <Button onClick={handleBack} variant="ghost">
              이전 단계로
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (analysisStep === 'analyzing' || analysisStep === 'generating') {
    return (
      <div className="lab-page">
        <div className="lab-container py-12">
          <div className="text-center mb-12 lab-paper-holes pl-12">
            <div className="lab-stamp inline-block mb-4">
              STEP 04 - AI ANALYSIS
            </div>
            
            <h1 className="lab-heading text-3xl md:text-4xl mb-4">
              AI 취향 분석 중
            </h1>
            
            <p className="lab-text max-w-2xl mx-auto text-lg mb-8">
              {analysisStep === 'analyzing' 
                ? '수천 가지 향수 데이터와 당신의 답변을 정밀 분석 중입니다. 정확한 추천을 위해 시간이 걸리니 페이지를 벗어나지 마세요!'
                : '당신만을 위한 완벽한 향수를 찾고 있습니다. 곧 놀라운 결과를 확인하실 수 있어요!'
              }
            </p>
          </div>

          {/* 흥미진진한 향수 정보와 함께하는 로딩 */}
          <div className="relative">
            <FragranceFacts />
            
            {/* 하단 로딩 표시 */}
            <div className="mt-8 max-w-md mx-auto">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="animate-spin w-6 h-6 border-3 border-mono-300 border-t-mono-700 rounded-full"></div>
                <p className="text-mono-700 font-medium text-center">
                  {analysisStep === 'analyzing' 
                    ? '취향을 정밀 분석 중입니다... 페이지를 벗어나지 마세요!'
                    : '맞춤 향수를 찾고 있습니다... 곧 완료됩니다!'
                  }
                </p>
              </div>
              
              {/* 진행률 바 - 실제 진행률 반영 */}
              <div className="w-full bg-mono-200/50 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-mono-600 to-mono-800 h-4 rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: analysisStep === 'analyzing' ? '45%' : 
                           analysisStep === 'generating' ? '85%' : '100%' 
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* 분석 중인 데이터 표시 */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">분석할 향수</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-lab-black">
                  {selectedFragrances.length}개
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">피드백 데이터</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-lab-black">
                  {feedbacks.length}개
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">높은 선호도</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-lab-black">
                  {highPreferenceFragrances.length}개
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!currentAnalysis) {
    return (
      <div className="lab-page">
        <div className="lab-container py-12 text-center">
          <p className="lab-text">분석 결과를 불러올 수 없습니다.</p>
          <Button onClick={startAnalysis} className="mt-4">
            분석 다시 시작
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="lab-page">
      <div className="lab-container py-12">
        {/* 헤더 */}
        <div className="text-center mb-12 lab-paper-holes pl-12">
          <div className="lab-stamp inline-block mb-4">
            STEP 04 - ANALYSIS COMPLETE
          </div>
          
          <h1 className="lab-heading text-3xl md:text-4xl mb-4">
            AI 취향 분석 결과
          </h1>
          
          <p className="lab-text max-w-2xl mx-auto text-lg mb-6">
            당신의 향수 취향을 분석하고 맞춤 추천을 준비했습니다.
          </p>
          
          <div className="lab-label">
            분석 신뢰도: {Math.round((currentAnalysis.confidence || 0) * 100)}%
          </div>
        </div>

        {/* 성향 프로필 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">당신의 향수 성향</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="lab-label mb-2">스타일</div>
                <div className="text-2xl font-bold text-lab-black capitalize">
                  {currentAnalysis.personalityProfile.style}
                </div>
                <div className="text-sm text-lab-gray-600 mt-1">
                  {currentAnalysis.personalityProfile.style === 'classic' && '클래식하고 전통적인'}
                  {currentAnalysis.personalityProfile.style === 'modern' && '모던하고 세련된'}
                  {currentAnalysis.personalityProfile.style === 'bold' && '대담하고 독특한'}
                  {currentAnalysis.personalityProfile.style === 'minimalist' && '미니멀하고 깔끔한'}
                  {currentAnalysis.personalityProfile.style === 'romantic' && '로맨틱하고 부드러운'}
                </div>
              </div>

              <div className="text-center">
                <div className="lab-label mb-2">강도</div>
                <div className="text-2xl font-bold text-lab-black capitalize">
                  {currentAnalysis.personalityProfile.intensity}
                </div>
                <div className="text-sm text-lab-gray-600 mt-1">
                  {currentAnalysis.personalityProfile.intensity === 'light' && '가볍고 은은한'}
                  {currentAnalysis.personalityProfile.intensity === 'moderate' && '적당하고 균형잡힌'}
                  {currentAnalysis.personalityProfile.intensity === 'strong' && '강하고 진한'}
                </div>
              </div>

              <div className="text-center">
                <div className="lab-label mb-2">복잡성</div>
                <div className="text-2xl font-bold text-lab-black capitalize">
                  {currentAnalysis.personalityProfile.complexity}
                </div>
                <div className="text-sm text-lab-gray-600 mt-1">
                  {currentAnalysis.personalityProfile.complexity === 'simple' && '단순하고 직관적인'}
                  {currentAnalysis.personalityProfile.complexity === 'complex' && '복합적이고 다층적인'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 선호 노트 */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">선호하는 노트</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {currentAnalysis.preferredNotes.map((note) => (
                  <span 
                    key={note.id}
                    className="px-3 py-1 bg-green-100 text-green-800 text-sm border border-green-300"
                  >
                    {note.name}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">선호하는 브랜드</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {currentAnalysis.preferredBrands.map((brand) => (
                  <span 
                    key={brand.id}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm border border-blue-300"
                  >
                    {brand.name}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 추천 향수들 */}
        <div className="mb-12">
          <h2 className="lab-heading text-2xl mb-6 text-center">
            당신을 위한 맞춤 향수 추천
          </h2>
          
          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
            {currentAnalysis.recommendations.map((recommendation: FragranceRecommendation, index: number) => (
              <Card key={recommendation.fragrance.id} className="border-2">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {recommendation.fragrance.name}
                      </CardTitle>
                      <CardDescription>
                        {recommendation.fragrance.brand.name}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="lab-stamp text-xs">#{index + 1}</div>
                      <div className="text-sm font-bold text-lab-black">
                        {Math.round(recommendation.score * 100)}% 매치
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-lab-gray-700">
                    {recommendation.fragrance.description}
                  </p>

                  <div className="text-xs space-y-1">
                    <div>
                      <span className="font-semibold">Top:</span>{' '}
                      {recommendation.fragrance.notes.top.map(note => note.name).join(', ')}
                    </div>
                    <div>
                      <span className="font-semibold">Middle:</span>{' '}
                      {recommendation.fragrance.notes.middle.map(note => note.name).join(', ')}
                    </div>
                    <div>
                      <span className="font-semibold">Base:</span>{' '}
                      {recommendation.fragrance.notes.base.map(note => note.name).join(', ')}
                    </div>
                  </div>

                  <div>
                    <div className="lab-label text-xs mb-1">추천 이유</div>
                    <p className="text-sm text-lab-gray-600">
                      {recommendation.reasoning}
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="lab-stamp text-xs">
                      {recommendation.fragrance.concentration.toUpperCase()}
                    </span>
                    {recommendation.fragrance.price && (
                      <span className="lab-text text-xs">
                        {typeof recommendation.fragrance.price === 'string' 
                          ? recommendation.fragrance.price 
                          : `₩${recommendation.fragrance.price.amount.toLocaleString()}`
                        }
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 완료 섹션 */}
        <Card className="border-2 border-lab-black bg-lab-gray-50">
          <CardContent className="p-8 text-center">
            <h3 className="lab-heading text-xl mb-4">
              향수 추천 완료!
            </h3>
            <p className="lab-text mb-6">
              당신의 취향에 맞는 향수들을 찾아보셨나요? 
              이 추천들이 새로운 향수 발견에 도움이 되기를 바랍니다.
            </p>
            
            <div className="space-x-4">
              <Button 
                variant="primary"
                onClick={handleComplete}
              >
                분석 완료
              </Button>
              <Button 
                variant="ghost"
                onClick={handleRestart}
              >
                새로운 분석 시작
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 