import { ParsedLogData, LogCategory } from '@/types/analysis-log';

// AI 응답에서 로그 데이터를 파싱하는 함수
export function parseAnalysisLogs(aiResponse: string): ParsedLogData[] {
  const logs: ParsedLogData[] = [];
  
  // aiResponse 유효성 검사
  if (!aiResponse || typeof aiResponse !== 'string') {
    console.log('🔍 AI 응답이 유효하지 않음:', aiResponse);
    return logs;
  }
  
  // 디버깅을 위한 로그 출력 - 안전한 substring
  const previewText = aiResponse.length > 200 ? aiResponse.substring(0, 200) + '...' : aiResponse;
  console.log('🔍 AI 응답 파싱 시작:', previewText);
  
  // PREFERENCE_LOG: 형태로 된 로그 추출 (여러 줄 지원)
  const preferenceMatches = aiResponse.match(/PREFERENCE_LOG:\s*([\s\S]*?)(?=(?:\n\s*(?:PROFILE_LOG|CONSIDERATIONS_LOG|QUESTION|$)))/g);
  if (preferenceMatches) {
    preferenceMatches.forEach(match => {
      const content = match.replace('PREFERENCE_LOG:', '').trim();
      if (content) {
        logs.push({
          category: 'preference',
          title: '취향 분석 업데이트',
          content,
          progressContribution: 15
        });
      }
    });
  }
  
  // PROFILE_LOG: 형태로 된 로그 추출 (여러 줄 지원)
  const profileMatches = aiResponse.match(/PROFILE_LOG:\s*([\s\S]*?)(?=(?:\n\s*(?:PREFERENCE_LOG|CONSIDERATIONS_LOG|QUESTION|$)))/g);
  if (profileMatches) {
    profileMatches.forEach(match => {
      const content = match.replace('PROFILE_LOG:', '').trim();
      if (content) {
        logs.push({
          category: 'profile',
          title: '고객 프로필 업데이트',
          content,
          progressContribution: 20
        });
      }
    });
  }
  
  // CONSIDERATIONS_LOG: 형태로 된 로그 추출 (여러 줄 지원)
  const considerationsMatches = aiResponse.match(/CONSIDERATIONS_LOG:\s*([\s\S]*?)(?=(?:\n\s*(?:PREFERENCE_LOG|PROFILE_LOG|QUESTION|$)))/g);
  if (considerationsMatches) {
    considerationsMatches.forEach(match => {
      const content = match.replace('CONSIDERATIONS_LOG:', '').trim();
      if (content) {
        logs.push({
          category: 'considerations',
          title: '고려사항 업데이트',
          content,
          progressContribution: 25
        });
      }
    });
  }
  
  // 디버깅을 위한 로그 출력
  console.log('📝 파싱된 로그 개수:', logs.length);
  logs.forEach((log, index) => {
    const contentPreview = log.content && typeof log.content === 'string' && log.content.length > 100 
      ? log.content.substring(0, 100) + '...' 
      : log.content || '';
    console.log(`로그 ${index + 1}:`, {
      category: log.category,
      title: log.title,
      content: contentPreview
    });
  });
  
  return logs;
}

// 응답 내용을 기반으로 자동으로 로그를 생성하는 함수 (fallback)
export function generateAutoLogs(userMessage: string, aiResponse: string): ParsedLogData[] {
  const logs: ParsedLogData[] = [];
  
  // 매개변수 유효성 검사
  if (!userMessage || typeof userMessage !== 'string' || 
      !aiResponse || typeof aiResponse !== 'string') {
    console.log('🔍 generateAutoLogs: 유효하지 않은 매개변수', { userMessage, aiResponse });
    return logs;
  }
  
  const response = aiResponse.toLowerCase();
  const message = userMessage.toLowerCase();
  
  // 향수 브랜드나 제품명이 언급된 경우 취향 로그 생성
  const perfumeBrands = ['샤넬', 'dior', '디올', 'tom ford', '톰포드', 'gucci', '구찌', 'hermès', '에르메스', 'ysl', 'versace', '베르사체'];
  const mentionedBrands = perfumeBrands.filter(brand => 
    message.includes(brand) || response.includes(brand)
  );
  
  if (mentionedBrands.length > 0) {
    logs.push({
      category: 'preference',
      title: '선호 브랜드 분석',
      content: `고객이 언급한 브랜드: ${mentionedBrands.join(', ')}. 이를 바탕으로 고객의 향수 취향을 분석하고 있습니다.`,
      progressContribution: 15
    });
  }
  
  // 나이, 성별, 라이프스타일 정보가 있는 경우 프로필 로그 생성
  const ageKeywords = ['나이', '살', '대', '연령'];
  const genderKeywords = ['남', '여', '남성', '여성', '남자', '여자'];
  const lifestyleKeywords = ['직장', '회사', '학생', '주부', '운동', '취미'];
  
  const hasAge = ageKeywords.some(keyword => message.includes(keyword));
  const hasGender = genderKeywords.some(keyword => message.includes(keyword));
  const hasLifestyle = lifestyleKeywords.some(keyword => message.includes(keyword));
  
  if (hasAge || hasGender || hasLifestyle) {
    const profileInfo = [];
    if (hasAge) profileInfo.push('연령대');
    if (hasGender) profileInfo.push('성별');
    if (hasLifestyle) profileInfo.push('라이프스타일');
    
    logs.push({
      category: 'profile',
      title: '고객 프로필 정보 수집',
      content: `${profileInfo.join(', ')} 정보를 바탕으로 고객 프로필을 구성하고 있습니다.`,
      progressContribution: 20
    });
  }
  
  // 가격, 계절, 사용 상황 등이 언급된 경우 고려사항 로그 생성
  const priceKeywords = ['가격', '비싸', '저렴', '예산', '만원', '원'];
  const seasonKeywords = ['봄', '여름', '가을', '겨울', '계절'];
  const occasionKeywords = ['데이트', '회사', '일상', '특별한', '파티', '모임'];
  
  const hasPrice = priceKeywords.some(keyword => message.includes(keyword));
  const hasSeason = seasonKeywords.some(keyword => message.includes(keyword));
  const hasOccasion = occasionKeywords.some(keyword => message.includes(keyword));
  
  if (hasPrice || hasSeason || hasOccasion) {
    const considerations = [];
    if (hasPrice) considerations.push('가격대');
    if (hasSeason) considerations.push('계절');
    if (hasOccasion) considerations.push('사용 상황');
    
    logs.push({
      category: 'considerations',
      title: '추가 고려사항 수집',
      content: `${considerations.join(', ')} 관련 정보를 추천에 반영하겠습니다.`,
      progressContribution: 25
    });
  }
  
  return logs;
}

// 카테고리별 아이콘과 색상 정보
export const categoryInfo = {
  preference: {
    icon: '🎯',
    title: '취향 프로파일',
    description: '개인 향수 취향 프로파일 구축',
    bgColor: 'bg-mono-900',
    textColor: 'text-mono-900'
  },
  profile: {
    icon: '👤',
    title: '고객 프로필',
    description: '라이프스타일 및 개인정보 분석',
    bgColor: 'bg-mono-800',
    textColor: 'text-mono-800'
  },
  considerations: {
    icon: '📋',
    title: '기타 고려사항',
    description: '가격대, 계절, 사용상황 등 분석',
    bgColor: 'bg-mono-700',
    textColor: 'text-mono-700'
  }
} as const; 