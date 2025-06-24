// Brave Search API를 활용한 향수 정보 검색 서비스
interface BraveSearchResult {
  title: string;
  url: string;
  description: string;
  price?: string;
}

interface BraveSearchResponse {
  web?: {
    results: Array<{
      title: string;
      url: string;
      description: string;
      page_age?: string;
      page_fetched?: string;
    }>;
  };
}

interface FragranceSearchResult {
  verifiedBrand: string;
  verifiedProduct: string;
  verifiedPrice: string;
  searchResults: string;
  purchaseLinks: string[];
  fragranceNotes?: {
    top: string[];
    middle: string[];
    base: string[];
  };
  detailedInfo?: string;
}

/**
 * Brave Search API를 사용하여 향수 정보를 검색합니다. (대폭 강화된 버전)
 */
export async function searchFragranceWithBrave(
  brand: string, 
  product: string,
  budget?: string
): Promise<FragranceSearchResult> {
  const apiKey = process.env.BRAVE_API_KEY;
  
  if (!apiKey) {
    console.error('❌ BRAVE_API_KEY가 설정되지 않았습니다.');
    return {
      verifiedBrand: brand,
      verifiedProduct: product,
      verifiedPrice: '검증 실패',
      searchResults: 'API 키 없음',
      purchaseLinks: []
    };
  }

  try {
    console.log(`🔍 Brave Search로 향수 정보 검색: ${brand} ${product}`);
    
    // 1. 브랜드와 제품명 정확성 검증 검색
    const brandProductQuery = `"${brand}" "${product}" 향수 정품 perfume fragrance`;
    const brandResults = await performBraveSearch(brandProductQuery, apiKey);
    await delay(1000);
    
    // 2. 한국 시장 가격 정보 검색 (여러 쿼리)
    const priceQueries = [
      `"${brand} ${product}" 향수 가격 한국 올리브영 신세계 롯데`,
      `"${brand} ${product}" perfume price korea 온라인 쇼핑몰`,
      `${brand} ${product} 향수 할인 특가 판매가`,
      `"${brand} ${product}" fragrance 구매 price 원`,
      `${brand} ${product} 향수 50ml 100ml 가격`,
      `"${brand} ${product}" EDT EDP 향수 가격 비교`,
      `${brand} ${product} perfume 최저가 할인`,
      `"${brand} ${product}" 향수 정가 할인가 특가`,
      `${brand} ${product} fragrance 온라인 가격 비교`,
      `"${brand} ${product}" 향수 구매 가격 리뷰`
    ];
    
    const priceResults = [];
    for (const query of priceQueries) {
      try {
        const result = await performBraveSearch(query, apiKey);
        priceResults.push(result);
        await delay(1200); // Rate limit 방지
      } catch (error) {
        console.warn(`가격 검색 실패: ${query}`, error);
      }
    }
    
    // 3. 향수 노트 정보 검색
    const noteQueries = [
      `"${brand} ${product}" 향수 노트 top middle base notes`,
      `${brand} ${product} fragrance notes bergamot sandalwood`,
      `"${brand} ${product}" perfume composition ingredients`,
      `${brand} ${product} 향수 향료 구성 성분`
    ];
    
    const noteResults = [];
    for (const query of noteQueries) {
      try {
        const result = await performBraveSearch(query, apiKey);
        noteResults.push(result);
        await delay(1200);
      } catch (error) {
        console.warn(`노트 검색 실패: ${query}`, error);
      }
    }
    
    // 4. 구매 링크 검색 (신뢰할 수 있는 쇼핑몰 중심)
    const purchaseQueries = [
      `"${brand} ${product}" 향수 구매 올리브영 oliveyoung`,
      `"${brand} ${product}" perfume 신세계몰 shinsegaemall`,
      `"${brand} ${product}" 향수 롯데백화점 lotte`,
      `"${brand} ${product}" fragrance 퍼퓸그라피 perfumegraphic`,
      `"${brand} ${product}" 향수 세포라 sephora`,
      `"${brand} ${product}" perfume 11번가 gmarket`
    ];
    
    const purchaseResults = [];
    for (const query of purchaseQueries) {
      try {
        const result = await performBraveSearch(query, apiKey);
        purchaseResults.push(result);
        await delay(1200);
      } catch (error) {
        console.warn(`구매처 검색 실패: ${query}`, error);
      }
    }
    
    // 검색 결과 종합 분석
    const analysis = analyzeEnhancedSearchResults(
      brandResults,
      priceResults,
      noteResults,
      purchaseResults,
      brand, 
      product,
      budget
    );
    
    console.log('✅ Brave Search 검색 완료:', analysis);
    
    return analysis;
    
  } catch (error) {
    console.error('❌ Brave Search 오류:', error);
    return {
      verifiedBrand: brand,
      verifiedProduct: product,
      verifiedPrice: '검증 실패',
      searchResults: '검색 실패',
      purchaseLinks: []
    };
  }
}

/**
 * Brave Search API 호출 함수
 */
async function performBraveSearch(
  query: string, 
  apiKey: string
): Promise<BraveSearchResponse> {
  const url = 'https://api.search.brave.com/res/v1/web/search';
  
  const params = new URLSearchParams({
    q: query,
    count: '10',
    offset: '0',
    mkt: 'ko-KR', // 한국 시장 우선
    safesearch: 'moderate',
    text_decorations: 'false',
    search_lang: 'ko'
  });
  
  const response = await fetch(`${url}?${params}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip',
      'X-Subscription-Token': apiKey
    }
  });
  
  if (!response.ok) {
    throw new Error(`Brave Search API 오류: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * 딜레이 함수
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 강화된 검색 결과 분석 함수
 */
function analyzeEnhancedSearchResults(
  brandResults: BraveSearchResponse,
  priceResults: BraveSearchResponse[],
  noteResults: BraveSearchResponse[],
  purchaseResults: BraveSearchResponse[],
  originalBrand: string,
  originalProduct: string,
  budget?: string
): FragranceSearchResult {
  
  // 브랜드명과 제품명 정확성 검증 (기존 로직 유지)
  let verifiedBrand = originalBrand;
  let verifiedProduct = originalProduct;
  
  if (brandResults.web?.results) {
    for (const result of brandResults.web.results) {
      const title = result.title.toLowerCase();
      const description = result.description.toLowerCase();
      
      // Calvin Klein 같은 두 단어 브랜드명 검증
      if (title.includes('calvin klein') || description.includes('calvin klein')) {
        if (originalBrand.toLowerCase() === 'calvin') {
          verifiedBrand = 'Calvin Klein';
          verifiedProduct = originalProduct.replace(/^klein\s*/i, '').trim();
        }
      }
      
      // 다른 유명 브랜드들도 검증
      const brandPatterns = [
        { pattern: /tom ford/i, correct: 'Tom Ford' },
        { pattern: /jo malone/i, correct: 'Jo Malone' },
        { pattern: /maison margiela/i, correct: 'Maison Margiela' },
        { pattern: /creed/i, correct: 'Creed' },
        { pattern: /chanel/i, correct: 'Chanel' },
        { pattern: /dior/i, correct: 'Dior' },
        { pattern: /versace/i, correct: 'Versace' },
        { pattern: /dolce gabbana/i, correct: 'Dolce & Gabbana' },
        { pattern: /yves saint laurent/i, correct: 'Yves Saint Laurent' },
        { pattern: /giorgio armani/i, correct: 'Giorgio Armani' }
      ];
      
      for (const brand of brandPatterns) {
        if (brand.pattern.test(title) || brand.pattern.test(description)) {
          verifiedBrand = brand.correct;
          break;
        }
      }
    }
  }
  
  // 강화된 가격 정보 추출
  let verifiedPrice = '가격 정보 없음';
  const enhancedPricePatterns = [
    // 기본 패턴들
    /(\d{1,3}(?:,\d{3})*)\s*원/g,
    /(\d+)\s*만\s*원/g,
    /(\d+)\s*만원/g,
    // 통화 기호 패턴
    /₩\s*(\d{1,3}(?:,\d{3})*)/g,
    /KRW\s*(\d{1,3}(?:,\d{3})*)/g,
    /(\d{1,3}(?:,\d{3})*)\s*KRW/g,
    // 할인/판매가 패턴
    /할인가[:\s]*(\d{1,3}(?:,\d{3})*)\s*원/g,
    /특가[:\s]*(\d{1,3}(?:,\d{3})*)\s*원/g,
    /판매가[:\s]*(\d{1,3}(?:,\d{3})*)\s*원/g,
    /정가[:\s]*(\d{1,3}(?:,\d{3})*)\s*원/g,
    /가격[:\s]*(\d{1,3}(?:,\d{3})*)\s*원/g,
    // 온라인몰 가격 패턴
    /(\d{1,3}(?:,\d{3})*)\s*원\s*배송/g,
    /(\d{1,3}(?:,\d{3})*)\s*원\s*무료배송/g,
    /(\d{1,3}(?:,\d{3})*)\s*원\s*택배/g,
    // 범위 가격 패턴
    /(\d{1,3}(?:,\d{3})*)\s*~\s*(\d{1,3}(?:,\d{3})*)\s*원/g,
    /(\d{1,3}(?:,\d{3})*)\s*원\s*~\s*(\d{1,3}(?:,\d{3})*)\s*원/g,
    /(\d{1,3}(?:,\d{3})*)\s*-\s*(\d{1,3}(?:,\d{3})*)\s*원/g,
    // 용량별 가격 패턴
    /(\d{1,3}(?:,\d{3})*)\s*원\s*\(\s*\d+ml\s*\)/g,
    /\d+ml[:\s]*(\d{1,3}(?:,\d{3})*)\s*원/g,
    // 추가 패턴들
    /price[:\s]*(\d{1,3}(?:,\d{3})*)/gi,
    /(\d{1,3}(?:,\d{3})*)\s*won/gi,
    // 더 정교한 패턴들 추가
    /(\d{1,3}(?:,\d{3})*)\s*원\s*\(/g,
    /\(\s*(\d{1,3}(?:,\d{3})*)\s*원\s*\)/g,
    /(\d{1,3}(?:,\d{3})*)\s*원\s*\[/g,
    /\[\s*(\d{1,3}(?:,\d{3})*)\s*원\s*\]/g,
    // 쇼핑몰 특화 패턴
    /최저가[:\s]*(\d{1,3}(?:,\d{3})*)\s*원/g,
    /최저[:\s]*(\d{1,3}(?:,\d{3})*)\s*원/g,
    /(\d{1,3}(?:,\d{3})*)\s*원\s*최저가/g,
    /(\d{1,3}(?:,\d{3})*)\s*원\s*최저/g,
    // 브랜드별 특화 패턴
    /(\d{1,3}(?:,\d{3})*)\s*원\s*\d+ml/g,
    /\d+ml\s*(\d{1,3}(?:,\d{3})*)\s*원/g,
    // 리뷰/후기 패턴
    /(\d{1,3}(?:,\d{3})*)\s*원에\s*구매/g,
    /(\d{1,3}(?:,\d{3})*)\s*원\s*주고/g,
    /(\d{1,3}(?:,\d{3})*)\s*원\s*정도/g
  ];
  
  const allPrices: number[] = [];
  const priceContexts: string[] = []; // 가격이 발견된 문맥 저장
  
  for (const priceResult of priceResults) {
    if (priceResult.web?.results) {
      for (const result of priceResult.web.results) {
        const title = result.title.toLowerCase();
        const description = result.description.toLowerCase();
        const fullText = `${title} ${description}`;
        
        // 가격 관련 키워드가 있는 결과만 처리
        const hasRelevantKeywords = [
          '가격', '원', '만원', '할인', '특가', '판매가', 'krw', '₩', 
          'price', 'won', '정가', '배송', '무료배송', '택배', '최저가',
          '구매', '주문', '쇼핑', '온라인', '할인', '특가', '세일'
        ].some(keyword => fullText.includes(keyword));
        
        // 브랜드명과 제품명이 모두 포함된 결과만 처리
        const hasBrandAndProduct = fullText.includes(originalBrand.toLowerCase()) && 
                                 fullText.includes(originalProduct.toLowerCase());
        
        if (hasRelevantKeywords && hasBrandAndProduct) {
          for (const pattern of enhancedPricePatterns) {
            let match;
            while ((match = pattern.exec(fullText)) !== null) {
              let price = 0;
              
              if (pattern.source.includes('만') && pattern.source.includes('원')) {
                // "5만원" 형태
                price = parseInt(match[1]) * 10000;
              } else if (match[2]) {
                // 범위 가격 "30,000~50,000원" 형태
                const price1 = parseInt(match[1].replace(/,/g, ''));
                const price2 = parseInt(match[2].replace(/,/g, ''));
                if (price1 >= 5000 && price1 <= 2000000 && price2 >= 5000 && price2 <= 2000000) {
                  allPrices.push(price1, price2);
                  priceContexts.push(`${title} - 범위가격: ${price1}-${price2}`);
                }
                continue;
              } else {
                // "50,000원" 형태
                price = parseInt(match[1].replace(/,/g, ''));
              }
              
              // 합리적인 향수 가격 범위 확인 (5천원~200만원)
              if (price >= 5000 && price <= 2000000) {
                allPrices.push(price);
                priceContexts.push(`${title} - ${price}원`);
              }
            }
          }
        }
      }
    }
  }
  
  // 가격 정보 처리 (개선된 버전)
  if (allPrices.length > 0) {
    // 중복 제거, 이상치 제거, 정렬
    const uniquePrices = Array.from(new Set(allPrices)).sort((a, b) => a - b);
    
    console.log(`💰 발견된 가격들: ${uniquePrices.map(p => p.toLocaleString()).join(', ')}원`);
    console.log(`📝 가격 문맥: ${priceContexts.slice(0, 3).join(' | ')}`);
    
    // 이상치 제거 (Q1-1.5*IQR 미만, Q3+1.5*IQR 초과 제거)
    let filteredPrices = uniquePrices;
    if (uniquePrices.length > 4) {
      const q1 = uniquePrices[Math.floor(uniquePrices.length * 0.25)];
      const q3 = uniquePrices[Math.floor(uniquePrices.length * 0.75)];
      const iqr = q3 - q1;
      filteredPrices = uniquePrices.filter(price => 
        price >= (q1 - 1.5 * iqr) && price <= (q3 + 1.5 * iqr)
      );
    }
    
    if (filteredPrices.length > 0) {
      const minPrice = filteredPrices[0];
      const maxPrice = filteredPrices[filteredPrices.length - 1];
      
      if (filteredPrices.length === 1) {
        verifiedPrice = `약 ${minPrice.toLocaleString()}원`;
      } else if (filteredPrices.length === 2) {
        // 2개의 가격만 있으면 범위로 표시
        verifiedPrice = `${minPrice.toLocaleString()}원 ~ ${maxPrice.toLocaleString()}원`;
      } else if (maxPrice - minPrice < minPrice * 0.2) {
        // 가격 차이가 20% 미만이면 평균가 표시
        const avgPrice = Math.round(filteredPrices.reduce((a, b) => a + b, 0) / filteredPrices.length);
        verifiedPrice = `약 ${avgPrice.toLocaleString()}원 (${filteredPrices.length}개 매장 평균)`;
      } else if (maxPrice - minPrice < minPrice * 0.5) {
        // 가격 차이가 50% 미만이면 중간값 표시
        const medianPrice = filteredPrices[Math.floor(filteredPrices.length / 2)];
        verifiedPrice = `약 ${medianPrice.toLocaleString()}원 (${minPrice.toLocaleString()}~${maxPrice.toLocaleString()}원)`;
      } else {
        // 가격 범위 표시
        verifiedPrice = `${minPrice.toLocaleString()}원 ~ ${maxPrice.toLocaleString()}원`;
      }
      
      // 예산 체크 (개선된 버전)
      if (budget) {
        const budgetMatch = budget.match(/(\d+)\s*만원/);
        if (budgetMatch) {
          const budgetAmount = parseInt(budgetMatch[1]) * 10000;
          if (minPrice > budgetAmount) {
            verifiedPrice += ` (예산 ${budget} 초과)`;
          } else if (maxPrice > budgetAmount && minPrice <= budgetAmount) {
            verifiedPrice += ` (일부 예산 초과)`;
          }
        }
      }
    }
  } else {
    // 가격을 찾지 못한 경우, 검색 결과가 있는지라도 확인
    const hasRelevantResults = priceResults.some(priceResult => 
      priceResult.web?.results?.some(result => {
        const text = `${result.title} ${result.description}`.toLowerCase();
        return text.includes(originalBrand.toLowerCase()) || 
               text.includes(originalProduct.toLowerCase()) ||
               text.includes('향수') || text.includes('perfume') || text.includes('fragrance');
      })
    );
    
    if (hasRelevantResults) {
      verifiedPrice = '가격 확인 필요 (검색 결과 있음)';
    }
  }
  
  // 향수 노트 정보 추출
  const fragranceNotes = extractFragranceNotes(noteResults);
  
  // 실제 구매 링크 추출 (강화된 버전)
  const purchaseLinks = extractPurchaseLinks(purchaseResults);
  
  // 상세 정보 수집
  const detailedInfo = extractDetailedInfo(brandResults, priceResults, noteResults);
  
  // 검색 결과 요약
  const totalSearches = 1 + priceResults.length + noteResults.length + purchaseResults.length;
  const totalResults = (brandResults.web?.results?.length || 0) +
    priceResults.reduce((sum, result) => sum + (result.web?.results?.length || 0), 0) +
    noteResults.reduce((sum, result) => sum + (result.web?.results?.length || 0), 0) +
    purchaseResults.reduce((sum, result) => sum + (result.web?.results?.length || 0), 0);
  
  const searchResults = `
총 ${totalSearches}회 검색 수행
브랜드 검증: ${brandResults.web?.results?.length || 0}개 결과
가격 검증: ${priceResults.reduce((sum, result) => sum + (result.web?.results?.length || 0), 0)}개 결과
노트 정보: ${noteResults.reduce((sum, result) => sum + (result.web?.results?.length || 0), 0)}개 결과
구매처 검증: ${purchaseResults.reduce((sum, result) => sum + (result.web?.results?.length || 0), 0)}개 결과
실제 구매 링크: ${purchaseLinks.length}개 발견
총 검색 결과: ${totalResults}개
  `.trim();
  
  return {
    verifiedBrand,
    verifiedProduct,
    verifiedPrice,
    searchResults,
    purchaseLinks,
    fragranceNotes,
    detailedInfo
  };
}

/**
 * 향수 구매 링크를 생성합니다 (실제 검색 결과 기반)
 */
export function generatePurchaseLink(brand: string, product: string): string {
  // 실제 검색 결과에서 구매 링크를 찾기 위해 간단한 검색 수행
  // 실제 사용시에는 캐시된 검색 결과를 사용하는 것이 좋음
  return `https://search.brave.com/search?q=${encodeURIComponent(`${brand} ${product} 향수 구매 올리브영 신세계`)}`;
}

/**
 * 실제 구매 링크를 가져옵니다 (검색 결과 기반)
 */
export async function getActualPurchaseLinks(brand: string, product: string): Promise<string[]> {
  try {
    const result = await searchFragranceWithBrave(brand, product);
    return result.purchaseLinks || [];
  } catch (error) {
    console.error('구매 링크 검색 실패:', error);
    return [];
  }
}

/**
 * 향수 노트 정보를 추출합니다
 */
function extractFragranceNotes(noteResults: BraveSearchResponse[]): {
  top: string[];
  middle: string[];
  base: string[];
} {
  const notes = {
    top: [] as string[],
    middle: [] as string[],
    base: [] as string[]
  };
  
  // 일반적인 향수 노트들
  const commonNotes = {
    top: [
      'bergamot', '베르가못', 'lemon', '레몬', 'lime', '라임', 'orange', '오렌지',
      'grapefruit', '자몽', 'mandarin', '만다린', 'lavender', '라벤더', 'mint', '민트',
      'eucalyptus', '유칼립투스', 'rosemary', '로즈마리', 'sage', '세이지'
    ],
    middle: [
      'rose', '장미', 'jasmine', '자스민', 'lily', '릴리', 'geranium', '제라늄',
      'neroli', '네롤리', 'ylang ylang', '일랑일랑', 'iris', '아이리스', 'violet', '바이올렛',
      'peony', '모란', 'freesia', '프리지아', 'cedar', '시더', 'pine', '파인'
    ],
    base: [
      'sandalwood', '샌달우드', 'cedarwood', '시더우드', 'vetiver', '베티버',
      'patchouli', '패츌리', 'musk', '머스크', 'amber', '앰버', 'vanilla', '바닐라',
      'tonka bean', '통카빈', 'oakmoss', '오크모스', 'oud', '우드', 'incense', '인센스'
    ]
  };
  
  for (const result of noteResults) {
    if (result.web?.results) {
      for (const item of result.web.results) {
        const text = `${item.title} ${item.description}`.toLowerCase();
        
        // Top notes 찾기
        for (const note of commonNotes.top) {
          if (text.includes(note.toLowerCase()) && !notes.top.includes(note)) {
            notes.top.push(note);
          }
        }
        
        // Middle notes 찾기
        for (const note of commonNotes.middle) {
          if (text.includes(note.toLowerCase()) && !notes.middle.includes(note)) {
            notes.middle.push(note);
          }
        }
        
        // Base notes 찾기
        for (const note of commonNotes.base) {
          if (text.includes(note.toLowerCase()) && !notes.base.includes(note)) {
            notes.base.push(note);
          }
        }
      }
    }
  }
  
  return notes;
}

/**
 * 실제 구매 링크를 추출합니다
 */
function extractPurchaseLinks(purchaseResults: BraveSearchResponse[]): string[] {
  const purchaseLinks: string[] = [];
  const trustedDomains = [
    'oliveyoung.co.kr',
    'shinsegaemall.com',
    'lotte.com',
    'lotteon.com',
    'perfumegraphic.co.kr',
    'sephora.kr',
    'beautiqlo.com',
    '11st.co.kr',
    'gmarket.co.kr',
    'auction.co.kr',
    'coupang.com',
    'interpark.com'
  ];
  
  for (const result of purchaseResults) {
    if (result.web?.results) {
      for (const item of result.web.results) {
        try {
          const url = new URL(item.url);
          const domain = url.hostname.toLowerCase();
          
          // 신뢰할 수 있는 도메인인지 확인
          if (trustedDomains.some(trusted => domain.includes(trusted))) {
            // 중복 방지
            if (!purchaseLinks.includes(item.url)) {
              purchaseLinks.push(item.url);
            }
          }
        } catch (error) {
          // URL 파싱 실패시 무시
          continue;
        }
      }
    }
  }
  
  return purchaseLinks;
}

/**
 * 상세 정보를 추출합니다
 */
function extractDetailedInfo(
  brandResults: BraveSearchResponse,
  priceResults: BraveSearchResponse[],
  noteResults: BraveSearchResponse[]
): string {
  const details: string[] = [];
  
  // 브랜드 정보 추출
  if (brandResults.web?.results) {
    for (const result of brandResults.web.results) {
      const text = `${result.title} ${result.description}`;
      
      // 용량 정보 찾기
      const volumeMatch = text.match(/(\d+)\s*ml/i);
      if (volumeMatch) {
        details.push(`용량: ${volumeMatch[1]}ml`);
        break;
      }
    }
  }
  
  // 농도 정보 찾기
  const concentrationKeywords = ['EDT', 'EDP', 'Parfum', 'EDC', 'Cologne'];
  for (const result of [...(brandResults.web?.results || [])]) {
    const text = `${result.title} ${result.description}`;
    
    for (const concentration of concentrationKeywords) {
      if (text.includes(concentration)) {
        details.push(`농도: ${concentration}`);
        break;
      }
    }
    if (details.some(d => d.startsWith('농도:'))) break;
  }
  
  // 출시년도 정보 찾기
  for (const result of [...(brandResults.web?.results || [])]) {
    const text = `${result.title} ${result.description}`;
    const yearMatch = text.match(/(19|20)\d{2}/);
    if (yearMatch) {
      details.push(`출시년도: ${yearMatch[0]}`);
      break;
    }
  }
  
  return details.join(', ');
}

// 🔍 새로운 함수: 예산 내 향수 데이터 대량 수집
export async function collectFragranceData(budget: string, preferences: string): Promise<any[]> {
  const fragrances: any[] = [];
  
  // 다양한 검색 쿼리로 실제 향수 데이터 수집
  const searchQueries = [
    `향수 ${budget} 이하 남성`,
    `남성 향수 ${budget} 올리브영`,
    `향수 ${budget} 우디 앰버`,
    `${budget} 향수 추천 남성`,
    `남성 향수 가격 ${budget} 이하`,
    `향수 ${preferences} ${budget}`,
    `데일리 향수 남성 ${budget}`,
    `비즈니스 향수 ${budget} 이하`
  ];

  for (const query of searchQueries) {
    try {
      console.log(`🔍 향수 데이터 수집 중: ${query}`);
      
      const response = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=10`, {
        headers: {
          'X-Subscription-Token': process.env.BRAVE_API_KEY || '',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`검색 실패: ${response.status}`);
        continue;
      }

      const data = await response.json();
      
      if (data.web?.results) {
        for (const result of data.web.results) {
          // 향수 관련 결과만 필터링
          if (isFragranceResult(result)) {
            const fragrance = parseFragranceFromResult(result);
            if (fragrance) {
              fragrances.push(fragrance);
            }
          }
        }
      }

      // Rate limit 준수
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (error) {
      console.error(`검색 오류: ${query}`, error);
    }
  }

  // 중복 제거 및 정렬
  const uniqueFragrances = removeDuplicateFragrances(fragrances);
  console.log(`✅ 총 ${uniqueFragrances.length}개 향수 데이터 수집 완료`);
  
  return uniqueFragrances;
}

// 향수 관련 결과인지 확인
function isFragranceResult(result: any): boolean {
  const text = (result.title + ' ' + result.description).toLowerCase();
  const fragranceKeywords = [
    '향수', 'perfume', 'fragrance', 'edt', 'edp', 'cologne',
    '올리브영', '신세계', '롯데', '퍼퓸', 'ml', '원'
  ];
  
  return fragranceKeywords.some(keyword => text.includes(keyword));
}

// 검색 결과에서 향수 정보 파싱
function parseFragranceFromResult(result: any): any | null {
  try {
    const title = result.title;
    const description = result.description;
    const url = result.url;
    
    // 가격 추출
    const priceMatch = (title + ' ' + description).match(/([0-9,]+)\s*원/);
    const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : null;
    
    // 브랜드명과 제품명 추출 (개선된 로직)
    const brandProduct = extractBrandAndProduct(title);
    
    if (!brandProduct) return null;
    
    return {
      brand: brandProduct.brand,
      product: brandProduct.product,
      price: price,
      title: title,
      description: description,
      url: url,
      source: getDomainFromUrl(url)
    };
    
  } catch (error) {
    console.error('향수 정보 파싱 오류:', error);
    return null;
  }
}

// 브랜드명과 제품명 추출 (개선된 버전)
function extractBrandAndProduct(title: string): {brand: string, product: string} | null {
  // 알려진 브랜드 목록
  const knownBrands = [
    'Calvin Klein', 'Tom Ford', 'Jo Malone', 'Chanel', 'Dior', 
    'Versace', 'Armani', 'Hugo Boss', 'Prada', 'Burberry',
    'Mercedes-Benz', 'Bentley', 'Zara', 'Issey Miyake', 'Bvlgari',
    'Ralph Lauren', 'Dolce & Gabbana', 'Yves Saint Laurent',
    'Creed', 'Maison Margiela', 'Hermès'
  ];
  
  const titleLower = title.toLowerCase();
  
  for (const brand of knownBrands) {
    if (titleLower.includes(brand.toLowerCase())) {
      const brandIndex = titleLower.indexOf(brand.toLowerCase());
      const afterBrand = title.substring(brandIndex + brand.length).trim();
      
      // 브랜드 다음에 오는 부분을 제품명으로 추출
      const product = afterBrand.split(/[|\-\(\)]/)[0].trim();
      
      if (product.length > 0) {
        return {
          brand: brand,
          product: product
        };
      }
    }
  }
  
  return null;
}

// 도메인 추출
function getDomainFromUrl(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return 'unknown';
  }
}

// 중복 향수 제거
function removeDuplicateFragrances(fragrances: any[]): any[] {
  const seen = new Set();
  return fragrances.filter(fragrance => {
    const key = `${fragrance.brand}-${fragrance.product}`.toLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
} 