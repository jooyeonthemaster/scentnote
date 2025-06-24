import { NextRequest, NextResponse } from 'next/server';
import { startFirecrawlCrawling, startDanawaCrawling } from '@/lib/firecrawl-service';

export async function POST(request: NextRequest) {
  try {
    // 환경변수에서 Firecrawl API 키 가져오기
    const apiKey = process.env.FIRECRAWL_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'Firecrawl API 키가 설정되지 않았습니다. env.txt에 FIRECRAWL_API_KEY를 추가해주세요.'
      }, { status: 400 });
    }

    // URL 파라미터에서 타입 확인 (우선순위)
    const { searchParams } = new URL(request.url);
    let crawlType = searchParams.get('type');
    
    // URL 파라미터가 없으면 요청 본문에서 확인
    if (!crawlType) {
      const body = await request.json().catch(() => ({}));
      crawlType = body.type;
    }
    
    // 기본값은 다나와로 변경
    crawlType = crawlType || 'danawa';

    let result;

    if (crawlType === 'danawa') {
      console.log('🔥 Firecrawl을 사용한 다나와 향수 크롤링 시작...');
      result = await startDanawaCrawling(apiKey);
    } else {
      console.log('🔥 Firecrawl을 사용한 퍼퓸그라피 크롤링 시작...');
      result = await startFirecrawlCrawling(apiKey);
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Firecrawl 크롤링 실패:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}

// 크롤링 진행 상태 확인 API
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'perfumegraphy';
  
  // 실제로는 Redis나 메모리에 저장된 진행 상태를 반환
  return NextResponse.json({
    status: 'idle',
    type: type,
    message: `${type} 크롤링 상태 확인 API`
  });
} 