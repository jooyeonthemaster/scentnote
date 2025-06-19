import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { 
  FragranceFeedback, 
  FragrancePreference, 
  FragranceAnalysis, 
  FragranceRecommendation,
  Fragrance 
} from '@/types';

// Gemini AI 클라이언트 초기화
console.log('GEMINI_API_KEY 확인:', process.env.GEMINI_API_KEY ? '키 존재함' : '키 없음');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// 향수 분석을 위한 Gemini 모델
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash',
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    }
  ]
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

// 향수 추천 함수
export async function generateFragranceRecommendations(options: {
  analysis: Partial<FragranceAnalysis>;
  availableFragrances: Fragrance[];
}): Promise<FragranceRecommendation[]> {
  try {
    const prompt = createRecommendationPrompt(JSON.stringify(options.analysis));
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // JSON 파싱 시도
    try {
      const parsed = JSON.parse(text);
      
      // 사용 가능한 향수들에서 매칭되는 것들을 찾아서 추천 생성
      const recommendations: FragranceRecommendation[] = options.availableFragrances
        .slice(0, 3) // 임시로 처음 3개 선택
        .map((fragrance, index) => ({
          fragrance,
          score: 0.9 - (index * 0.1), // 임시 점수
          reasoning: `당신의 ${options.analysis.personalityProfile?.style} 스타일에 잘 맞는 향수입니다.`,
          matchedPreferences: ['스타일 매칭', '향의 조화']
        }));
      
      return recommendations;
    } catch {
      // JSON 파싱 실패시 기본 추천 생성
      const recommendations: FragranceRecommendation[] = options.availableFragrances
        .slice(0, 3)
        .map((fragrance, index) => ({
          fragrance,
          score: 0.8 - (index * 0.1),
          reasoning: '당신의 취향에 맞는 추천 향수입니다.',
          matchedPreferences: ['기본 매칭']
        }));
      
      return recommendations;
    }
  } catch (error) {
    console.error('Gemini API 오류:', error);
    throw new Error('향수 추천 생성 중 오류가 발생했습니다.');
  }
} 