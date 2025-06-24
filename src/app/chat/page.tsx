'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Bot, User, Send, RotateCcw, Home } from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';
import { ConversationProgress } from '@/components/features/ConversationProgress';
import { MessageRenderer } from '@/components/features/MessageRenderer';

export default function ChatPage() {
  const {
    messages,
    isLoading,
    error,
    conversationState,
    sendMessage,
    resetChat
  } = useChatStore();
  
  const [input, setInput] = useState('');
  const [isClient, setIsClient] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const messageContent = input.trim();
    setInput('');
    
    await sendMessage(messageContent);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const goHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="lab-page min-h-screen">
      <div className="lab-container py-8">
        {/* 헤더 */}
        <div className="text-center mb-8 lab-paper-holes pl-12">
          <div className="lab-stamp inline-block mb-4">
            AI FRAGRANCE EXPERT
          </div>
          
          <h1 className="lab-heading text-2xl md:text-3xl mb-4">
            ScentNote AI 연구소
          </h1>
          
          <div className="flex justify-center gap-4 mb-4">
            <Button variant="ghost" size="sm" onClick={goHome}>
              <Home className="w-4 h-4 mr-2" />
              홈으로
            </Button>
            <Button variant="ghost" size="sm" onClick={resetChat}>
              <RotateCcw className="w-4 h-4 mr-2" />
              대화 초기화
            </Button>
          </div>
        </div>

        {/* 채팅 영역 */}
        <div className="max-w-6xl mx-auto grid lg:grid-cols-4 gap-6">
          {/* 진행상황 사이드바 */}
          <div className="lg:col-span-1">
            <ConversationProgress conversationState={conversationState} />
          </div>
          
          {/* 메인 채팅 */}
          <div className="lg:col-span-3">
            <Card className="border-lab-gray-300 bg-lab-cream/20">
              <CardHeader className="border-b border-lab-gray-300">
                <CardTitle className="flex items-center gap-3 font-mono">
                  <div className="w-10 h-10 bg-lab-black rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-lab-white" />
                  </div>
                  정밀 취향 분석 중... 잠시만 기다려 주세요
                  {isLoading && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-lab-black/30 border-t-lab-black rounded-full animate-spin"></div>
                      <div className="w-20 bg-lab-gray-200 rounded-full h-2">
                        <div className="bg-lab-black h-2 rounded-full animate-loading-bar"></div>
                      </div>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-0">
                {/* 메시지 히스토리 */}
                <div className="h-96 md:h-[500px] overflow-y-auto p-6 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start gap-3 ${
                        message.type === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.type === 'bot' && (
                        <div className="w-8 h-8 bg-lab-black rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-lab-white" />
                        </div>
                      )}
                      
                      <div
                        className={`max-w-[80%] rounded-lg shadow-sm ${
                          message.type === 'bot'
                            ? 'bg-white border border-lab-gray-200 p-4'
                            : 'bg-lab-black text-lab-white p-3'
                        }`}
                      >
                        <MessageRenderer content={message.content} type={message.type} />
                        {isClient && (
                          <div className="mt-3 text-xs opacity-60 border-t pt-2">
                            {message.timestamp.toLocaleTimeString('ko-KR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        )}
                      </div>
                      
                      {message.type === 'user' && (
                        <div className="w-8 h-8 bg-lab-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                
                {/* 입력 영역 */}
                <div className="border-t border-lab-gray-300 p-4">
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="메시지를 입력하세요..."
                        disabled={isLoading}
                        className="w-full font-mono py-4 text-base pr-16 md:pr-4"
                      />
                      
                      {/* 모바일용 입력창 내부 전송 버튼 */}
                      <button
                        onClick={handleSendMessage}
                        disabled={!input.trim() || isLoading}
                        className="md:hidden absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-lab-black hover:bg-lab-gray-800 disabled:bg-gray-400 rounded-full flex items-center justify-center transition-colors duration-200"
                      >
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <Send className="w-5 h-5 text-white" />
                        )}
                      </button>
                    </div>
                    
                    {/* 데스크톱용 전송 버튼 */}
                    <Button
                      onClick={handleSendMessage}
                      disabled={!input.trim() || isLoading}
                      variant="primary"
                      className="hidden md:flex bg-lab-black hover:bg-lab-gray-800 py-4 text-base font-medium"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="mt-3 text-center">
                    <p className="text-xs text-lab-gray-500 font-mono">
                      💡 향수 이름, 좋아하는 향, 사용 경험 등을 자세히 알려주세요
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 하단 가이드 */}
        <div className="max-w-6xl mx-auto mt-8">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-lab-cream/30 border-lab-gray-300">
              <CardContent className="p-4 text-center">
                <div className="lab-stamp mb-2 text-xs">TIP 01</div>
                <p className="font-mono text-sm text-lab-gray-600">
                  사용해본 향수나 좋아하는 향을 구체적으로 알려주세요
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-lab-cream/30 border-lab-gray-300">
              <CardContent className="p-4 text-center">
                <div className="lab-stamp mb-2 text-xs">TIP 02</div>
                <p className="font-mono text-sm text-lab-gray-600">
                  어떤 상황에서 사용하고 싶은지 말씀해주세요
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-lab-cream/30 border-lab-gray-300">
              <CardContent className="p-4 text-center">
                <div className="lab-stamp mb-2 text-xs">TIP 03</div>
                <p className="font-mono text-sm text-lab-gray-600">
                  싫어하는 향이나 피하고 싶은 느낌도 알려주세요
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 