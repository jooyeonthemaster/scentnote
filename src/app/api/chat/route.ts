import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { fragrances } from '@/data/fragrances';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// 향수 구매 링크 생성 함수 (실제 구매처 링크)
function generatePurchaseLink(brand: string, name: string): string {
  const brandLower = brand.toLowerCase().trim();
  const nameLower = name.toLowerCase().trim();
  
  // 포맨트(4ment) 향수들
  if (brandLower.includes('포맨트') || brandLower.includes('4ment')) {
    return `https://4ment.co.kr/product/search.html?banner_action=&keyword=${encodeURIComponent(name)}`;
  }
  
  // 퍼퓸그라피 향수들  
  if (brandLower.includes('퍼퓸그라피') || brandLower.includes('perfumegraph')) {
    return `https://perfumegraph.com/product/search.html?banner_action=&keyword=${encodeURIComponent(name)}`;
  }
  
  // 올리브영 (대부분의 향수 판매)
  if (brandLower.includes('딥디크') || brandLower.includes('diptyque') || 
      brandLower.includes('조말론') || brandLower.includes('jo malone') ||
      brandLower.includes('르라보') || brandLower.includes('le labo') ||
      brandLower.includes('메종마르지엘라') || brandLower.includes('maison margiela')) {
    return `https://www.oliveyoung.co.kr/store/search/getSearchMain.do?query=${encodeURIComponent(brand + ' ' + name)}`;
  }
  
  // 신세계몰 (고급 향수들)
  if (brandLower.includes('톰포드') || brandLower.includes('tom ford') ||
      brandLower.includes('크리드') || brandLower.includes('creed') ||
      brandLower.includes('바이레도') || brandLower.includes('byredo')) {
    return `https://www.shinsegaemall.com/search?keyword=${encodeURIComponent(brand + ' ' + name)}`;
  }
  
  // 기본적으로 올리브영 검색
  return `https://www.oliveyoung.co.kr/store/search/getSearchMain.do?query=${encodeURIComponent(brand + ' ' + name)}`;
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

**중요: 응답 형식을 반드시 지켜주세요:**

**질문:** [구체적인 질문 1-2개]
**설명:** [질문의 이유나 배경 설명]
**예시:** [구체적인 예시나 옵션 제시]

대화 스타일:
- 친근하지만 전문적인 톤
- 사용자의 이전 답변을 분석하여 맞춤형 꼬리질문
- 가독성 좋은 구조화된 응답
- 실험실 컨셉에 맞는 표현 사용

사용자 답변 분석 방법:
1. 사용자가 언급한 구체적인 향수/브랜드에 대해 더 깊이 질문
2. 사용자의 감정적 반응이나 경험에 기반한 후속 질문
3. 애매하거나 일반적인 답변에는 구체적인 선택지 제시
4. 사용자의 라이프스타일이나 성격과 연결된 질문

수집할 정보:
1. 향수 사용 경험과 선호도
2. 좋아하는 향의 구체적인 특징
3. 사용 상황과 목적
4. 피하고 싶은 향이나 경험
5. 개인 스타일과 라이프스타일
`;

  const availableFragrances = fragrances.map(f => `${f.brand.name} ${f.name}`).join(', ');
  
  let stageSpecificPrompt = '';
  
  switch (stage) {
    case 'initial':
      stageSpecificPrompt = `
당신은 ScentNote AI 향수 전문가입니다.

반드시 다음 형식으로 응답하세요:

QUESTION: [향수 사용 경험에 대한 친근한 질문]
EXPLANATION: [왜 이 정보가 필요한지 간단한 설명]
OPTIONS: [선택할 수 있는 구체적인 옵션들 또는 예시]

첫 대화이므로 향수 사용 경험 정도를 파악하세요.
- 향수를 처음 사용하는지
- 평소 향수 사용 빈도  
- 현재 사용 중인 향수가 있는지

절대로 마크다운 문법(**, ##, ### 등)을 사용하지 마세요.
`;
      break;
      
    case 'experience_gathering':
      const lastUserMessage = conversationHistory.length > 0 ? 
        conversationHistory[conversationHistory.length - 1]?.content || '' : '';
      stageSpecificPrompt = `
당신은 ScentNote AI 향수 전문가입니다.

사용자의 최근 답변: "${lastUserMessage}"

이 답변을 기반으로 맞춤형 꼬리질문을 해주세요.

반드시 다음 형식으로 응답하세요:

QUESTION: [사용자 답변에 기반한 구체적인 후속 질문]
EXPLANATION: [왜 이 정보가 향수 추천에 중요한지 설명]
OPTIONS: [구체적인 선택지나 예시들]

분석 방법:
1. 구체적인 향수/브랜드가 언급되었다면 → 그것에 대한 세부 경험 질문
2. 추상적인 표현이 있다면 → 구체적인 선택지로 명확화
3. 감정이나 기억이 언급되었다면 → 그 감정과 연결된 향의 특징 질문

사용 가능한 향수들: ${availableFragrances}

절대로 마크다운 문법을 사용하지 마세요.
`;
      break;
      
    case 'preference_analysis':
      const recentConversation = conversationHistory.slice(-4)
        .filter(m => m.type === 'user')
        .map(m => m.content).join(' | ');
      stageSpecificPrompt = `
당신은 ScentNote AI 향수 전문가입니다.

지금까지 파악된 정보: "${recentConversation}"

이제 라이프스타일과 사용 목적을 파악해주세요.

반드시 다음 형식으로 응답하세요:

QUESTION: [라이프스타일과 연결된 질문 + 가격대 선호도 질문]
EXPLANATION: [왜 이 정보들이 향수 추천에 중요한지]
OPTIONS: [구체적인 상황 선택지 + 가격대 옵션]

포함해야 할 내용:
1. 향수 사용 목적과 상황 (데이트/직장/일상/특별한 날)
2. 계절적/시간적 선호도
3. 가격대 선호도 (5만원 이하/5-10만원/10-20만원/20만원 이상)
4. 성격적 특징과 향수 스타일 연결

사용자가 언급한 선호도를 기반으로 구체적인 질문을 해주세요.

절대로 마크다운 문법을 사용하지 마세요.
`;
      break;
      
    case 'recommendation_ready':
      const fullUserHistory = conversationHistory
        .filter(m => m.type === 'user')
        .map(m => m.content).join('\n');
      stageSpecificPrompt = `
당신은 ScentNote AI 향수 전문가입니다.

전체 사용자 답변 분석:
${fullUserHistory}

반드시 다음 형식으로 응답하세요:

ANALYSIS_START
향수 경험 수준: [초급/중급/고급]
선호 향 스타일: [분석 결과]  
라이프스타일: [파악된 특징]
가격대 선호: [파악된 가격대]
ANALYSIS_END

RECOMMENDATION_START
1. [브랜드명] [향수명] - [가격대]
매칭도: [1-5점] / 5점
추천이유: [사용자 답변 기반 구체적 이유 2-3줄]
주요노트: [탑/미들/베이스 노트]
추천상황: [언제 사용하면 좋은지]
구매링크: PURCHASE_LINK_[브랜드]_[향수명]

2. [브랜드명] [향수명] - [가격대]  
매칭도: [1-5점] / 5점
추천이유: [사용자 답변 기반 구체적 이유 2-3줄]
주요노트: [탑/미들/베이스 노트]
추천상황: [언제 사용하면 좋은지]
구매링크: PURCHASE_LINK_[브랜드]_[향수명]

3. [브랜드명] [향수명] - [가격대]
매칭도: [1-5점] / 5점  
추천이유: [사용자 답변 기반 구체적 이유 2-3줄]
주요노트: [탑/미들/베이스 노트]
추천상황: [언제 사용하면 좋은지]
구매링크: PURCHASE_LINK_[브랜드]_[향수명]
RECOMMENDATION_END

TIPS_START
[개인화된 향수 사용 조언]
TIPS_END

사용 가능한 향수 데이터베이스:
${JSON.stringify(fragrances, null, 2)}

중요: 반드시 데이터베이스에 있는 향수만 추천하고, 사용자의 가격대 선호도에 맞춰 추천하세요.
절대로 마크다운 문법을 사용하지 마세요.
`;
      break;
  }

  return `${systemContext}\n\n${stageSpecificPrompt}\n\n대화 히스토리를 참고하여 자연스럽게 응답하세요. 사용자 메시지: "${userMessage}"`;
}

// 대화 단계 분석
function analyzeConversationStage(messages: Message[]): ConversationState {
  const userMessages = messages.filter(m => m.type === 'user');
  const conversationLength = userMessages.length;
  
  let stage: ConversationState['stage'] = 'initial';
  
  if (conversationLength >= 1 && conversationLength < 3) {
    stage = 'experience_gathering';
  } else if (conversationLength >= 3 && conversationLength < 6) {
    stage = 'preference_analysis';  
  } else if (conversationLength >= 6) {
    stage = 'recommendation_ready';
  }
  
  // 간단한 데이터 수집 (실제로는 더 정교한 NLP 분석이 필요)
  const allUserText = userMessages.map(m => m.content).join(' ').toLowerCase();
  
  const collectedData = {
    experiencedFragrances: fragrances
      .filter(f => allUserText.includes(f.name.toLowerCase()) || allUserText.includes(f.brand.name.toLowerCase()))
      .map(f => `${f.brand.name} ${f.name}`),
    preferences: [],
    occasions: [],
    avoidances: [],
    personalityTraits: []
  };
  
  return { stage, collectedData };
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json();
    
    if (!message || !Array.isArray(conversationHistory)) {
      return NextResponse.json(
        { error: '메시지와 대화 히스토리가 필요합니다.' },
        { status: 400 }
      );
    }

    // 대화 단계 분석
    const conversationState = analyzeConversationStage(conversationHistory);
    
    // AI 프롬프트 생성
    const prompt = generateStagePrompt(conversationState.stage, message, conversationHistory);
    
    // Gemini AI 응답 생성
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let aiResponse = response.text();

    // 추천 단계에서 구매 링크 교체
    if (conversationState.stage === 'recommendation_ready') {
      // PURCHASE_LINK_[브랜드]_[향수명] 패턴을 실제 구매 링크로 교체
      aiResponse = aiResponse.replace(
        /\[PURCHASE_LINK_([^_]+)_([^\]]+)\]/g,
        (match, brand, name) => {
          const purchaseLink = generatePurchaseLink(brand.trim(), name.trim());
          return `[🛒 구매하기](${purchaseLink})`;
        }
      );
    }

    return NextResponse.json({
      response: aiResponse,
      stage: conversationState.stage,
      collectedData: conversationState.collectedData
    });

  } catch (error) {
    console.error('AI 채팅 오류:', error);
    
    // 오류 시 대체 응답
    const fallbackResponses = [
      "죄송합니다. 일시적으로 분석에 어려움이 있습니다. 다시 말씀해주시겠어요?",
      "잠시 시스템을 점검 중입니다. 조금 더 자세히 설명해주시면 도움이 될 것 같아요.",
      "기술적인 문제가 발생했습니다. 향수에 대한 경험을 다시 한 번 알려주세요."
    ];
    
    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    
    return NextResponse.json({
      response: randomResponse,
      stage: 'experience_gathering',
      collectedData: { experiencedFragrances: [], preferences: [], occasions: [], avoidances: [], personalityTraits: [] }
    });
  }
} 