import React from 'react';

export function ProcessSection() {
  const processes = [
    { step: '01', title: '초기 상담', desc: '향수 경험과 선호도 파악', icon: '🔬' },
    { step: '02', title: '데이터 수집', desc: '개인 취향 패턴 분석', icon: '📊' },
    { step: '03', title: '성분 매칭', desc: '과학적 향료 조합 연구', icon: '🧪' },
    { step: '04', title: '결과 도출', desc: '최적화된 향수 추천', icon: '✨' }
  ];

  return (
    <div className="mono-section">
      <div className="text-center mb-32 relative z-10">
        <div className="mono-badge mb-8">
          Research Process
        </div>
        
        <h2 className="mono-subheading mb-16">
          4단계 과학적 분석 프로세스
        </h2>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {processes.map((item, index) => (
              <div key={index} className="relative">
                <div className="mono-card p-6 text-center hover:shadow-mono transition-all duration-300">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <div className="text-3xl font-bold mono-text mb-4">{item.step}</div>
                  <h3 className="text-lg font-semibold text-mono-900 mb-2">{item.title}</h3>
                  <p className="text-mono-600 text-sm">{item.desc}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-accent"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 