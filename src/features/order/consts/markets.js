/**
 * Markt-Auswahl als neutrale Text-Karten — keine fremden Logos (SPEC R12).
 * Beschreibungen nach HANDOFF 2.3.
 */
export const MARKETS = [
  {
    id: "rewe",
    label: "REWE",
    description: "Vollsortiment, größere Auswahl",
  },
  {
    id: "lidl",
    label: "Lidl",
    description: "Discounter, günstige Preise",
  },
  {
    id: "aldi",
    label: "Aldi",
    description: "Discounter, günstige Preise",
  },
  {
    id: "dm",
    label: "dm",
    description: "Drogerie, Baby & Haushalt — keine frischen Lebensmittel",
  },
  {
    id: "egal",
    label: "Egal — Sie entscheiden",
    description: "Wir wählen den passenden Markt für Ihre Liste",
  },
];

/**
 * @param {string} marketId
 * @returns {string}
 */
export function marketLabel(marketId) {
  return MARKETS.find((market) => market.id === marketId)?.label ?? marketId;
}
