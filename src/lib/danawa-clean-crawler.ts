import { chromium } from 'playwright';
import { collection, writeBatch, doc, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export interface DanawaFragranceClean {
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

export class DanawaCleanCrawler {
  private baseUrl = 'https://prod.danawa.com/list/?cate=18222429&15main_18_02';

  async startCrawling(targetCount: number = 1000, startPage: number = 1): Promise<{ success: boolean; totalProducts: number; message: string }> {
    const browser = await chromium.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      await page.goto(this.baseUrl);
      
      const allProducts: DanawaFragranceClean[] = [];
      let currentPage = startPage;
      
      // Firebase에서 기존 제품들 가져오기
      console.log('📋 Firebase에서 기존 제품 목록 가져오는 중...');
      const existingProducts = await this.getExistingProducts();
      console.log(`📋 기존 제품 ${existingProducts.length}개 확인됨`);

      while (allProducts.length < targetCount) {
        try {
          console.log(`📖 페이지 ${currentPage} 처리 중...`);
          
          if (currentPage === startPage) {
            // 첫 번째 페이지 처리
            if (startPage === 1) {
              // 1페이지는 이미 로드된 상태
              console.log(`📖 첫 번째 페이지(${startPage}) - 이미 로드됨`);
            } else if (startPage <= 10) {
              // 2-10페이지: 페이지 링크 클릭
              console.log(`📖 ${startPage}페이지로 이동 중...`);
              const pageSelector = `a.num[onclick*="movePage(${startPage})"]`;
              try {
                await page.waitForSelector(pageSelector, { timeout: 10000 });
                await page.click(pageSelector);
                await page.waitForTimeout(6000);
                await page.waitForLoadState('networkidle');
                console.log(`✅ ${startPage}페이지 이동 완료`);
              } catch (error) {
                console.error(`❌ ${startPage}페이지 이동 실패:`, error);
                throw error;
              }
            } else {
              // 11페이지 이상: "다음 페이지" 버튼을 먼저 클릭
              console.log(`📖 ${startPage}페이지로 이동 중... (다음 페이지 버튼 클릭)`);
              
              try {
                // "다음 페이지" 버튼 클릭
                const nextPageSelector = 'a.edge_nav.nav_next';
                await page.waitForSelector(nextPageSelector, { timeout: 10000 });
                await page.click(nextPageSelector);
                console.log(`✅ "다음 페이지" 버튼 클릭 완료`);
                
                // 페이지네이션 변경 대기
                await page.waitForTimeout(5000);
                
                // 이제 해당 페이지 링크 클릭 (11-20 범위에서)
                if (startPage > 11) {
                  const pageSelector = `a.num[onclick*="movePage(${startPage})"]`;
                  await page.waitForSelector(pageSelector, { timeout: 10000 });
                  await page.click(pageSelector);
                  await page.waitForTimeout(5000);
                  console.log(`✅ ${startPage}페이지 링크 클릭 완료`);
                }
                
                console.log(`✅ ${startPage}페이지 이동 완료`);
              } catch (error) {
                console.error(`❌ ${startPage}페이지 이동 실패:`, error);
                throw error;
              }
            }
          } else {
            // 페이지 변경 전 첫 번째 제품명 저장 (변경 확인용)
            const beforeFirstProduct = await page.$eval('.prod_main_info .prod_name a', el => el.textContent?.trim() || '').catch(() => '');
            console.log(`📝 변경 전 첫 번째 제품: ${beforeFirstProduct}`);
            
            // 11페이지부터는 "다음 페이지" 버튼을 먼저 클릭해야 함
            if (currentPage === 11 || (currentPage > 10 && (currentPage - 1) % 10 === 0)) {
              console.log(`🔄 페이지 ${currentPage}: "다음 페이지" 버튼 클릭 중...`);
              
              try {
                // "다음 페이지" 버튼 클릭
                const nextPageSelector = 'a.edge_nav.nav_next';
                await page.waitForSelector(nextPageSelector, { timeout: 10000 });
                await page.click(nextPageSelector);
                console.log(`✅ "다음 페이지" 버튼 클릭 완료`);
                
                // 페이지네이션 변경 대기
                await page.waitForTimeout(5000);
                
                // 페이지 변경 확인
                let attempts = 0;
                while (attempts < 10) {
                  const afterFirstProduct = await page.$eval('.prod_main_info .prod_name a', el => el.textContent?.trim() || '').catch(() => '');
                  if (afterFirstProduct && afterFirstProduct !== beforeFirstProduct) {
                    console.log(`✅ 페이지 변경 확인됨: ${afterFirstProduct}`);
                    break;
                  }
                  console.log(`⏳ 페이지 변경 대기 중... (시도 ${attempts + 1}/10)`);
                  await page.waitForTimeout(2000);
                  attempts++;
                }
                
                if (attempts >= 10) {
                  console.log(`❌ 페이지 ${currentPage}: "다음 페이지" 버튼 클릭 후 페이지 변경 확인 실패`);
                  break;
                }
              } catch (error) {
                console.error(`❌ 페이지 ${currentPage}: "다음 페이지" 버튼 클릭 실패:`, error);
                break;
              }
            } else {
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
                
                // 페이지 변경 대기 및 확인
                let attempts = 0;
                while (attempts < 10) {
                  await page.waitForTimeout(2000);
                  const afterFirstProduct = await page.$eval('.prod_main_info .prod_name a', el => el.textContent?.trim() || '').catch(() => '');
                  
                  if (afterFirstProduct && afterFirstProduct !== beforeFirstProduct) {
                    console.log(`✅ 페이지 변경 확인됨: ${afterFirstProduct}`);
                    break;
                  }
                  
                  console.log(`⏳ 페이지 변경 대기 중... (시도 ${attempts + 1}/10)`);
                  attempts++;
                }
                
                if (attempts >= 10) {
                  console.log(`❌ 페이지 ${currentPage}: 페이지 변경 확인 실패, 다음 페이지로 이동`);
                  currentPage++;
                  continue;
                }
              } catch (error) {
                console.error(`❌ 페이지 ${currentPage} 링크를 찾을 수 없음:`, error);
                
                // 페이지네이션 끝에 도달했을 가능성
                console.log(`🔚 페이지네이션 끝에 도달한 것 같습니다. 크롤링을 종료합니다.`);
                break;
              }
            }
          }
          
          // 제품 요소 대기 및 스크롤로 모든 제품 로드 보장
          await page.waitForSelector('.prod_main_info', { timeout: 15000 });
          
          // 페이지 끝까지 스크롤하여 모든 제품 로드
          console.log(`🔄 페이지 ${currentPage} 스크롤하여 모든 제품 로드 중...`);
          await page.evaluate(() => {
            return new Promise((resolve) => {
              let totalHeight = 0;
              const distance = 100;
              const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                  clearInterval(timer);
                  resolve(true);
                }
              }, 100);
            });
          });
          
          // 스크롤 후 추가 대기
          await page.waitForTimeout(3000);
          
          // 맨 위로 스크롤
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.waitForTimeout(2000);
          
          // DOM 상태 확인
          const domInfo = await page.evaluate(() => {
            const elements = document.querySelectorAll('.prod_main_info');
            const products: string[] = [];
            
            elements.forEach((el, idx) => {
              const nameEl = el.querySelector('a[name="productName"]');
              const name = nameEl?.textContent?.trim() || `제품${idx}`;
              products.push(`${idx}: ${name}`);
            });
            
            return {
              totalElements: elements.length,
              products: products
            };
          });
          
          console.log(`🔍 페이지 ${currentPage} DOM 확인: ${domInfo.totalElements}개 제품 발견`);
          domInfo.products.forEach(product => {
            console.log(`   ${product}`);
          });

          // 제품 데이터 추출
          const pageProducts = await page.evaluate((currentPageNum: number) => {
            const productElements = document.querySelectorAll('.prod_main_info');
            const extractedProducts: any[] = [];
            
            console.log(`🔍 페이지 ${currentPageNum}: DOM에서 ${productElements.length}개 제품 요소 발견`);

            productElements.forEach((element, index) => {
              try {
                // 제품명 추출
                const nameElement = element.querySelector('a[name="productName"]');
                const productName = nameElement?.textContent?.trim() || '';
                
                console.log(`📝 페이지 ${currentPageNum} 인덱스 ${index}: ${productName}`);
                
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
                  const productId = `danawa-clean-${timestamp}-${microseconds}-${currentPageNum}-${index}-${random}`;
                  
                  console.log(`✅ 페이지 ${currentPageNum} 인덱스 ${index} 제품 추가: ${productName} (ID: ${productId})`);
                  
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
                } else {
                  console.log(`❌ 페이지 ${currentPageNum} 인덱스 ${index} 제품 스킵: 이름="${productName}", 가격=${price}`);
                }
              } catch (error) {
                console.warn(`❌ 페이지 ${currentPageNum} 인덱스 ${index} 파싱 실패:`, error);
              }
            });

            console.log(`📊 페이지 ${currentPageNum} 최종: ${extractedProducts.length}개 제품 추출 완료`);
            
            // 추출된 모든 제품명 출력
            console.log(`📋 페이지 ${currentPageNum} 추출된 제품들:`);
            extractedProducts.forEach((product, idx) => {
              console.log(`   ${idx + 1}. ${product.name}`);
            });
            
            return extractedProducts;
          }, currentPage);

          if (pageProducts.length > 0) {
            // 중복 제거: 현재 세션 제품들과 Firebase 기존 제품들 모두와 비교
            const newProducts = pageProducts.filter(newProduct => {
              // 현재 세션에서 수집된 제품들과 비교
              const duplicateInSession = allProducts.some(existingProduct => 
                existingProduct.name === newProduct.name && 
                existingProduct.brand === newProduct.brand
              );
              
              // Firebase에 이미 저장된 제품들과 비교
              const duplicateInFirebase = existingProducts.some(existingProduct => 
                existingProduct.name === newProduct.name && 
                existingProduct.brand === newProduct.brand
              );
              
              return !duplicateInSession && !duplicateInFirebase;
            });
            
            console.log(`📊 페이지 ${currentPage}: ${pageProducts.length}개 추출, ${newProducts.length}개 신규, ${pageProducts.length - newProducts.length}개 중복`);
            
            allProducts.push(...newProducts);
            console.log(`✅ ${newProducts.length}개 제품 추출 완료 (총 ${allProducts.length}개)`);
            
            // 중간 저장 제거 - 최종에만 저장하여 중복 방지
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

      // 최종 저장 (모든 제품을 배치 단위로 저장)
      if (allProducts.length > 0) {
        console.log(`💾 최종 저장 시작: 총 ${allProducts.length}개 제품`);
        
        // 50개씩 나누어 저장
        for (let i = 0; i < allProducts.length; i += 50) {
          const batch = allProducts.slice(i, i + 50);
          await this.saveToFirebase(batch);
          console.log(`💾 배치 저장 완료: ${i + 1}-${Math.min(i + 50, allProducts.length)} (${batch.length}개)`);
        }
        
        console.log(`✅ 전체 저장 완료: ${allProducts.length}개`);
      }

      await browser.close();
      
      return {
        success: true,
        totalProducts: allProducts.length,
        message: `🧹 다나와 향수 깨끗한 크롤링 완료! 총 ${allProducts.length}개 제품 수집`
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

  private async getExistingProducts(): Promise<Array<{name: string, brand: string}>> {
    try {
      const collectionRef = collection(db, 'danawa-fragrances-clean');
      const snapshot = await getDocs(collectionRef);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          name: data.name || '',
          brand: data.brand || ''
        };
      });
    } catch (error) {
      console.error('❌ 기존 제품 목록 가져오기 실패:', error);
      return [];
    }
  }

  private async saveToFirebase(products: DanawaFragranceClean[]): Promise<void> {
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
      const collection_ref = collection(db, 'danawa-fragrances-clean');

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
export async function startCleanDanawaCrawling(targetCount: number = 1000, startPage: number = 1) {
  const crawler = new DanawaCleanCrawler();
  return await crawler.startCrawling(targetCount, startPage);
} 