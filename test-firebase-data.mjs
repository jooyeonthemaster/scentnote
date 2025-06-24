import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyA-3DNvyhdLS14pOOg-TZmE7LRsM4hWpEw",
  authDomain: "scentnote-29fe7.firebaseapp.com",
  projectId: "scentnote-29fe7",
  storageBucket: "scentnote-29fe7.firebasestorage.app",
  messagingSenderId: "973575073079",
  appId: "1:973575073079:web:f4c6232fdbda1387007eb2"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkDanawaData() {
  try {
    console.log('🔍 Firebase에서 다나와 향수 데이터 조회 중...');
    
    const danawaCollection = collection(db, 'danawa-fragrances');
    const snapshot = await getDocs(danawaCollection);
    
    if (snapshot.empty) {
      console.log('❌ 다나와 향수 데이터가 없습니다.');
      return;
    }
    
    console.log(`📊 총 ${snapshot.size}개 다나와 향수 데이터 발견`);
    console.log('');
    
    snapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`📦 상품 ${index + 1}:`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   브랜드: ${data.brand}`);
      console.log(`   상품명: ${data.name}`);
      console.log(`   가격: ${data.price?.original?.toLocaleString()}원`);
      console.log(`   상품 URL: ${data.productUrl}`);
      console.log(`   소스: ${data.source}`);
      console.log(`   크롤링 시간: ${data.crawledAt?.toDate?.() || data.crawledAt}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Firebase 데이터 조회 실패:', error);
  }
}

// 실행
checkDanawaData(); 