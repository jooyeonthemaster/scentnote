import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  getAllFragrances, 
  filterFragrances, 
  formatFragrancesForAI,
  parsePriceRange,
  PRICE_RANGES,
  type FragranceDBData,
  type PriceFilter
} from '@/lib/firebase-fragrance';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash'
});

// 향수 구매 링크 생성 함수 (구글 검색으로 변경)
function generatePurchaseLink(brand: string, name: string): string {
  const searchQuery = `${brand} ${name} 향수`.trim();
  return `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
}

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
}

interface ConversationState {
  stage: 'initial' | 'experience_gathering' | 'preference_analysis' | 'recommendation_ready';
  collectedData: {
    experiencedFragrances: string[];
    preferences: string[];
    occasions: string[];
    avoidances: string[];
    personalityTraits: string[];
  };
}

// 대화 단계별 프롬프트 생성
function generateStagePrompt(stage: string, userMessage: string, conversationHistory: Message[]): string {
  const systemContext = `
당신은 ScentNote 실험실의 AI 향수 전문가입니다. 
실험실의 과학적이고 체계적인 접근 방식으로 사용자의 향수 취향을 분석하고 추천해야 합니다.

**🗄️ 중요: 향수 데이터베이스 기반 추천**
우리는 1500개의 향수 데이터베이스를 보유하고 있습니다.
모든 추천은 이 데이터베이스에 실제로 있는 향수만 사용해야 합니다.
추천 시 반드시 브랜드명, 제품명, 실제 가격을 정확히 확인하여 제공하세요.

**중요: 응답 규칙**
1. 질문 단계에서는 반드시 다음 형식으로 응답하세요:
   QUESTION: [질문 내용]
   EXAMPLES: [예시1]|[예시2]|[예시3]
   
2. 질문은 15단어 이하로 간결하게 작성하세요
3. 예시 답안은 사용자가 바로 클릭해서 사용할 수 있는 구체적인 예시 3개를 제공하세요
4. 예시는 다양한 수준(초급자/경험자/무경험자)을 고려해서 작성하세요

**분석 로그 생성 규칙**
사용자의 답변을 분석할 때마다 다음 형식으로 로그를 생성하세요. 반드시 향수 전문가가 실제로 고민하고 메모하는 것처럼 작성하세요.
각 로그는 최소 2-3문장으로 구성하고, 우리 데이터베이스에 있는 구체적인 향수 브랜드와 제품명을 반드시 포함하세요:

PREFERENCE_LOG: [취향 분석 - 실제 향수들을 언급하며 구체적으로 고민하는 과정]
PROFILE_LOG: [고객 프로필 - 라이프스타일을 분석하며 적합한 향수 스타일 고민]
CONSIDERATIONS_LOG: [기타 고려사항 - 실용적 요소들을 고민하며 향수 후보 검토]

대화 스타일:
- 친근하지만 전문적인 톤
- 사용자의 이전 답변을 분석하여 맞춤형 꼬리질문
- 실험실 컨셉에 맞는 표현 사용
- 한 번에 하나의 핵심 질문만

수집할 정보:
1. 향수 사용 경험과 선호도
2. 좋아하는 향의 구체적인 특징
3. 사용 상황과 목적
4. 피하고 싶은 향이나 경험
5. 개인 스타일과 라이프스타일
`;

  let stageSpecificPrompt = '';
  
  switch (stage) {
    case 'initial':
      stageSpecificPrompt = `
첫 대화이므로 향수 사용 경험을 파악하는 구체적인 질문을 하세요.

사용자의 기존 향수 경험을 정확히 파악하기 위해 브랜드명과 제품명을 포함한 예시를 제공하세요.

응답 예시:
QUESTION: 지금까지 사용해본 향수가 있으신가요?
EXAMPLES: 샤넬 No.5, 톰포드 블랙 오키드를 써봤어요|디올 미스 디올, 구찌 블룸 사용 경험 있어요|향수는 처음이라 잘 모르겠어요
`;
      break;
      
    case 'experience_gathering':
      const lastUserMessage = conversationHistory.length > 0 ? 
        conversationHistory[conversationHistory.length - 1]?.content || '' : '';
      stageSpecificPrompt = `
사용자의 최근 답변: "${lastUserMessage}"

이 답변을 기반으로 분석 로그를 생성하고 한 개의 간단한 후속 질문만 하세요.
반드시 우리 데이터베이스에 있는 실제 향수 브랜드와 제품명을 언급하며 전문가가 고민하는 과정을 보여주세요.

질문 방향:
1. 구체적인 향수가 언급되었다면 → 그 향수에 대한 감정이나 경험 질문
2. 추상적인 표현이 있다면 → 더 구체적인 선호도 질문  
3. 감정이나 기억이 언급되었다면 → 그와 관련된 향의 특징 질문

응답 예시:
PREFERENCE_LOG: 고객이 샤넬과 톰포드를 언급하셨군요! 이 두 브랜드의 공통점을 생각해보니... 우리 DB에서 비슷한 스타일의 향수들을 찾아보니 조말론 네롤리 앤 오렌지 블라썸이나 딥디크 오 로즈도 고려해볼 만하겠다.
QUESTION: 그 향수의 어떤 부분이 가장 마음에 드셨나요?
EXAMPLES: 첫 느낌이 상쾌하고 깔끔해서 좋았어요|지속력이 길고 은은하게 퍼져서 좋았어요|달콤하면서도 고급스러운 느낌이 좋았어요
`;
      break;
      
    case 'preference_analysis':
      const recentConversation = conversationHistory.slice(-4)
        .filter(m => m.type === 'user')
        .map(m => m.content).join(' | ');
      
      // 가격대 정보가 있는지 확인
      const hasPriceInfo = recentConversation.toLowerCase().includes('만원') || 
                          recentConversation.toLowerCase().includes('원') ||
                          recentConversation.toLowerCase().includes('가격') ||
                          recentConversation.toLowerCase().includes('예산') ||
                          recentConversation.toLowerCase().includes('비싸') ||
                          recentConversation.toLowerCase().includes('저렴');
      
      if (!hasPriceInfo) {
        // 가격대 정보가 없으면 반드시 가격대 질문
        stageSpecificPrompt = `
지금까지 파악된 정보: "${recentConversation}"

**중요: 가격대 정보가 필수입니다!**
향수 추천을 위해 고객의 예산 범위를 반드시 확인해야 합니다.
가격대에 따라 우리 데이터베이스에서 추천할 수 있는 향수가 완전히 달라지므로 이 정보는 필수입니다.

반드시 우리 DB의 실제 가격대별 향수들을 언급하며 메모하는 과정을 보여주세요.

CONSIDERATIONS_LOG: 향수 추천을 위해서는 가격대 정보가 절대적으로 필요하다! 우리 DB를 보니 3만원 이하면 조말론 미니어처나 딥디크 롤온 타입들이 있고, 5-8만원대면 조말론 30ml나 르라보 15ml급 제품들이 가능하다. 10-15만원이면 정품 50ml 조말론이나 톰포드 30ml도 고려할 수 있겠다.
QUESTION: 향수 구매 예산은 대략 어느 정도로 생각하고 계신가요?
EXAMPLES: 3만원 이하로 부담 없게 시작하고 싶어요|5-8만원 정도면 적당할 것 같아요|10-15만원까지는 투자할 의향이 있어요
`;
      } else {
        // 가격대 정보가 있으면 다른 라이프스타일 질문
        stageSpecificPrompt = `
지금까지 파악된 정보: "${recentConversation}"

이제 라이프스타일과 사용 목적을 파악하는 간단한 질문을 하세요.
사용자 답변에서 프로필 정보나 고려사항을 파악했다면 해당 로그를 생성하세요.
반드시 우리 데이터베이스의 구체적인 향수들을 고민하며 메모하는 과정을 보여주세요.

질문 방향:
1. 향수 사용 목적과 상황
2. 계절적/시간적 선호도  
3. 성격적 특징과 향수 스타일

응답 예시:
PROFILE_LOG: 고객의 취향을 보니 오피스용 향수를 찾고 계신 것 같다... 우리 DB에서 찾아보니 메종마르지엘라 언더 더 레몬 트리나 딥디크 필로시코스 같은 깔끔한 향수들이 후보에 올라간다. 이솝 제품들도 좋겠는데 가격대를 고려해봐야겠다.
QUESTION: 주로 어떤 상황에서 향수를 사용하고 싶으신가요?
EXAMPLES: 출근할 때나 중요한 미팅에서 사용하고 싶어요|데이트나 특별한 날에 사용하고 싶어요|일상적으로 매일 가볍게 사용하고 싶어요
`;
      }
      break;
      
    case 'recommendation_ready':
      const fullUserHistory = conversationHistory
        .filter(m => m.type === 'user')
        .map(m => m.content).join('\n');
      stageSpecificPrompt = `
전체 사용자 답변 분석:
${fullUserHistory}

**🗄️ 데이터베이스 기반 실시간 향수 추천**
우리가 보유한 1500개 향수 데이터베이스에서 사용자에게 최적의 향수를 선별하여 추천하세요.
반드시 실제 DB에 있는 향수만 추천하고, 정확한 브랜드명, 제품명, 가격 정보를 제공하세요.

**데이터베이스 활용 방법:**
1. 사용자의 예산에 맞는 가격대 향수 필터링
2. 선호도와 라이프스타일에 맞는 브랜드/스타일 선별
3. 우리 DB의 실제 재고와 정보만 활용하여 추천

반드시 다음 형식으로 응답하세요:

PREFERENCE_LOG: [최종 취향 분석 결과 - DB에서 찾은 매칭 향수들 언급]
PROFILE_LOG: [최종 고객 프로필 분석 - 적합한 DB 향수 카테고리 고민]
CONSIDERATIONS_LOG: [최종 고려사항 정리 - DB에서 선별한 후보군들의 실용성 검토]

ANALYSIS_START
향수 경험 수준: [초급/중급/고급]
선호 향 스타일: [분석 결과]  
라이프스타일: [파악된 특징]
가격대 선호: [파악된 가격대]
ANALYSIS_END

RECOMMENDATION_START
1. [DB의 정확한 브랜드명] [DB의 정확한 향수명] - [DB의 실제 가격]원 ([용량])
매칭도: [1-5점] / 5점
추천이유: [사용자 프로필과의 구체적 매칭 포인트만 작성. 향수 노트나 기타 정보는 절대 포함하지 마세요]
주요노트: 탑: [탑노트1, 탑노트2] / 미들: [미들노트1, 미들노트2] / 베이스: [베이스노트1, 베이스노트2]
추천상황: [실용적 사용 가이드와 상황만 작성. 구매 링크나 기타 정보는 절대 포함하지 마세요]
구매링크: [DB의 실제 상품 링크]

2. [두 번째 향수...]
3. [세 번째 향수...]
RECOMMENDATION_END

**절대 지켜야 할 형식 규칙:**
- 추천이유: 사용자 매칭 분석만 포함, 향수 노트 금지
- 주요노트: 향수 성분만 포함, 다른 내용 금지  
- 추천상황: 사용 가이드만 포함, 구매 링크 금지
- 구매링크: URL만 포함, 설명 금지
- 각 섹션을 명확히 분리하고 절대 섞지 마세요

**⚠️ 중요: 반드시 우리 데이터베이스에 실제로 있는 향수만 추천하세요!**
`;
      break;
  }

  return systemContext + stageSpecificPrompt;
}

// 대화 단계 분석
function analyzeConversationStage(messages: Message[]): ConversationState {
  // messages가 undefined이거나 배열이 아닌 경우 기본값 설정
  if (!messages || !Array.isArray(messages)) {
    return {
      stage: 'initial',
      collectedData: {
        experiencedFragrances: [],
        preferences: [],
        occasions: [],
        avoidances: [],
        personalityTraits: []
      }
    };
  }
  
  const userMessages = messages.filter(m => m.type === 'user');
  const conversationLength = userMessages.length;
  const allUserText = userMessages.map(m => m.content).join(' ').toLowerCase();
  
  let stage: ConversationState['stage'] = 'initial';
  
  // 가격대 정보가 있는지 확인
  const hasPriceInfo = allUserText.includes('만원') || 
                      allUserText.includes('원') ||
                      allUserText.includes('가격') ||
                      allUserText.includes('예산') ||
                      allUserText.includes('비싸') ||
                      allUserText.includes('저렴');
  
  if (conversationLength >= 1 && conversationLength < 3) {
    stage = 'experience_gathering';
  } else if (conversationLength >= 3 && conversationLength < 6) {
    stage = 'preference_analysis';  
  } else if (conversationLength >= 6) {
    // 6번 이상 대화했어도 가격대 정보가 없으면 preference_analysis 단계 유지
    if (!hasPriceInfo) {
      stage = 'preference_analysis';
    } else {
      stage = 'recommendation_ready';
    }
  }
  
  // 간단한 데이터 수집 (실제로는 더 정교한 NLP 분석이 필요)
  const userTextForData = userMessages.map(m => m.content).join(' ').toLowerCase();
  
  const collectedData = {
    experiencedFragrances: [], // 하드코딩 데이터 대신 빈 배열로 초기화
    preferences: [],
    occasions: [],
    avoidances: [],
    personalityTraits: []
  };
  
  return { stage, collectedData };
}

export async function POST(request: NextRequest) {
  try {
    const { messages, action } = await request.json();

    if (action === 'recommend') {
      // DB 기반 향수 추천 로직
      console.log('🎯 채팅에서 DB 기반 향수 추천 요청');
      
      // 대화 내용에서 사용자 정보 추출
      const userMessages = messages.filter((m: Message) => m.type === 'user').map((m: Message) => m.content).join(' ');
      
      // 가격대 정보 추출
      const priceRange = parsePriceRange(userMessages);
      console.log('💰 추출된 가격대:', priceRange?.label || '기본값 적용');
      
      // Firebase에서 향수 데이터 로딩
      const allFragrances = await getAllFragrances();
      
      // 사용자 조건에 맞는 향수 필터링
      let filteredFragrances = allFragrances;
      
      if (priceRange) {
        filteredFragrances = filterFragrances(allFragrances, { 
          priceRange,
          limit: 100 
        });
      } else {
        // 기본 가격대 적용 (5만원 이하)
        const defaultPriceRange = PRICE_RANGES.find(range => range.max === 50000);
        if (defaultPriceRange) {
          filteredFragrances = filterFragrances(allFragrances, { 
            priceRange: defaultPriceRange,
            limit: 100 
          });
        }
      }
      
      console.log(`🔍 필터링된 향수: ${filteredFragrances.length}개`);
      
      // Gemini에게 최종 추천 요청 (웹 검색 포함)
      const recommendationPrompt = `
대화 내용 분석:
${userMessages}

다음은 사용자 조건에 맞는 우리 데이터베이스의 향수들입니다:
${formatFragrancesForAI(filteredFragrances)}

**중요 지침:**
1. 이 목록에서만 사용자에게 가장 적합한 3개를 선별하여 추천하세요
2. 각 추천 향수에 대해 웹 검색을 통해 최신 가격 정보를 확인하세요
3. 웹 검색으로 확인한 실제 가격이 DB 가격과 다르면 실제 가격을 우선 사용하세요
4. 향수 노트 정보는 전문 지식을 바탕으로 정확히 제공하세요
5. 반드시 실제 데이터베이스 정보만 사용하세요

위의 recommendation_ready 형식으로 추천해주세요.
`;
      
      const result = await model.generateContent(recommendationPrompt);
      const response = await result.response;
      const recommendation = response.text();

      return NextResponse.json({
        type: 'recommendation',
        content: recommendation,
        metadata: {
          totalFragrances: allFragrances.length,
          filteredFragrances: filteredFragrances.length,
          appliedPriceRange: priceRange?.label || '기본 범위'
        }
      });
    }

    // 일반 대화 처리
    // messages 유효성 검사 추가
    const validMessages = messages && Array.isArray(messages) ? messages : [];
    const conversationState = analyzeConversationStage(validMessages);
    const lastUserMessage = validMessages.length > 0 ? validMessages[validMessages.length - 1]?.content || '' : '';
    
    // DB 기반 대화 컨텍스트 추가
    let dbContext = '';
    if (conversationState.stage === 'recommendation_ready') {
      // 추천 단계에서는 바로 실제 추천 실행
      console.log('🗄️ 추천 단계: 실제 추천 시작');
      
      try {
        // 대화 내용에서 사용자 정보 추출
        const userMessages = validMessages.filter((m: Message) => m.type === 'user').map((m: Message) => m.content).join(' ');
        
        // 가격대 정보 추출
        const priceRange = parsePriceRange(userMessages);
        console.log('💰 추출된 가격대:', priceRange?.label || '기본값 적용');
        
        // Firebase에서 향수 데이터 로딩
        const allFragrances = await getAllFragrances();
        
        // 사용자 조건에 맞는 향수 필터링
        let filteredFragrances = allFragrances;
        
        if (priceRange) {
          filteredFragrances = filterFragrances(allFragrances, { 
            priceRange,
            limit: 100 
          });
        } else {
          // 사용자가 언급한 가격대 텍스트에서 범위 추출 시도
          const userPriceHint = userMessages.match(/(\d+)(?:만원?)?(?:에서|[-~])(\d+)만원?|(\d+)만원?\s*이하/);
          if (userPriceHint) {
            let defaultRange: PriceFilter;
            if (userPriceHint[3]) {
              // "X만원 이하" 패턴
              const max = parseInt(userPriceHint[3]) * 10000;
              defaultRange = { min: 0, max, label: `${userPriceHint[3]}만원 이하` };
            } else if (userPriceHint[1] && userPriceHint[2]) {
              // "X~Y만원" 패턴
              const min = parseInt(userPriceHint[1]) * 10000;
              const max = parseInt(userPriceHint[2]) * 10000;
              defaultRange = { min: min + 1, max, label: `${userPriceHint[1]}-${userPriceHint[2]}만원` };
            } else {
              // 기본값 (5만원 이하)
              defaultRange = { min: 0, max: 50000, label: "5만원 이하" };
            }
            
            filteredFragrances = filterFragrances(allFragrances, { 
              priceRange: defaultRange,
              limit: 100 
            });
            console.log(`💰 추출된 기본 가격대: ${defaultRange.label}`);
          } else {
            // 완전 기본값 (5만원 이하)
            const defaultPriceRange = { min: 0, max: 50000, label: "5만원 이하" };
            filteredFragrances = filterFragrances(allFragrances, { 
              priceRange: defaultPriceRange,
              limit: 100 
            });
          }
        }
        
        console.log(`🔍 필터링된 향수: ${filteredFragrances.length}개`);
        
        // 50ml 우선 필터링 및 10ml 제외
        const preferredFragrances = filteredFragrances.filter(f => {
          // 10ml 제품 제외
          if (f.volume && f.volume.includes('10ml')) {
            return false;
          }
          return true;
        }).sort((a, b) => {
          // 50ml 제품을 우선순위로 정렬
          const aIs50ml = a.volume && a.volume.includes('50ml');
          const bIs50ml = b.volume && b.volume.includes('50ml');
          
          if (aIs50ml && !bIs50ml) return -1;
          if (!aIs50ml && bIs50ml) return 1;
          return 0;
        });
        
        console.log(`✅ 50ml 우선 필터링 완료: ${preferredFragrances.length}개`);
        
        // 필터링된 향수들을 컨텍스트로 추가
        dbContext = `
**🗄️ 사용자 조건에 맞는 향수 목록 (총 ${preferredFragrances.length}개, 50ml 우선):**
${formatFragrancesForAI(preferredFragrances.slice(0, 30))}

**중요 추천 지침:**
- 위 목록에서만 사용자에게 가장 적합한 3개를 선별하여 추천하세요
- 사용자가 요구한 가격대(${priceRange?.label || '5만원 이하'})에 맞는 향수만 추천하세요
- 50ml 제품을 우선적으로 추천하고, 10ml 제품은 추천하지 마세요
- 반드시 실제 데이터베이스 정보만 사용하세요
`;
        
      } catch (error) {
        console.error('DB 로딩 오류:', error);
        dbContext = '**⚠️ DB 연결 중 오류가 발생했습니다. 일반적인 향수 지식으로 도움드리겠습니다.**';
      }
    }

    const prompt = generateStagePrompt(conversationState.stage, lastUserMessage, validMessages) + dbContext;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      type: 'chat',
      content: text,
      stage: conversationState.stage,
      collectedData: conversationState.collectedData
    });

  } catch (error) {
    console.error('Chat API 오류:', error);
    
    return NextResponse.json({
      type: 'error',
      content: '죄송합니다. 시스템에 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    }, { status: 500 });
  }
} 