import { NextRequest, NextResponse } from 'next/server';
import { startCleanDanawaCrawling } from '@/lib/danawa-clean-crawler';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 깨끗한 다나와 크롤링 API 호출됨');
    
    const body = await request.json();
    const targetCount = body.targetCount || 1000;
    const startPage = body.startPage || 1;
    
    console.log(`🎯 목표 크롤링 개수: ${targetCount}개`);
    console.log(`📖 시작 페이지: ${startPage}페이지`);
    
    const result = await startCleanDanawaCrawling(targetCount, startPage);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ 크롤링 API 에러:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : '알 수 없는 오류',
        totalProducts: 0
      }, 
      { status: 500 }
    );
  }
} 