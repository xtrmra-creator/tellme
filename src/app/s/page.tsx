import type { Metadata } from "next";
import Link from "next/link";
import {
  buildOgImageUrl,
  buildSharePageUrl,
  parseShareCardParams,
} from "@/lib/shareCard";
import { getSiteUrl } from "@/lib/shareSite";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function teaseTitle(card: {
  handle?: string;
  topicTitle: string;
  country: string;
}): string {
  const who = card.handle?.trim() || "Someone";
  return `${who} sealed a forecast on ${card.topicTitle} — what does ${card.country} say?`;
}

function teaseDescription(card: {
  country: string;
  risk: number;
  isPeace?: boolean;
  prediction: string;
}): string {
  if (card.isPeace) {
    return `${card.country}: ${card.risk}% war. I said no war. Open the seal — what does your country say?`;
  }
  return `${card.country}: ${card.risk}% war. Forecast sealed. Open to see the tag — what does your country say?`;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const card = parseShareCardParams(params);
  const title = teaseTitle(card);
  const description = teaseDescription(card);
  const image = buildOgImageUrl(card, getSiteUrl());
  const pageUrl = buildSharePageUrl(card);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: "WWtellme",
      type: "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: "Sealed WWtellme forecast",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function SharePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const card = parseShareCardParams(params);
  const image = buildOgImageUrl(card, getSiteUrl());

  return (
    <main className="min-h-dvh bg-[#050505] text-zinc-300 flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-3xl flex flex-col items-center gap-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt="Forecast seal"
          width={1200}
          height={630}
          className="w-full rounded-2xl border border-zinc-800 shadow-2xl shadow-black/50"
        />
        <div className="text-center space-y-3">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-amber-500">
            WWtellme
          </p>
          <h1 className="text-2xl sm:text-3xl font-light text-white">
            {card.topicTitle}
          </h1>
          <p className="text-sm text-zinc-400 max-w-md leading-relaxed">
            {teaseDescription(card)}
          </p>
        </div>
        <Link
          href="/"
          className="bg-amber-500 hover:bg-amber-400 text-black px-8 py-3 rounded-xl text-xs font-bold tracking-wide transition-colors"
        >
          Seal your forecast
        </Link>
      </div>
    </main>
  );
}
