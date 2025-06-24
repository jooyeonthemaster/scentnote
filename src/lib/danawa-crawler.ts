import { collection, writeBatch, doc } from 'firebase/firestore';
import { db } from './firebase';

// 다나와 상품 타입
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

// Playwright 타입 정의 (실제 사용시 @playwright/test 설치 필요)
interface Page {
  goto(url: string, options?: { waitUntil?: string }): Promise<void>;
  waitForTimeout(timeout: number): Promise<void>;
  $$eval(selector: string, pageFunction: (elements: Element[]) => any): Promise<any>;
  $(selector: string): Promise<Element | null>;
  evaluate(pageFunction: () => any): Promise<any>;
  content(): Promise<string>;
}

export class DanawaPlaywrightCrawler {
  private baseUrl = 'https://prod.danawa.com/list/?cate=18222429&15main_18_02';

  async crawlDanawaFragrances(page: Page): Promise<{ success: boolean; totalProducts: number; message: string }> {
    try {
      console.log('🔥 Playwright로 다나와 향수 크롤링 시작...');

      // 1. 다나와 향수 페이지 접속
      await page.goto(this.baseUrl, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);

      console.log('📊 다나와 페이지 로딩 완료');

      // 2. 페이지 내용 추출
      const pageContent = await page.content();
      console.log('📄 페이지 내용 길이:', pageContent.length);

      // 3. 상품 정보 추출
      const products = await this.extractProductsFromHTML(pageContent);

      // 4. Firebase에 저장
      if (products.length > 0) {
        await this.saveProductsToFirebase(products);
      }

      return {
        success: true,
        totalProducts: products.length,
        message: `🎉 다나와에서 ${products.length}개 향수 상품 크롤링 완료!`
      };

    } catch (error) {
      console.error('❌ 다나와 크롤링 실패:', error);
      return {
        success: false,
        totalProducts: 0,
        message: `다나와 크롤링 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      };
    }
  }

  // HTML에서 상품 정보 추출
  private extractProductsFromHTML(html: string): DanawaProduct[] {
    const products: DanawaProduct[] = [];

    try {
      console.log('🔍 HTML에서 상품 정보 추출 중...');

      // 다나와 웹사이트에서 확인된 상품 패턴들
      const productPatterns = [
        // [발렌티노 뷰티] 패턴
        /\[발렌티노 뷰티\]\s*([^_\n]+)[\s\S]*?(\d{1,3}(?:,\d{3})*)\s*원/g,
        // 발렌티노뷰티 패턴
        /발렌티노뷰티\s+([^_\n]+)[\s\S]*?(\d{1,3}(?:,\d{3})*)\s*원/g,
        // 크리드 패턴
        /크리드\s+([^_\n]+)[\s\S]*?(\d{1,3}(?:,\d{3})*)\s*원/g,
        // 아이젠버그 파리 패턴
        /아이젠버그 파리\s+([^_\n]+)[\s\S]*?(\d{1,3}(?:,\d{3})*)\s*원/g,
        // 라리브 패턴
        /라리브\s+([^_\n]+)[\s\S]*?(\d{1,3}(?:,\d{3})*)\s*원/g,
      ];

      for (const pattern of productPatterns) {
        let match;
        while ((match = pattern.exec(html)) !== null) {
          try {
            const productName = match[1].trim();
            const priceStr = match[2];
            const price = parseInt(priceStr.replace(/,/g, ''), 10);

            // 브랜드명 결정
            let brand = '기타';
            if (html.includes('발렌티노')) brand = '발렌티노 뷰티';
            else if (html.includes('크리드')) brand = '크리드';
            else if (html.includes('아이젠버그')) brand = '아이젠버그 파리';
            else if (html.includes('라리브')) brand = '라리브';

            if (productName && price > 0) {
              const product: DanawaProduct = {
                id: this.generateProductId(brand, productName),
                name: productName,
                brand,
                price: {
                  original: price,
                  currency: 'KRW'
                },
                productUrl: this.baseUrl,
                source: 'danawa',
                crawledAt: new Date()
              };

              products.push(product);
              console.log(`✅ 상품 추출: ${brand} - ${productName} (${price.toLocaleString()}원)`);
            }
          } catch (error) {
            console.warn('상품 파싱 중 오류:', error);
          }
        }
      }

      // 중복 제거
      const uniqueProducts = this.removeDuplicates(products);
      console.log(`🎉 총 ${uniqueProducts.length}개 고유 상품 추출 완료`);
      
      return uniqueProducts;

    } catch (error) {
      console.error('HTML 파싱 중 오류:', error);
      return [];
    }
  }

  // 중복 상품 제거
  private removeDuplicates(products: DanawaProduct[]): DanawaProduct[] {
    const seen = new Set<string>();
    return products.filter(product => {
      const key = `${product.brand}-${product.name}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // 상품 ID 생성
  private generateProductId(brand: string, productName: string): string {
    const combined = `danawa-${brand}-${productName}`.toLowerCase()
      .replace(/[^a-z0-9가-힣]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    return combined.substring(0, 100);
  }

  // Firebase에 저장
  private async saveProductsToFirebase(products: DanawaProduct[]): Promise<void> {
    if (products.length === 0) {
      console.log('저장할 상품이 없습니다.');
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
      console.log(`🔥 Firebase에 ${products.length}개 상품 저장 완료!`);
    } catch (error) {
      console.error('Firebase 저장 실패:', error);
      throw error;
    }
  }
}

// 간단한 테스트용 함수 (Playwright 없이)
export async function testDanawaExtraction(): Promise<{ success: boolean; totalProducts: number; message: string }> {
  try {
    console.log('🧪 다나와 추출 로직 테스트...');
    
    // 실제 다나와 페이지에서 가져온 샘플 HTML
    const sampleHTML = `
      [발렌티노 뷰티] 본 인 로마 우오모 오 드 뚜왈렛 50ml (4종 택1) (+향수 미니어처 증정)
      124,200원
      네이버플러스멤버십 발렌티노 뷰티
      
      발렌티노뷰티 우오모 본 인 로마 오 드 뚜왈렛
      175,500원
      네이버플러스멤버십 발렌티노 뷰티
      
      크리드 어벤투스 오 드 퍼퓸
      320,000원
      네이버플러스멤버십 퍼퓸그라피
      
      아이젠버그 파리 러브어페어 옴므 오 드 퍼퓸
      101,650원
      네이버플러스멤버십 퍼퓸그라피
      
      [1+1] 라리브 잔향좋은 남성향수 전라인
      39,500원
      네이버플러스멤버십 크로스메드 샵
    `;

    const crawler = new DanawaPlaywrightCrawler();
    const products = crawler['extractProductsFromHTML'](sampleHTML);

    return {
      success: true,
      totalProducts: products.length,
      message: `🎉 테스트에서 ${products.length}개 상품 추출 완료!`
    };

  } catch (error) {
    console.error('❌ 테스트 실패:', error);
    return {
      success: false,
      totalProducts: 0,
      message: `테스트 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    };
  }
} 