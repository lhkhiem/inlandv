import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/hooks/use-theme";
import { AppearanceProvider } from "@/hooks/use-appearance";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Inland CMS - Admin Dashboard",
  description: "Modern Content Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="light" storageKey="inland-cms-theme">
          <AppearanceProvider>
            {children}
          </AppearanceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

