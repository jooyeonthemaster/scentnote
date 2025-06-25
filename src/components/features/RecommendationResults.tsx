import React from 'react';
import { Star, ShoppingBag, Sparkles, Clock, Heart, ExternalLink } from 'lucide-react';
import { parseRecommendationResponse, getMatchingScoreColor, getMatchingScoreBgColor, type RecommendationItem, type AnalysisResult } from '@/utils/recommendation-parser';
import { trackPurchaseLinkClick, trackFragranceClick } from '@/lib/analytics';

// 향수 구매 링크 생성 함수 (구글 검색으로 변경)
function generatePurchaseLink(brand: string, name: string): string {
  const searchQuery = `${brand} ${name} 향수`.trim();
  return `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
}

// 구매 링크 클릭 핸들러
function handlePurchaseLinkClick(brand: string, name: string) {
  trackPurchaseLinkClick(brand, name, 'google_search');
}

// 향수 상세 클릭 핸들러  
function handleFragranceClick(brand: string, name: string) {
  trackFragranceClick(brand, name);
}

interface RecommendationResultsProps {
  recommendationText: string;
}

export function RecommendationResults({ recommendationText }: RecommendationResultsProps) {
  const parsedData = parseRecommendationResponse(recommendationText);

  if (!parsedData) {
    return (
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-white/10 border border-gray-600/30 rounded-lg p-6 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-mono-900 mb-4 text-center">
            🎯 맞춤 향수 추천 결과
          </h3>
          <div className="text-center text-mono-600">
            추천 결과를 분석하는 중입니다...
          </div>
        </div>
      </div>
    );
  }

  const { analysisResult, recommendations, tips } = parsedData;

  return (
    <div className="max-w-6xl mx-auto mb-8 space-y-8">
      {/* 헤더 */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3 mb-4">
          <Sparkles className="w-8 h-8 text-mono-700" />
          <h2 className="text-3xl font-bold text-mono-900">맞춤 향수 추천</h2>
          <Sparkles className="w-8 h-8 text-mono-700" />
        </div>
        <p className="text-mono-600">AI가 분석한 당신만의 향수 프로필을 기반으로 선별된 추천입니다</p>
      </div>

      {/* 분석 결과 요약 */}
      <AnalysisSummary analysisResult={analysisResult} />

      {/* 추천 향수 리스트 */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-mono-900 text-center mb-6">
          추천 향수 ({recommendations.length}개)
        </h3>
        <div className="grid gap-6">
          {recommendations.map((item, index) => (
            <RecommendationCard key={item.id} item={item} rank={index + 1} />
          ))}
        </div>
      </div>

      {/* 개인화된 팁 */}
      {tips && <PersonalizedTips tips={tips} />}
    </div>
  );
}

// 분석 결과 요약 컴포넌트
function AnalysisSummary({ analysisResult }: { analysisResult: AnalysisResult }) {
  const summaryItems = [
    { label: '경험 수준', value: analysisResult.experienceLevel, icon: '🎯' },
    { label: '선호 스타일', value: analysisResult.preferredStyle, icon: '🌟' },
    { label: '라이프스타일', value: analysisResult.lifestyle, icon: '👤' },
    { label: '가격대', value: analysisResult.priceRange, icon: '💰' }
  ].filter(item => item.value);

  if (summaryItems.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-mono-50 to-mono-100 border border-mono-200 rounded-xl p-6">
      <h3 className="text-xl font-bold text-mono-900 mb-4 text-center">
        📊 취향 분석 결과
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryItems.map((item, index) => (
          <div key={index} className="bg-white/70 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">{item.icon}</div>
            <div className="text-sm font-medium text-mono-600 mb-1">{item.label}</div>
            <div className="text-mono-900 font-semibold">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 추천 향수 카드 컴포넌트
function RecommendationCard({ item, rank }: { item: RecommendationItem; rank: number }) {
  const matchingScoreColor = getMatchingScoreColor(item.matchingScore);
  const matchingScoreBg = getMatchingScoreBgColor(item.matchingScore);

  return (
    <div className={`bg-white border-2 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 ${matchingScoreBg}`}>
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-mono-800 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
            {rank}
          </div>
          <div>
            <h4 className="text-xl font-bold text-mono-900">
              {item.brand} {item.name}
            </h4>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < item.matchingScore ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <div className={`text-sm font-medium ${matchingScoreColor}`}>
            매칭도 {item.matchingScore}/5
          </div>
        </div>
      </div>

      {/* 가격 */}
      {item.price && (
        <div className="mb-4">
          <span className="text-2xl font-bold text-mono-900">{item.price}</span>
        </div>
      )}

      {/* 추천 이유 */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="w-4 h-4 text-red-500" />
          <span className="font-semibold text-mono-800">추천 이유</span>
        </div>
        <p className="text-mono-700 leading-relaxed">{item.reason}</p>
      </div>

      {/* 향수 노트 */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span className="font-semibold text-mono-800">향수 노트</span>
        </div>
        <div className="space-y-2">
          {(item.topNotes.length > 0 || item.middleNotes.length > 0 || item.baseNotes.length > 0) ? (
            <>
              {item.topNotes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-medium text-mono-600 min-w-[60px]">탑:</span>
                  {item.topNotes.map((note, i) => (
                    <span key={i} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                      {note}
                    </span>
                  ))}
                </div>
              )}
              {item.middleNotes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-medium text-mono-600 min-w-[60px]">미들:</span>
                  {item.middleNotes.map((note, i) => (
                    <span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {note}
                    </span>
                  ))}
                </div>
              )}
              {item.baseNotes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-medium text-mono-600 min-w-[60px]">베이스:</span>
                  {item.baseNotes.map((note, i) => (
                    <span key={i} className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs">
                      {note}
                    </span>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-mono-500 text-sm italic">
              향수 노트 정보를 불러오는 중입니다...
            </div>
          )}
        </div>
      </div>

      {/* 추천 상황 */}
      {item.recommendedSituation && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="font-semibold text-mono-800">추천 상황</span>
          </div>
          <p className="text-mono-700">{item.recommendedSituation}</p>
        </div>
      )}

      {/* 구매 버튼 - 항상 표시 */}
      <div className="pt-4 border-t border-gray-200">
        <a
          href={
            item.purchaseLink && item.purchaseLink.startsWith('http') 
              ? item.purchaseLink
              : generatePurchaseLink(item.brand, item.name)
          }
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-mono-800 hover:bg-mono-900 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          onClick={() => handlePurchaseLinkClick(item.brand, item.name)}
        >
          <ShoppingBag className="w-5 h-5" />
          {item.purchaseLink && item.purchaseLink.startsWith('http') ? '구매하기' : '검색하기'}
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

// 개인화된 팁 컴포넌트
function PersonalizedTips({ tips }: { tips: string }) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
      <h3 className="text-xl font-bold text-mono-900 mb-4 text-center">
        💡 개인화된 향수 사용 팁
      </h3>
      <div className="text-mono-700 leading-relaxed whitespace-pre-line">
        {tips}
      </div>
    </div>
  );
} 