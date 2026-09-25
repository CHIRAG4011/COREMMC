import type { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";
import { Inter, JetBrains_Mono, Lobster } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { SecurityGuard } from "@/components/security-guard";
import { SiteDataProvider } from "@/contexts/site-data-context";
import { ScrollProgress } from "@/components/ui/scroll-progress";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700', '800'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
  weight: ['400', '500', '600'],
});

const lobster = Lobster({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lobster',
  weight: '400',
});

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://coremmc.cloud"),
  title: "CoreMMC — Premium Hosting | Minecraft, VPS, Domains, Discord Bots",
  description: "India's premium hosting platform. High-performance Minecraft servers, VPS solutions, domain registration, web hosting, and Discord bot hosting with India data centers for lowest latency.",
  keywords: ["hosting", "minecraft hosting", "VPS", "domain registration", "web hosting", "discord bot hosting", "India hosting", "CoreMMC"],
  verification: {
    google: "ALy13SlkcnfId49d7Xv7N7eDNu-GwJnayADrbQqEXT0",
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
  openGraph: {
    title: "CoreMMC — Premium Hosting | Minecraft, VPS, Domains, Discord Bots",
    description: "India's premium hosting platform. High-performance Minecraft servers, VPS solutions, domain registration, web hosting, and Discord bot hosting with India data centers for lowest latency.",
    images: [{ url: "/android-chrome-512x512.png", width: 512, height: 512, type: "image/png" }],
    type: "website",
    siteName: "CoreMMC",
  },
  twitter: {
    card: "summary",
    title: "CoreMMC — Premium Hosting",
    description: "India's premium hosting platform for Minecraft, VPS, Domains, and Discord Bots.",
    images: ["/android-chrome-512x512.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${lobster.variable} dark`} suppressHydrationWarning style={{ scrollBehavior: 'smooth' }}>
      <head>
        {/* Preconnect to Firebase Auth origin */}
        <link rel="preconnect" href="https://firebase.googleapis.com" />
        <link rel="preconnect" href="https://securetoken.googleapis.com" />
        {/* Favicon — explicit links for maximum browser/search-engine compatibility */}
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="antialiased min-h-screen flex flex-col overflow-x-hidden" style={{ background: '#0a0a0f' }} suppressHydrationWarning>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded-md">
          Skip to main content
        </a>
        <ScrollProgress />
        <SecurityGuard />
        <SiteDataProvider>
        {children}
        </SiteDataProvider>
        <Toaster />
        <SonnerToaster theme="dark" position="bottom-center" richColors expand />
        {/* Google Analytics — optimized by Next.js (afterInteractive) */}
        <GoogleAnalytics gaId="G-K51TY9H5NS" />
        {/* Google AdSense — lazy load after page is fully interactive */}
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9190694258297146"
          async
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}