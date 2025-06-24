// 다나와 크롤링 테스트 스크립트
console.log('🔥 다나와 크롤링 테스트 시작...');

try {
    const response = await fetch('http://localhost:3000/api/crawl-perfumes?type=danawa', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();
    
    if (response.ok) {
        console.log('✅ 크롤링 성공!');
        console.log(`📊 추출된 상품 수: ${data.products?.length || 0}개`);
        
        if (data.products && data.products.length > 0) {
            console.log('\n🎯 추출된 상품 목록:');
            data.products.forEach((product, index) => {
                console.log(`\n${index + 1}. ${product.name}`);
                console.log(`   브랜드: ${product.brand}`);
                console.log(`   가격: ${product.price?.original?.toLocaleString()}원`);
                console.log(`   URL: ${product.productUrl}`);
            });
        }
        
        console.log('\n📝 전체 응답:');
        console.log(JSON.stringify(data, null, 2));
    } else {
        console.log('❌ 크롤링 실패');
        console.log('오류:', data.error || '알 수 없는 오류');
    }
} catch (error) {
    console.log('❌ 네트워크 오류');
    console.log('오류:', error.message);
}