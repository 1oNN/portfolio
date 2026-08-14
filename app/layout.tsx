import { toJsonLd } from "@/lib/json-ld";
import AgentConsoleLauncher from "@/components/interactive/AgentConsoleLauncher";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/lib/metadata";
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// The -src suffix is not cosmetic: Tailwind 4 owns the --font-* namespace, so
// emitting --font-mono / --font-display here would have them defined twice,
// each referring to the other. app/globals.css maps these into @theme.
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono-src",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display-src",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://hammadahmad.co.uk"),
  title: {
    default: SITE_TITLE,
    template: "%s | Hammad Ahmad",
  },
  description: SITE_DESCRIPTION,
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
  // Deliberately NO openGraph.title / openGraph.description / twitter.title /
  // twitter.description / twitter.images here. App Router merges metadata
  // shallowly: any value pinned at the root sticks to every descendant that
  // does not override the whole object, which is why every child page used to
  // share the homepage's OG and Twitter text. Left unset, Next derives them
  // per page from that page's own title/description, and twitter falls back to
  // openGraph.images - so a route with its own opengraph-image.tsx gets its own
  // card image on both networks.
  // No `url` here on purpose: it would be inherited by every page that does not
  // set its own openGraph, so /blog and /projects used to advertise the
  // homepage as their og:url while their canonical said otherwise. Public pages
  // build a complete block via pageOpenGraph(); this is only the fallback for
  // routes that do not (admin, error), which are noindex anyway.
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "Hammad Ahmad",
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
  url: SITE_URL,
  jobTitle: "AI/ML Engineer & Researcher",
  description: SITE_DESCRIPTION,
  image: `${SITE_URL}/profile.png`,
  email: "mailto:hammadahmad.ml@gmail.com",
  alumniOf: [
    { "@type": "CollegeOrUniversity", name: "University of Bradford" },
    { "@type": "CollegeOrUniversity", name: "COMSATS University Islamabad" },
  ],
  sameAs: [
    "https://github.com/1oNN",
    "https://linkedin.com/in/hammadahmad123",
    "https://orcid.org/0009-0000-7873-4977",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(jsonLd) }}
        />
        {/*
          Decides the home-page intro BEFORE first paint, the same way
          next-themes avoids a theme flash. Setting this from a React effect
          instead would paint the page and then cover it, which reads as a bug.
          Guarded in try/catch because sessionStorage throws outright when
          cookies are blocked, and a decorative intro must never break the page.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{
if(location.pathname!=="/")return;
if(sessionStorage.getItem("intro-seen"))return;
if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;
sessionStorage.setItem("intro-seen","1");
document.documentElement.dataset.intro="play";
}catch(e){}})();`,
          }}
        />
      </head>
      <body id="top">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-md focus:bg-[var(--accent)] focus:px-4 focus:py-2 focus:text-[var(--accent-contrast)] focus:shadow-lg"
        >
          Skip to content
        </a>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          {/* Mounted here, not per page, so Ctrl+K works everywhere and the
              "Ask my agent about this project" chip on a case study can open
              the console in place instead of navigating home to an anchor. */}
          <AgentConsoleLauncher />
        </ThemeProvider>
      </body>
    </html>
  );
}
