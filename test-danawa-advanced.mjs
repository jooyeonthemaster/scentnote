async function testAdvancedDanawaCrawling() {
  try {
    console.log('🚀 고급 다나와 향수 크롤링 테스트 시작...');
    console.log('🎯 목표: 1000개 향수 데이터 수집');
    console.log('⚡ 기술: Playwright + Stealth Plugin + Firebase');
    console.log('');

    const startTime = Date.now();
    
    const response = await fetch('http://localhost:3000/api/crawl-danawa-advanced', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        targetCount: 100 // 테스트용으로 100개만
      })
    });
    
    const data = await response.json();
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);
    
    console.log('📊 크롤링 결과:');
    console.log('=====================================');
    console.log(`✅ 성공 여부: ${data.success ? '성공' : '실패'}`);
    console.log(`📦 수집된 제품 수: ${data.totalProducts}개`);
    console.log(`⏱️ 소요 시간: ${duration}초`);
    console.log(`📝 메시지: ${data.message}`);
    
    if (data.success) {
      console.log('');
      console.log('🎉 테스트 성공! 실제 1000개 크롤링 준비 완료');
      console.log('💡 1000개 크롤링 예상 시간: 약 30-40분');
      console.log('💾 데이터는 Firebase의 "danawa-fragrances-advanced" 컬렉션에 저장됩니다');
    } else {
      console.log('');
      console.log('❌ 테스트 실패');
      if (data.error) {
        console.log(`🔍 오류 내용: ${data.error}`);
      }
    }

  } catch (error) {
    console.error('💥 테스트 중 오류 발생:', error.message);
  }
}

// 1000개 크롤링 실행 함수
async function runFullCrawling() {
  try {
    console.log('🚀 전체 다나와 향수 크롤링 시작...');
    console.log('🎯 목표: 1000개 향수 데이터 수집');
    console.log('⚠️  이 작업은 약 30-40분 소요됩니다.');
    console.log('');

    const startTime = Date.now();
    
    const response = await fetch('http://localhost:3000/api/crawl-danawa-advanced', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        targetCount: 1000
      })
    });
    
    const data = await response.json();
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 60000).toFixed(1); // 분 단위
    
    console.log('📊 최종 크롤링 결과:');
    console.log('=====================================');
    console.log(`✅ 성공 여부: ${data.success ? '성공' : '실패'}`);
    console.log(`📦 수집된 제품 수: ${data.totalProducts}개`);
    console.log(`⏱️ 총 소요 시간: ${duration}분`);
    console.log(`📝 메시지: ${data.message}`);
    
    if (data.success) {
      console.log('');
      console.log('🎉🎉🎉 1000개 크롤링 완료! 🎉🎉🎉');
      console.log('💾 모든 데이터가 Firebase에 저장되었습니다');
      console.log('🔗 Firebase 콘솔에서 "danawa-fragrances-advanced" 컬렉션을 확인하세요');
    }

  } catch (error) {
    console.error('💥 크롤링 중 오류 발생:', error.message);
  }
}

// 사용법 안내
console.log('🎯 다나와 고급 크롤러 테스트');
console.log('=====================================');
console.log('1. 테스트 실행 (100개): node test-danawa-advanced.mjs test');
console.log('2. 전체 실행 (1000개): node test-danawa-advanced.mjs full');
console.log('');

const mode = process.argv[2];

if (mode === 'test') {
  await testAdvancedDanawaCrawling();
} else if (mode === 'full') {
  await runFullCrawling();
} else {
  console.log('🔍 모드를 선택하세요:');
  console.log('  - test: 100개 테스트 크롤링');
  console.log('  - full: 1000개 전체 크롤링');
  console.log('');
  console.log('예시: node test-danawa-advanced.mjs test');
} 