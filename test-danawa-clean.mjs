console.log('🎯 다나와 깨끗한 크롤러 테스트');

const args = process.argv.slice(2);
const isTest = args.includes('test');
const targetCount = isTest ? 30 : 1000;

console.log(`📊 모드: ${isTest ? '테스트 (30개)' : '전체 (1000개)'}`);

async function testCleanCrawler() {
  try {
    const response = await fetch('http://localhost:3000/api/crawl-danawa-clean', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        targetCount: 60,
        startPage: 1
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('\n🎉 크롤링 결과:');
    console.log(`✅ 성공: ${result.success}`);
    console.log(`📦 수집된 제품 수: ${result.totalProducts}개`);
    console.log(`💬 메시지: ${result.message}`);
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
  }
}

testCleanCrawler(); 