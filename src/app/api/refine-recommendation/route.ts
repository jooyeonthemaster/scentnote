import { NextRequest, NextResponse } from 'next/server';
import { model } from '@/lib/gemini';
import { getActualPurchaseLinks } from '@/lib/brave-search';

// 향수 구매 링크 생성 함수 (실제 검색 결과 기반)
async function generateAccuratePurchaseLink(brand: string, name: string): Promise<string> {
  try {
    // 실제 검색된 구매 링크들을 가져오기
    const actualLinks = await getActualPurchaseLinks(brand, name);
    
    if (actualLinks.length > 0) {
      // 신뢰도 순으로 정렬하여 첫 번째 링크 반환
      const priorityDomains = [
        'oliveyoung.co.kr',
        'shinsegaemall.com', 
        'lotte.com',
        'perfumegraphic.co.kr',
        'sephora.kr'
      ];
      
      for (const domain of priorityDomains) {
        const priorityLink = actualLinks.find(link => link.includes(domain));
        if (priorityLink) {
          return priorityLink;
        }
      }
      
      // 우선순위 도메인이 없으면 첫 번째 링크 반환
      return actualLinks[0];
    }
    
    // 실제 링크를 찾지 못한 경우 검색 페이지로 리다이렉트
    return `https://search.brave.com/search?q=${encodeURIComponent(`${brand} ${name} 향수 구매 올리브영`)}`;
  } catch (error) {
    console.error('구매 링크 생성 실패:', error);
    return `https://search.brave.com/search?q=${encodeURIComponent(`${brand} ${name} 향수 구매`)}`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { recommendationText, userProfile } = await request.json();
    
    if (!recommendationText) {
      return NextResponse.json(
        { error: '정제할 추천 결과가 필요합니다.' },
        { status: 400 }
      );
    }

    const refinementPrompt = `
🔍 **향수 추천 결과 철저 검증 및 정제 (Brave Search 활용)**

당신은 향수 전문가로서 AI가 생성한 향수 추천 결과를 정확하게 검증하고 수정하는 역할입니다.

**🔍 Brave Search 기반 검증 프로세스:**

**1. 브랜드명과 제품명 정확성 확인:**
- 각 추천 향수의 브랜드명과 제품명을 정확히 분리
- 예: "Calvin Klein Defy EDT" → "Calvin Klein" (브랜드) + "Defy EDT" (제품)
- 두 단어 브랜드명 (Tom Ford, Jo Malone, Calvin Klein) 올바른 분리

**2. 한국 시장 실제 가격 정보:**
- 퍼퓸그라피, 올리브영, 신세계몰, 롯데백화점 등의 실제 판매 가격
- 50ml, 100ml 용량별 현재 시세
- 할인가와 정가를 모두 고려한 현실적인 가격대

**3. 제품 실존성 확인:**
- 실제 존재하는 제품인지 확인
- 가짜 제품명이나 모방품 표현 제거
- 현재 판매 중인 제품만 추천

**4. 예산 적합성 검토:**
- 사용자 예산: ${userProfile?.budget || '5만원'} 이하
- 실제 가격과 예산 비교
- 예산 초과 시 비슷한 향 계열의 예산 내 대안 제시

**🔧 검증 기반 수정 작업:**

**검증 완료 후 다음 형식으로 출력:**

REFINED_ANALYSIS_START
[사용자 분석 내용 그대로 유지]
REFINED_ANALYSIS_END

REFINED_RECOMMENDATION_START
[각 향수별로 아래 형식 준수]
1. [브랜드명] [제품명] - [정확한 가격대] ([용량] 기준)
매칭도: X/5점
추천이유: [검증된 정보 기반 추천이유]
주요노트: [실제 향수 노트]
추천상황: [적절한 사용 상황]
구매링크: PURCHASE_LINK_[브랜드명]_[제품명]

2. [두 번째 향수...]
3. [세 번째 향수...]
REFINED_RECOMMENDATION_END

REFINED_TIPS_START
[실용적인 사용 팁]
REFINED_TIPS_END

**⚠️ 중요 지시사항:**
- 검증 과정에서 오류를 발견하면 **반드시 수정**
- **실제 검색된 가격 정보는 절대 변경 금지** (175,500원을 4만원으로 바꾸는 것 등 절대 금지)
- 예산에 맞지 않으면 **해당 제품을 추천 목록에서 완전 제거**하고 **예산 내 대안 제시**
- 가짜 제품이나 모방품은 **완전 제거**
- 브랜드명 분리가 틀렸으면 **정확히 수정**
- **가격 정확성이 사용자 만족도보다 최우선**

---

**검증할 원본 추천 결과:**
${recommendationText}

**사용자 프로필:**
${JSON.stringify(userProfile, null, 2)}

위 내용을 철저히 검증하고 수정하여 정제된 결과를 제공해주세요.`;

    // Gemini AI로 정제 요청
    const result = await model.generateContent(refinementPrompt);
    const response = await result.response;
    let refinedResponse = response.text();

    console.log('정제된 추천 결과:', refinedResponse);

    // 구매 링크를 실제 링크로 변환 (비동기 처리)
    const linkMatches = refinedResponse.match(/PURCHASE_LINK_([^_]+)_([^\s\n]+)/g);
    
    if (linkMatches) {
      for (const match of linkMatches) {
        const linkMatch = match.match(/PURCHASE_LINK_([^_]+)_([^\s\n]+)/);
        if (linkMatch) {
          const brand = linkMatch[1].replace(/_/g, ' ');
          const product = linkMatch[2].replace(/_/g, ' ');
          
          try {
            const actualLink = await generateAccuratePurchaseLink(brand, product);
            refinedResponse = refinedResponse.replace(match, actualLink);
          } catch (error) {
            console.error('구매 링크 생성 실패:', error);
            const fallbackLink = `https://search.brave.com/search?q=${encodeURIComponent(`${brand} ${product} 향수 구매`)}`;
            refinedResponse = refinedResponse.replace(match, fallbackLink);
          }
        }
      }
    }

    return NextResponse.json({
      refinedRecommendation: refinedResponse
    });

  } catch (error) {
    console.error('추천 결과 정제 오류:', error);
    
    return NextResponse.json({
      error: '추천 결과 정제 중 오류가 발생했습니다.',
      refinedRecommendation: null
    }, { status: 500 });
  }
}
