import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LocaleProvider } from "@/components/LocaleProvider";
import { t } from "@/lib/i18n";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: t("meta.title"),
  description: t("meta.description"),
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: "/apple-icon",
  },
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased min-h-dvh">
        <LocaleProvider>{children}</LocaleProvider>
        <Analytics mode="production" />
      </body>
    </html>
  );
}
