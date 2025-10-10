import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase/client-provider";

export const metadata: Metadata = {
  title: "OR Wallet - Fast and Secure Digital Wallet",
  description: "OR Wallet is a simple, secure wallet for sending, receiving, and managing digital coins instantly.",
  keywords: "OR Wallet, crypto wallet, coin wallet, INR wallet, earn wallet, money transfer app, finance app",
  authors: [{ name: "OR Wallet Team" }],
  robots: "index, follow",
  themeColor: "#2196f3",
  alternates: {
    canonical: "https://orwallet.com",
  },
  openGraph: {
    title: "OR Wallet - Fast and Secure Digital Wallet",
    description: "Manage your balance, claim rewards, and withdraw easily using OR Wallet.",
    url: "https://orwallet.com",
    type: "website",
    images: [
      {
        url: "https://orwallet.com/logo.png",
      },
    ],
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased h-full">
        <FirebaseClientProvider>
          {children}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
