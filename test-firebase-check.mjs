import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from './src/lib/firebase.ts';

async function checkRecentData() {
  try {
    const q = query(
      collection(db, 'danawa-fragrances-simple'), 
      orderBy('crawledAt', 'desc'), 
      limit(15)
    );
    const snapshot = await getDocs(q);
    
    console.log('🔍 최근 수집된 제품들:');
    console.log('===================');
    
    const products = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      products.push({
        name: data.name,
        pageNumber: data.pageNumber,
        crawledAt: data.crawledAt.toDate()
      });
    });
    
    // 페이지별로 그룹화
    const pageGroups = {};
    products.forEach(p => {
      if (!pageGroups[p.pageNumber]) pageGroups[p.pageNumber] = [];
      pageGroups[p.pageNumber].push(p.name);
    });
    
    Object.keys(pageGroups).sort().forEach(page => {
      console.log(`📄 페이지 ${page}:`);
      pageGroups[page].slice(0, 3).forEach(name => {
        console.log(`  - ${name}`);
      });
      if (pageGroups[page].length > 3) {
        console.log(`  ... 외 ${pageGroups[page].length - 3}개`);
      }
      console.log('');
    });
    
    console.log(`총 ${products.length}개 제품 확인됨`);
    
  } catch (error) {
    console.error('❌ 데이터 확인 실패:', error);
  }
}

checkRecentData(); 