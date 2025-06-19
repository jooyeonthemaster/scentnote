import { NextRequest, NextResponse } from 'next/server';
import { generateFragranceRecommendations } from '@/lib/gemini';
import { FragranceAnalysis, Fragrance } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { analysis, availableFragrances }: { 
      analysis: Partial<FragranceAnalysis>, 
      availableFragrances: Fragrance[] 
    } = body;

    const result = await generateFragranceRecommendations({
      analysis,
      availableFragrances
    });
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('API Route 추천 오류:', error);
    return NextResponse.json(
      { success: false, error: '추천 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 