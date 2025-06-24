import { chromium } from 'playwright';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { db } from './firebase';

export interface DanawaFragrance {
  id: string;
  name: string;
  brand: string;
  price: number;
  pricePerMl?: number;
  volume?: string;
  productUrl: string;
  imageUrl?: string;
  rank?: number;
  rating?: number;
  reviewCount?: number;
  source: 'danawa';
  crawledAt: Date;
  pageNumber: number;
}

export class DanawaSimpleCrawler {
  private baseUrl = 'https://prod.danawa.com/list/?cate=18222429&15main_18_02';

  async startCrawling(targetCount: number = 1000): Promise<{ success: boolean; totalProducts: number; message: string }> {
    let browser;
    
    try {
      console.log(`🚀 다나와 향수 크롤링 시작 - 목표: ${targetCount}개`);
      
      // 브라우저 시작
      browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ]
      });

      const page = await browser.newPage();
      
      // User-Agent 설정 (컨텍스트 레벨에서 설정)
      await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });
      
      const allProducts: DanawaFragrance[] = [];
      let currentPage = 1;
      const maxPages = Math.ceil(targetCount / 30); // 페이지당 약 30개

      while (allProducts.length < targetCount && currentPage <= maxPages) {
        try {
          console.log(`📖 페이지 ${currentPage} 처리 중...`);
          
          if (currentPage === 1) {
            // 첫 번째 페이지는 직접 로드
            await page.goto(this.baseUrl, { waitUntil: 'networkidle', timeout: 30000 });
          } else {
            // 페이지 변경 전 첫 번째 제품명 저장 (변경 확인용)
            const beforeFirstProduct = await page.$eval('.prod_main_info .prod_name a', el => el.textContent?.trim() || '').catch(() => '');
            console.log(`📝 변경 전 첫 번째 제품: ${beforeFirstProduct}`);
            
            // 두 번째 페이지부터는 페이지네이션 링크 클릭
            console.log(`🔄 페이지 ${currentPage} 링크 클릭 중...`);
            
            // 페이지네이션 링크 찾기 및 클릭
            const pageSelector = `a.num[onclick*="movePage(${currentPage})"]`;
            
            try {
              // 페이지네이션 링크가 있는지 확인
              await page.waitForSelector(pageSelector, { timeout: 10000 });
              
              // 링크 클릭
              await page.click(pageSelector);
              console.log(`✅ 페이지 ${currentPage} 링크 클릭 완료`);
              
              // 페이지 변경 대기 (더 긴 시간)
              await page.waitForTimeout(6000);
              
              // 네트워크 요청 완료 대기
              await page.waitForLoadState('networkidle');
              
              // 페이지 변경 확인 (최대 10초 대기)
              let pageChanged = false;
              for (let i = 0; i < 10; i++) {
                const afterFirstProduct = await page.$eval('.prod_main_info .prod_name a', el => el.textContent?.trim() || '').catch(() => '');
                if (afterFirstProduct !== beforeFirstProduct && afterFirstProduct !== '') {
                  console.log(`✅ 페이지 변경 확인됨: ${afterFirstProduct}`);
                  pageChanged = true;
                  break;
                }
                console.log(`⏳ 페이지 변경 대기 중... (${i + 1}/10)`);
                await page.waitForTimeout(1000);
              }
              
              if (!pageChanged) {
                console.warn(`⚠️ 페이지 ${currentPage} 변경이 확인되지 않음`);
              }
              
            } catch (error) {
              console.error(`❌ 페이지 ${currentPage} 링크 클릭 실패:`, error);
              // 대체 방법: 텍스트로 링크 찾기
              const altSelector = `a.num:has-text("${currentPage}")`;
              await page.click(altSelector);
              await page.waitForTimeout(6000);
            }
          }
          
          // 제품 요소 대기
          await page.waitForSelector('.prod_main_info', { timeout: 15000 });
          await page.waitForTimeout(2000);

          // 제품 데이터 추출
          const pageProducts = await page.evaluate((currentPageNum: number) => {
            const productElements = document.querySelectorAll('.prod_main_info');
            const extractedProducts: any[] = [];

            productElements.forEach((element, index) => {
              try {
                // 제품명 추출
                const nameElement = element.querySelector('a[name="productName"]');
                const productName = nameElement?.textContent?.trim() || '';
                
                // 제품 URL 추출
                const productUrl = nameElement?.getAttribute('href') || '';
                const fullUrl = productUrl.startsWith('http') ? productUrl : `https://prod.danawa.com${productUrl}`;
                
                // 브랜드명 추출
                const brandMatch = productName.match(/^([가-힣a-zA-Z\s]+)/);
                const brand = brandMatch ? brandMatch[1].trim() : '기타';
                
                // 가격 정보 추출
                const priceElements = element.querySelectorAll('.price_sect strong');
                let price = 0;
                let volume = '';
                let pricePerMl = 0;
                
                if (priceElements.length > 0) {
                  const priceText = priceElements[0].textContent?.replace(/[^\d]/g, '') || '0';
                  price = parseInt(priceText, 10);
                  
                  // 용량 정보 추출
                  const volumeElement = element.querySelector('.memory_sect .text');
                  volume = volumeElement?.textContent?.trim() || '';
                  
                  // ml당 가격 추출
                  const pricePerMlElement = element.querySelector('.memory_price_sect');
                  if (pricePerMlElement) {
                    const pricePerMlText = pricePerMlElement.textContent?.replace(/[^\d]/g, '') || '0';
                    pricePerMl = parseInt(pricePerMlText, 10);
                  }
                }
                
                // 이미지 URL 추출
                const imageElement = element.querySelector('.thumb_image img') as HTMLImageElement;
                let imageUrl = imageElement?.src || '';
                if (imageUrl && !imageUrl.startsWith('http')) {
                  imageUrl = `https:${imageUrl}`;
                }
                
                // 순위 추출
                const rankElement = element.querySelector('.pop_rank');
                const rank = rankElement ? parseInt(rankElement.textContent?.replace(/[^\d]/g, '') || '0', 10) : undefined;
                
                // 평점 및 리뷰 수 추출
                const ratingElement = element.querySelector('.text__score');
                const rating = ratingElement ? parseFloat(ratingElement.textContent || '0') : undefined;
                
                const reviewElement = element.querySelector('.text__number');
                const reviewCount = reviewElement ? parseInt(reviewElement.textContent?.replace(/[^\d]/g, '') || '0', 10) : undefined;

                if (productName && price > 0) {
                  // 더 고유한 ID 생성 (마이크로초 + 랜덤값 추가)
                  const timestamp = Date.now();
                  const microseconds = performance.now().toString().replace('.', '');
                  const random = Math.random().toString(36).substring(2, 8);
                  const productId = `danawa-${timestamp}-${microseconds}-${currentPageNum}-${index}-${random}`;
                  
                  const product: any = {
                    id: productId,
                    name: productName,
                    brand: brand,
                    price: price,
                    productUrl: fullUrl,
                    source: 'danawa',
                    crawledAt: new Date(),
                    pageNumber: currentPageNum
                  };
                  
                  // undefined가 아닌 값들만 추가
                  if (pricePerMl > 0) product.pricePerMl = pricePerMl;
                  if (volume) product.volume = volume;
                  if (imageUrl) product.imageUrl = imageUrl;
                  if (rank && rank > 0) product.rank = rank;
                  if (rating && rating > 0) product.rating = rating;
                  if (reviewCount && reviewCount > 0) product.reviewCount = reviewCount;
                  
                  extractedProducts.push(product);
                }
              } catch (error) {
                console.warn(`제품 ${index} 파싱 실패:`, error);
              }
            });

            return extractedProducts;
          }, currentPage);

          if (pageProducts.length > 0) {
            allProducts.push(...pageProducts);
            console.log(`✅ ${pageProducts.length}개 제품 추출 완료 (총 ${allProducts.length}개)`);
            
            // 50개마다 Firebase에 저장
            if (allProducts.length % 50 === 0) {
              await this.saveToFirebase(pageProducts);
              console.log(`💾 중간 저장 완료 (${allProducts.length}개)`);
            }
          }

          // 목표 달성 체크
          if (allProducts.length >= targetCount) {
            console.log(`🎉 목표 달성! ${allProducts.length}개 수집 완료`);
            break;
          }

          currentPage++;
          
          // 페이지 간 지연 (2-4초)
          await page.waitForTimeout(2000 + Math.random() * 2000);

        } catch (error) {
          console.error(`❌ 페이지 ${currentPage} 처리 실패:`, error);
          currentPage++;
          await page.waitForTimeout(5000);
        }
      }

      // 최종 저장
      if (allProducts.length > 0) {
        const remainingProducts = allProducts.slice(-(allProducts.length % 50));
        if (remainingProducts.length > 0) {
          await this.saveToFirebase(remainingProducts);
        }
      }

      await browser.close();
      
      return {
        success: true,
        totalProducts: allProducts.length,
        message: `🎉 다나와 향수 크롤링 완료! 총 ${allProducts.length}개 제품 수집`
      };

    } catch (error) {
      console.error('❌ 크롤링 실패:', error);
      
      if (browser) {
        await browser.close();
      }
      
      return {
        success: false,
        totalProducts: 0,
        message: `크롤링 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      };
    }
  }

  private async saveToFirebase(products: DanawaFragrance[]): Promise<void> {
    if (products.length === 0) return;

    try {
      console.log(`💾 Firebase 저장 시작: ${products.length}개 제품`);
      
      // ID 중복 체크
      const ids = products.map(p => p.id);
      const uniqueIds = new Set(ids);
      if (ids.length !== uniqueIds.size) {
        console.warn(`⚠️ 중복 ID 발견: ${ids.length}개 중 ${uniqueIds.size}개만 고유함`);
      }
      
      const batch = writeBatch(db);
      const collection_ref = collection(db, 'danawa-fragrances-simple');

      products.forEach((product, index) => {
        const docRef = doc(collection_ref, product.id);
        batch.set(docRef, product);
        console.log(`📝 배치 추가 [${index + 1}/${products.length}]: ${product.name} (ID: ${product.id})`);
      });

      await batch.commit();
      console.log(`🔥 Firebase에 ${products.length}개 제품 저장 완료`);
      
      // 저장 후 검증
      console.log(`✅ 저장된 제품 ID들: ${products.map(p => p.id.split('-').slice(-2).join('-')).join(', ')}`);
      
    } catch (error) {
      console.error('❌ Firebase 저장 실패:', error);
      console.error('실패한 제품들:', products.map(p => ({ id: p.id, name: p.name })));
      throw error;
    }
  }
}

// 크롤링 실행 함수
export async function startSimpleDanawaCrawling(targetCount: number = 1000) {
  const crawler = new DanawaSimpleCrawler();
  return await crawler.startCrawling(targetCount);
} 