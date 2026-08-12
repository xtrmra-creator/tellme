import type { Metadata } from "next";
import "./globals.css";
import { LocaleProvider } from "@/components/LocaleProvider";
import { t } from "@/lib/i18n";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: t("meta.title"),
  description: t("meta.description"),
  openGraph: {
    title: t("meta.title"),
    description: t("meta.ogDescription"),
    url: "https://wwtellme.com",
    siteName: "WWtellme",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: t("meta.title"),
    description: t("meta.ogDescription"),
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased min-h-screen">
        <LocaleProvider>{children}</LocaleProvider>
        <Analytics />
      </body>
    </html>
  );
}
