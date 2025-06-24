async function testDanawaCrawling() {
  try {
    console.log('🔥 다나와 향수 크롤링 시작...');
    
    const response = await fetch('http://localhost:3000/api/crawl-perfumes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'danawa'
      })
    });
    
    const data = await response.text();
    console.log('📊 응답 상태:', response.status);
    console.log('📊 응답 데이터:', data);
    
    if (response.ok) {
      console.log('✅ 다나와 크롤링 API 호출 성공!');
      
      // JSON 파싱 시도
      try {
        const jsonData = JSON.parse(data);
        if (jsonData.success) {
          console.log(`🎉 총 ${jsonData.totalProducts}개 상품 크롤링 완료!`);
          console.log(`📝 메시지: ${jsonData.message}`);
        } else {
          console.log(`❌ 크롤링 실패: ${jsonData.error}`);
        }
      } catch (parseError) {
        console.log('⚠️ JSON 파싱 실패, 원본 응답:', data);
      }
      
    } else {
      console.log('❌ 다나와 크롤링 실패:', response.status);
    }
    
  } catch (error) {
    console.error('💥 에러 발생:', error.message);
  }
}

// 크롤링 상태 확인 함수
async function checkDanawaCrawlingStatus() {
  try {
    console.log('📊 다나와 크롤링 상태 확인...');
    
    const response = await fetch('http://localhost:3000/api/crawl-perfumes?type=danawa', {
      method: 'GET'
    });
    
    const data = await response.json();
    console.log('📈 크롤링 상태:', data);
    
  } catch (error) {
    console.error('💥 상태 확인 에러:', error.message);
  }
}

// 메인 실행
console.log('🚀 다나와 향수 크롤링 테스트 시작');
console.log('📋 목표: 다나와에서 "리뷰 많은 순"으로 향수 1000개 크롤링');
console.log('📋 추출 데이터: 브랜드명, 제품명, 가격, 제품 링크');
console.log('');

// 먼저 상태 확인
await checkDanawaCrawlingStatus();

console.log('');
console.log('⏳ 5초 후 크롤링 시작...');
await new Promise(resolve => setTimeout(resolve, 5000));

// 크롤링 실행
await testDanawaCrawling(); 