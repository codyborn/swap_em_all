import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/wallet/Providers";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-gameboy",
});

export const metadata: Metadata = {
  title: "Swap 'Em All - Catch & Trade Tokens on Base",
  description: "A GameBoy-style Pokemon adventure where you catch and trade real tokens on Base using Uniswap",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${pressStart.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
