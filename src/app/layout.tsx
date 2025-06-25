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
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WHKCSC8S');`,
          }}
        />
      </head>
      <body className="h-full lab-notebook" suppressHydrationWarning>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-WHKCSC8S"
            height="0" 
            width="0" 
            style={{display:'none', visibility:'hidden'}}
          />
        </noscript>
        
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