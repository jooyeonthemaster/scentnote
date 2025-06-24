import React from 'react';
import { Microscope, FlaskConical, Beaker } from 'lucide-react';

export function FeatureShowcase() {
  return (
    <div className="mono-section">
      <div className="grid lg:grid-cols-3 gap-8 mb-32 relative z-10">
        <div className="interactive-card animate-slide-up" style={{animationDelay: '0.1s'}}>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-accent flex items-center justify-center floating-element shadow-soft">
              <Microscope className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-mono-900 mb-4">정밀 과학 분석</h3>
            <p className="text-mono-600 leading-relaxed">
              향수 성분과 개인 취향을 과학적으로 
              분석하여 최적의 매칭을 찾아냅니다.
            </p>
          </div>
        </div>

        <div className="interactive-card animate-slide-up" style={{animationDelay: '0.2s'}}>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-dark flex items-center justify-center floating-element shadow-soft">
              <FlaskConical className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-mono-900 mb-4">실험실급 상담</h3>
            <p className="text-mono-600 leading-relaxed">
              전문 연구원 수준의 AI가 체계적인 
              질문을 통해 당신의 향수 DNA를 분석합니다.
            </p>
          </div>
        </div>

        <div className="interactive-card animate-slide-up" style={{animationDelay: '0.3s'}}>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-accent flex items-center justify-center floating-element shadow-soft">
              <Beaker className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-mono-900 mb-4">맞춤 조합 추천</h3>
            <p className="text-mono-600 leading-relaxed">
              수천 가지 향수 데이터와 성분 분석을 통해 
              당신에게 완벽한 향수를 추천합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 