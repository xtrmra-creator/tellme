// @ts-nocheck
import React from "react";
import { t } from "@/lib/i18n";

interface CountrySelectorProps {
  selectedCountry: string;
  onSelect: (countryCode: string) => void;
}

const COUNTRY_CODES = [
  "TR",
  "US",
  "DE",
  "FR",
  "GB",
  "JP",
  "CN",
  "RU",
  "IN",
  "BR",
  "CA",
  "AU",
] as const;

const FLAGS: Record<string, string> = {
  TR: "🇹🇷",
  US: "🇺🇸",
  DE: "🇩🇪",
  FR: "🇫🇷",
  GB: "🇬🇧",
  JP: "🇯🇵",
  CN: "🇨🇳",
  RU: "🇷🇺",
  IN: "🇮🇳",
  BR: "🇧🇷",
  CA: "🇨🇦",
  AU: "🇦🇺",
};

const CountrySelector: React.FC<CountrySelectorProps> = ({
  selectedCountry,
  onSelect,
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white mb-4">
        {t("countrySelector.title")}
      </h3>
      <p className="text-zinc-400 mb-6">{t("countrySelector.hint")}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {COUNTRY_CODES.map((code) => (
          <button
            key={code}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedCountry === code
                ? "border-amber-500 bg-amber-500/10"
                : "border-zinc-700 hover:border-zinc-500"
            }`}
            onClick={() => onSelect(code)}
          >
            <div className="text-2xl mb-2">{FLAGS[code]}</div>
            <div className="text-sm font-medium">
              {t(`countrySelector.countries.${code}`)}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8">
        <label className="block text-zinc-400 mb-2">
          {t("countrySelector.searchLabel")}
        </label>
        <input
          type="text"
          placeholder={t("countrySelector.searchPlaceholder")}
          className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
        />
      </div>
    </div>
  );
};

export default CountrySelector;
