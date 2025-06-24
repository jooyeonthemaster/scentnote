// 정규식 테스트 스크립트
const fs = require('fs');

// 다나와 디버그 파일 읽기
const markdown = fs.readFileSync('danawa-debug.md', 'utf8');

console.log('🔍 마크다운 길이:', markdown.length);

// 1. 다나와 상품 링크 찾기
const linkPattern = /\[([^\]]+?)\]\((https?:\/\/prod\.danawa\.com\/bridge\/loadingBridgePowerShopping\.php[^\)]+?)\)/g;
const links = [];

let linkMatch;
while ((linkMatch = linkPattern.exec(markdown)) !== null) {
  links.push({
    name: linkMatch[1].trim(),
    url: linkMatch[2],
    index: linkMatch.index
  });
}

console.log(`🔗 발견된 다나와 상품 링크: ${links.length}개`);
links.slice(0, 3).forEach((link, i) => {
  console.log(`  ${i+1}. ${link.name}`);
  console.log(`     URL: ${link.url.substring(0, 100)}...`);
});

// 2. 가격 패턴 찾기
const pricePattern = /_(\d{1,3}(?:,\d{3})*)_\s*원/g;
const prices = [];

let priceMatch;
while ((priceMatch = pricePattern.exec(markdown)) !== null) {
  prices.push({
    price: priceMatch[1],
    index: priceMatch.index
  });
}

console.log(`💰 발견된 가격 패턴: ${prices.length}개`);
prices.slice(0, 5).forEach((price, i) => {
  console.log(`  ${i+1}. ${price.price}원`);
});

// 3. 거리 분석
console.log('\n📏 링크-가격 거리 분석:');
for (let i = 0; i < Math.min(3, links.length); i++) {
  const link = links[i];
  console.log(`\n🔍 링크 ${i+1}: ${link.name}`);
  console.log(`   위치: ${link.index}`);
  
  // 다음에 나오는 모든 가격과의 거리 계산
  const nextPrices = prices.filter(price => price.index > link.index);
  
  if (nextPrices.length > 0) {
    nextPrices.slice(0, 3).forEach((price, j) => {
      const distance = price.index - link.index;
      console.log(`   → 가격 ${j+1}: ${price.price}원 (거리: ${distance}자)`);
    });
  } else {
    console.log(`   → 다음 가격 없음`);
  }
}

// 4. 매칭 테스트 (더 큰 거리로)
console.log('\n🔄 링크-가격 매칭 테스트 (거리 2000자):');
for (let i = 0; i < Math.min(3, links.length); i++) {
  const link = links[i];
  const nearestPrice = prices.find(price => 
    price.index > link.index && 
    price.index - link.index < 2000 // 2000자로 확장
  );
  
  if (nearestPrice) {
    const distance = nearestPrice.index - link.index;
    console.log(`✅ 매칭 성공: ${link.name} → ${nearestPrice.price}원 (거리: ${distance}자)`);
  } else {
    console.log(`❌ 매칭 실패: ${link.name}`);
  }
} 