// 추천 API 테스트
async function testRecommendationAPI() {
  try {
    console.log('🔍 추천 API 테스트 시작...');
    
    const testData = {
      analysis: {
        personalityProfile: {
          style: 'modern',
          intensity: 'moderate',
          complexity: 'complex',
          budget: '5만원'
        }
      },
      availableFragrances: [
        {
          id: '1',
          name: 'Defy EDT',
          brand: {
            id: 'ck',
            name: 'Calvin Klein'
          },
          notes: {
            top: [],
            middle: [],
            base: []
          },
          concentration: 'edt'
        },
        {
          id: '2',
          name: 'Oud Wood',
          brand: {
            id: 'tf',
            name: 'Tom Ford'
          },
          notes: {
            top: [],
            middle: [],
            base: []
          },
          concentration: 'edp'
        },
        {
          id: '3',
          name: 'Lime Basil & Mandarin',
          brand: {
            id: 'jm',
            name: 'Jo Malone'
          },
          notes: {
            top: [],
            middle: [],
            base: []
          },
          concentration: 'edc'
        }
      ]
    };
    
    const response = await fetch('http://localhost:3000/api/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    console.log('📊 추천 API 테스트 결과:');
    console.log('==================================================');
    
    if (result.success) {
      console.log('✅ 추천 성공!');
      console.log(`📋 추천 개수: ${result.data.length}개`);
      
      result.data.forEach((rec, index) => {
        console.log(`\n🎯 추천 ${index + 1}:`);
        console.log(`   향수: ${rec.fragrance.brand.name} ${rec.fragrance.name}`);
        console.log(`   점수: ${rec.score}`);
        console.log(`   이유: ${rec.reasoning}`);
        
        if (rec.searchMetadata) {
          console.log(`   검증 상태: ${rec.searchMetadata.verificationStatus}`);
          console.log(`   가격 정보: ${rec.searchMetadata.priceRange}`);
          console.log(`   구매처: ${rec.searchMetadata.availablePurchaseLinks}개`);
        }
        
        if (rec.fragrance.price) {
          console.log(`   실제 가격: ${rec.fragrance.price}`);
        }
        
        if (rec.fragrance.purchaseLinks && rec.fragrance.purchaseLinks.length > 0) {
          console.log(`   구매 링크: ${rec.fragrance.purchaseLinks.length}개 발견`);
        }
      });
    } else {
      console.log('❌ 추천 실패:', result.error);
    }
    
    console.log('==================================================');
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error.message);
  }
}

// 테스트 실행
testRecommendationAPI(); 