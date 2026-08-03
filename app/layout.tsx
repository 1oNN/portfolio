import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://hammadahmad.co.uk"),
  title: {
    default: "Hammad Ahmad - AI/ML Engineer & Researcher",
    template: "%s | Hammad Ahmad",
  },
  description:
    "Graduate AI & Machine Learning Engineer specialising in LLMs, RAG systems, and scalable ML infrastructure. MSc Applied AI, University of Bradford.",
  keywords: [
    "AI Engineer",
    "Machine Learning",
    "LLMs",
    "RAG",
    "NLP",
    "Python",
    "PyTorch",
    "FastAPI",
    "Neo4j",
    "Portfolio",
  ],
  authors: [{ name: "Hammad Ahmad" }],
  creator: "Hammad Ahmad",
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://hammadahmad.co.uk",
    siteName: "Hammad Ahmad",
    title: "Hammad Ahmad - AI/ML Engineer & Researcher",
    description:
      "Graduate AI & Machine Learning Engineer specialising in LLMs, RAG systems, and scalable ML infrastructure.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Hammad Ahmad - AI/ML Engineer & Researcher",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hammad Ahmad - AI/ML Engineer & Researcher",
    description:
      "Graduate AI & Machine Learning Engineer specialising in LLMs, RAG systems, and scalable ML infrastructure.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1b2a" },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Hammad Ahmad",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://hammadahmad.co.uk",
  jobTitle: "AI/ML Engineer & Researcher",
  description:
    "Graduate AI & Machine Learning Engineer specialising in LLMs, RAG systems, and scalable ML infrastructure. MSc Applied AI, University of Bradford.",
  alumniOf: [
    { "@type": "CollegeOrUniversity", name: "University of Bradford" },
    { "@type": "CollegeOrUniversity", name: "COMSATS University Islamabad" },
  ],
  sameAs: [
    "https://github.com/1onn",
    "https://linkedin.com/in/hammadahmad123",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-md focus:bg-[var(--accent)] focus:px-4 focus:py-2 focus:text-[var(--accent-contrast)] focus:shadow-lg"
        >
          Skip to content
        </a>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
