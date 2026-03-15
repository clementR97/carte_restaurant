import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { OrderModalProvider } from "./context/OrderModalContext";
import OrderModal from "./components/OrderModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Karu'Foods - Fast Food Antillais",
  description: "Fast Food Antillais",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <OrderModalProvider>
          {children}
          <OrderModal />
        </OrderModalProvider>
      </body>
    </html>
  );
}
