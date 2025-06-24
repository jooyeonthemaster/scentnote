async function testCrawling() {
  try {
    console.log('🔥 크롤링 시작...');
    
    const response = await fetch('http://localhost:3000/api/crawl-perfumes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.text();
    console.log('📊 응답 상태:', response.status);
    console.log('📊 응답 데이터:', data);
    
    if (response.ok) {
      console.log('✅ 크롤링 API 호출 성공!');
    } else {
      console.log('❌ 크롤링 실패:', response.status);
    }
    
  } catch (error) {
    console.error('💥 에러 발생:', error.message);
  }
}

testCrawling(); 