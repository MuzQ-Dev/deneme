import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BEN'S BAP'S | Premium Catering & Event Services in London",
  description: "BEN'S BAP'S offers exceptional catering services, event planning, and custom menus for weddings, corporate events, and private parties in London. Experience premium British cuisine with professional service.",
  keywords: [
    "catering London",
    "event catering",
    "wedding catering",
    "corporate catering",
    "private party catering",
    "British cuisine",
    "event planning",
    "custom menus",
    "premium catering",
    "London catering services",
    "BEN'S BAP'S",
    "catering company",
    "event management",
    "buffet catering",
    "fine dining catering"
  ],
  authors: [{ name: "BEN'S BAP'S" }],
  creator: "BEN'S BAP'S",
  publisher: "BEN'S BAP'S",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://bensbaps.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "BEN'S BAP'S | Premium Catering & Event Services",
    description: "Exceptional catering services for weddings, corporate events, and private parties in London. Premium British cuisine with professional service.",
    url: '/',
    siteName: "BEN'S BAP'S",
    locale: 'en_GB',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: "BEN'S BAP'S Catering Services",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "BEN'S BAP'S | Premium Catering Services",
    description: "Exceptional catering services for weddings, corporate events, and private parties in London.",
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
    google: process.env.GOOGLE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <head>
        <link rel="canonical" href={process.env.NEXT_PUBLIC_SITE_URL || 'https://bensbaps.com'} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FoodEstablishment",
              "name": "BEN'S BAP'S",
              "description": "Premium catering and event services in London",
              "url": process.env.NEXT_PUBLIC_SITE_URL || "https://bensbaps.com",
              "servesCuisine": "British",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "GB",
                "addressLocality": "London"
              },
              "priceRange": "££",
              "image": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bensbaps.com'}/og-image.jpg`,
              "sameAs": [
                process.env.FACEBOOK_URL,
                process.env.INSTAGRAM_URL,
                process.env.TWITTER_URL
              ].filter(Boolean)
            })
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

