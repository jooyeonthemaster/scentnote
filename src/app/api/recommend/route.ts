import { NextRequest, NextResponse } from 'next/server';
import { model } from '@/lib/gemini';
import { 
  getAllFragrances, 
  filterFragrances, 
  formatFragrancesForAI,
  parsePriceRange,
  PRICE_RANGES,
  type FragranceDBData,
  type PriceFilter 
} from '@/lib/firebase-fragrance';

export async function POST(request: NextRequest) {
  try {
    const { userProfile } = await request.json();
    
    if (!userProfile) {
      return NextResponse.json(
        { error: '사용자 프로필이 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('🎯 DB 기반 향수 추천 시스템 시작');
    console.log('👤 사용자 프로필:', userProfile);

    // 1단계: Firebase에서 모든 향수 데이터 로딩
    console.log('📋 1단계: Firebase 향수 데이터 로딩 중...');
    const allFragrances = await getAllFragrances();
    
    if (allFragrances.length === 0) {
      return NextResponse.json({
        error: '향수 데이터를 찾을 수 없습니다.',
        recommendations: []
      }, { status: 404 });
    }

    console.log(`✅ ${allFragrances.length}개 향수 데이터 로딩 완료`);

    // 2단계: 가격대 필터링 (우선순위)
    console.log('💰 2단계: 가격대 필터링 중...');
    let filteredFragrances = allFragrances;

    // 사용자 예산 파싱
    const budget = userProfile.budget || userProfile.priceRange || '5만원';
    const priceRange = parsePriceRange(budget);
    
    if (priceRange) {
      filteredFragrances = filterFragrances(allFragrances, { 
        priceRange,
        limit: 200 // 최대 200개로 제한 
      });
      console.log(`💰 가격대 ${priceRange.label}: ${filteredFragrances.length}개 향수 선별`);
    } else {
      // 기본 가격대 설정 (5만원 이하)
      const defaultPriceRange = PRICE_RANGES.find(range => range.max === 50000);
      if (defaultPriceRange) {
        filteredFragrances = filterFragrances(allFragrances, { 
          priceRange: defaultPriceRange,
          limit: 200 
        });
        console.log(`💰 기본 가격대 적용: ${filteredFragrances.length}개 향수`);
      }
    }

    // 3단계: 추가 필터링 (브랜드, 키워드 등)
    if (userProfile.preferredBrands && userProfile.preferredBrands.length > 0) {
      filteredFragrances = filterFragrances(filteredFragrances, {
        brands: userProfile.preferredBrands,
        limit: 150
      });
      console.log(`🏷️ 브랜드 필터링 후: ${filteredFragrances.length}개 향수`);
    }

    // 키워드 검색 (선호 노트나 스타일)
    if (userProfile.preferredNotes || userProfile.style) {
      const keyword = `${userProfile.preferredNotes || ''} ${userProfile.style || ''}`.trim();
      if (keyword) {
        const keywordFiltered = filterFragrances(filteredFragrances, {
          keyword,
          limit: 100
        });
        if (keywordFiltered.length > 0) {
          filteredFragrances = keywordFiltered;
          console.log(`🔍 키워드 "${keyword}" 필터링 후: ${filteredFragrances.length}개 향수`);
        }
      }
    }

    // 최종 후보가 너무 적으면 조건 완화
    if (filteredFragrances.length < 10) {
      console.log('⚠️ 후보가 너무 적어서 조건 완화');
      filteredFragrances = filterFragrances(allFragrances, { 
        priceRange,
        limit: 100 
      });
    }

    console.log(`🎯 최종 후보: ${filteredFragrances.length}개 향수`);

    // 4단계: Gemini AI로 최종 추천
    console.log('🤖 3단계: Gemini AI 최종 추천 중...');
    
    const recommendationPrompt = `
🎯 **데이터베이스 기반 맞춤 향수 추천**

다음은 사용자 조건에 맞는 실제 구매 가능한 향수들입니다.
**이 목록에서만** 사용자에게 가장 적합한 3개를 선별하여 추천해주세요.

**선별된 향수 목록 (${filteredFragrances.length}개):**
${formatFragrancesForAI(filteredFragrances)}

**사용자 프로필:**
- 예산: ${budget}
- 선호 노트: ${userProfile.preferredNotes || '없음'}
- 라이프스타일: ${userProfile.lifestyle || '일반'}
- 사용 상황: ${userProfile.occasions || '데일리'}
- 향수 경험: ${userProfile.experience || '초급'}
- 성별: ${userProfile.gender || '무관'}
- 나이대: ${userProfile.ageGroup || '무관'}

**추천 규칙:**
1. **위 목록에 있는 향수만 추천** (절대 다른 향수 추천 금지)
2. **실제 가격 정보 그대로 사용** (가격 조작 절대 금지)
3. **예산 내 향수만 선택**
4. **사용자 프로필과 가장 잘 맞는 3개 선별**
5. **각 향수의 특징과 추천 이유를 구체적으로 설명**

**출력 형식:**
ANALYSIS_START
[사용자 취향 분석 및 선별 기준 설명]
ANALYSIS_END

RECOMMENDATION_START
1. [브랜드명] [제품명] - [실제 가격]원 ([용량])
매칭도: X/5점
추천이유: [사용자 프로필과의 매칭 포인트]
예상특징: [향의 특징과 느낌]
사용상황: [언제, 어떤 상황에서 사용하면 좋을지]
구매정보: [실제 구매 링크나 정보]

2. [두 번째 향수...]
3. [세 번째 향수...]
RECOMMENDATION_END

TIPS_START
[선택한 향수들의 실용적인 사용 팁과 조합 방법]
TIPS_END

**⚠️ 중요: 위 데이터베이스 목록에 없는 향수는 절대 추천하지 마세요!**
`;

    const result = await model.generateContent(recommendationPrompt);
    const response = await result.response;
    const recommendationText = response.text();

    console.log('✅ DB 기반 맞춤 추천 완료');

    return NextResponse.json({
      recommendations: recommendationText,
      totalFragrancesInDB: allFragrances.length,
      filteredCandidates: filteredFragrances.length,
      appliedFilters: {
        priceRange: priceRange?.label || '기본 범위',
        brands: userProfile.preferredBrands || [],
        keyword: userProfile.preferredNotes || userProfile.style || ''
      },
      dataSource: 'Firebase DB + Gemini AI',
      method: 'Database-First Recommendation'
    });

  } catch (error) {
    console.error('DB 기반 향수 추천 오류:', error);
    
    return NextResponse.json({
      error: '향수 추천 중 오류가 발생했습니다.',
      recommendations: null
    }, { status: 500 });
  }
} 