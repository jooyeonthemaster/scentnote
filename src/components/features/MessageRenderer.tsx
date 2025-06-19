import React from 'react';

interface MessageRendererProps {
  content: string;
  type: 'bot' | 'user';
}

// 마크다운 링크를 JSX 링크로 변환하는 함수
function renderMarkdownLinks(text: string) {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    // 링크 이전 텍스트 추가
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    
    // 링크 추가
    parts.push(
      <a
        key={match.index}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium transition-colors"
      >
        {match[1]}
      </a>
    );
    
    lastIndex = linkRegex.lastIndex;
  }
  
  // 마지막 남은 텍스트 추가
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  
  return parts.length > 1 ? parts : text;
}

export function MessageRenderer({ content, type }: MessageRendererProps) {
  if (type === 'user') {
    return (
      <p className="font-mono text-sm whitespace-pre-wrap">
        {content}
      </p>
    );
  }

  // AI 메시지의 구조화된 렌더링
  const renderStructuredContent = (text: string) => {
    // 새로운 형식 파싱
    const questionMatch = text.match(/QUESTION:\s*([\s\S]*?)(?=EXPLANATION:|OPTIONS:|ANALYSIS_START|$)/);
    const explanationMatch = text.match(/EXPLANATION:\s*([\s\S]*?)(?=QUESTION:|OPTIONS:|ANALYSIS_START|$)/);
    const optionsMatch = text.match(/OPTIONS:\s*([\s\S]*?)(?=QUESTION:|EXPLANATION:|ANALYSIS_START|$)/);
    
    // 추천 단계 새로운 형식 파싱
    const analysisMatch = text.match(/ANALYSIS_START([\s\S]*?)ANALYSIS_END/);
    const recommendationMatch = text.match(/RECOMMENDATION_START([\s\S]*?)RECOMMENDATION_END/);
    const tipsMatch = text.match(/TIPS_START([\s\S]*?)TIPS_END/);

    // 추천 단계인 경우
    if (analysisMatch || recommendationMatch || tipsMatch) {
      return (
        <div className="space-y-4">
          {analysisMatch && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 bg-slate-600 text-white rounded-full flex items-center justify-center text-sm font-bold">🔬</span>
                <h3 className="font-bold text-slate-800 text-lg">분석 결과</h3>
              </div>
              <div className="space-y-2">
                {analysisMatch[1].trim().split('\n').filter(line => line.trim()).map((line, index) => (
                  <div key={index} className="flex items-start gap-3 text-sm">
                    <span className="w-1 h-1 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-slate-700">{line.trim()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {recommendationMatch && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold">💎</span>
                <h3 className="font-bold text-emerald-800 text-lg">맞춤 향수 추천</h3>
              </div>
              <div className="space-y-4">
                {recommendationMatch[1].trim().split('\n\n').filter(section => section.trim()).map((section, index) => {
                  const lines = section.trim().split('\n').filter(line => line.trim());
                  if (lines.length < 5) return null;
                  
                  const title = lines[0];
                  const matching = lines.find(line => line.includes('매칭도:'))?.replace('매칭도:', '').trim();
                  const reason = lines.find(line => line.includes('추천이유:'))?.replace('추천이유:', '').trim();
                  const notes = lines.find(line => line.includes('주요노트:'))?.replace('주요노트:', '').trim();
                  const situation = lines.find(line => line.includes('추천상황:'))?.replace('추천상황:', '').trim();
                  const buyLink = lines.find(line => line.includes('구매링크:'))?.replace('구매링크:', '').trim();
                  
                  return (
                    <div key={index} className="border border-emerald-200 rounded-lg p-4 bg-white">
                      <div className="font-bold text-emerald-900 mb-2 text-lg">{title}</div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-1 rounded">매칭도</span>
                          <span className="font-medium text-emerald-800">{matching}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div>
                          <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded mr-2">추천 이유</span>
                          <span className="text-sm text-gray-700">{reason}</span>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded mr-2">주요 노트</span>
                          <span className="text-sm text-gray-700">{notes}</span>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded mr-2">추천 상황</span>
                          <span className="text-sm text-gray-700">{situation}</span>
                        </div>
                      </div>
                      
                      {buyLink && (
                        <div className="pt-2 border-t border-emerald-200">
                          {renderMarkdownLinks(buyLink)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {tipsMatch && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">📋</span>
                <h3 className="font-bold text-blue-800 text-lg">개인 맞춤 사용 팁</h3>
              </div>
              <div className="text-sm text-blue-700 whitespace-pre-wrap">
                {tipsMatch[1].trim()}
              </div>
            </div>
          )}
        </div>
      );
    }

    // 일반 질문 단계인 경우
    if (questionMatch || explanationMatch || optionsMatch) {
      return (
        <div className="space-y-3">
          {questionMatch && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">💬</span>
                <span className="text-sm font-bold text-amber-800">질문</span>
              </div>
              <p className="text-amber-900 font-medium">
                {questionMatch[1].trim()}
              </p>
            </div>
          )}
          
          {explanationMatch && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">💡</span>
                <span className="text-sm font-bold text-blue-800">설명</span>
              </div>
              <p className="text-blue-700">
                {explanationMatch[1].trim()}
              </p>
            </div>
          )}
          
          {optionsMatch && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">📝</span>
                <span className="text-sm font-bold text-green-800">옵션</span>
              </div>
              <div className="text-green-700">
                {optionsMatch[1].trim().split('\n').filter(line => line.trim()).map((option, index) => (
                  <div key={index} className="flex items-start gap-2 mb-1">
                    <span className="text-green-500 mt-1">•</span>
                    <span>{option.trim()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* 구조화되지 않은 나머지 텍스트 */}
          {(() => {
            let remainingText = text;
            if (questionMatch) remainingText = remainingText.replace(/QUESTION:\s*([\s\S]*?)(?=EXPLANATION:|OPTIONS:|$)/, '');
            if (explanationMatch) remainingText = remainingText.replace(/EXPLANATION:\s*([\s\S]*?)(?=QUESTION:|OPTIONS:|$)/, '');
            if (optionsMatch) remainingText = remainingText.replace(/OPTIONS:\s*([\s\S]*?)(?=QUESTION:|EXPLANATION:|$)/, '');
            remainingText = remainingText.trim();
            
            if (remainingText) {
              return (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {remainingText}
                  </p>
                </div>
              );
            }
            return null;
          })()}
        </div>
      );
    }

    // 구조화되지 않은 메시지는 기본 렌더링
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="font-mono text-sm whitespace-pre-wrap text-gray-700">
          {text}
        </p>
      </div>
    );
  };

  return renderStructuredContent(content);
} 