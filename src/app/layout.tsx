import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ScentNote - AI 향수 취향 분석',
  description: '당신의 향수 취향을 분석하고 맞춤형 향수를 추천하는 AI 서비스',
  keywords: ['향수', '취향분석', 'AI추천', '메종마르지엘라', '실험실'],
  authors: [{ name: 'ScentNote Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#FFFFFF',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full">
      <body className="h-full lab-notebook">
        <div className="min-h-full bg-lab-paper relative">
          <div className="absolute inset-0 bg-lab-paper/90 pointer-events-none" />
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
} 