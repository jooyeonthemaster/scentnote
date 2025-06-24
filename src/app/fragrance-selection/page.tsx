'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { useFragranceStore } from '@/store/useFragranceStore';
import { fragrances } from '@/data/fragrances';
import { Fragrance } from '@/types';

export default function FragranceSelectionPage() {
  const { 
    selectedFragrances, 
    selectFragrance, 
    unselectFragrance, 
    updateJourneyStep 
  } = useFragranceStore();
  
  const [isLoading, setIsLoading] = useState(false);

  const handleFragranceToggle = (fragranceId: string) => {
    if (selectedFragrances.includes(fragranceId)) {
      unselectFragrance(fragranceId);
    } else {
      selectFragrance(fragranceId);
    }
  };

  const handleNext = async () => {
    if (selectedFragrances.length < 2) {
      alert('최소 2개 이상의 향수를 선택해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      updateJourneyStep('feedback');
      window.location.href = '/feedback';
    } catch (error) {
      console.error('다음 단계로 이동 중 오류:', error);
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    window.location.href = '/';
  };

  return (
    <div className="lab-page">
      <div className="lab-container py-12">
        {/* 헤더 */}
        <div className="text-center mb-12 lab-paper-holes pl-12">
          <div className="lab-stamp inline-block mb-4">
            STEP 01 - FRAGRANCE SELECTION
          </div>
          
          <h1 className="lab-heading text-3xl md:text-4xl mb-4">
            향수 선택하기
          </h1>
          
          <p className="lab-text max-w-2xl mx-auto text-lg">
            아래 향수들 중에서 <strong>사용해본 경험이 있는</strong> 향수들을 선택해주세요. 
            최소 2개 이상 선택해야 다음 단계로 진행할 수 있습니다.
          </p>
          
          <div className="mt-6">
            <span className="lab-label">
              선택된 향수: {selectedFragrances.length}개
            </span>
          </div>
        </div>

        {/* 향수 그리드 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {fragrances.map((fragrance: Fragrance) => {
            const isSelected = selectedFragrances.includes(fragrance.id);
            
            return (
              <Card 
                key={fragrance.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isSelected 
                    ? 'border-lab-black bg-lab-gray-100' 
                    : 'hover:border-lab-gray-400'
                }`}
                onClick={() => handleFragranceToggle(fragrance.id)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">
                        {fragrance.name}
                      </CardTitle>
                      <CardDescription className="text-sm text-lab-gray-500">
                        {fragrance.brand.name}
                      </CardDescription>
                    </div>
                    <div className={`
                      w-6 h-6 border-2 rounded-none flex items-center justify-center
                      ${isSelected 
                        ? 'bg-lab-black border-lab-black' 
                        : 'border-lab-gray-300'
                      }
                    `}>
                      {isSelected && (
                        <span className="text-lab-white text-xs">✓</span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <CardDescription className="mb-4">
                    {fragrance.description}
                  </CardDescription>
                  
                  <div className="space-y-2">
                    <div className="lab-label">노트</div>
                    
                    <div className="text-xs space-y-1">
                      <div>
                        <span className="font-semibold">Top:</span>{' '}
                        {fragrance.notes.top.map(note => note.name).join(', ')}
                      </div>
                      <div>
                        <span className="font-semibold">Middle:</span>{' '}
                        {fragrance.notes.middle.map(note => note.name).join(', ')}
                      </div>
                      <div>
                        <span className="font-semibold">Base:</span>{' '}
                        {fragrance.notes.base.map(note => note.name).join(', ')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <span className="lab-stamp text-xs">
                      {fragrance.concentration.toUpperCase()}
                    </span>
                    {fragrance.price && (
                      <span className="lab-text text-xs">
                        {typeof fragrance.price === 'string' 
                          ? fragrance.price 
                          : `₩${fragrance.price.amount.toLocaleString()}`
                        }
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 네비게이션 */}
        <div className="flex justify-between items-center">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            disabled={isLoading}
          >
            ← 처음으로
          </Button>
          
          <div className="text-center">
            <p className="lab-text text-sm mb-2">
              {selectedFragrances.length < 2 
                ? `${2 - selectedFragrances.length}개 더 선택해주세요` 
                : '다음 단계로 진행할 수 있습니다'
              }
            </p>
          </div>
          
          <Button 
            variant="primary"
            onClick={handleNext}
            disabled={selectedFragrances.length < 2 || isLoading}
          >
            {isLoading ? '진행 중...' : '다음 단계 →'}
          </Button>
        </div>
      </div>
    </div>
  );
} 