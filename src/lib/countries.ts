export interface Country {
  code: string;
  name: Record<string, string>;
}

/** Core set for MVP — enough for viral country leaderboards */
export const COUNTRIES: Country[] = [
  { code: "TR", name: { en: "Turkey", tr: "Türkiye", de: "Türkei", fr: "Turquie", es: "Turquía", it: "Turchia", ru: "Турция" } },
  { code: "US", name: { en: "United States", tr: "ABD", de: "USA", fr: "États-Unis", es: "EE. UU.", it: "Stati Uniti", ru: "США" } },
  { code: "DE", name: { en: "Germany", tr: "Almanya", de: "Deutschland", fr: "Allemagne", es: "Alemania", it: "Germania", ru: "Германия" } },
  { code: "FR", name: { en: "France", tr: "Fransa", de: "Frankreich", fr: "France", es: "Francia", it: "Francia", ru: "Франция" } },
  { code: "GB", name: { en: "United Kingdom", tr: "Birleşik Krallık", de: "Vereinigtes Königreich", fr: "Royaume-Uni", es: "Reino Unido", it: "Regno Unito", ru: "Великобритания" } },
  { code: "RU", name: { en: "Russia", tr: "Rusya", de: "Russland", fr: "Russie", es: "Rusia", it: "Russia", ru: "Россия" } },
  { code: "CN", name: { en: "China", tr: "Çin", de: "China", fr: "Chine", es: "China", it: "Cina", ru: "Китай" } },
  { code: "IN", name: { en: "India", tr: "Hindistan", de: "Indien", fr: "Inde", es: "India", it: "India", ru: "Индия" } },
  { code: "BR", name: { en: "Brazil", tr: "Brezilya", de: "Brasilien", fr: "Brésil", es: "Brasil", it: "Brasile", ru: "Бразилия" } },
  { code: "JP", name: { en: "Japan", tr: "Japonya", de: "Japan", fr: "Japon", es: "Japón", it: "Giappone", ru: "Япония" } },
  { code: "KR", name: { en: "South Korea", tr: "Güney Kore", de: "Südkorea", fr: "Corée du Sud", es: "Corea del Sur", it: "Corea del Sud", ru: "Южная Корея" } },
  { code: "IT", name: { en: "Italy", tr: "İtalya", de: "Italien", fr: "Italie", es: "Italia", it: "Italia", ru: "Италия" } },
  { code: "ES", name: { en: "Spain", tr: "İspanya", de: "Spanien", fr: "Espagne", es: "España", it: "Spagna", ru: "Испания" } },
  { code: "PL", name: { en: "Poland", tr: "Polonya", de: "Polen", fr: "Pologne", es: "Polonia", it: "Polonia", ru: "Польша" } },
  { code: "UA", name: { en: "Ukraine", tr: "Ukrayna", de: "Ukraine", fr: "Ukraine", es: "Ucrania", it: "Ucraina", ru: "Украина" } },
  { code: "NL", name: { en: "Netherlands", tr: "Hollanda", de: "Niederlande", fr: "Pays-Bas", es: "Países Bajos", it: "Paesi Bassi", ru: "Нидерланды" } },
  { code: "SE", name: { en: "Sweden", tr: "İsveç", de: "Schweden", fr: "Suède", es: "Suecia", it: "Svezia", ru: "Швеция" } },
  { code: "NO", name: { en: "Norway", tr: "Norveç", de: "Norwegen", fr: "Norvège", es: "Noruega", it: "Norvegia", ru: "Норвегия" } },
  { code: "FI", name: { en: "Finland", tr: "Finlandiya", de: "Finnland", fr: "Finlande", es: "Finlandia", it: "Finlandia", ru: "Финляндия" } },
  { code: "GR", name: { en: "Greece", tr: "Yunanistan", de: "Griechenland", fr: "Grèce", es: "Grecia", it: "Grecia", ru: "Греция" } },
  { code: "PT", name: { en: "Portugal", tr: "Portekiz", de: "Portugal", fr: "Portugal", es: "Portugal", it: "Portogallo", ru: "Португалия" } },
  { code: "RO", name: { en: "Romania", tr: "Romanya", de: "Rumänien", fr: "Roumanie", es: "Rumania", it: "Romania", ru: "Румыния" } },
  { code: "HU", name: { en: "Hungary", tr: "Macaristan", de: "Ungarn", fr: "Hongrie", es: "Hungría", it: "Ungheria", ru: "Венгрия" } },
  { code: "CZ", name: { en: "Czechia", tr: "Çekya", de: "Tschechien", fr: "Tchéquie", es: "Chequia", it: "Cechia", ru: "Чехия" } },
  { code: "AT", name: { en: "Austria", tr: "Avusturya", de: "Österreich", fr: "Autriche", es: "Austria", it: "Austria", ru: "Австрия" } },
  { code: "CH", name: { en: "Switzerland", tr: "İsviçre", de: "Schweiz", fr: "Suisse", es: "Suiza", it: "Svizzera", ru: "Швейцария" } },
  { code: "BE", name: { en: "Belgium", tr: "Belçika", de: "Belgien", fr: "Belgique", es: "Bélgica", it: "Belgio", ru: "Бельгия" } },
  { code: "IE", name: { en: "Ireland", tr: "İrlanda", de: "Irland", fr: "Irlande", es: "Irlanda", it: "Irlanda", ru: "Ирландия" } },
  { code: "CA", name: { en: "Canada", tr: "Kanada", de: "Kanada", fr: "Canada", es: "Canadá", it: "Canada", ru: "Канада" } },
  { code: "MX", name: { en: "Mexico", tr: "Meksika", de: "Mexiko", fr: "Mexique", es: "México", it: "Messico", ru: "Мексика" } },
  { code: "AR", name: { en: "Argentina", tr: "Arjantin", de: "Argentinien", fr: "Argentine", es: "Argentina", it: "Argentina", ru: "Аргентина" } },
  { code: "AU", name: { en: "Australia", tr: "Avustralya", de: "Australien", fr: "Australie", es: "Australia", it: "Australia", ru: "Австралия" } },
  { code: "IL", name: { en: "Israel", tr: "İsrail", de: "Israel", fr: "Israël", es: "Israel", it: "Israele", ru: "Израиль" } },
  { code: "SA", name: { en: "Saudi Arabia", tr: "Suudi Arabistan", de: "Saudi-Arabien", fr: "Arabie saoudite", es: "Arabia Saudí", it: "Arabia Saudita", ru: "Саудовская Аравия" } },
  { code: "EG", name: { en: "Egypt", tr: "Mısır", de: "Ägypten", fr: "Égypte", es: "Egipto", it: "Egitto", ru: "Египет" } },
  { code: "ZA", name: { en: "South Africa", tr: "Güney Afrika", de: "Südafrika", fr: "Afrique du Sud", es: "Sudáfrica", it: "Sudafrica", ru: "ЮАР" } },
  { code: "ID", name: { en: "Indonesia", tr: "Endonezya", de: "Indonesien", fr: "Indonésie", es: "Indonesia", it: "Indonesia", ru: "Индонезия" } },
  { code: "PK", name: { en: "Pakistan", tr: "Pakistan", de: "Pakistan", fr: "Pakistan", es: "Pakistán", it: "Pakistan", ru: "Пакистан" } },
  { code: "IR", name: { en: "Iran", tr: "İran", de: "Iran", fr: "Iran", es: "Irán", it: "Iran", ru: "Иран" } },
  { code: "OTHER", name: { en: "Other", tr: "Diğer", de: "Andere", fr: "Autre", es: "Otro", it: "Altro", ru: "Другое" } },
];

export function getCountryName(code: string, locale: string): string {
  const c = COUNTRIES.find((x) => x.code === code);
  if (!c) return code;
  return c.name[locale] ?? c.name.en;
}
