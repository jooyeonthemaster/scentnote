import { NextRequest, NextResponse } from 'next/server';
import { analyzeFragrancePreference } from '@/lib/gemini';
import { FragranceFeedback, FragrancePreference } from '@/types';

export async function POST(request: NextRequest) {
  try {
    console.log('API Route 시작: /api/analyze');
    console.log('GEMINI_API_KEY 확인:', process.env.GEMINI_API_KEY ? '키 존재함' : '키 없음');
    
    const body = await request.json();
    console.log('요청 데이터 수신:', { 
      feedbacksCount: body.feedbacks?.length || 0,
      preferencesCount: body.preferences?.length || 0 
    });
    
    const { feedbacks, preferences }: { 
      feedbacks: FragranceFeedback[], 
      preferences: FragrancePreference[] 
    } = body;

    console.log('Gemini API 호출 시작...');
    const result = await analyzeFragrancePreference(feedbacks, preferences);
    console.log('Gemini API 호출 성공');
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('API Route 분석 오류:', error);
    return NextResponse.json(
      { success: false, error: '분석 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 