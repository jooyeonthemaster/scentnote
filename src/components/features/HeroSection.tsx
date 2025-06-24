import React from 'react';

interface HeroSectionProps {
  onStartChat: () => void;
}

export function HeroSection({ onStartChat }: HeroSectionProps) {
  return (
    <div className="text-center mb-8 relative z-10">
      <h1 className="mono-heading mb-8 animate-fade-in">
        ScentNote
      </h1>
      <div className="max-w-3xl mx-auto mb-12">
        <p className="text-xl text-mono-600 leading-relaxed mb-8 animate-slide-up">
          AI 기술을 바탕으로 당신의 취향을 겨냥하는 향수를 찾아드립니다.
        </p>
        
        <div className="flex flex-wrap justify-center gap-6 text-sm text-mono-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-mono-700"></div>
            과학적 AI 분석
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-mono-800"></div>
            실시간 연구 상담
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-mono-900"></div>
            정밀한 성분 매칭
          </div>
        </div>
      </div>
    </div>
  );
} 