# ScentNote 🧪

AI 기반 향수 추천 챗봇 서비스

## 프로젝트 소개

ScentNote는 사용자와의 자연스러운 대화를 통해 개인의 취향에 맞는 향수를 추천해주는 AI 챗봇 서비스입니다. 실험실 테마의 과학적 컨셉으로 향수 분석과 추천을 제공합니다.

## 주요 기능

- **AI 챗봇 대화**: Gemini AI를 활용한 자연스러운 대화형 상담
- **4단계 분석 프로세스**: 초기상담 → 경험수집 → 취향분석 → 추천완료
- **개인화된 추천**: 사용자의 향수 경험, 선호도, 가격대를 종합한 맞춤 추천
- **실시간 진행상황 표시**: 상담 단계별 진행률 시각화
- **구매 링크 제공**: 추천 향수의 실제 구매처 연결

## 기술 스택

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **상태관리**: Zustand
- **AI**: Google Gemini API
- **배포**: Vercel

## 개발 환경 설정

1. 프로젝트 클론
```bash
git clone https://github.com/jooyeonthemaster/scentnote.git
cd scentnote
```

2. 의존성 설치
```bash
npm install
```

3. 환경변수 설정
`.env.local` 파일을 생성하고 다음 환경변수를 설정하세요:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

4. 개발 서버 실행
```bash
npm run dev
```

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   └── chat/          # 채팅 API
│   ├── chat/              # 채팅 페이지
│   └── page.tsx           # 메인 페이지
├── components/
│   ├── features/          # 기능별 컴포넌트
│   └── ui/               # UI 컴포넌트
├── store/                 # Zustand 상태관리
├── types/                 # TypeScript 타입 정의
└── utils/                 # 유틸리티 함수
```

## 라이선스

MIT License 