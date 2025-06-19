'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { FlaskConical, Microscope, Bot, Sparkles } from 'lucide-react';

export default function HomePage() {
  const [isStarting, setIsStarting] = useState(false);

  const handleStartChat = async () => {
    setIsStarting(true);
    try {
      // 챗봇 페이지로 이동
      window.location.href = '/chat';
    } catch (error) {
      console.error('챗봇 시작 중 오류:', error);
      setIsStarting(false);
    }
  };

  return (
    <div className="lab-page bg-lab-paper">
      <div className="lab-container py-16">
        {/* 헤더 섹션 */}
        <div className="text-center mb-20 lab-paper-holes pl-12 animate-fade-in">
          <div className="lab-stamp inline-block mb-8 hover:rotate-0 transition-transform duration-300">
            EXPERIMENTAL AI LAB
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-lab-black mb-6 font-serif tracking-tight">
            ScentNote
          </h1>
          
          <h2 className="text-2xl md:text-3xl text-lab-gray-700 mb-8 font-mono">
            AI 향수 연구소 🧪
          </h2>
          
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-lab-gray-600 leading-relaxed mb-8 font-mono">
              실험실의 AI 향수 전문가와 대화하며 <br />
              당신만의 향수 프로필을 발견하고 맞춤형 추천을 받아보세요.
            </p>
            
            <div className="border-t border-b border-lab-gray-300 py-4 border-dashed mb-8">
              <p className="text-sm text-lab-gray-500 font-mono">
                🤖 AI 전문가와 실시간 대화 • 🧠 개인화된 분석 • 🎯 맞춤 추천
              </p>
            </div>

            {/* AI 챗봇 시작하기 버튼 */}
            <div className="max-w-md mx-auto">
              <Button 
                variant="primary" 
                size="lg" 
                className="w-full text-lg py-4 bg-lab-black hover:bg-lab-gray-800 text-lab-white font-mono transition-all duration-300 hover:scale-105 shadow-lg"
                onClick={handleStartChat}
                disabled={isStarting}
              >
                {isStarting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-lab-white/30 border-t-lab-white rounded-full animate-spin"></div>
                    AI 전문가 호출 중...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    AI 향수 전문가와 대화하기
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* AI 챗봇 특징 설명 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          <Card className="group hover:shadow-lg transition-all duration-300 border-lab-gray-300 bg-lab-cream/50 animate-slide-up">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-16 h-16 bg-lab-black rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Bot className="w-8 h-8 text-lab-white" />
              </div>
              <div className="lab-stamp mx-auto mb-3 text-xs">AI EXPERT</div>
              <CardTitle className="text-xl font-mono">개인 맞춤 대화</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="font-mono text-sm text-lab-gray-600">
                AI 향수 전문가가 당신의 취향과 
                경험을 자연스럽게 파악합니다.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-lab-gray-300 bg-lab-cream/50 animate-slide-up" style={{animationDelay: '0.1s'}}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-16 h-16 bg-lab-black rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Microscope className="w-8 h-8 text-lab-white" />
              </div>
              <div className="lab-stamp mx-auto mb-3 text-xs">REAL-TIME</div>
              <CardTitle className="text-xl font-mono">실시간 분석</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="font-mono text-sm text-lab-gray-600">
                대화를 통해 실시간으로 취향을 
                분석하고 패턴을 찾아냅니다.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-lab-gray-300 bg-lab-cream/50 animate-slide-up" style={{animationDelay: '0.2s'}}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-16 h-16 bg-lab-black rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-8 h-8 text-lab-white" />
              </div>
              <div className="lab-stamp mx-auto mb-3 text-xs">INTELLIGENT</div>
              <CardTitle className="text-xl font-mono">스마트 추천</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="font-mono text-sm text-lab-gray-600">
                대화 내용을 바탕으로 가장 적합한 
                향수를 지능적으로 추천합니다.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* 대화 예시 */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="lab-stamp text-center mb-8">CONVERSATION PREVIEW</div>
          <Card className="bg-lab-cream/30 border-lab-gray-300">
            <CardHeader>
              <CardTitle className="text-center font-mono">AI 전문가와의 대화 미리보기</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-lab-black rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-lab-white" />
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="font-mono text-sm">안녕하세요! 저는 ScentNote 실험실의 AI 향수 전문가입니다. 당신만의 완벽한 향수를 찾아드리기 위해 몇 가지 질문을 드릴게요. 먼저, 평소 어떤 향수를 사용해보셨나요?</p>
                </div>
              </div>
              <div className="flex items-start gap-3 justify-end">
                <div className="bg-lab-black text-lab-white rounded-lg p-3 shadow-sm max-w-xs">
                  <p className="font-mono text-sm">톰포드 블랙 오키드랑 샤넬 No.5를 써봤어요</p>
                </div>
                <div className="w-8 h-8 bg-lab-gray-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">👤</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-lab-black rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-lab-white" />
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="font-mono text-sm">오, 정말 좋은 선택이시네요! 둘 다 클래식한 명품 향수죠. 그 중에서 어떤 게 더 마음에 드셨나요? 그리고 어떤 점이 좋으셨는지 자세히 알려주세요.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 하단 노트 */}
        <div className="text-center border-t border-lab-gray-300 border-dashed pt-12">
          <div className="max-w-2xl mx-auto space-y-3">
            <p className="text-xs text-lab-gray-500 font-mono">
              * AI와의 모든 대화는 안전하게 암호화되어 저장되며, 개인 맞춤 분석 목적으로만 사용됩니다.
            </p>
            <p className="text-xs text-lab-gray-500 font-mono">
              ** AI 추천은 개인의 취향 분석에 기반한 것으로, 참고용으로만 사용해주세요.
            </p>
            <div className="pt-4">
              <div className="lab-stamp inline-block text-xs">
                POWERED BY AI • SCENTNOTE LAB © 2024
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 