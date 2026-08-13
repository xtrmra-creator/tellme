import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LocaleProvider } from "@/components/LocaleProvider";
import { t } from "@/lib/i18n";
import { Analytics } from "@vercel/analytics/next";

const SITE_URL = "https://wwtellme.com";
/** Default social preview (1200×630) — absolute URL for Facebook crawlers. */
const DEFAULT_OG_IMAGE = `${SITE_URL}/api/og?t=WWtellme&p=Seal%20your%20forecast&c=World&r=50&l=en&v=5`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: t("meta.title"),
  description: t("meta.description"),
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: "/apple-icon",
  },
  openGraph: {
    title: t("meta.title"),
    description: t("meta.ogDescription"),
    url: SITE_URL,
    siteName: "WWtellme",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        secureUrl: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "WWtellme",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: t("meta.title"),
    description: t("meta.ogDescription"),
    images: [DEFAULT_OG_IMAGE],
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
