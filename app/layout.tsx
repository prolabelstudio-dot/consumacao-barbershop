import { Manrope, Sora } from "next/font/google";
import type { Metadata, Viewport } from "next";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BarberPoints | Gestão de Fidelidade",
  description: "Sistema exclusivo de gestão de pontos e fidelidade para barbearias premium.",
  appleWebApp: {
    title: "BarberPoints",
    statusBarStyle: "black-translucent",
    capable: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#050505",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${manrope.variable} ${sora.variable}`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
