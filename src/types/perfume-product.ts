// 퍼퓸그라피 크롤링 상품 데이터 타입
export interface PerfumeProduct {
  id: string;
  name: string;
  brand: string;
  price: {
    original: number;
    discounted?: number;
    currency: string;
  };
  description: string;
  imageUrl: string;
  purchaseUrl: string;
  category: string[];
  tags: string[];
  
  // 향수 특성 정보
  notes?: {
    top: string[];
    middle: string[];
    base: string[];
  };
  
  // 메타데이터
  popularity: number; // 조회수/인기도
  isInStock: boolean;
  volume?: string; // 50ml, 100ml 등
  concentration?: 'EDT' | 'EDP' | 'Parfum' | 'EDC';
  
  // 크롤링 메타데이터
  crawledAt: Date;
  lastUpdated: Date;
  source: 'perfumegraphy';
}

// 크롤링 설정 타입
export interface CrawlConfig {
  maxConcurrency: number; // 동시 크롤링 수
  delayBetweenRequests: number; // 요청 간 지연 (ms)
  retryAttempts: number;
  batchSize: number; // Firebase 저장 배치 크기
}

// 크롤링 진행 상태 타입
export interface CrawlProgress {
  totalProducts: number;
  processedProducts: number;
  failedProducts: number;
  currentCategory?: string;
  estimatedTimeRemaining: number; // 초
  status: 'idle' | 'crawling' | 'completed' | 'error';
}

// AI 추천용 향수 검색 필터
export interface PerfumeSearchFilter {
  priceRange?: {
    min: number;
    max: number;
  };
  brands?: string[];
  categories?: string[];
  notes?: string[];
  concentration?: string[];
  inStockOnly?: boolean;
  sortBy?: 'price' | 'popularity' | 'newest' | 'relevance';
  limit?: number;
} 