// GA4 Analytics 유틸리티 함수들

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// 페이지뷰 이벤트
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID, {
      page_location: url,
    });
  }
};

// 향수 상담 시작 이벤트
export const trackConsultationStart = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'consultation_start', {
      event_category: 'engagement',
      event_label: 'fragrance_consultation_started',
    });
  }
};

// 향수 추천 완료 이벤트
export const trackRecommendationComplete = (recommendationCount: number = 3) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'recommendation_complete', {
      event_category: 'conversion',
      event_label: 'fragrance_recommendation_generated',
      value: recommendationCount,
      custom_parameter_1: 'ai_powered_recommendation'
    });
  }
};

// 향수 상세 정보 클릭 이벤트
export const trackFragranceClick = (fragranceBrand: string, fragranceName: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'fragrance_detail_click', {
      event_category: 'engagement',
      event_label: 'fragrance_detail_viewed',
      fragrance_brand: fragranceBrand,
      fragrance_name: fragranceName,
    });
  }
};

// 구매 링크 클릭 이벤트
export const trackPurchaseLinkClick = (fragranceBrand: string, fragranceName: string, linkType: string = 'google_search') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase_link_click', {
      event_category: 'engagement',
      event_label: 'purchase_intent',
      fragrance_brand: fragranceBrand,
      fragrance_name: fragranceName,
      link_type: linkType,
    });
  }
};

// 채팅 메시지 전송 이벤트
export const trackChatMessage = (messageType: 'user' | 'bot', stage: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'chat_message', {
      event_category: 'engagement',
      event_label: 'chat_interaction',
      message_type: messageType,
      conversation_stage: stage,
    });
  }
};

// 취향 분석 진행률 이벤트
export const trackAnalysisProgress = (progressPercentage: number, stage: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'analysis_progress', {
      event_category: 'engagement',
      event_label: 'taste_analysis_progress',
      progress_percentage: progressPercentage,
      analysis_stage: stage,
    });
  }
};

// 에러 이벤트
export const trackError = (errorType: string, errorMessage: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'exception', {
      description: errorMessage,
      fatal: false,
      error_type: errorType,
    });
  }
}; 