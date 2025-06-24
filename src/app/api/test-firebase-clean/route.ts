import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

export async function GET() {
  try {
    console.log('🧪 Firebase Clean 데이터 확인 테스트 시작...');
    
    // 1. 전체 데이터 개수 확인
    const collectionRef = collection(db, 'danawa-fragrances-clean');
    const allSnapshot = await getDocs(collectionRef);
    console.log(`📦 Clean 컬렉션 전체 데이터 개수: ${allSnapshot.size}개`);
    
    // 2. 최근 10개 데이터 확인
    const recentQuery = query(
      collectionRef, 
      orderBy('crawledAt', 'desc'), 
      limit(10)
    );
    const recentSnapshot = await getDocs(recentQuery);
    const recentData = recentSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      crawledAt: doc.data().crawledAt?.toDate?.()?.toISOString() || doc.data().crawledAt
    }));
    
    console.log(`📋 Clean 컬렉션 최근 10개 데이터:`, recentData.map(d => ({ id: d.id, name: (d as any).name })));
    
    return NextResponse.json({
      success: true,
      totalCount: allSnapshot.size,
      recentData: recentData,
      message: `Clean 컬렉션에 ${allSnapshot.size}개의 데이터가 있습니다`
    });
    
  } catch (error) {
    console.error('❌ Firebase Clean 데이터 확인 실패:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : '알 수 없는 오류',
        totalCount: 0,
        recentData: []
      }, 
      { status: 500 }
    );
  }
} 