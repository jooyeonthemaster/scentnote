import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface CTASectionProps {
  onStartChat: () => void;
  isStarting: boolean;
}

export function CTASection({ onStartChat, isStarting }: CTASectionProps) {
  return (
    <div className="text-center relative z-10">
      <div className="mono-card p-12 max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mono-text mb-6">
          지금 바로 연구를 시작하세요
        </h2>
        <p className="text-mono-600 mb-8 text-lg">
          AI 향수 연구원이 과학적 방법으로 당신만의 향수를 찾아드립니다
        </p>
        <button 
          className="mono-button text-lg px-12 py-5"
          onClick={onStartChat}
          disabled={isStarting}
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6" />
            무료 연구 시작하기
            <ArrowRight className="w-5 h-5" />
          </div>
        </button>
        
        <div className="mt-8 text-sm text-mono-500">
          * 모든 연구 데이터는 안전하게 보호됩니다
        </div>
      </div>
    </div>
  );
} 