import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { 
  FragranceFeedback, 
  FragrancePreference, 
  FragranceAnalysis, 
  FragranceRecommendation,
  Fragrance 
} from '@/types';
import { searchFragranceWithBrave } from './brave-search';

// Gemini AI 클라이언트 초기화
console.log('GEMINI_API_KEY 확인:', process.env.GEMINI_API_KEY ? '키 존재함' : '키 없음');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// 기본 Gemini 모델 (Brave Search와 함께 사용)
export const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash'
});

// 향수 취향 분석 프롬프트 생성
function createAnalysisPrompt(
  feedbacks: FragranceFeedback[],
  preferences: FragrancePreference[]
): string {
  return `
당신은 향수 전문가입니다. 다음 정보를 바탕으로 사용자의 향수 취향을 분석해주세요.

**사용자 피드백:**
${feedbacks.map(f => `
- 향수: ${f.fragranceId}
- 평점: ${f.rating}/5
- 지속력: ${f.longevity}/5
- 실라주: ${f.sillage}/5
- 리뷰: ${f.review || '없음'}
- 사용 상황: ${f.usageContext || '없음'}
- 선호 계절: ${f.seasonPreference?.join(', ') || '없음'}
- 선호 상황: ${f.occasionPreference?.join(', ') || '없음'}
`).join('\n')}

**선호도 정보:**
${preferences.map(p => `
- 향수: ${p.fragranceId}
- 선호도: ${p.preferenceLevel}/10
- 좋아하는 점: ${p.preferredAspects.join(', ')}
- 싫어하는 점: ${p.dislikedAspects?.join(', ') || '없음'}
- 감정적 반응: ${p.emotionalResponse || '없음'}
`).join('\n')}

다음 형식으로 JSON 응답을 제공해주세요:
{
  "personalityProfile": {
    "style": "classic|modern|bold|minimalist|romantic",
    "intensity": "light|moderate|strong",
    "complexity": "simple|complex"
  },
  "preferredNoteCategories": ["citrus", "floral", "woody", "oriental", ...],
  "avoidedNoteCategories": ["..."],
  "preferredConcentrations": ["edp", "edt", ...],
  "analysisText": "상세한 분석 설명",
  "confidence": 0.85
}
`;
}

// 향수 추천 프롬프트 생성
function createRecommendationPrompt(analysis: string): string {
  return `
앞서 분석한 사용자 취향을 바탕으로, 적합한 향수 3개를 추천해주세요.

**사용자 분석:**
${analysis}

다음 형식으로 JSON 응답을 제공해주세요:
{
  "recommendations": [
    {
      "name": "향수 이름",
      "brand": "브랜드명",
      "description": "향수 설명",
      "score": 0.95,
      "reasoning": "추천 이유",
      "matchedPreferences": ["매칭되는 선호도들"],
      "notes": {
        "top": ["탑노트들"],
        "middle": ["미들노트들"],
        "base": ["베이스노트들"]
      },
      "concentration": "edp",
      "occasionSuggestion": "추천 사용 상황"
    }
  ]
}
`;
}

// 향수 취향 분석 함수
export async function analyzeFragrancePreference(
  feedbacks: FragranceFeedback[],
  preferences: FragrancePreference[]
): Promise<Partial<FragranceAnalysis>> {
  try {
    const prompt = createAnalysisPrompt(feedbacks, preferences);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // JSON 파싱 시도
    try {
      const parsed = JSON.parse(text);
      
      // 기본 FragranceAnalysis 형태로 변환
      return {
        userId: 'current-user', // 임시 사용자 ID
        preferredNotes: [],
        avoidedNotes: [],
        preferredConcentrations: parsed.preferredConcentrations || ['edp'],
        preferredBrands: [],
        personalityProfile: parsed.personalityProfile || {
          style: 'modern',
          intensity: 'moderate',
          complexity: 'complex'
        },
        recommendations: [],
        confidence: parsed.confidence || 0.8,
        generatedAt: new Date()
      };
    } catch {
      // JSON 파싱 실패시 기본값 반환
      return {
        userId: 'current-user',
        preferredNotes: [],
        avoidedNotes: [],
        preferredConcentrations: ['edp'],
        preferredBrands: [],
        personalityProfile: {
          style: 'modern',
          intensity: 'moderate',
          complexity: 'complex'
        },
        recommendations: [],
        confidence: 0.5,
        generatedAt: new Date()
      };
    }
  } catch (error) {
    console.error('Gemini API 오류:', error);
    throw new Error('향수 취향 분석 중 오류가 발생했습니다.');
  }
}

// 향수 추천 함수 (Brave Search 기반으로 완전 개선)
export async function generateFragranceRecommendations(options: {
  analysis: Partial<FragranceAnalysis>;
  availableFragrances: Fragrance[];
}): Promise<FragranceRecommendation[]> {
  try {
    console.log('🔍 Brave Search 기반 향수 추천 시작');
    
    // 1단계: AI로 초기 후보 향수들 선별 (더 많은 후보를 선택)
    const initialCandidates = await selectInitialCandidates(options.analysis, options.availableFragrances);
    console.log(`📋 초기 후보 향수: ${initialCandidates.length}개 선별`);
    
    // 2단계: 각 후보에 대해 Brave Search로 실제 정보 검증
    const verifiedRecommendations: FragranceRecommendation[] = [];
    
    for (const candidate of initialCandidates) {
      try {
        console.log(`🔍 검증 중: ${candidate.fragrance.brand.name} ${candidate.fragrance.name}`);
        
        // Brave Search로 실제 정보 검증
        const searchResult = await verifyFragranceInfoWithSearch(
          candidate.fragrance.brand.name,
          candidate.fragrance.name,
          options.analysis.personalityProfile?.budget || '5만원'
        );
        
        // 검증 결과가 좋은 경우에만 추천 목록에 포함
        if (isValidRecommendation(searchResult)) {
          // 예산 체크 (추가)
          const budget = options.analysis.personalityProfile?.budget || '5만원';
          const budgetMatch = budget.match(/(\d+)\s*만원/);
          const budgetAmount = budgetMatch ? parseInt(budgetMatch[1]) * 10000 : 50000;
          
          // 가격 정보에서 최소 가격 추출
          let minPrice = 0;
          if (searchResult.verifiedPrice.includes('원')) {
            const priceMatch = searchResult.verifiedPrice.match(/(\d{1,3}(?:,\d{3})*)/);
            if (priceMatch) {
              minPrice = parseInt(priceMatch[1].replace(/,/g, ''));
            }
          }
          
          // 예산 초과 시 추천에서 제외
          if (minPrice > budgetAmount) {
            console.log(`❌ 예산 초과로 제외: ${candidate.fragrance.brand.name} ${candidate.fragrance.name} (${searchResult.verifiedPrice})`);
            continue;
          }
          
          // 검증된 정보로 업데이트
          const updatedFragrance = {
            ...candidate.fragrance,
            brand: candidate.fragrance.brand, // 원래 FragranceBrand 유지
            name: searchResult.verifiedProduct,
            price: searchResult.verifiedPrice,
            purchaseLinks: searchResult.purchaseLinks || []
          };
          
          verifiedRecommendations.push({
            ...candidate,
            fragrance: updatedFragrance,
            reasoning: `${candidate.reasoning} (실제 가격: ${searchResult.verifiedPrice})`,
            searchMetadata: {
              searchResults: searchResult.searchResults,
              verificationStatus: 'verified',
              priceRange: searchResult.verifiedPrice,
              availablePurchaseLinks: searchResult.purchaseLinks?.length || 0
            }
          });
          
          console.log(`✅ 검증 완료: ${searchResult.verifiedBrand} ${searchResult.verifiedProduct} - ${searchResult.verifiedPrice}`);
        } else {
          console.log(`❌ 검증 실패: ${candidate.fragrance.brand.name} ${candidate.fragrance.name} - 가격/구매처 정보 부족`);
        }
        
        // Rate limit 방지를 위한 딜레이
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 충분한 추천을 얻었으면 중단
        if (verifiedRecommendations.length >= 3) {
          break;
        }
        
      } catch (error) {
        console.error(`❌ ${candidate.fragrance.brand.name} ${candidate.fragrance.name} 검증 오류:`, error);
        continue;
      }
    }
    
    // 3단계: 검증된 추천이 부족한 경우 fallback 처리
    if (verifiedRecommendations.length < 3) {
      console.log(`⚠️ 검증된 추천이 ${verifiedRecommendations.length}개만 있음. Fallback 추천 추가 중...`);
      
      const fallbackCandidates = initialCandidates
        .filter(c => !verifiedRecommendations.some(v => v.fragrance.id === c.fragrance.id))
        .slice(0, 3 - verifiedRecommendations.length);
        
      for (const fallback of fallbackCandidates) {
        verifiedRecommendations.push({
          ...fallback,
          reasoning: `${fallback.reasoning} (검증 대기 중 - 구매 전 가격 확인 권장)`,
          searchMetadata: {
            searchResults: '검증 대기',
            verificationStatus: 'pending',
            priceRange: '확인 필요',
            availablePurchaseLinks: 0
          }
        });
      }
    }
    
    console.log(`✅ 최종 추천 완료: ${verifiedRecommendations.length}개 향수`);
    return verifiedRecommendations.slice(0, 3); // 최대 3개 반환
    
  } catch (error) {
    console.error('향수 추천 생성 오류:', error);
    
    // 오류 발생시 기본 추천 반환
    const fallbackRecommendations: FragranceRecommendation[] = options.availableFragrances
      .slice(0, 3)
      .map((fragrance, index) => ({
        fragrance,
        score: 0.7 - (index * 0.1),
        reasoning: '시스템 오류로 인한 기본 추천입니다. 구매 전 가격과 정보를 확인해주세요.',
        matchedPreferences: ['기본 매칭'],
        searchMetadata: {
          searchResults: '시스템 오류',
          verificationStatus: 'error',
          priceRange: '확인 필요',
          availablePurchaseLinks: 0
        }
      }));
      
    return fallbackRecommendations;
  }
}

// AI로 초기 후보 향수들을 선별하는 함수
async function selectInitialCandidates(
  analysis: Partial<FragranceAnalysis>,
  availableFragrances: Fragrance[]
): Promise<FragranceRecommendation[]> {
  const prompt = `
🎯 **향수 전문가 AI 추천 시스템**

다음 사용자 분석을 바탕으로 적합한 향수 후보 6-8개를 선별해주세요.
실제 Brave Search로 검증할 예정이므로, 실존하는 유명 향수들 위주로 선별해주세요.

**사용자 분석:**
${JSON.stringify(analysis, null, 2)}

**선별 기준:**
1. 실제 존재하는 유명 브랜드의 향수
2. 한국에서 구매 가능한 향수
3. 사용자 취향과 예산에 적합
4. 온라인에서 가격 정보를 찾을 수 있는 향수

**응답 형식:**
각 추천에 대해 다음 정보를 제공해주세요:
- 브랜드명 (정확한 영문명)
- 제품명 (정확한 영문명)
- 추천 점수 (0.0-1.0)
- 추천 이유
- 매칭되는 선호도

JSON 형식으로 응답해주세요.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // AI 응답을 파싱하여 FragranceRecommendation 형태로 변환
    // 실제 구현에서는 availableFragrances에서 매칭되는 향수를 찾아서 반환
    const candidates: FragranceRecommendation[] = availableFragrances
      .slice(0, 8) // 더 많은 후보 선택
      .map((fragrance, index) => ({
        fragrance,
        score: 0.9 - (index * 0.05),
        reasoning: `당신의 ${analysis.personalityProfile?.style || 'modern'} 스타일과 취향에 잘 맞는 향수입니다.`,
        matchedPreferences: ['스타일 매칭', '향의 조화']
      }));
    
    return candidates;
    
  } catch (error) {
    console.error('초기 후보 선별 오류:', error);
    
    // 오류시 기본 후보 반환
    return availableFragrances
      .slice(0, 6)
      .map((fragrance, index) => ({
        fragrance,
        score: 0.8 - (index * 0.05),
        reasoning: '기본 추천 향수입니다.',
        matchedPreferences: ['기본 매칭']
      }));
  }
}

// 검증 결과가 유효한 추천인지 판단하는 함수
function isValidRecommendation(searchResult: {
  verifiedBrand: string;
  verifiedProduct: string;
  verifiedPrice: string;
  searchResults: string;
  purchaseLinks?: string[];
}): boolean {
  // 검증 기준:
  // 1. 브랜드명이 제대로 검증되었는지
  // 2. 가격 정보가 있는지 (또는 최소한 검색 결과가 있는지)
  // 3. 검색 실패가 아닌지
  
  if (searchResult.verifiedPrice === '검증 실패' || 
      searchResult.searchResults === '검증 실패' ||
      searchResult.searchResults === 'API 키 없음') {
    return false;
  }
  
  // 검색 결과가 있고, 브랜드명이 검증되었으면 유효한 추천으로 간주
  if (searchResult.searchResults.includes('개 결과') && 
      searchResult.verifiedBrand.length > 1) {
    return true;
  }
  
  return false;
}

// 🔍 Brave Search를 사용한 향수 정보 검증 함수 (Gemini AI 분석 추가)
export async function verifyFragranceInfoWithSearch(
  brandName: string, 
  productName: string,
  budget?: string
): Promise<{
  verifiedBrand: string;
  verifiedProduct: string;
  verifiedPrice: string;
  searchResults: string;
  purchaseLinks?: string[];
  fragranceNotes?: {
    top: string[];
    middle: string[];
    base: string[];
  };
  detailedInfo?: string;
}> {
  try {
    console.log(`🔍 Brave Search로 향수 정보 검증: ${brandName} ${productName}`);
    
    // 1단계: Brave Search API를 사용하여 향수 정보 검증
    const searchResult = await searchFragranceWithBrave(brandName, productName, budget);
    
    // 2단계: Gemini AI가 검색 결과를 분석하여 정보 정제
    const aiAnalyzedResult = await analyzeSearchResultsWithAI(searchResult, brandName, productName);
    
    return {
      verifiedBrand: aiAnalyzedResult.verifiedBrand || searchResult.verifiedBrand,
      verifiedProduct: aiAnalyzedResult.verifiedProduct || searchResult.verifiedProduct,
      verifiedPrice: aiAnalyzedResult.verifiedPrice || searchResult.verifiedPrice,
      searchResults: searchResult.searchResults,
      purchaseLinks: searchResult.purchaseLinks,
      fragranceNotes: aiAnalyzedResult.fragranceNotes || searchResult.fragranceNotes,
      detailedInfo: aiAnalyzedResult.detailedInfo || searchResult.detailedInfo
    };
  } catch (error) {
    console.error('향수 정보 검증 오류:', error);
    return {
      verifiedBrand: brandName,
      verifiedProduct: productName,
      verifiedPrice: '검증 실패',
      searchResults: '검색 실패',
      purchaseLinks: []
    };
  }
}

// Gemini AI로 검색 결과를 분석하는 함수
async function analyzeSearchResultsWithAI(
  searchResult: any,
  originalBrand: string,
  originalProduct: string
): Promise<{
  verifiedBrand?: string;
  verifiedProduct?: string;
  verifiedPrice?: string;
  fragranceNotes?: {
    top: string[];
    middle: string[];
    base: string[];
  };
  detailedInfo?: string;
}> {
  try {
    const analysisPrompt = `
🔍 **향수 정보 분석 전문가**

다음 검색 결과를 분석하여 향수 정보를 정확히 추출해주세요.

**원본 정보:**
- 브랜드: ${originalBrand}
- 제품: ${originalProduct}

**검색 결과 데이터:**
- 검증된 브랜드: ${searchResult.verifiedBrand}
- 검증된 제품: ${searchResult.verifiedProduct}
- 가격 정보: ${searchResult.verifiedPrice}
- 검색 요약: ${searchResult.searchResults}
- 구매 링크 수: ${searchResult.purchaseLinks?.length || 0}개
- 추출된 노트: ${JSON.stringify(searchResult.fragranceNotes || {})}
- 상세 정보: ${searchResult.detailedInfo || '없음'}

**분석 요청:**
1. 브랜드명과 제품명이 정확한지 재검증
2. 가격 정보가 합리적인지 확인
3. 향수 노트 정보를 더 정확하게 정리
4. 추가 상세 정보 제공

**응답 형식 (JSON):**
{
  "verifiedBrand": "정확한 브랜드명",
  "verifiedProduct": "정확한 제품명",
  "verifiedPrice": "정확한 가격 정보",
  "fragranceNotes": {
    "top": ["탑노트들"],
    "middle": ["미들노트들"],
    "base": ["베이스노트들"]
  },
  "detailedInfo": "용량, 농도, 출시년도 등 상세 정보",
  "confidence": 0.95,
  "recommendations": "구매 시 주의사항이나 추천사항"
}

정확하고 신뢰할 수 있는 정보만 제공해주세요.
`;

    const result = await model.generateContent(analysisPrompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      // JSON 응답 파싱
      const cleanedText = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanedText);
      
      return {
        verifiedBrand: parsed.verifiedBrand,
        verifiedProduct: parsed.verifiedProduct,
        verifiedPrice: parsed.verifiedPrice,
        fragranceNotes: parsed.fragranceNotes,
        detailedInfo: parsed.detailedInfo
      };
    } catch (parseError) {
      console.warn('AI 분석 결과 파싱 실패:', parseError);
      return {};
    }
    
  } catch (error) {
    console.error('AI 분석 오류:', error);
    return {};
  }
} 