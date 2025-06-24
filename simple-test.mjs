import FirecrawlApp from '@mendable/firecrawl-js';

async function testPerfumegraphyScrape() {
  try {
    console.log('🔥 퍼퓸그라피 스크래핑 테스트 시작...');
    
    const app = new FirecrawlApp({ 
      apiKey: process.env.FIRECRAWL_API_KEY || 'fc-51c02275b02943a0bd53ab78035ee56a'
    });
    
    // 간단한 스크래핑 테스트 (크레딧 절약)
    console.log('📊 퍼퓸그라피 메인 페이지 스크래핑...');
    const result = await app.scrapeUrl('https://perfumegraphy.com', {
      formats: ['markdown'],
      onlyMainContent: true
    });
    
    console.log('✅ 스크래핑 성공!');
    console.log('📄 결과:', result);
    
    if (result.success && result.data) {
      console.log('📝 마크다운 길이:', result.data.markdown?.length || 0);
      console.log('🏷️ 메타데이터:', result.data.metadata?.title || 'No title');
      
      // 마크다운 내용 일부 출력
      if (result.data.markdown) {
        console.log('📖 마크다운 미리보기:');
        console.log(result.data.markdown.substring(0, 500) + '...');
      }
    }
    
  } catch (error) {
    console.error('❌ 에러 발생:', error.message);
  }
}

testPerfumegraphyScrape(); 