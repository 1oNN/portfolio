import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://hammadahmad.dev"),
  title: {
    default: "Hammad Ahmad — AI/ML Engineer & Researcher",
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
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://hammadahmad.dev",
    siteName: "Hammad Ahmad",
    title: "Hammad Ahmad — AI/ML Engineer & Researcher",
    description:
      "Graduate AI & Machine Learning Engineer specialising in LLMs, RAG systems, and scalable ML infrastructure.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Hammad Ahmad Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hammad Ahmad — AI/ML Engineer & Researcher",
    description:
      "Graduate AI & Machine Learning Engineer specialising in LLMs, RAG systems, and scalable ML infrastructure.",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
