import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { HeroUIProvider } from "@heroui/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],     
});

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dashboard by admin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning={true} lang="en">
      <head>
        <link rel="shortcut icon" href="/logo.svg" sizes="any"/>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="hidden md:block">
        </div>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"   
            enableSystem
            disableTransitionOnChange>
            <HeroUIProvider>
              {children}
            </HeroUIProvider>
        </ThemeProvider>
        <Toaster/>
      </body>
    </html>
  );
}