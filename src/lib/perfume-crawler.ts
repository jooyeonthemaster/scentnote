import { collection, writeBatch, doc } from 'firebase/firestore';
import { db } from './firebase';
import { PerfumeProduct, CrawlConfig, CrawlProgress } from '@/types/perfume-product';

// Playwright 타입 정의 (설치 후 import로 변경)
interface Page {
  goto(url: string, options?: { waitUntil?: string }): Promise<void>;
  waitForTimeout(timeout: number): Promise<void>;
  $$eval(selector: string, pageFunction: (elements: Element[]) => any): Promise<any>;
  $(selector: string): Promise<Element | null>;
  evaluate(pageFunction: () => any): Promise<any>;
}

export class PerfumeCrawler {
  private config: CrawlConfig;
  private progress: CrawlProgress;
  private onProgressUpdate?: (progress: CrawlProgress) => void;

  constructor(config: CrawlConfig, onProgressUpdate?: (progress: CrawlProgress) => void) {
    this.config = config;
    this.onProgressUpdate = onProgressUpdate;
    this.progress = {
      totalProducts: 0,
      processedProducts: 0,
      failedProducts: 0,
      estimatedTimeRemaining: 0,
      status: 'idle'
    };
  }

  async startCrawling(page: Page): Promise<void> {
    try {
      this.progress.status = 'crawling';
      this.updateProgress();

      // 1단계: 카테고리별 상품 URL 수집
      const productUrls = await this.collectAllProductUrls(page);
      this.progress.totalProducts = productUrls.length;
      this.updateProgress();

      console.log(`총 ${productUrls.length}개 상품 발견`);

      // 2단계: 배치 단위로 상품 정보 추출
      await this.processProductsBatch(page, productUrls);

      this.progress.status = 'completed';
      this.updateProgress();

    } catch (error) {
      console.error('크롤링 중 오류:', error);
      this.progress.status = 'error';
      this.updateProgress();
      throw error;
    }
  }

  private async collectAllProductUrls(page: Page): Promise<string[]> {
    const baseUrl = 'https://perfumegraphy.com';
    const productUrls: string[] = [];

    try {
      // 메인 페이지 접속
      await page.goto(baseUrl, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);

      // 카테고리 링크 수집
      const categoryLinks = await page.$$eval('a[href*="/category/"]', links => 
        links.map(link => (link as HTMLAnchorElement).href)
      );

      console.log(`발견된 카테고리: ${categoryLinks.length}개`);

      // 각 카테고리별로 상품 URL 수집
      for (const categoryUrl of categoryLinks) {
        try {
          const categoryProducts = await this.collectCategoryProducts(page, categoryUrl);
          productUrls.push(...categoryProducts);
          
          this.progress.currentCategory = categoryUrl.split('/').pop();
          this.updateProgress();
          
          // 요청 간 지연
          await page.waitForTimeout(this.config.delayBetweenRequests);
        } catch (error) {
          console.error(`카테고리 ${categoryUrl} 처리 실패:`, error);
        }
      }

    } catch (error) {
      console.error('카테고리 수집 실패:', error);
    }

    return Array.from(new Set(productUrls)); // 중복 제거
  }

  private async collectCategoryProducts(page: Page, categoryUrl: string): Promise<string[]> {
    const productUrls: string[] = [];
    let currentPage = 1;
    let hasNextPage = true;

    while (hasNextPage) {
      try {
        const pageUrl = `${categoryUrl}?page=${currentPage}`;
        await page.goto(pageUrl, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);

        // 상품 링크 추출
        const pageProducts = await page.$$eval('a[href*="/product/"]', links => 
          links.map(link => (link as HTMLAnchorElement).href)
        );

        if (pageProducts.length === 0) {
          hasNextPage = false;
        } else {
          productUrls.push(...pageProducts);
          currentPage++;
          
          // 다음 페이지 버튼 확인
          const nextButton = await page.$('a[aria-label="Next"]');
          hasNextPage = nextButton !== null;
        }

      } catch (error) {
        console.error(`페이지 ${currentPage} 처리 실패:`, error);
        hasNextPage = false;
      }
    }

    return productUrls;
  }

  private async processProductsBatch(page: Page, productUrls: string[]): Promise<void> {
    const batches = this.chunkArray(productUrls, this.config.batchSize);
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const products: PerfumeProduct[] = [];

      console.log(`배치 ${i + 1}/${batches.length} 처리 중... (${batch.length}개 상품)`);

      // 배치 내 상품들 병렬 처리
      const productPromises = batch.map(url => this.extractProductInfo(page, url));
      const results = await Promise.allSettled(productPromises);

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          products.push(result.value);
          this.progress.processedProducts++;
        } else {
          console.error(`상품 ${batch[index]} 추출 실패:`, result.status === 'rejected' ? result.reason : 'Unknown error');
          this.progress.failedProducts++;
        }
      });

      // Firebase에 배치 저장
      if (products.length > 0) {
        await this.saveProductsBatch(products);
      }

      // 진행률 업데이트
      this.progress.estimatedTimeRemaining = this.calculateRemainingTime(batches.length - i - 1);
      this.updateProgress();

      // 배치 간 지연
      await page.waitForTimeout(this.config.delayBetweenRequests * 2);
    }
  }

  private async extractProductInfo(page: Page, productUrl: string): Promise<PerfumeProduct | null> {
    try {
      await page.goto(productUrl, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);

      // 상품 정보 추출
      const productInfo = await page.evaluate(() => {
        const getName = () => document.querySelector('h1')?.textContent?.trim() || '';
        const getBrand = () => document.querySelector('.brand')?.textContent?.trim() || '';
        const getPrice = () => {
          const priceText = document.querySelector('.price')?.textContent?.trim() || '';
          const price = parseInt(priceText.replace(/[^\d]/g, ''));
          return isNaN(price) ? 0 : price;
        };
        const getImage = () => document.querySelector('img.product-image')?.getAttribute('src') || '';
        const getDescription = () => document.querySelector('.product-description')?.textContent?.trim() || '';
        const getCategory = () => {
          const breadcrumbs = Array.from(document.querySelectorAll('.breadcrumb a'));
          return breadcrumbs.map(a => a.textContent?.trim()).filter(Boolean);
        };

        return {
          name: getName(),
          brand: getBrand(),
          price: getPrice(),
          imageUrl: getImage(),
          description: getDescription(),
          category: getCategory()
        };
      });

      // 데이터 검증
      if (!productInfo.name || !productInfo.brand) {
        throw new Error('필수 정보 누락');
      }

      const product: PerfumeProduct = {
        id: this.generateProductId(productUrl),
        name: productInfo.name,
        brand: productInfo.brand,
        price: {
          original: productInfo.price,
          currency: 'KRW'
        },
        description: productInfo.description,
        imageUrl: productInfo.imageUrl.startsWith('http') 
          ? productInfo.imageUrl 
          : `https://perfumegraphy.com${productInfo.imageUrl}`,
        purchaseUrl: productUrl,
        category: productInfo.category,
        tags: [],
        popularity: 0,
        isInStock: true,
        crawledAt: new Date(),
        lastUpdated: new Date(),
        source: 'perfumegraphy'
      };

      return product;

    } catch (error) {
      console.error(`상품 정보 추출 실패 ${productUrl}:`, error);
      return null;
    }
  }

  private async saveProductsBatch(products: PerfumeProduct[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      const productsCollection = collection(db, 'perfume-products');

      products.forEach(product => {
        const docRef = doc(productsCollection, product.id);
        batch.set(docRef, product);
      });

      await batch.commit();
      console.log(`${products.length}개 상품 Firebase에 저장 완료`);

    } catch (error) {
      console.error('Firebase 저장 실패:', error);
      throw error;
    }
  }

  private generateProductId(url: string): string {
    const urlParts = url.split('/');
    const productSlug = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
    return `perfumegraphy_${productSlug}`;
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private calculateRemainingTime(remainingBatches: number): number {
    const avgTimePerBatch = 60; // 60초 예상
    return remainingBatches * avgTimePerBatch;
  }

  private updateProgress(): void {
    if (this.onProgressUpdate) {
      this.onProgressUpdate({ ...this.progress });
    }
  }
}

// 크롤링 실행 함수
export async function startPerfumeCrawling(): Promise<void> {
  const config: CrawlConfig = {
    maxConcurrency: 5,
    delayBetweenRequests: 1000, // 1초
    retryAttempts: 3,
    batchSize: 50
  };

  const crawler = new PerfumeCrawler(config, (progress) => {
    console.log(`진행률: ${progress.processedProducts}/${progress.totalProducts} (${Math.round(progress.processedProducts / progress.totalProducts * 100)}%)`);
  });

  // Playwright 페이지는 외부에서 전달받아야 함
  // 실제 사용시에는 API 라우트에서 호출
} 