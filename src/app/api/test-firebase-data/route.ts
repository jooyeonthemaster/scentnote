import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

export async function GET() {
  try {
    console.log('🧪 Firebase 데이터 확인 테스트 시작...');
    
    // 1. 전체 데이터 개수 확인
    const collectionRef = collection(db, 'danawa-fragrances-clean');
    const allSnapshot = await getDocs(collectionRef);
    console.log(`📦 전체 데이터 개수: ${allSnapshot.size}개`);
    
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
    
    console.log(`📋 최근 10개 데이터:`, recentData.map(d => ({ id: d.id, name: (d as any).name })));
    
    // 3. 컬렉션 내 모든 문서 ID 확인 (처음 20개만)
    const first20 = allSnapshot.docs.slice(0, 20).map(doc => ({
      id: doc.id,
      name: doc.data().name,
      pageNumber: doc.data().pageNumber
    }));
    
    return NextResponse.json({
      success: true,
      totalCount: allSnapshot.size,
      recentData: recentData,
      first20Documents: first20,
      message: `Firebase 연결 성공! 총 ${allSnapshot.size}개 데이터 확인됨`
    });
    
  } catch (error) {
    console.error('❌ Firebase 테스트 실패:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      message: 'Firebase 연결 실패'
    }, { status: 500 });
  }
} 