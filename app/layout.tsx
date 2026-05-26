import { Geist_Mono, Inter, Oxanium } from "next/font/google";

import "./globals.css";
import { Providers } from "@/app/providers";
import { Footer } from "@/components/shell/Footer";
import { Header } from "@/components/shell/Header";
import { cn } from "@/lib/utils";

const oxaniumHeading = Oxanium({
  subsets: ["latin"],
  variable: "--font-heading",
});

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata = {
  title: "Movie App — Algolia playground",
  description:
    "Demo app exercising Algolia InstantSearch, Recommend, Personalization, Rules, NeuralSearch, and Agent Studio against the public movies dataset.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable,
        oxaniumHeading.variable
      )}
    >
      <body className="flex min-h-svh flex-col bg-background">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
