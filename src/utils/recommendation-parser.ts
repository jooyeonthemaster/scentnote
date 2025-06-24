export interface RecommendationItem {
  id: string;
  brand: string;
  name: string;
  price: string;
  matchingScore: number;
  reason: string;
  topNotes: string[];
  middleNotes: string[];
  baseNotes: string[];
  recommendedSituation: string;
  purchaseLink: string;
}

export interface AnalysisResult {
  experienceLevel: string;
  preferredStyle: string;
  lifestyle: string;
  priceRange: string;
}

export interface ParsedRecommendation {
  analysisResult: AnalysisResult;
  recommendations: RecommendationItem[];
  tips: string;
}

// 추천 이유 텍스트에서 불필요한 내용 제거
function cleanReasonText(text: string): string {
  if (!text) return '';
  
  // "주요노트:", "구매링크:", "추천상황:" 이후의 모든 내용 제거
  let cleanedText = text.split(/주요노트:|구매링크:|추천상황:/)[0];
  
  // URL 패턴 제거
  cleanedText = cleanedText.replace(/https?:\/\/[^\s]+/g, '');
  
  // 향수 노트 패턴 제거 (탑:, 미들:, 베이스: 형태)
  cleanedText = cleanedText.replace(/탑:\s*[^/]*\/?\s*미들:\s*[^/]*\/?\s*베이스:\s*[^/]*/g, '');
  
  // 줄바꿈을 공백으로 변환하고 연속된 공백 정리
  return cleanedText.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
}

// 추천 상황 텍스트에서 불필요한 내용 제거
function cleanSituationText(text: string): string {
  if (!text) return '';
  
  // "구매링크:" 이후의 모든 내용 제거
  let cleanedText = text.split(/구매링크:/)[0];
  
  // URL 패턴 제거
  cleanedText = cleanedText.replace(/https?:\/\/[^\s]+/g, '');
  
  // 줄바꿈을 공백으로 변환하고 연속된 공백 정리
  return cleanedText.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
}

export function parseRecommendationResponse(response: string): ParsedRecommendation | null {
  try {
    // 정제된 결과 우선 파싱 시도
    const refinedAnalysisMatch = response.match(/REFINED_ANALYSIS_START([\s\S]*?)REFINED_ANALYSIS_END/);
    const refinedRecommendationMatch = response.match(/REFINED_RECOMMENDATION_START([\s\S]*?)REFINED_RECOMMENDATION_END/);
    const refinedTipsMatch = response.match(/REFINED_TIPS_START([\s\S]*?)REFINED_TIPS_END/);
    
    // 기존 형식 파싱
    const analysisMatch = response.match(/ANALYSIS_START([\s\S]*?)ANALYSIS_END/);
    const recommendationMatch = response.match(/RECOMMENDATION_START([\s\S]*?)RECOMMENDATION_END/);
    const tipsMatch = response.match(/TIPS_START([\s\S]*?)TIPS_END/);
    
    let analysisResult: AnalysisResult = {
      experienceLevel: '',
      preferredStyle: '',
      lifestyle: '',
      priceRange: ''
    };

    // 정제된 분석 결과 우선 사용
    const finalAnalysisMatch = refinedAnalysisMatch || analysisMatch;
    if (finalAnalysisMatch) {
      const analysisText = finalAnalysisMatch[1];
      const experienceMatch = analysisText.match(/향수 경험 수준:\s*([^\n]+)/);
      const styleMatch = analysisText.match(/선호 향 스타일:\s*([^\n]+)/);
      const lifestyleMatch = analysisText.match(/라이프스타일:\s*([^\n]+)/);
      const priceMatch = analysisText.match(/가격대 선호:\s*([^\n]+)/);

      if (experienceMatch) analysisResult.experienceLevel = experienceMatch[1].trim();
      if (styleMatch) analysisResult.preferredStyle = styleMatch[1].trim();
      if (lifestyleMatch) analysisResult.lifestyle = lifestyleMatch[1].trim();
      if (priceMatch) analysisResult.priceRange = priceMatch[1].trim();
    }

    // 정제된 추천 결과 우선 사용
    const finalRecommendationMatch = refinedRecommendationMatch || recommendationMatch;
    const recommendations: RecommendationItem[] = [];

    if (finalRecommendationMatch) {
      const recommendationText = finalRecommendationMatch[1];
      
      // 각 추천 항목 파싱 (1., 2., 3. 으로 구분)
      const items = recommendationText.split(/\n(?=\d+\.\s)/);
      
      items.forEach((item, index) => {
        if (!item.trim()) return;
        
        // 기본 정보 파싱
        const titleMatch = item.match(/\d+\.\s*([^-]+)\s*-\s*([^\n]+)/);
        const matchingMatch = item.match(/매칭도:\s*(\d+)/);
        
        // 더 엄격한 섹션 파싱 (다른 섹션 키워드가 나타나면 중단)
        const reasonMatch = item.match(/추천이유:\s*([^]+?)(?=\s*주요노트:|$)/);
        const notesMatch = item.match(/주요노트:\s*([^]+?)(?=\s*추천상황:|$)/);
        const situationMatch = item.match(/추천상황:\s*([^]+?)(?=\s*구매링크:|$)/);
        const linkMatch = item.match(/구매링크:\s*([^\n]+)/);

        if (titleMatch) {
          const [, titlePart, pricePart] = titleMatch;
          
          // 개발 환경에서 디버깅 로그
          if (process.env.NODE_ENV === 'development') {
            console.log('🔍 파싱 중:', {
              title: titlePart,
              reasonRaw: reasonMatch?.[1]?.substring(0, 100) + '...',
              situationRaw: situationMatch?.[1]?.substring(0, 100) + '...'
            });
          }
          
          // 브랜드명과 제품명을 자연스럽게 분리 (하드코딩 목록 없이)
          let brandName = '';
          let productName = '';
          
          const words = titlePart.trim().split(' ');
          
          // 일반적인 패턴으로 브랜드명 추출
          if (words.length >= 3) {
            // 3단어 이상인 경우, 첫 1-2단어를 브랜드로 판단
            // "Tom Ford", "Jo Malone", "Maison Margiela" 등의 경우를 고려
            if (words[0].length <= 3 || words[1].length <= 3) {
              // 짧은 단어가 포함된 경우 2단어까지 브랜드로 인식
              brandName = `${words[0]} ${words[1]}`.trim();
              productName = words.slice(2).join(' ').trim();
            } else {
              // 일반적인 경우 첫 단어만 브랜드로 인식
              brandName = words[0].trim();
              productName = words.slice(1).join(' ').trim();
            }
          } else if (words.length === 2) {
            // 2단어인 경우 첫 단어를 브랜드로 인식
            brandName = words[0].trim();
            productName = words[1].trim();
          } else {
            // 1단어인 경우 전체를 브랜드로 인식
            brandName = titlePart.trim();
            productName = '';
          }

          // 노트 파싱 (정제된 형식 우선 지원)
          let topNotes: string[] = [];
          let middleNotes: string[] = [];
          let baseNotes: string[] = [];

          if (notesMatch) {
            const notesText = notesMatch[1];
            
            // 정제된 형식: "탑: 노트1, 노트2 / 미들: 노트3, 노트4 / 베이스: 노트5, 노트6"
            const refinedTopMatch = notesText.match(/탑:\s*([^\/]+)(?:\s*\/|$)/i);
            const refinedMiddleMatch = notesText.match(/미들:\s*([^\/]+)(?:\s*\/|$)/i);
            const refinedBaseMatch = notesText.match(/베이스:\s*([^\/]+)(?:\s*\/|$)/i);

            if (refinedTopMatch) {
              topNotes = refinedTopMatch[1].split(/[,、]/).map(n => n.trim()).filter(n => n.length > 0);
            }
            if (refinedMiddleMatch) {
              middleNotes = refinedMiddleMatch[1].split(/[,、]/).map(n => n.trim()).filter(n => n.length > 0);
            }
            if (refinedBaseMatch) {
              baseNotes = refinedBaseMatch[1].split(/[,、]/).map(n => n.trim()).filter(n => n.length > 0);
            }
            
            // 기존 형식도 지원 (백업)
            if (topNotes.length === 0 || middleNotes.length === 0 || baseNotes.length === 0) {
              const topMatch = notesText.match(/탑[:\s]*([^\/미들베이스]+)/i);
              const middleMatch = notesText.match(/미들[:\s]*([^\/탑베이스]+)/i);
              const baseMatch = notesText.match(/베이스[:\s]*([^\/탑미들]+)/i);

              if (topMatch && topNotes.length === 0) {
                topNotes = topMatch[1].split(/[,、]/).map(n => n.trim()).filter(n => n.length > 0);
              }
              if (middleMatch && middleNotes.length === 0) {
                middleNotes = middleMatch[1].split(/[,、]/).map(n => n.trim()).filter(n => n.length > 0);
              }
              if (baseMatch && baseNotes.length === 0) {
                baseNotes = baseMatch[1].split(/[,、]/).map(n => n.trim()).filter(n => n.length > 0);
              }
            }
          }

          // 구매 링크 처리
          let purchaseLink = '';
          if (linkMatch) {
            const linkText = linkMatch[1].trim();
            // 마크다운 링크 형태 파싱
            const markdownLinkMatch = linkText.match(/\[([^\]]+)\]\(([^)]+)\)/);
            if (markdownLinkMatch) {
              purchaseLink = markdownLinkMatch[2];
            } else if (linkText.startsWith('http')) {
              // 직접적인 URL인 경우
              purchaseLink = linkText;
            } else {
              // PURCHASE_LINK_ 형태인 경우 실제 링크로 변환하지 않고 그대로 저장
              purchaseLink = linkText;
            }
          }

          recommendations.push({
            id: `rec-${index + 1}`,
            brand: brandName,
            name: productName,
            price: pricePart?.trim() || '',
            matchingScore: matchingMatch ? parseInt(matchingMatch[1]) : 0,
            reason: cleanReasonText(reasonMatch ? reasonMatch[1].trim() : ''),
            topNotes,
            middleNotes,
            baseNotes,
            recommendedSituation: cleanSituationText(situationMatch ? situationMatch[1].trim() : ''),
            purchaseLink
          });
        }
      });
    }

    // 정제된 팁 우선 사용
    const finalTipsMatch = refinedTipsMatch || tipsMatch;
    const tips = finalTipsMatch ? finalTipsMatch[1].trim() : '';

    return {
      analysisResult,
      recommendations,
      tips
    };

  } catch (error) {
    console.error('추천 결과 파싱 오류:', error);
    return null;
  }
}

// 매칭도에 따른 색상 반환
export function getMatchingScoreColor(score: number): string {
  if (score >= 5) return 'text-green-600';
  if (score >= 4) return 'text-blue-600';
  if (score >= 3) return 'text-yellow-600';
  return 'text-gray-600';
}

// 매칭도에 따른 배경색 반환
export function getMatchingScoreBgColor(score: number): string {
  if (score >= 5) return 'bg-green-50 border-green-200';
  if (score >= 4) return 'bg-blue-50 border-blue-200';
  if (score >= 3) return 'bg-yellow-50 border-yellow-200';
  return 'bg-gray-50 border-gray-200';
} 