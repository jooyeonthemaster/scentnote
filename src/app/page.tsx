'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/store/useChatStore';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { HeroSection } from '@/components/features/HeroSection';
import { InteractiveConsultation } from '@/components/features/InteractiveConsultation';
import { FeatureShowcase } from '@/components/features/FeatureShowcase';
import { ProcessSection } from '@/components/features/ProcessSection';
import { ConversationPreview } from '@/components/features/ConversationPreview';
import { CTASection } from '@/components/features/CTASection';

export default function HomePage() {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const { resetChat } = useChatStore();
  const { resetAnalysis } = useAnalysisStore();

  const handleStartChat = async () => {
    setIsStarting(true);
    try {
      // 채팅과 분석 상태 초기화
      resetChat();
      resetAnalysis();
      
      // 채팅 페이지로 이동
      router.push('/chat');
    } catch (error) {
      console.error('채팅 시작 오류:', error);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <main className="min-h-screen">
      <div className="mono-container py-12">
        {/* 히어로 섹션 */}
        <HeroSection onStartChat={handleStartChat} />

        {/* AI 질문을 더 상단으로 이동 - 새로운 인터랙티브 상담 인터페이스 */}
        <div className="mb-16">
          <InteractiveConsultation onStartChat={handleStartChat} />
        </div>

        {/* 기능 소개 섹션 */}
        <FeatureShowcase />

        {/* 프로세스 섹션 */}
        <ProcessSection />

        {/* 대화 미리보기 섹션 */}
        <ConversationPreview />

        {/* 하단 CTA */}
        <CTASection onStartChat={handleStartChat} isStarting={isStarting} />
      </div>
    </main>
  );
} 