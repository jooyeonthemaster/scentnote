import { db } from './firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

// 향수 데이터 타입 정의 (DB 구조에 맞춤)
export interface FragranceDBData {
  id: string;
  brand: string;
  name: string;
  price: number;
  volume: string;
  imageUrl?: string;
  reviewCount?: number;
  rating?: number;
  productLink?: string;
  source: string;
}

// 가격대별 필터링 옵션
export interface PriceFilter {
  min: number;
  max: number;
  label: string;
}

// 일반적인 가격대 옵션들 (더 정확한 범위)
export const PRICE_RANGES: PriceFilter[] = [
  { min: 0, max: 30000, label: "3만원 이하" },
  { min: 30001, max: 50000, label: "3-5만원" },
  { min: 50001, max: 80000, label: "5-8만원" },
  { min: 80001, max: 120000, label: "8-12만원" },
  { min: 120001, max: 200000, label: "12-20만원" },
  { min: 200001, max: Infinity, label: "20만원 이상" }
];

// Firebase에서 모든 향수 데이터 가져오기
export async function getAllFragrances(): Promise<FragranceDBData[]> {
  try {
    console.log('🔍 Firebase에서 향수 데이터 로딩 중...');
    
    // 올바른 컬렉션 이름 사용
    const fragrancesRef = collection(db, 'danawa-fragrances-clean');
    const snapshot = await getDocs(fragrancesRef);
    
    const fragrances: FragranceDBData[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      fragrances.push({
        id: doc.id,
        brand: data.brand || '',
        name: data.name || '',
        price: data.price || 0,
        volume: data.volume || '',
        imageUrl: data.imageUrl,
        reviewCount: data.reviewCount,
        rating: data.rating,
        productLink: data.productUrl || data.productLink || '', // 상품 링크 필드 확인
        source: data.source || 'danawa'
      });
    });
    
    console.log(`✅ ${fragrances.length}개 향수 데이터 로딩 완료`);
    return fragrances;
    
  } catch (error) {
    console.error('Firebase 향수 데이터 로딩 오류:', error);
    throw new Error('향수 데이터를 불러올 수 없습니다.');
  }
}

// 가격대로 향수 필터링
export function filterFragrancesByPrice(
  fragrances: FragranceDBData[], 
  priceRange: PriceFilter
): FragranceDBData[] {
  return fragrances.filter(fragrance => 
    fragrance.price >= priceRange.min && 
    fragrance.price <= priceRange.max
  );
}

// 브랜드로 향수 필터링
export function filterFragrancesByBrand(
  fragrances: FragranceDBData[], 
  brands: string[]
): FragranceDBData[] {
  if (brands.length === 0) return fragrances;
  
  return fragrances.filter(fragrance => 
    brands.some(brand => 
      fragrance.brand.toLowerCase().includes(brand.toLowerCase())
    )
  );
}

// 키워드로 향수 검색 (브랜드명, 제품명에서)
export function searchFragrancesByKeyword(
  fragrances: FragranceDBData[], 
  keyword: string
): FragranceDBData[] {
  if (!keyword.trim()) return fragrances;
  
  const searchTerm = keyword.toLowerCase();
  
  return fragrances.filter(fragrance => 
    fragrance.brand.toLowerCase().includes(searchTerm) ||
    fragrance.name.toLowerCase().includes(searchTerm)
  );
}

// 복합 필터링 (가격대 + 브랜드 + 키워드)
export function filterFragrances(
  fragrances: FragranceDBData[],
  filters: {
    priceRange?: PriceFilter;
    brands?: string[];
    keyword?: string;
    limit?: number;
  }
): FragranceDBData[] {
  let filtered = [...fragrances];
  
  // 가격대 필터링
  if (filters.priceRange) {
    filtered = filterFragrancesByPrice(filtered, filters.priceRange);
  }
  
  // 브랜드 필터링
  if (filters.brands && filters.brands.length > 0) {
    filtered = filterFragrancesByBrand(filtered, filters.brands);
  }
  
  // 키워드 검색
  if (filters.keyword) {
    filtered = searchFragrancesByKeyword(filtered, filters.keyword);
  }
  
  // 개수 제한
  if (filters.limit) {
    filtered = filtered.slice(0, filters.limit);
  }
  
  return filtered;
}

// 가격대 문자열을 PriceFilter로 변환 (더 정확한 파싱)
export function parsePriceRange(priceText: string): PriceFilter | undefined {
  const cleanText = priceText.replace(/[^0-9만원이하이상~-]/g, '').toLowerCase();
  
  // "5만원 이하" 패턴 (5만원보다 작거나 같은)
  const belowMatch = cleanText.match(/(\d+)만원이하/);
  if (belowMatch) {
    const max = parseInt(belowMatch[1]) * 10000;
    return { min: 0, max, label: `${belowMatch[1]}만원 이하` };
  }
  
  // "5만원에서 8만원", "5~8만원", "5-8만원" 패턴
  const rangeMatch = cleanText.match(/(\d+)(?:만원?)?(?:에서|[-~])(\d+)만원?/);
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1]) * 10000;
    const max = parseInt(rangeMatch[2]) * 10000;
    return { min: min + 1, max, label: `${rangeMatch[1]}-${rangeMatch[2]}만원` };
  }
  
  // "20만원 이상" 패턴
  const aboveMatch = cleanText.match(/(\d+)만원이상/);
  if (aboveMatch) {
    const min = parseInt(aboveMatch[1]) * 10000;
    return { min: min + 1, max: Infinity, label: `${aboveMatch[1]}만원 이상` };
  }
  
  // 미리 정의된 범위에서 찾기
  const matchedRange = PRICE_RANGES.find(range => 
    priceText.includes(range.label) || range.label.includes(cleanText)
  );
  
  return matchedRange || undefined;
}

// Gemini AI용 향수 데이터 포맷팅
export function formatFragrancesForAI(fragrances: FragranceDBData[]): string {
  return fragrances.map((fragrance, index) => `
${index + 1}. ${fragrance.brand} ${fragrance.name}
   - 가격: ${fragrance.price.toLocaleString()}원 (${fragrance.volume})
   - 평점: ${fragrance.rating || '정보 없음'} (리뷰 ${fragrance.reviewCount || 0}개)
   - 상품링크: ${fragrance.productLink || '정보 없음'}
`).join('\n');
} 