import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wekeza Group Inc. | Financial Empowerment Platform",
  description:
    "Empowering communities through collective investments, financial education, and resource pooling. Join Wekeza Group to build wealth together.",
  keywords: [
    "Wekeza Group",
    "financial empowerment",
    "collective investments",
    "financial literacy",
    "wealth building",
    "community investment",
  ],
  authors: [{ name: "Wekeza Group Inc." }],
  creator: "Wekeza Group Inc.",
  publisher: "Wekeza Group Inc.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://wekeza.ca",
    title: "Wekeza Group Inc. | Financial Empowerment Platform",
    description:
      "Empowering communities through collective investments, financial education, and resource pooling.",
    siteName: "Wekeza Group Inc.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wekeza Group Inc. | Financial Empowerment Platform",
    description:
      "Empowering communities through collective investments, financial education, and resource pooling.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
