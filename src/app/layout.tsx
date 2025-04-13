import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/i18n";
import Header from "@/components/Header";
import SceneButtons from "@/components/SceneButtons";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WeiDaoHang",
  description: "A modern navigation website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <I18nProvider>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <SceneButtons />
        </I18nProvider>
      </body>
    </html>
  );
}
