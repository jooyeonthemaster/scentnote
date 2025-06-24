import FirecrawlApp from '@mendable/firecrawl-js';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { db } from './firebase';
import { PerfumeProduct } from '@/types/perfume-product';

// 다나와 상품 정보 타입
export interface DanawaProduct {
  id: string;
  name: string;
  brand: string;
  price: {
    original: number;
    currency: string;
  };
  productUrl: string;
  imageUrl?: string;
  source: 'danawa';
  crawledAt: Date;
}

export class FirecrawlPerfumeService {
  private firecrawl: FirecrawlApp;
  private baseUrl = 'https://perfumegraphy.com';

  constructor(apiKey: string) {
    this.firecrawl = new FirecrawlApp({ apiKey });
  }

  async crawlAllProducts(): Promise<{ success: boolean; totalProducts: number; message: string }> {
    try {
      console.log('🔥 Firecrawl로 퍼퓸그라피 크롤링 시작...');

      // 1. 전체 사이트 크롤링 (최신 v1 API 문법 사용)
      const crawlResponse = await this.firecrawl.crawlUrl(this.baseUrl, {
        limit: 1000, // 최대 크롤링 페이지 수
        scrapeOptions: {
          formats: ['markdown'],
          onlyMainContent: true
        },
        includePaths: ['/product/*'], // 상품 페이지만 크롤링
        excludePaths: ['/cart', '/checkout', '/account'], // 불필요한 페이지 제외
      });

      if (!crawlResponse.success) {
        throw new Error(`크롤링 실패: ${crawlResponse.error || '알 수 없는 오류'}`);
      }

      console.log(`📊 총 ${crawlResponse.data?.length || 0}개 페이지 발견`);

      // 2. 상품 데이터 변환 및 저장
      const products = await this.convertToProducts(crawlResponse.data || []);
      
      // 3. Firebase에 배치 저장
      await this.saveProductsToFirebase(products);

      return {
        success: true,
        totalProducts: products.length,
        message: `🎉 ${products.length}개 상품 크롤링 완료!`
      };

    } catch (error) {
      console.error('❌ Firecrawl 크롤링 실패:', error);
      return {
        success: false,
        totalProducts: 0,
        message: `크롤링 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      };
    }
  }

  // 크롤링된 데이터를 상품 객체로 변환
  private async convertToProducts(crawlData: any[]): Promise<PerfumeProduct[]> {
    const products: PerfumeProduct[] = [];

    for (const page of crawlData) {
      try {
        const product = this.extractProductFromPage(page);
        if (product) {
          products.push(product);
        }
      } catch (error) {
        console.error(`상품 추출 실패 ${page.metadata?.url}:`, error);
      }
    }

    console.log(`✅ ${products.length}개 상품 데이터 변환 완료`);
    return products;
  }

  // 페이지에서 상품 정보 추출
  private extractProductFromPage(pageData: any): PerfumeProduct | null {
    try {
      const markdown = pageData.markdown || '';
      const metadata = pageData.metadata || {};
      
      // 마크다운에서 상품 정보 파싱
      const title = this.extractTitle(markdown, metadata);
      const brand = this.extractBrand(markdown);
      const priceString = this.extractPrice(markdown);
      const description = this.extractDescription(markdown);
      const notes = this.extractNotes(markdown);
      const imageUrl = this.extractImageUrl(markdown);
      const purchaseUrl = metadata.url || '';

      // 필수 정보가 없으면 null 반환
      if (!title || !brand) {
        return null;
      }

      // 가격 숫자 변환
      const priceNumber = this.parsePrice(priceString);

      return {
        id: this.generateProductId(title, brand),
        name: title, // PerfumeProduct 타입에 맞게 name 사용
        brand,
        price: {
          original: priceNumber,
          currency: 'KRW'
        },
        description,
        notes,
        imageUrl,
        purchaseUrl,
        category: [], // 빈 배열로 초기화
        tags: [], // 빈 배열로 초기화
        popularity: 0,
        isInStock: true,
        source: 'perfumegraphy',
        crawledAt: new Date(),
        lastUpdated: new Date()
      };

    } catch (error) {
      console.error('상품 정보 추출 중 오류:', error);
      return null;
    }
  }

  // 개별 상품 페이지 스크래핑 (필요시)
  async scrapeProductPage(productUrl: string): Promise<PerfumeProduct | null> {
    try {
      const scrapeResponse = await this.firecrawl.scrapeUrl(productUrl, {
        formats: ['markdown'],
        onlyMainContent: true
      });

      if (!scrapeResponse.success) {
        throw new Error(`스크래핑 실패: ${scrapeResponse.error || '알 수 없는 오류'}`);
      }

      return this.extractProductFromPage(scrapeResponse);

    } catch (error) {
      console.error(`개별 상품 스크래핑 실패 ${productUrl}:`, error);
      return null;
    }
  }

  // Firebase에 배치 저장
  private async saveProductsToFirebase(products: PerfumeProduct[]): Promise<void> {
    if (products.length === 0) {
      console.log('저장할 상품이 없습니다.');
      return;
    }

    const batch = writeBatch(db);
    const perfumesCollection = collection(db, 'perfumes');

    products.forEach((product) => {
      const docRef = doc(perfumesCollection, product.id);
      batch.set(docRef, product);
    });

    try {
      await batch.commit();
      console.log(`🔥 Firebase에 ${products.length}개 상품 저장 완료!`);
    } catch (error) {
      console.error('Firebase 저장 실패:', error);
      throw error;
    }
  }

  // 유틸리티 메서드들
  private extractTitle(markdown: string, metadata: any): string {
    // 메타데이터의 title 우선 사용
    if (metadata.title && metadata.title !== 'Perfumegraphy') {
      return metadata.title.replace(' - Perfumegraphy', '').trim();
    }

    // 마크다운에서 첫 번째 헤딩 추출
    const titleMatch = markdown.match(/^#\s+(.+)$/m);
    return titleMatch ? titleMatch[1].trim() : '';
  }

  private extractBrand(markdown: string): string {
    // 브랜드 정보 추출 로직
    const brandMatch = markdown.match(/브랜드[:\s]*([^\n]+)/i) ||
                      markdown.match(/Brand[:\s]*([^\n]+)/i) ||
                      markdown.match(/\*\*([^*]+)\*\*\s*(?:향수|퍼퓨)/i);
    
    return brandMatch ? brandMatch[1].trim() : '';
  }

  private extractPrice(markdown: string): string {
    // 가격 정보 추출
    const priceMatch = markdown.match(/(\d{1,3}(?:,\d{3})*원|\$\d+(?:\.\d{2})?)/);
    return priceMatch ? priceMatch[1] : '';
  }

  private extractDescription(markdown: string): string {
    // 설명 추출 (첫 번째 문단)
    const paragraphs = markdown.split('\n\n');
    const descParagraph = paragraphs.find(p => 
      p.length > 50 && 
      !p.startsWith('#') && 
      !p.includes('가격') &&
      !p.includes('구매')
    );
    
    return descParagraph ? descParagraph.trim().substring(0, 500) : '';
  }

  private extractNotes(markdown: string): { top: string[]; middle: string[]; base: string[] } {
    // 노트 정보 추출
    const notes: { top: string[]; middle: string[]; base: string[] } = { top: [], middle: [], base: [] };
    
    const topMatch = markdown.match(/탑노트[:\s]*([^\n]+)/i);
    const middleMatch = markdown.match(/미들노트[:\s]*([^\n]+)/i);
    const baseMatch = markdown.match(/베이스노트[:\s]*([^\n]+)/i);
    
    if (topMatch) {
      notes.top = topMatch[1].split(',').map(n => n.trim());
    }
    if (middleMatch) {
      notes.middle = middleMatch[1].split(',').map(n => n.trim());
    }
    if (baseMatch) {
      notes.base = baseMatch[1].split(',').map(n => n.trim());
    }
    
    return notes;
  }

  private extractImageUrl(markdown: string): string {
    // 이미지 URL 추출
    const imgMatch = markdown.match(/!\[.*?\]\((https?:\/\/[^\)]+)\)/);
    return imgMatch ? imgMatch[1] : '';
  }

  private generateProductId(title: string, brand: string): string {
    // 상품 ID 생성
    const combined = `${brand}-${title}`.toLowerCase()
      .replace(/[^a-z0-9가-힣]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    return combined.substring(0, 100);
  }

  private parsePrice(priceString: string): number {
    // 가격 문자열을 숫자로 변환
    const cleanedString = priceString.replace(/[^0-9.]/g, '');
    return parseFloat(cleanedString);
  }
}

// 다나와 크롤링 전용 클래스
export class DanawaFirecrawlService {
  private firecrawl: FirecrawlApp;
  private baseUrl = 'https://prod.danawa.com/list/?cate=18222429&15main_18_02';

  constructor(apiKey: string) {
    this.firecrawl = new FirecrawlApp({ apiKey });
  }

  async crawlDanawaFragrances(): Promise<{ success: boolean; totalProducts: number; message: string }> {
    try {
      console.log('🔥 Firecrawl로 다나와 향수 스크래핑 시작... (최적화 모드)');

      // 최소 크레딧 사용 - 단순 스크래핑만
      const scrapeResponse = await this.firecrawl.scrapeUrl(this.baseUrl, {
        formats: ['markdown'], // HTML 제거로 크레딧 절약
        onlyMainContent: false, // 전체 내용 필요
      });

      if (!scrapeResponse.success) {
        throw new Error(`다나와 스크래핑 실패: ${scrapeResponse.error || '알 수 없는 오류'}`);
      }

      console.log('📊 다나와 페이지 스크래핑 완료');
      
      // 간단한 응답 확인
      const markdown = scrapeResponse.markdown || (scrapeResponse as any).data?.markdown || '';
      console.log('📝 추출된 마크다운 길이:', markdown.length);
      
      // 마크다운을 파일로 저장해서 확인
      if (markdown.length > 0) {
        const fs = require('fs');
        fs.writeFileSync('danawa-debug.md', markdown, 'utf8');
        console.log('📁 마크다운이 danawa-debug.md 파일로 저장되었습니다.');
      }
      
      if (markdown.length === 0) {
        console.log('⚠️ 마크다운이 비어있습니다. 응답 구조:', Object.keys(scrapeResponse));
      }

      // 2. 상품 데이터 변환 (응답 구조에 맞게 수정)
      const products = this.extractDanawaProductsFromPage(scrapeResponse);

      // 3. Firebase에 저장
      if (products.length > 0) {
        await this.saveDanawaProductsToFirebase(products);
      } else {
        console.log('⚠️ 추출된 상품이 없습니다. 디버깅 정보:');
        console.log('스크래핑 응답:', JSON.stringify(scrapeResponse, null, 2));
      }

      return {
        success: true,
        totalProducts: products.length,
        message: `🎉 다나와에서 ${products.length}개 향수 상품 스크래핑 완료!`
      };

    } catch (error) {
      console.error('❌ 다나와 스크래핑 실패:', error);
      return {
        success: false,
        totalProducts: 0,
        message: `다나와 스크래핑 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      };
    }
  }

  // 다나와 페이지에서 여러 상품 정보 추출
  private extractDanawaProductsFromPage(pageData: any): DanawaProduct[] {
    try {
      // Firecrawl 응답에서 마크다운 추출
      const markdown = pageData.markdown || pageData.data?.markdown || pageData.content || '';
      const metadata = pageData.metadata || pageData.data?.metadata || {};
      
      console.log('🔍 다나와 페이지에서 상품 정보 추출 중... (마크다운 길이:', markdown.length, ')');
      
      const products: DanawaProduct[] = [];

      // 새로운 접근: 마크다운 링크와 가격을 별도로 찾고 매칭
      // 1. 모든 마크다운 링크 찾기 (다나와 상품 링크만 - loadingBridgePowerShopping만)
      const linkPattern = /\[([^\]]+?)\]\((https?:\/\/prod\.danawa\.com\/bridge\/loadingBridgePowerShopping\.php[^\)]*?)\)/g;
      const links: Array<{name: string, url: string, index: number}> = [];
      
      let linkMatch;
      while ((linkMatch = linkPattern.exec(markdown)) !== null) {
        links.push({
          name: linkMatch[1].trim(),
          url: linkMatch[2],
          index: linkMatch.index
        });
      }
      
      console.log(`🔗 발견된 다나와 상품 링크: ${links.length}개`);
      
      // 디버깅: 각 링크 출력
      links.forEach((link, index) => {
        console.log(`  ${index + 1}. ${link.name}`);
      });
      
      // 2. 모든 가격 패턴 찾기
      const pricePattern = /_(\d{1,3}(?:,\d{3})*)_\s*원/g;
      const prices: Array<{price: string, index: number}> = [];
      
      let priceMatch;
      while ((priceMatch = pricePattern.exec(markdown)) !== null) {
        prices.push({
          price: priceMatch[1],
          index: priceMatch.index
        });
      }
      
      console.log(`💰 발견된 가격 패턴: ${prices.length}개`);
      
      // 3. 링크와 가격 매칭 (가장 가까운 가격을 찾기)
      for (const link of links) {
        // 링크 다음에 나오는 가장 가까운 가격 찾기
        const nearestPrice = prices.find(price => 
          price.index > link.index && 
          price.index - link.index < 2000 // 2000자 이내로 확장
        );
        
        if (nearestPrice) {
          const fullProductName = link.name;
          const productUrl = link.url;
          const priceStr = nearestPrice.price;
          
          // 상품명에서 브랜드와 제품명 분리 (모든 브랜드 허용)
          let brand = '기타';
          let productName = fullProductName;
          
          // [브랜드명] 제품명 형태 처리
          if (fullProductName.includes('] ')) {
            const bracketMatch = fullProductName.match(/\[([^\]]+)\]\s*(.+)/);
            if (bracketMatch) {
              brand = bracketMatch[1].trim();
              productName = bracketMatch[2].trim();
            }
          } else {
            // 브랜드명을 자동으로 추출 (첫 번째 단어나 구문을 브랜드로 가정)
            const words = fullProductName.split(' ');
            if (words.length >= 2) {
              // 첫 번째 단어가 브랜드일 가능성이 높음
              const potentialBrand = words[0];
              // 브랜드명이 한글이고 2글자 이상이면 브랜드로 인정
              if (potentialBrand.length >= 2 && /[가-힣]/.test(potentialBrand)) {
                brand = potentialBrand;
                productName = words.slice(1).join(' ');
              }
              // 영문 브랜드도 처리
              else if (potentialBrand.length >= 3 && /[a-zA-Z]/.test(potentialBrand)) {
                brand = potentialBrand;
                productName = words.slice(1).join(' ');
              }
            }
          }
          
          const price = parseInt(priceStr.replace(/,/g, ''), 10);
          
          // 유효성 검사 (브랜드 제한 제거)
          if (productName.length > 3 && price > 1000 && price < 10000000) {
            // 중복 체크
            const isDuplicate = products.some(p => 
              p.name === productName && p.brand === brand
            );
            
            if (!isDuplicate) {
              const product: DanawaProduct = {
                id: this.generateDanawaProductId(brand, productName),
                name: productName,
                brand,
                price: {
                  original: price,
                  currency: 'KRW'
                },
                productUrl: productUrl,
                source: 'danawa',
                crawledAt: new Date()
              };

              products.push(product);
              console.log(`✅ 상품 매칭 성공: ${brand} - ${productName} (${price.toLocaleString()}원)`);
            }
          }
        }
      }

      console.log(`🎉 총 ${products.length}개 고유 상품 추출 완료`);
      
      // 상품이 없으면 디버깅 정보 출력
      if (products.length === 0) {
        console.log('🔍 디버깅: 링크와 가격 매칭 실패');
        console.log('📝 마크다운 샘플 (첫 1000자):');
        console.log(markdown.substring(0, 1000));
      }
      
      return products;

    } catch (error) {
      console.error('다나와 상품 정보 추출 중 오류:', error);
      return [];
    }
  }

  // 다나와 상품 ID 생성
  private generateDanawaProductId(brand: string, productName: string): string {
    const combined = `danawa-${brand}-${productName}`.toLowerCase()
      .replace(/[^a-z0-9가-힣]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    return combined.substring(0, 100);
  }

  // Firebase에 다나와 상품 저장
  private async saveDanawaProductsToFirebase(products: DanawaProduct[]): Promise<void> {
    if (products.length === 0) {
      console.log('저장할 다나와 상품이 없습니다.');
      return;
    }

    const batch = writeBatch(db);
    const danawaCollection = collection(db, 'danawa-fragrances');

    products.forEach((product) => {
      const docRef = doc(danawaCollection, product.id);
      batch.set(docRef, product);
    });

    try {
      await batch.commit();
      console.log(`🔥 Firebase에 다나와 ${products.length}개 상품 저장 완료!`);
    } catch (error) {
      console.error('다나와 상품 Firebase 저장 실패:', error);
      throw error;
    }
  }
}

// 사용 예시
export async function startFirecrawlCrawling(apiKey: string) {
  const service = new FirecrawlPerfumeService(apiKey);
  return await service.crawlAllProducts();
}

// 다나와 크롤링 사용 예시
export async function startDanawaCrawling(apiKey: string) {
  const service = new DanawaFirecrawlService(apiKey);
  return await service.crawlDanawaFragrances();
} 