import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./main.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Metaplugs – World AI, Defence, Startups & More",
  description: "Metaplugs is your source for the latest intelligence on World AI, Defence Tech, Global Finance, Startups, and Unicorns.",
  keywords: "AI, defence technology, startups, unicorns, world news, technology blog",
  openGraph: {
    title: "Metaplugs",
    description: "Intelligence on World AI, Defence Tech, Global Finance, Startups & Unicorns.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
