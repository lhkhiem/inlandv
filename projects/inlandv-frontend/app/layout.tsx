import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import Header from '@/components/layout/Header'
import ConditionalFooter from '@/components/layout/ConditionalFooter'
import BackToTopMount from '@/components/layout/BackToTopMount'
import PortraitButtonsWrapper from '@/components/PortraitButtonsWrapper'
import { FullpageProvider } from '@/components/FullpageContext'
import { LayoutMeasurementsProvider } from '@/components/LayoutMeasurementsContext'

// GMV DIN Pro - UI / Display Font (Headings, Navigation, Buttons, UI Elements)
const gmvDINPro = localFont({
  src: [
    { path: '../public/fonts/GMV_DIN_Pro-Thin.ttf', weight: '100', style: 'normal' },
    { path: '../public/fonts/GMV_DIN_Pro-Extlight.ttf', weight: '200', style: 'normal' },
    { path: '../public/fonts/GMV_DIN_Pro-Light.ttf', weight: '300', style: 'normal' },
    { path: '../public/fonts/GMV_DIN_Pro.ttf', weight: '400', style: 'normal' },
    { path: '../public/fonts/GMV_DIN_Pro-Medium.ttf', weight: '500', style: 'normal' },
    { path: '../public/fonts/GMV_DIN_Pro-Bold.ttf', weight: '700', style: 'normal' },
    { path: '../public/fonts/GMV_DIN_Pro-Black.ttf', weight: '900', style: 'normal' },
    { path: '../public/fonts/GMV_DIN_Pro-Thin_Italic.ttf', weight: '100', style: 'italic' },
    { path: '../public/fonts/GMV_DIN_Pro-Extlight_Italic.ttf', weight: '200', style: 'italic' },
    { path: '../public/fonts/GMV_DIN_Pro-Light_Italic.ttf', weight: '300', style: 'italic' },
    { path: '../public/fonts/GMV_DIN_Pro-Italic.ttf', weight: '400', style: 'italic' },
    { path: '../public/fonts/GMV_DIN_Pro-Medium_Italic.ttf', weight: '500', style: 'italic' },
    { path: '../public/fonts/GMV_DIN_Pro-Bold_Italic.ttf', weight: '700', style: 'italic' },
    { path: '../public/fonts/GMV_DIN_Pro-Black_Italic.ttf', weight: '900', style: 'italic' },
  ],
  variable: '--font-gmv-din-pro',
  display: 'swap',
})

// NotoSerif - Content / Reading Font (Long-form content, articles, blog posts)
const notoSerif = localFont({
  src: [
    { path: '../public/fonts/NotoSerif-Thin.ttf', weight: '100', style: 'normal' },
    { path: '../public/fonts/NotoSerif-ExtraLight.ttf', weight: '200', style: 'normal' },
    { path: '../public/fonts/NotoSerif-Light.ttf', weight: '300', style: 'normal' },
    { path: '../public/fonts/NotoSerif-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../public/fonts/NotoSerif-Medium.ttf', weight: '500', style: 'normal' },
    { path: '../public/fonts/NotoSerif-SemiBold.ttf', weight: '600', style: 'normal' },
    { path: '../public/fonts/NotoSerif-Bold.ttf', weight: '700', style: 'normal' },
    { path: '../public/fonts/NotoSerif-ExtraBold.ttf', weight: '800', style: 'normal' },
    { path: '../public/fonts/NotoSerif-Black.ttf', weight: '900', style: 'normal' },
    { path: '../public/fonts/NotoSerif-ThinItalic.ttf', weight: '100', style: 'italic' },
    { path: '../public/fonts/NotoSerif-ExtraLightItalic.ttf', weight: '200', style: 'italic' },
    { path: '../public/fonts/NotoSerif-LightItalic.ttf', weight: '300', style: 'italic' },
    { path: '../public/fonts/NotoSerif-Italic.ttf', weight: '400', style: 'italic' },
    { path: '../public/fonts/NotoSerif-MediumItalic.ttf', weight: '500', style: 'italic' },
    { path: '../public/fonts/NotoSerif-SemiBoldItalic.ttf', weight: '600', style: 'italic' },
    { path: '../public/fonts/NotoSerif-BoldItalic.ttf', weight: '700', style: 'italic' },
    { path: '../public/fonts/NotoSerif-ExtraBoldItalic.ttf', weight: '800', style: 'italic' },
    { path: '../public/fonts/NotoSerif-BlackItalic.ttf', weight: '900', style: 'italic' },
  ],
  variable: '--font-noto-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Inland Real Estate - Sàn Bất Động Sản Uy Tín',
  description: 'Sàn giao dịch bất động sản chuyên nghiệp, cung cấp các dự án mua bán và cho thuê bất động sản cao cấp tại Việt Nam.',
  keywords: 'bất động sản, mua bán nhà đất, cho thuê căn hộ, dự án bất động sản, inland real estate',
  authors: [{ name: 'Inland Real Estate' }],
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://inlandrealestate.vn',
    siteName: 'Inland Real Estate',
    title: 'Inland Real Estate - Sàn Bất Động Sản Uy Tín',
    description: 'Sàn giao dịch bất động sản chuyên nghiệp, cung cấp các dự án mua bán và cho thuê bất động sản cao cấp tại Việt Nam.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Inland Real Estate',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inland Real Estate - Sàn Bất Động Sản Uy Tín',
    description: 'Sàn giao dịch bất động sản chuyên nghiệp',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" className={`${gmvDINPro.variable} ${notoSerif.variable}`}>
      <body>
        <LayoutMeasurementsProvider>
          <FullpageProvider>
            <Header />
            <main>
              {children}
            </main>
            <ConditionalFooter />
            {/* Movetop: fullpage uses its own; normal scroll uses dedicated module */}
            <BackToTopMount />
            {/* Portrait buttons: CallButton và PortraitMoveTopButton cho normal scroll pages */}
            <PortraitButtonsWrapper />
          </FullpageProvider>
        </LayoutMeasurementsProvider>
      </body>
    </html>
  )
}
