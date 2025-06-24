import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, writeBatch } from 'firebase/firestore';

export async function DELETE() {
  try {
    console.log('🗑️ Firebase Clean 컬렉션 삭제 시작...');
    
    const collectionRef = collection(db, 'danawa-fragrances-clean');
    const snapshot = await getDocs(collectionRef);
    
    console.log(`📦 삭제할 문서 개수: ${snapshot.size}개`);
    
    if (snapshot.size === 0) {
      return NextResponse.json({
        success: true,
        message: '삭제할 데이터가 없습니다.',
        deletedCount: 0
      });
    }
    
    // 배치로 삭제 (한 번에 최대 500개)
    const batches = [];
    let currentBatch = writeBatch(db);
    let batchCount = 0;
    
    snapshot.docs.forEach((doc) => {
      currentBatch.delete(doc.ref);
      batchCount++;
      
      if (batchCount === 500) {
        batches.push(currentBatch);
        currentBatch = writeBatch(db);
        batchCount = 0;
      }
    });
    
    if (batchCount > 0) {
      batches.push(currentBatch);
    }
    
    // 모든 배치 실행
    await Promise.all(batches.map(batch => batch.commit()));
    
    console.log(`🗑️ ${snapshot.size}개 문서 삭제 완료`);
    
    return NextResponse.json({
      success: true,
      message: `Clean 컬렉션에서 ${snapshot.size}개 문서를 삭제했습니다.`,
      deletedCount: snapshot.size
    });
    
  } catch (error) {
    console.error('❌ 삭제 실패:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : '알 수 없는 오류',
        deletedCount: 0
      }, 
      { status: 500 }
    );
  }
} 