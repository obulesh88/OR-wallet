import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase/client-provider";

export const metadata: Metadata = {
  title: "OR Wallet - Earn Money Daily by Completing Tasks | Rewards App",
  description: "OR Wallet: Complete simple daily tasks, earn rewards, and increase your savings. Play games, take surveys, watch videos & get paid daily to your wallet.",
  keywords: "earn money app, task earning app, play games earn money, survey app India, daily earning app",
  authors: [{ name: "OR Wallet Team" }],
  robots: "index, follow",
  themeColor: "#2196f3",
  alternates: {
    canonical: "https://orawallet.com",
  },
  openGraph: {
    title: "OR Wallet - Earn Money Daily by Completing Tasks",
    description: "Complete simple tasks, earn rewards, and get paid daily to your digital wallet.",
    url: "https://orawallet.com",
    type: "website",
    images: [
      {
        url: "https://orawallet.com/logo.png",
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
