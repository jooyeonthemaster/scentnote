import { useState, useEffect, useCallback } from 'react';
import { useChatStore } from '@/store/useChatStore';

export function useTypingAnimation() {
  const [typingText, setTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasTypedInitial, setHasTypedInitial] = useState(false);
  const [lastTypedQuestion, setLastTypedQuestion] = useState('');
  const [exampleAnswers, setExampleAnswers] = useState<string[]>([]);
  
  const { messages, conversationState } = useChatStore();

  // AI 응답에서 예시 답안 추출하는 함수
  const extractExamples = useCallback((content: string): string[] => {
    // content가 유효하지 않은 경우 빈 배열 반환
    if (!content || typeof content !== 'string') {
      return [];
    }
    
    const examplesMatch = content.match(/EXAMPLES:\s*(.*?)(?=\n|$)/);
    if (examplesMatch) {
      return examplesMatch[1].split('|').map(example => example.trim()).filter(example => example.length > 0);
    }
    return [];
  }, []);

  // AI 메시지에서 순수한 질문만 추출하는 함수
  const extractQuestion = useCallback((content: string): string => {
    // content가 유효하지 않은 경우 기본 질문 반환
    if (!content || typeof content !== 'string') {
      return '추가로 알려주실 내용이 있나요?';
    }
    
    // 새로운 구조화된 응답에서 QUESTION 부분만 추출
    const questionMatch = content.match(/QUESTION:\s*(.*?)(?=\n(?:EXAMPLES|EXPLANATION|ANALYSIS|OPTIONS|$))/);
    if (questionMatch) {
      return questionMatch[1].trim();
    }

    // EXPLANATION, ANALYSIS 등의 부차적 설명 제거
    let cleanContent = content
      .replace(/EXPLANATION:[\s\S]*?(?=QUESTION:|$)/g, '')
      .replace(/ANALYSIS:[\s\S]*?(?=QUESTION:|$)/g, '')
      .replace(/OPTIONS:[\s\S]*?(?=QUESTION:|$)/g, '')
      .replace(/BACKGROUND:[\s\S]*?(?=QUESTION:|$)/g, '')
      .replace(/NOTE:[\s\S]*?(?=QUESTION:|$)/g, '');

    // 괄호 안의 예시 부분 제거 (예: 샤넬 No.5, 톰포드 블랙 오키드)
    cleanContent = cleanContent.replace(/\([^)]*예[^)]*\)/g, '');

    // 물음표로 분리해서 각 질문을 개별적으로 확인
    const questionParts = cleanContent.split('?').filter(part => part.trim());
    
    if (questionParts.length > 0) {
      // 각 질문 후보들을 정리
      const questionCandidates = questionParts.map(part => {
        // 마지막 문장만 추출 (이전 설명 제거)
        const sentences = part.split(/[.!]/).filter(s => s.trim());
        const lastSentence = sentences[sentences.length - 1]?.trim();
        return lastSentence ? (lastSentence.endsWith('!') ? lastSentence : lastSentence + '?') : '';
      }).filter(q => q.length > 0);

      // 완전한 질문 우선 선택 (주어와 서술어가 있는)
      const completeQuestions = questionCandidates.filter(q => {
        const wordCount = q.split(' ').length;
        return wordCount >= 5 && // 최소 5단어 이상
               wordCount <= 25 && // 최대 25단어 이하
               !q.includes('사용자님께서') &&
               !q.includes('이전 분석에서') &&
               !q.includes('말씀해주셨는데요') &&
               !q.includes('궁금합니다') &&
               !q.includes('라이프스타일') &&
               !q.includes('빛을 발할지') &&
               !/^\d+[,\s]/.test(q) && // 숫자로 시작하는 문장 제외
               !/^[,\s]*\)/.test(q) && // 괄호로 시작하는 문장 제외
               (q.includes('어떤') || q.includes('무엇') || q.includes('몇') || 
                q.includes('언제') || q.includes('어디') || q.includes('왜') ||
                q.includes('알려주세요') || q.includes('말씀해주세요') ||
                q.includes('가요') || q.includes('나요') || q.includes('습니까') ||
                q.includes('있나요') || q.includes('있으신가요'));
      });

      if (completeQuestions.length > 0) {
        // 가장 자연스럽고 완전한 질문 선택
        return completeQuestions[0];
      }

      // 완전한 질문이 없으면 유효한 질문 중 가장 적절한 것 선택
      const validQuestions = questionCandidates.filter(q => {
        const wordCount = q.split(' ').length;
        return wordCount >= 3 && 
               wordCount <= 20 &&
               !/^\d+[,\s]/.test(q) &&
               !/^[,\s]*\)/.test(q);
      });

      if (validQuestions.length > 0) {
        return validQuestions[0];
      }
    }

    // 줄바꿈으로 분리해서 완전한 질문 라인 찾기
    const lines = cleanContent.split('\n').map(line => line.trim()).filter(line => line);
    
    const completeQuestionLines = lines.filter(line => {
      const wordCount = line.split(' ').length;
      return wordCount >= 5 && 
             wordCount <= 20 &&
             (line.includes('?') || line.includes('!') || line.includes('알려주세요') || line.includes('말씀해주세요')) &&
             !line.includes('사용자님께서') &&
             !line.includes('이전 분석에서') &&
             !line.includes('라이프스타일') &&
             !/^\d+[,\s]/.test(line) &&
             !line.includes('(예:') &&
             (line.includes('어떤') || line.includes('무엇') || line.includes('브랜드') || 
              line.includes('제품명') || line.includes('사용') || line.includes('경험'));
    });

    if (completeQuestionLines.length > 0) {
      const question = completeQuestionLines[0];
      return (question.endsWith('?') || question.endsWith('!')) ? question : question + '?';
    }

    // 마지막 시도: 핵심 키워드가 포함된 완전한 문장 찾기
    const sentences = cleanContent.split(/[.!?]/).map(s => s.trim()).filter(s => s);
    const coreQuestions = sentences.filter(sentence => {
      const wordCount = sentence.split(' ').length;
      return wordCount >= 5 &&
             wordCount <= 15 &&
             !/^\d+[,\s]/.test(sentence) &&
             (sentence.includes('어떤') || sentence.includes('무엇') || 
              sentence.includes('언제') || sentence.includes('어디') ||
              sentence.includes('가격') || sentence.includes('상황') ||
              sentence.includes('계절') || sentence.includes('브랜드') ||
              sentence.includes('사용') || sentence.includes('경험'));
    });

    if (coreQuestions.length > 0) {
      const question = coreQuestions[0];
      return (question.endsWith('?') || question.endsWith('!')) ? question : question + '?';
    }
    
    // 질문을 찾지 못한 경우 기본 질문 반환
    return '추가로 알려주실 내용이 있나요?';
  }, []);

  // 현재 표시할 질문 가져오기
  const getCurrentQuestion = useCallback(() => {
    const defaultQuestion = '지금까지 사용해본 향수의 브랜드와 제품명을 모두 알려주세요!';
    
    // recommendation_ready 단계에서는 질문 대신 완료 메시지 표시
    if (conversationState.stage === 'recommendation_ready') {
      return '분석이 완료되었습니다! 맞춤 향수 추천을 확인해보세요.';
    }
    
    if (messages && Array.isArray(messages) && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.type === 'bot' && lastMessage?.content) {
        const extracted = extractQuestion(lastMessage.content);
        return extracted;
      }
    }
    return defaultQuestion;
  }, [messages, conversationState.stage, extractQuestion]);

  // 타이핑 애니메이션 함수
  const typeText = useCallback((text: string, callback?: () => void) => {
    if (isTyping || text === lastTypedQuestion) return;
    
    setIsTyping(true);
    setTypingText('');
    setLastTypedQuestion(text);
    let index = 0;
    
    const typing = setInterval(() => {
      if (index < text.length) {
        setTypingText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typing);
        setIsTyping(false);
        setHasTypedInitial(true);
        if (callback) callback();
      }
    }, 100);
    
    return () => clearInterval(typing);
  }, [isTyping, lastTypedQuestion]);

  // 질문 타이핑 및 예시 답안 추출 관리
  useEffect(() => {
    if (!hasTypedInitial && !isTyping) {
      // 초기 질문 타이핑
      const currentQuestion = getCurrentQuestion();
      typeText(currentQuestion);
    } else if (hasTypedInitial && messages && Array.isArray(messages) && messages.length > 0 && !isTyping) {
      // 새로운 AI 메시지가 있을 때만 타이핑
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.type === 'bot' && lastMessage?.content) {
        const currentQuestion = getCurrentQuestion();
        typeText(currentQuestion);
        
        // 예시 답안 추출
        const examples = extractExamples(lastMessage.content);
        if (examples.length > 0) {
          setExampleAnswers(examples);
        }
      }
    }
  }, [hasTypedInitial, isTyping, messages, getCurrentQuestion, typeText, extractExamples]);

  return {
    typingText,
    isTyping,
    hasTypedInitial,
    exampleAnswers,
    extractExamples,
    extractQuestion,
    getCurrentQuestion,
    typeText
  };
} 