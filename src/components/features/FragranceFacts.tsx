import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, Zap, Star, Brain, Clock } from 'lucide-react';

interface FragranceFactsProps {
  onComplete?: () => void;
}

const FRAGRANCE_FACTS = [
  {
    icon: Sparkles,
    title: "향수의 마법",
    content: "코코 샤넬의 No.5는 실험실에서 우연히 탄생했습니다. 조향사가 실수로 알데하이드를 10배나 넣었지만, 이것이 오히려 전설적인 향수를 만들어냈죠! 🧪✨",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Heart,
    title: "사랑의 화학",
    content: "향수는 실제로 사람의 페로몬과 상호작용합니다. 같은 향수라도 사람마다 다르게 느껴지는 이유가 바로 이것! 당신만의 고유한 향이 만들어지고 있어요 💕",
    color: "from-red-500 to-pink-500"
  },
  {
    icon: Brain,
    title: "기억의 열쇠",
    content: "후각은 뇌의 기억과 감정을 담당하는 부위와 직접 연결되어 있습니다. 특정 향수를 맡으면 10년 전 추억이 생생하게 떠오르는 이유죠! 🧠💭",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Zap,
    title: "향의 파워",
    content: "라벤더 향은 실제로 혈압을 낮추고, 바닐라 향은 스트레스를 줄인다는 연구 결과가 있습니다. 향수는 단순한 향이 아니라 웰빙 도구예요! ⚡️🌿",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Star,
    title: "향수의 비밀",
    content: "가장 비싼 향수 재료는 '아가우드(침향)'로, 1그램에 무려 50만원! 이 나무는 자연적으로 감염될 때만 특별한 향을 만들어냅니다 🌟💎",
    color: "from-yellow-500 to-orange-500"
  },
  {
    icon: Clock,
    title: "시간의 예술",
    content: "향수는 시간에 따라 3단계로 변화합니다. 탑노트(첫 5분) → 미들노트(30분-2시간) → 베이스노트(2-8시간). 마치 하루 종일 변화하는 향의 일기장이에요! ⏰📖",
    color: "from-indigo-500 to-purple-500"
  },
  {
    icon: Sparkles,
    title: "향수의 숨겨진 역사",
    content: "클레오파트라는 배를 향수로 적신 돛으로 장식해 안토니우스를 유혹했다고 합니다. 진짜 향수 마케팅의 원조죠! 🚢👑 향수가 단순한 향이 아니라 권력과 매혹의 도구였어요.",
    color: "from-amber-500 to-orange-500"
  },
  {
    icon: Heart,
    title: "향수와 사랑의 과학",
    content: "연구에 따르면 커플이 서로의 향수를 좋아할 확률은 97%! 사랑에 빠지면 상대방의 향도 더 좋게 느껴진답니다. 향수는 사랑의 화학 반응이에요! 💕🧬",
    color: "from-pink-500 to-rose-500"
  },
  {
    icon: Brain,
    title: "향수의 신비한 능력",
    content: "향수는 시간여행을 가능하게 합니다! 특정 향을 맡으면 뇌에서 그 시절의 기억과 감정이 생생하게 되살아나죠. 이를 '프루스트 효과'라고 불러요! 🕰️✨",
    color: "from-teal-500 to-cyan-500"
  }
];

export function FragranceFacts({ onComplete }: FragranceFactsProps) {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentFactIndex((prev) => {
          const nextIndex = (prev + 1) % FRAGRANCE_FACTS.length;
          if (nextIndex === 0 && onComplete) {
            onComplete();
          }
          return nextIndex;
        });
        setIsVisible(true);
      }, 300);
    }, 4000); // 4초마다 변경

    return () => clearInterval(interval);
  }, [onComplete]);

  const currentFact = FRAGRANCE_FACTS[currentFactIndex];
  const IconComponent = currentFact.icon;

  return (
    <div className="max-w-2xl mx-auto">
      <div className={`transform transition-all duration-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center shadow-2xl">
          {/* 아이콘과 제목 */}
          <div className="mb-6">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${currentFact.color} flex items-center justify-center shadow-lg`}>
              <IconComponent className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-mono-900 mb-2">{currentFact.title}</h3>
          </div>
          
          {/* 내용 */}
          <p className="text-lg text-mono-700 leading-relaxed mb-6">
            {currentFact.content}
          </p>
          
          {/* 진행 표시기 */}
          <div className="flex justify-center gap-2">
            {FRAGRANCE_FACTS.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentFactIndex 
                    ? `bg-gradient-to-r ${currentFact.color}` 
                    : 'bg-mono-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* 추가 시각적 효과 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-1/4 left-1/4 w-2 h-2 bg-gradient-to-r ${currentFact.color} rounded-full animate-ping opacity-30`} />
        <div className={`absolute top-3/4 right-1/4 w-1 h-1 bg-gradient-to-r ${currentFact.color} rounded-full animate-pulse opacity-40`} />
        <div className={`absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-gradient-to-r ${currentFact.color} rounded-full animate-bounce opacity-20`} />
      </div>
    </div>
  );
} 