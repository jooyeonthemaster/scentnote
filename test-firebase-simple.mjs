import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs, writeBatch } from 'firebase/firestore';

// Firebase 설정
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

console.log('🔧 Firebase 설정 확인:');
console.log('- API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ 설정됨' : '❌ 누락');
console.log('- Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testFirebaseConnection() {
  try {
    console.log('\n🧪 Firebase 연결 테스트 시작...');
    
    // 1. 기존 데이터 개수 확인
    console.log('\n📊 기존 데이터 확인...');
    const collectionRef = collection(db, 'danawa-fragrances-simple');
    const snapshot = await getDocs(collectionRef);
    console.log(`📦 기존 데이터 개수: ${snapshot.size}개`);
    
    // 2. 테스트 데이터 저장
    console.log('\n💾 테스트 데이터 저장...');
    const testData = {
      id: `test-${Date.now()}`,
      name: '테스트 향수',
      brand: '테스트 브랜드',
      price: 50000,
      productUrl: 'https://test.com',
      source: 'danawa',
      crawledAt: new Date(),
      pageNumber: 1
    };
    
    const docRef = doc(collectionRef, testData.id);
    await setDoc(docRef, testData);
    console.log(`✅ 테스트 데이터 저장 완료: ${testData.id}`);
    
    // 3. 저장 후 데이터 개수 재확인
    console.log('\n📊 저장 후 데이터 확인...');
    const newSnapshot = await getDocs(collectionRef);
    console.log(`📦 저장 후 데이터 개수: ${newSnapshot.size}개`);
    
    // 4. 배치 저장 테스트
    console.log('\n🔥 배치 저장 테스트...');
    const batch = writeBatch(db);
    const batchTestData = [];
    
    for (let i = 0; i < 3; i++) {
      const batchData = {
        id: `batch-test-${Date.now()}-${i}`,
        name: `배치 테스트 향수 ${i + 1}`,
        brand: '배치 테스트 브랜드',
        price: 30000 + (i * 10000),
        productUrl: `https://test-${i}.com`,
        source: 'danawa',
        crawledAt: new Date(),
        pageNumber: 1
      };
      
      const batchDocRef = doc(collectionRef, batchData.id);
      batch.set(batchDocRef, batchData);
      batchTestData.push(batchData);
      console.log(`📝 배치 추가: ${batchData.name} (ID: ${batchData.id})`);
    }
    
    await batch.commit();
    console.log(`🔥 배치 저장 완료: ${batchTestData.length}개`);
    
    // 5. 최종 데이터 개수 확인
    console.log('\n📊 최종 데이터 확인...');
    const finalSnapshot = await getDocs(collectionRef);
    console.log(`📦 최종 데이터 개수: ${finalSnapshot.size}개`);
    
    console.log('\n✅ Firebase 테스트 완료!');
    
  } catch (error) {
    console.error('❌ Firebase 테스트 실패:', error);
    console.error('에러 상세:', error.message);
  }
}

// 테스트 실행
testFirebaseConnection(); 