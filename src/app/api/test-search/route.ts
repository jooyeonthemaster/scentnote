import { NextRequest, NextResponse } from 'next/server';
import { verifyFragranceInfoWithSearch } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { brandName, productName, budget } = await request.json();
    
    if (!brandName || !productName) {
      return NextResponse.json(
        { error: '브랜드명과 제품명이 필요합니다.' },
        { status: 400 }
      );
    }

    console.log(`🔍 Brave Search 테스트 시작: ${brandName} ${productName}`);
    
    const result = await verifyFragranceInfoWithSearch(brandName, productName, budget);
    
    console.log('✅ 검증 결과:', result);
    
    return NextResponse.json({
      success: true,
      original: {
        brand: brandName,
        product: productName
      },
      verified: result
    });

  } catch (error) {
    console.error('❌ Brave Search 테스트 실패:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST 요청으로 { "brandName": "Calvin", "productName": "Klein Defy EDT", "budget": "5만원" } 형태로 Brave Search를 테스트하세요.'
  });
} 