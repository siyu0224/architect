import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Cormorant } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const cormorant = Cormorant({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Gao Architect | Architecture & Design",
  description:
    "Gao Architect creates spaces that sit gracefully in their context. View our work and get in touch.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${cormorant.variable} antialiased`}>
        <Header />
        {children}
      </body>
    </html>
  );
}
