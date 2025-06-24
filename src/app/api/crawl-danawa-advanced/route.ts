import { NextRequest, NextResponse } from 'next/server';
import { startAdvancedDanawaCrawling } from '@/lib/danawa-advanced-crawler';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 고급 다나와 크롤링 API 호출됨');
    
    // 요청 본문에서 설정 가져오기
    const body = await request.json().catch(() => ({}));
    const targetCount = body.targetCount || 1000;
    
    console.log(`🎯 목표 크롤링 개수: ${targetCount}개`);
    
    // 크롤링 실행
    const result = await startAdvancedDanawaCrawling(targetCount);
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ 고급 다나와 크롤링 실패:', error);
    return NextResponse.json({
      success: false,
      totalProducts: 0,
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}

// 크롤링 상태 확인 API
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ready',
    message: '고급 다나와 크롤링 준비 완료',
    features: [
      'Playwright + Stealth Plugin',
      '실시간 진행률 모니터링',
      '스마트 지연 시스템',
      'Firebase 실시간 저장',
      '에러 복구 메커니즘'
    ]
  });
} 