import React from 'react';
import { Brain } from 'lucide-react';

export function ConversationPreview() {
  return (
    <div className="mono-section">
      <div className="max-w-4xl mx-auto mb-32 relative z-10">
        <div className="text-center mb-12">
          <div className="mono-badge mb-6">
            Conversation Preview
          </div>
          <h2 className="mono-subheading">
            AI 연구원과의 실제 상담 미리보기
          </h2>
        </div>

        <div className="mono-card p-8">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-accent flex items-center justify-center flex-shrink-0 shadow-soft">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="mono-card p-4 flex-1 bg-white/90">
                <p className="text-mono-900">
                  안녕하세요! 저는 ScentNote 연구소의 AI 향수 연구원입니다. 🔬
                  <br /><br />
                  과학적인 방법으로 당신만의 완벽한 향수를 찾아드리겠습니다. 
                  먼저, 평소 사용해보신 향수가 있으신가요?
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 justify-end">
              <div className="mono-card p-4 max-w-md bg-gradient-to-r from-mono-900/10 to-mono-800/10">
                <p className="text-mono-900">
                  톰포드 블랙 오키드와 샤넬 No.5를 써봤어요
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-mono-400 to-mono-500 flex items-center justify-center flex-shrink-0 shadow-soft">
                <span className="text-white text-sm">👤</span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-accent flex items-center justify-center flex-shrink-0 shadow-soft">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="mono-card p-4 flex-1 bg-white/90">
                <p className="text-mono-900">
                  훌륭한 선택이시네요! 🌟 두 향수 모두 클래식한 명품입니다. 
                  이제 성분 분석을 위해 더 자세히 알아보겠습니다. 
                  어떤 향이 더 마음에 드셨나요?
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 