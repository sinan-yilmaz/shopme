# SPEC — Demo-Web-App „Einkaufsservice Günzburg" (Arbeitstitel)

**Version 1.0 · Stand 17.07.2026 · Status: verbindlich für den Demo-Build**

---

## 0. Auftrag an den Coding-Agent

Baue die hier spezifizierte Demo-Anwendung **vollständig und exakt nach dieser Spezifikation**.

- Diese Datei ist die einzige Anforderungsquelle. Bei Widersprüchen gilt: **Abschnitt 5 (Business-Regeln) > Abschnitt 8/9 (Screens) > Rest.**
- Falls im Repo Skills/Konventionen unter `.claude/skills/` liegen (structure-_, craft-_), gelten sie zusätzlich; Abschnitt 3 fasst die wichtigsten zusammen und widerspricht ihnen nicht.
- **Lade verfügbare Skills aktiv, bevor du baust:** die structure-/craft-Skills des Repos vor der ersten Code-Zeile — und, falls installiert, Design-Skills (insbesondere Anthropics offiziellen `frontend-design`-Skill) vor der ersten UI-Zeile. Abschnitt 10 gilt in jedem Fall zusätzlich; fehlen Design-Skills, ist Abschnitt 10 allein die verbindliche Design-Vorgabe.
- Stelle keine Rückfragen. Entscheide Detailfragen konservativ und im Sinne der Business-Regeln. Dokumentiere nicht offensichtliche Entscheidungen kurz im README.
- Erfinde keine zusätzlichen Features. Was nicht in dieser Spec steht, wird nicht gebaut (siehe Abschnitt 14).
  **Zweck der Demo:** Ein klickbarer, hochwertig wirkender Prototyp des Bestell- und Fahrer-Flows — für interne Tests der drei Gründer, Nutzerfeedback aus dem Bekanntenkreis und als Vorzeigeobjekt (Presse, spätere Gespräche mit Märkten). Kein Produktivsystem: keine Datenbank, kein Backend, keine echte Zahlung.

---

## 1. Ziele & Nicht-Ziele

**Ziele**

1. Kompletter Kunden-Bestellflow: Einkaufsliste bauen → Budget & Markt → Lieferfenster & Adresse → Prüfen & Bestellen → Statusseite.
2. Kompletter Fahrer-Flow: Bestellübersicht → Einkaufsmodus mit Budget-Logik → Abrechnung → Lieferung.
3. Alle Business-Regeln aus Abschnitt 5 funktionieren real (Gebühren, Budget-Skip, Kapazitäten, Bestellschluss, Gutschrift).
4. Wirkt produktionsreif: sauberes UI, deutsche Texte, mobile-first, barrierearm (Senioren-tauglich).
5. Architektur so geschnitten, dass später **nur die API-Schicht** gegen Supabase getauscht wird.
   **Nicht-Ziele (bewusst ausgeklammert)**

- Kein Login/Auth, keine Nutzerkonten.
- Keine echte Zahlung — Zahlungslink wird nur simuliert (Abschnitt 8, Schritt 4).
- Keine Datenbank, kein Server — Fake-Backend im Browser (Abschnitt 6).
- Kein echter WhatsApp-Versand — nur `wa.me`-Deeplinks mit vorbefülltem Text.
- Kein LLM-/KI-Parsing — der Listen-Import ist ein deterministischer Parser (Abschnitt 8, Schritt 1).
- Keine Mehrsprachigkeit, kein Dark Mode, keine Push-Notifications.

---

## 2. Tech-Stack & Setup

| Bereich           | Vorgabe                                                                                                                                                                                                                                                                                                                                                   |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Build             | Vite (aktuelle stabile Version), SPA                                                                                                                                                                                                                                                                                                                      |
| Sprache           | **JavaScript (ESM). Kein TypeScript.** Typen als JSDoc-`@typedef`                                                                                                                                                                                                                                                                                         |
| UI                | React (aktuelle stabile Version), Tailwind CSS                                                                                                                                                                                                                                                                                                            |
| Routing           | `react-router-dom` (Library-Mode, `createBrowserRouter`)                                                                                                                                                                                                                                                                                                  |
| Server-State      | `@tanstack/react-query` v5 (auch für das Fake-Backend)                                                                                                                                                                                                                                                                                                    |
| Formulare         | `react-hook-form` (eingebaute Validierung, **kein** zod/yup)                                                                                                                                                                                                                                                                                              |
| Drag & Drop       | `@dnd-kit/core` + `@dnd-kit/sortable`                                                                                                                                                                                                                                                                                                                     |
| Icons             | `lucide-react`                                                                                                                                                                                                                                                                                                                                            |
| Utilities         | `clsx`                                                                                                                                                                                                                                                                                                                                                    |
| Basis-Komponenten | Bevorzugt shadcn/ui im **JavaScript-Modus** (`"tsx": false` in components.json), abgelegt unter `lib/shadcn/`, niemals editiert — Anpassungen über Wrapper. **Fallback:** Wenn das shadcn-Setup Probleme macht, eigene Primitives in `lib/primitives/` bauen (Button, Input, Dialog, Select, Checkbox); die Screens dürfen dadurch nicht anders aussehen. |

Keine weiteren Dependencies ohne zwingenden Grund.

**Import-Aliase:** `baseUrl: 'src'` (jsconfig.json) + passende `resolve.alias`-Einträge in `vite.config.js`, sodass Imports so aussehen: `import routes from 'common/consts/routes'`, `import { OrderItemRow } from 'features/order/components'`.

**Formatierung/Linting:** ESLint (react, react-hooks) + Prettier-Defaults. `npm run lint` muss fehlerfrei durchlaufen.

---

## 3. Architektur & Projektstruktur

Die Struktur folgt den Repo-Konventionen (structure-* / craft-*-Skills). Kurzfassung der verbindlichen Regeln:

- **`src/root/`** — `Root.jsx` (Provider + Route-Tree, einzige JSX-Datei ohne eigenen Ordner), `root.css`, `components/` (App-Shell), `scopes/` (unsichtbare Route-Wrapper mit `<Outlet />`). Root exportiert nichts; nur `main.jsx` konsumiert es.
- **`src/pages/`** — eine Page pro Route, komponiert Sections; kein Barrel, Direktpfad-Importe.
- **`src/features/{domain}/`** — Domänensprache nur hier. Untermodule optional: `components/` (einziges Barrel), `hooks/`, `context/`, `consts/`, `services/`, `api/`, `types/`, `errors/`, `mocks/`.
- **`src/ui/{group}/`** — app-spezifische, domänenfreie Komponenten mit fester Semantik; Barrel auf Gruppenebene.
- **`src/lib/`** — generische Bausteine: `primitives/`, `layout/` (`PageContainer`, `PageHeader`, `Section`), `form-layout/`, `form-fields/`, ggf. `shadcn/` (unangetastet).
- **`src/common/`** — generisch & domänenfrei: `services/`, `consts/`, `hooks/`, `errors/`, `types/`. Keine Komponenten, kein Barrel, importiert nichts aus `src/` außer common.
- **Komponenten:** ein Ordner pro Komponente + `index.js`-Re-Export, Default-Export, interne Reihenfolge hooks → derived → handlers → guards → JSX, Props destrukturiert, Styling via Tailwind + `clsx`.
- **Query-Hooks:** `use{Domain}{Specifier}({ ... })`, Query-Key als benannter Const im selben File (`ORDERS_QUERY_KEY`), `queryFn` ruft die API-Schicht, Rückgabe unverändert. **Mutation-Hooks:** `use{Action}{Domain}(options)`, Invalidierung in `onSuccess` vor dem Weiterreichen der Caller-Callbacks.
- **API-Schicht:** `features/{domain}/api/{Domain}Api.js` — reine async-Funktionen, formen Daten, werfen Domain-Errors. Komponenten/Hooks greifen **nie** direkt auf das Fake-Backend zu.
- **Formulare:** Hook `use{Domain}{Action}Form.js` mit `DEFAULT_VALUES`-Const, ein `useController` pro Feld im `fields`-Objekt, Validierungsregeln mit Message im Hook; Formular-Komponente ist kontrolliert und importiert nie react-hook-form; Submit-Button steht außerhalb via `form="<id>"`.

### 3.1 Domänen

| Domain     | Verantwortung                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------- |
| `catalog`  | Katalogartikel, Kategorien, Suche                                                                 |
| `order`    | Bestellentwurf (Draft), Bestellungen, Positionen, Gebührenrechnung, Statusmaschine, Listen-Parser |
| `delivery` | Liefergebiete/PLZ, Zeitfenster, Bestellschluss- und Kapazitätslogik                               |

Erlaubte Feature-Querbezüge: `order` darf aus `delivery` und `catalog` importieren (Direktpfad bzw. components-Barrel). Nicht umgekehrt.

### 3.2 Ziel-Struktur (Auszug, verbindlich für die genannten Dateien)

```
src/
├── main.jsx
├── root/
│   ├── Root.jsx                      # Provider (QueryClient), Router, Route-Tree
│   ├── root.css
│   └── components/
│       ├── App/                      # Shell: DemoBanner + Header + <Outlet/> + Footer
│       └── DemoBanner/               # „Demo"-Hinweis + Reset-Button
├── pages/
│   ├── HomePage/
│   ├── OrderWizardPage/              # Schritte 1–4 (Abschnitt 8)
│   ├── OrderConfirmationPage/        # Erfolg nach Bestellung
│   ├── OrderStatusPage/              # /bestellung/:code
│   ├── DriverOverviewPage/           # /fahrer
│   ├── DriverOrderPage/              # /fahrer/bestellung/:id (Einkaufsmodus + Abrechnung)
│   └── NotFoundPage/
├── features/
│   ├── catalog/
│   │   ├── api/CatalogApi.js
│   │   ├── components/               # CatalogSearch, CategoryChips, CatalogItemButton …
│   │   ├── consts/categories.js
│   │   └── hooks/useCatalogItems.js
│   ├── order/
│   │   ├── api/OrderApi.js
│   │   ├── components/               # OrderItemRow, OrderItemList, BudgetInput, MarketPicker,
│   │   │                             # PasteImportDialog, OrderSummary, FeeBreakdown,
│   │   │                             # OrderStatusTimeline, ShoppingChecklist, ShoppingItemRow,
│   │   │                             # ReceiptForm, HandoverChecklist …
│   │   ├── consts/fees.js            # alle Beträge in Cent (Abschnitt 5)
│   │   ├── consts/orderStatus.js
│   │   ├── context/OrderDraftProvider.jsx  # + useOrderDraft()
│   │   ├── hooks/                    # useOrders, useOrderByCode, useOrderById,
│   │   │                             # useCreateOrder, useUpdateOrderItem, useCompleteShopping,
│   │   │                             # useUpdateOrderStatus, useOrderAddressForm …
│   │   ├── services/calculateFees.js
│   │   ├── services/parseShoppingList.js
│   │   ├── services/sortItemsForShopping.js
│   │   └── types/Order.js            # JSDoc-Typedefs
│   └── delivery/
│       ├── api/DeliveryApi.js
│       ├── components/               # SlotPicker, AreaHint …
│       ├── consts/areas.js           # PLZ→Gebiet (Abschnitt 5, R2)
│       ├── hooks/useDeliverySlots.js
│       └── services/slotRules.js     # Cutoff/Kapazität (pure functions)
├── ui/
│   ├── buttons/                      # z. B. WhatsAppButton (fester Zweck)
│   ├── feedback/                     # InfoBox, WarningBox, EmptyState
│   └── steps/                        # WizardSteps (Fortschrittsanzeige)
├── lib/
│   ├── primitives/  layout/  form-layout/  form-fields/  (ggf. shadcn/)
├── common/
│   ├── consts/routes.js  consts/brand.js
│   ├── hooks/useDebounce.js
│   └── services/money.js  services/demoDb.js  services/id.js
└── assets/
```

**`common/consts/brand.js`** (Marke ist noch nicht entschieden — alles Branding nur hier):

```js
export const BRAND_NAME = "Einkaufsservice Günzburg";
export const BRAND_CLAIM = "Wir kaufen ein. Sie machen Schöneres.";
export const WHATSAPP_NUMBER = "4915112345678"; // Platzhalter
```

---

## 4. Datenmodell (JSDoc, verbindlich)

Alle Geldbeträge sind **Integer in Cent**. Formatierung ausschließlich über `common/services/money.js` (`formatCents(9290) → '92,90 €'`, `Intl.NumberFormat('de-DE')`).

```js
/** @typedef {Object} CatalogItem
 *  @property {string} id
 *  @property {string} name            // markenfrei, z. B. "Eier"
 *  @property {string} categoryId
 *  @property {string} emoji           // z. B. "🥚"
 *  @property {string[]} units         // erlaubte Einheiten, erste = Default: "Stück"|"Packung"|"kg"|"g"|"Liter"|"Flasche"|"Kiste"|"Dose"|"Glas"|"Bund"
 *  @property {boolean} bioAvailable   // Bio-Toggle anbieten?
 *  @property {boolean} ageRestricted  // Alkohol → Ausweis-Check bei Übergabe
 *  @property {string[]} keywords      // Suchbegriffe/Synonyme, lowercase
 */

/** @typedef {Object} OrderItem
 *  @property {string} id
 *  @property {string|null} catalogItemId   // null = Freitext-Artikel
 *  @property {string} label
 *  @property {number} quantity             // > 0
 *  @property {string} unit
 *  @property {boolean} bio
 *  @property {boolean} mustHave            // Pflicht-Artikel
 *  @property {string} note                 // z. B. "reife Avocados"
 *  @property {number} position             // Prio: 0 = wichtigster Kann-Artikel-Rang, Reihenfolge der Liste
 *  @property {'offen'|'gekauft'|'ersetzt'|'uebersprungen'} status
 *  @property {number|null} priceCents      // vom Fahrer optional erfasst
 *  @property {string} substitutionNote
 */

/** @typedef {'eingegangen'|'bestaetigt'|'im_einkauf'|'unterwegs'|'geliefert'|'storniert'} OrderStatus */

/** @typedef {Object} Order
 *  @property {string} id
 *  @property {string} code                 // "GZ-26-0001"
 *  @property {string} createdAt            // ISO
 *  @property {OrderStatus} status
 *  @property {{name:string, phone:string, street:string, zip:string, city:string,
 *              doorInfo:string, area:'stadt'|'umland'}} customer
 *  @property {'rewe'|'lidl'|'aldi'|'dm'|'egal'} market
 *  @property {boolean} allowSecondMarket
 *  @property {string} slotId
 *  @property {number} budgetCents
 *  @property {OrderItem[]} items
 *  @property {'vorkasse'|'tuer'} paymentMode
 *  @property {number|null} prepaidCents    // nur bei vorkasse (R6)
 *  @property {number|null} receiptCents    // Kassenbon-Summe nach Einkauf
 *  @property {{deliveryCents:number, serviceCents:number}|null} finalFees
 *  @property {boolean} ageCheckConfirmed
 */

/** @typedef {Object} DeliverySlot
 *  @property {string} id               // "2026-07-18_am"
 *  @property {string} date             // "2026-07-18"
 *  @property {string} label            // "17:30–20:30 Uhr"
 *  @property {string} start            // "17:30"
 *  @property {string} end              // "20:30"
 *  @property {string} cutoffAt         // ISO — bis wann buchbar
 *  @property {number} capacity
 *  @property {number} bookedCount
 */
```

**Status-Übergänge (Statusmaschine, in `consts/orderStatus.js` als Map):**
`eingegangen → bestaetigt | storniert` · `bestaetigt → im_einkauf | storniert` · `im_einkauf → unterwegs` · `unterwegs → geliefert`. Andere Übergänge sind ungültig und werden von `OrderApi` mit Fehler abgelehnt.

---

## 5. Business-Regeln (verbindlich, einzeln testbar)

**R1 — Gebühren.** `features/order/consts/fees.js`:

```js
export const FEE_DELIVERY_CITY_CENTS = 490;
export const FEE_DELIVERY_SUBURB_CENTS = 690;
export const SERVICE_FEE_RATE = 0.1;
export const SERVICE_FEE_MIN_CENTS = 300;
export const SERVICE_FEE_MAX_CENTS = 1200;
export const MIN_BUDGET_CENTS = 3000; // Mindestbestellwert 30 €
```

Servicegebühr auf einen Betrag `x`: `clamp(round(x * 0.10), 300, 1200)`. Liefergebühr nach `customer.area`.

**R2 — Liefergebiet (PLZ → Gebiet)** in `features/delivery/consts/areas.js`:

| PLZ   | Ort                        | area     |
| ----- | -------------------------- | -------- |
| 89312 | Günzburg (inkl. Ortsteile) | `stadt`  |
| 89340 | Leipheim                   | `umland` |
| 89347 | Bubesheim                  | `umland` |
| 89359 | Kötz                       | `umland` |
| 89335 | Ichenhausen                | `umland` |

Jede andere PLZ: Bestellung nicht möglich; freundlicher Hinweis (Copy C7) statt Weiter-Button.

**R3 — Budget.** `budgetCents ≥ MIN_BUDGET_CENTS`, sonst kein Fortschritt im Wizard. Das Budget ist eine **harte Obergrenze für den Warenwert** (Kassenbon ≤ Budget ist das Einkaufsziel des Fahrers).

**R4 — Einkaufsreihenfolge & Skip-Regel.** `sortItemsForShopping(items)` liefert: **zuerst alle `mustHave`-Artikel in Listenreihenfolge, danach alle übrigen in Listenreihenfolge.** Würde ein Artikel das Budget sprengen, wird nur dieser übersprungen (`uebersprungen`) und mit den nachfolgenden weitergemacht — kein Abbruch. (Im Demo entscheidet der Fahrer per Button; die App erzwingt das nicht automatisch, zeigt aber Budget-Fortschritt und Warnung ab 90 %.)

**R5 — Zeitfenster.** Erzeugung für die nächsten 7 Kalendertage ab heute: Mo–Fr ein Fenster 17:30–20:30 (Cutoff: gleicher Tag 14:00), Sa zwei Fenster 10:00–13:00 und 14:00–17:00 (Cutoff: Freitag 20:00), So keine Fenster. `capacity = 8`. Buchbar nur, wenn `now < cutoffAt` **und** `bookedCount < capacity`. Anzeige „Nur noch X Plätze" bei Restplätzen ≤ 2; ausgebuchte/abgelaufene Fenster sichtbar, aber deaktiviert.

**R6 — Vorkasse (Neukunde).** Bei `paymentMode = 'vorkasse'`:
`prepaidCents = budgetCents + deliveryFee(area) + clamp(round(budgetCents * 0.10), 300, 1200)`.
Beispiel: Budget 80 €, Stadt → 8000 + 490 + 800 = **9290** („92,90 €").

**R7 — Abrechnung & Gutschrift.** Nach Bon-Eingabe (`receiptCents`):
`serviceCents = clamp(round(receiptCents * 0.10), 300, 1200)`; `totalCents = receiptCents + deliveryCents + serviceCents`.
Bei Vorkasse: `creditCents = prepaidCents − totalCents`. Beispiel: Bon 67,43 € → Service 6,74 €, Total 79,07 €, Gutschrift **13,83 €**. Ist der Bon > Budget (Fahrer bestätigt bewusst eine Warnung), kann die Gutschrift negativ werden → Anzeige „Nachzahlung an der Tür: X €".

**R8 — Altersprüfung.** Enthält eine Bestellung mindestens einen Artikel mit `ageRestricted`, kann „Als geliefert markieren" erst nach angehakter Checkbox „Ausweis geprüft — Kunde ist 18+" (Copy C10) ausgelöst werden.

**R9 — Bestellcode.** Fortlaufend pro Demo-Datenbestand: `GZ-26-0001`, `GZ-26-0002`, … (`common/services/id.js`).

**R10 — Draft-Persistenz.** Der Bestellentwurf (Wizard-Zustand) übersteht ein Reload (localStorage, eigener Key `gzes-draft-v1`). „Demo zurücksetzen" löscht Draft **und** Datenbestand.

**R11 — Geldformat.** Ausschließlich `de-DE`, Format `12,34 €`. Nirgendwo Float-Arithmetik auf Eurobeträgen — nur Cent-Integer.

**R12 — Markenneutralität.** Keine fremden Logos (Rewe/Lidl/…) als Bilddateien. Markt-Auswahl als Text-Chips/Karten mit neutralen Farben. (Markenrecht; gilt auch für die Demo.)

---

## 6. Fake-Backend & API-Schicht

**`common/services/demoDb.js`** — das „Backend" im Browser:

- Hält den gesamten Datenbestand (`catalogItems`, `slots`, `orders`, `orderSeq`) als ein Objekt; Persistenz in `localStorage` unter `gzes-demo-v1`; beim ersten Start wird geseedet (Abschnitt 12), Slots werden bei jedem Laden relativ zu „heute" neu generiert, bestehende Buchungszähler der Seed-Bestellungen bleiben konsistent.
- Exportiert reine Funktionen (`readDb`, `writeDb`, `resetDb`) — kein React.
- **Künstliche Latenz:** Jede API-Funktion wartet 250–400 ms (`delay`), damit Loading-States sichtbar und realistisch sind.
  **API-Schicht (verbindliche Signaturen; alle async, alle über `demoDb`):**

```js
// features/catalog/api/CatalogApi.js
CatalogApi.getItems(); // → CatalogItem[]

// features/delivery/api/DeliveryApi.js
DeliveryApi.getSlots(); // → DeliverySlot[] (7 Tage, inkl. voller/abgelaufener)

// features/order/api/OrderApi.js
OrderApi.create(draft); // validiert R2/R3/R5, bucht Slot (+1), vergibt code → Order
OrderApi.getByCode({ code }); // → Order | wirft OrderNotFoundError
OrderApi.getById({ id }); // → Order | wirft OrderNotFoundError
OrderApi.getAll(); // → Order[] (Fahrer-Übersicht, sortiert nach Slot/Datum)
OrderApi.updateItem({ orderId, itemId, patch }); // Status/Preis/Ersatznotiz einer Position
OrderApi.completeShopping({ orderId, receiptCents }); // setzt receiptCents, finalFees (R7), Status → 'unterwegs'
OrderApi.updateStatus({ orderId, status }); // prüft Statusmaschine, R8 bei 'geliefert'
```

Query-/Mutation-Hooks je Domain gemäß Konventionen (Abschnitt 3), z. B.:

```js
// features/order/hooks/useOrderByCode.js
export const ORDER_BY_CODE_QUERY_KEY = (code) => ["order", "by-code", code];

export default function useOrderByCode({ code }) {
  return useQuery({
    queryKey: ORDER_BY_CODE_QUERY_KEY(code),
    queryFn: () => OrderApi.getByCode({ code }),
  });
}
```

Mutationen invalidieren `['order']`-Präfix bzw. `DELIVERY_SLOTS_QUERY_KEY` (nach `create`, wegen `bookedCount`).

---

## 7. Routen

`common/consts/routes.js`:

| Route                     | Page                  | Zweck                                                |
| ------------------------- | --------------------- | ---------------------------------------------------- |
| `/`                       | HomePage              | Landing: Nutzenversprechen, „So funktioniert's", CTA |
| `/bestellen`              | OrderWizardPage       | 4-Schritte-Wizard (Abschnitt 8)                      |
| `/bestellung/danke/:code` | OrderConfirmationPage | Erfolg + Code + Statuslink                           |
| `/bestellung/:code`       | OrderStatusPage       | Status-Timeline + Positionen (read-only)             |
| `/fahrer`                 | DriverOverviewPage    | Bestellungen nach Fenstern gruppiert                 |
| `/fahrer/bestellung/:id`  | DriverOrderPage       | Einkaufsmodus, Abrechnung, Lieferung                 |
| `*`                       | NotFoundPage          | 404                                                  |

`OrderDraftProvider` mountet im Route-Tree inline um `/bestellen` und `/bestellung/danke/:code`. Fahrer-Bereich ohne Auth (Demo); Zugang über Footer-Link „Fahrer-Ansicht (Demo)".

App-Shell (`root/components/App`): oben `DemoBanner` („🧪 Demo — alle Daten nur in diesem Browser · [Demo zurücksetzen]", Reset mit Bestätigungsdialog), schlanker Header (Brand-Name aus `brand.js`, Link „Bestellung verfolgen"), `<Outlet/>`, Footer (Fahrer-Link, Impressum/Datenschutz als Platzhalterseiten-Links mit Hinweistext).

---

## 8. Kunden-Flow — Screens & Akzeptanzkriterien

Kundengerichtete Texte in **Sie-Form**. Wizard mit Fortschrittsanzeige (`ui/steps/WizardSteps`): 1 Liste · 2 Budget & Markt · 3 Lieferung · 4 Prüfen. Zurückspringen jederzeit möglich, Eingaben bleiben erhalten (R10).

### 8.0 HomePage `/`

Hero: `BRAND_NAME`, Headline C1, Subline C2, primärer CTA „Jetzt Einkauf zusammenstellen" → `/bestellen`, sekundär `WhatsAppButton` (C6). Darunter drei Karten „So funktioniert's" (Liste erstellen → Wir kaufen ein → Lieferung zum Wunschfenster) und eine Vertrauens-Sektion (Kassenbon-Transparenz, Gebühren aus R1 als kleine Tabelle, Liefergebiet).

- [ ] CTA führt in den Wizard; WhatsApp-Button öffnet `wa.me/<WHATSAPP_NUMBER>` mit Text C6b.
- [ ] Gebühren und Liefergebiet stimmen mit R1/R2 überein (aus den Consts gerendert, nicht hartcodiert).

### 8.1 Schritt 1 — Einkaufsliste

Kernstück. Aufbau (mobile-first, eine Spalte):

1. **Suchfeld** mit Autocomplete: debounced (150 ms, `useDebounce`), Treffer aus Name + `keywords` (case-/umlaut-tolerant normalisiert). Treffer-Klick fügt Artikel hinzu (quantity 1, Default-Unit). **Enter ohne Treffer** fügt die Eingabe als Freitext-Artikel hinzu.
2. **Kategorie-Chips** (horizontal scrollbar): Tipp auf Chip zeigt Artikel der Kategorie als Grid aus `CatalogItemButton`s (Emoji + Name); Tipp fügt hinzu. Bereits enthaltene Artikel sind markiert; erneuter Tipp erhöht die Menge.
3. **„Liste einfügen"-Button** → `PasteImportDialog`: Textarea („eine Zeile pro Artikel"), Import parst per `parseShoppingList` (Abschnitt 8.1.1) und hängt Items an; danach Snackbar „X Artikel übernommen — bitte prüfen".
4. **Die Liste** (`OrderItemList` mit `OrderItemRow`): pro Zeile Drag-Handle **und** Hoch/Runter-Pfeiltasten (Senioren/Tastatur — Pflicht!), Emoji/Icon, Label, Mengensteuerung (− / Zahl / +) mit Unit-Auswahl, Bio-Toggle (nur wenn `bioAvailable`), Pflicht-Stern (Tooltip C4), Notiz-Feld (aufklappbar), Löschen. Sortierung per `@dnd-kit/sortable` **und** Pfeiltasten identisch.
5. **Hinweisbox** (`ui/feedback/InfoBox`) mit Copy C3 (Prio + Skip-Regel, verständlich erklärt).
6. Sticky unten: Artikelzähler + „Weiter zu Budget & Markt" (deaktiviert bei leerer Liste).

- [ ] Suche findet „eier", „Eier", „öl"→„Öl"; Freitext via Enter funktioniert.
- [ ] Paste-Import: 12-Zeilen-Beispiel aus Abschnitt 13/T2 ergibt korrekt gematchte + Freitext-Items.
- [ ] Reihenfolge per Drag **und** per Pfeiltasten änderbar; Reihenfolge ist die gespeicherte `position`.
- [ ] Pflicht-Stern, Bio, Notiz, Menge, Unit werden am Item gespeichert und überleben Reload (R10).

#### 8.1.1 `parseShoppingList(text, catalogItems)` — deterministisch

1. Split an Zeilenumbrüchen, `,` und `;`. 2. Pro Segment: trimmen; führende Aufzählungszeichen entfernen (`-`, `*`, `•`, `–`, `1.`, `2)` …). 3. Mengen-Präfix erkennen: `^(\d+)\s*[x×]?\s+` → quantity (z. B. „2x Milch", „3 Paprika"). 4. Rest lowercase-normalisiert (Umlaute äöüß erhalten) gegen Katalog matchen: exakter Name-Treffer > Keyword-Treffer > `includes`-Treffer; bei Mehrdeutigkeit erster Treffer nach Katalogreihenfolge. 5. Kein Treffer → Freitext-Item (`catalogItemId: null`). 6. Leere Segmente verwerfen. Rückgabe: `OrderItem[]`-Rohlinge. **Kein LLM, keine Netzwerkaufrufe.** Pure Function mit JSDoc, gut testbar.

### 8.2 Schritt 2 — Budget & Markt

1. **BudgetInput**: Euro-Eingabe (Zahlenfeld, Steppers ±5 €) + Schnellwahl-Chips 40/60/80/100/120 €. Validierung R3 mit Message C5a. Referenzhilfe C5 darunter.
2. **MarketPicker**: Karten „REWE", „Lidl", „Aldi", „dm", „Egal — Sie entscheiden" (Text-Chips, R12), Single-Select. Checkbox „Zweiter Markt erlaubt, falls etwas fehlt" (`allowSecondMarket`).

- [ ] Weiter erst bei Budget ≥ 30 € und gewähltem Markt.
- [ ] Beträge intern in Cent (R11).

### 8.3 Schritt 3 — Lieferung

1. **SlotPicker** (`features/delivery`): 7-Tage-Leiste (Tag-Kacheln mit Wochentag, So ausgegraut „keine Lieferung"), darunter Fenster des gewählten Tags als Karten mit Restplatz-Badge; Regeln R5. Abgelaufene Fenster: „Bestellschluss vorbei".
2. **Adresse & Kontakt** — Formular nach Form-Konventionen (`useOrderAddressForm`): Name*, Straße + Nr._, PLZ_ (Select oder Input mit Validierung gegen R2-Tabelle), Ort (auto aus PLZ), Klingel/Etage/Hinweis, Telefon* (Pflicht; Validierung: 7–15 Ziffern, `+`/Leerzeichen erlaubt; Hilfetext C8). PLZ außerhalb → `AreaHint` mit C7, Weiter deaktiviert.
3. Bei Umland-PLZ zeigt eine kleine InfoBox die höhere Liefergebühr (6,90 €) an — keine Überraschung in Schritt 4.

- [ ] Slot-Kapazität/Cutoff wirken exakt nach R5 (T6/T7).
- [ ] Formular-Validierungsmeldungen erscheinen am Feld (react-hook-form, Messages aus dem Hook).
- [ ] PLZ 89340 → Liefergebühr 6,90 € in Schritt 4; PLZ 86150 → C7, kein Weiter.

### 8.4 Schritt 4 — Prüfen & Bestellen

1. **OrderSummary**: Liste kompakt (mit Pflicht-Sternen), Markt, Fenster (Datum + Label), Adresse — jede Sektion mit „Bearbeiten"-Link zurück zum Schritt.
2. **FeeBreakdown** (transparent, aus R1/R6 berechnet): Budget (Obergrenze Warenwert), Liefergebühr, Servicegebühr („10 % vom Kassenbon, mind. 3 €, max. 12 €" — als Obergrenze ausgewiesen), Gesamt-Obergrenze. Erklärtext C9.
3. **Zahlungsart (Demo)**: Radio „Ich bestelle zum ersten Mal" (default) → Vorkasse-Erklärung C9a mit Betrag nach R6; „Ich bin bereits Kunde (Demo)" → „Zahlung an der Tür (Karte, bar oder PayPal)".
4. Checkbox „Ich akzeptiere die Demo-Bedingungen" (Platzhalter), dann CTA **„Zahlungspflichtig bestellen"** → `useCreateOrder` → bei Vorkasse Zwischenscreen „Zahlungslink simuliert" mit fiktivem Link-Kasten und Button „Zahlung simulieren ✓" → `/bestellung/danke/:code`.

- [ ] Beispielrechnung: Budget 80 €, Stadt, Vorkasse → Obergrenze 92,90 € (R6).
- [ ] Nach Bestellung: Slot-`bookedCount` +1; Draft geleert; Danke-Seite zeigt Code + Link zur Statusseite.

### 8.5 OrderStatusPage `/bestellung/:code`

`OrderStatusTimeline` (5 Stationen mit Zeitstempeln soweit vorhanden), Positionsliste read-only (nach Einkauf inkl. Status-Badges gekauft/ersetzt/übersprungen und ggf. Preisen), FeeBreakdown (nach Abrechnung: echte Beträge + Gutschrift/Nachzahlung nach R7), WhatsApp-Button „Frage zur Bestellung?" (vorbefüllt mit Code). Unbekannter Code → freundliche Leere (`EmptyState`) mit Eingabefeld für Code.

---

## 9. Fahrer-Flow — Screens & Akzeptanzkriterien

Interner Bereich, neutrale Du-/Kurzform ok. Mobile-first (wird im Markt am Handy benutzt!).

### 9.1 DriverOverviewPage `/fahrer`

Bestellungen gruppiert nach Fenster (heute zuerst), Karten: Code, Ortsteil/Stadt, Artikelanzahl, Budget, Markt, Status-Badge, Alters-Badge 🔞 falls `ageRestricted`-Artikel enthalten. Filter-Chips nach Status. Karte → Detailseite. Bestellungen mit Status `eingegangen` haben einen Schnell-Button „Bestätigen".

- [ ] Gruppierung/Sortierung nach Slot-Datum + Start; Seeds aus Abschnitt 12 erscheinen korrekt.

### 9.2 DriverOrderPage `/fahrer/bestellung/:id` — Einkaufsmodus

Kopf: Code, Markt, Fenster, Adresse (mit `tel:`-Link), **BudgetBar**: Budget, Summe erfasster Preise, Fortschrittsbalken; ab 90 % Warnfarbe + Hinweis C11.

Liste via `sortItemsForShopping` (R4): Sektion „Pflicht" zuerst, dann „Weitere" — Reihenfolge unverändert sichtbar machen (Nummern). Pro `ShoppingItemRow` (große Touch-Targets):

- **„Gekauft"** → optionaler Preis-Quickdialog (Numpad-freundliches Eingabefeld, überspringbar).
- **„Nicht da"** → Dialog: „Ersetzt durch …" (Textfeld, Status `ersetzt`) · „Überspringen" (Status `uebersprungen`) · „Kunde fragen" → WhatsApp-Deeplink mit vorbefülltem Text C12.
- Notiz/Bio/Menge deutlich sichtbar; Pflicht-Artikel mit Stern.
  Fußbereich: „Einkauf abschließen" (aktiv, sobald keine Position mehr `offen`) → **ReceiptForm**: Kassenbon-Summe (Pflicht, Euro-Eingabe; Warnung + Bestätigung, falls > Budget), danach Abrechnungsansicht nach R7 (Bon, Liefergebühr, Servicegebühr, Total; bei Vorkasse Gutschrift bzw. Nachzahlung) → Status `unterwegs`.

Status `unterwegs`: **HandoverChecklist** — Adresse, Zahlhinweis (Vorkasse: „Gutschrift X € mitteilen" / Tür: „Total X € kassieren — Karte/bar/PayPal"), bei 🔞: Pflicht-Checkbox nach R8 → Button „Als geliefert markieren" → Status `geliefert`, Erfolgshinweis.

- [ ] R4-Sortierung sichtbar korrekt (T10). BudgetBar zählt nur erfasste Preise.
- [ ] Abrechnung rechnet T8-Beispiel exakt. Statusmaschine verhindert Sprünge (T8).
- [ ] 🔞-Bestellung ohne Häkchen nicht abschließbar (T9).

---

## 10. Design & UX-Vorgaben

- **Look:** ruhig, hell, freundlich; viel Weißraum; Karten mit `rounded-2xl`, dezente Schatten. Akzentfarbe Grün: primär `#1F5C41`, hell `#2E7D5B`, Hintergrund `#F7F8F6`, Warnung Amber. Farben als Tailwind-Theme-Tokens (`brand.*`) — Rebranding an einer Stelle.
- **Typo:** System-Font-Stack oder Inter; Basis **17–18 px** auf der Kundenseite (Senioren!), Zeilenhöhe ≥ 1.5.
- **Touch:** interaktive Ziele ≥ 44 px; primäre Buttons volle Breite auf Mobile.
- **Barrierefreiheit:** semantisches HTML, Labels an allen Feldern, Fokus-Ringe sichtbar, Kontrast AA, komplette Tastaturbedienung (inkl. Listen-Reihenfolge über Pfeil-Buttons), `aria-live` für Snackbar/Statuswechsel.
- **Loading/Empty/Error:** Query-Ladezustände mit Skeletons; leere Zustände über `ui/feedback/EmptyState`; Fehler menschlich formuliert, nie Stacktraces.
- **Responsive:** 360 px bis Desktop; Wizard auf Desktop max-w ~640 px zentriert, Fahrer-Ansicht max-w ~720 px.

### 10.1 Anspruch: wirkt wie ein fertiges Produkt, nicht wie ein Prototyp

Die Demo wird Außenstehenden gezeigt (Testkunden, Presse, später Händler). Maßstab ist das Niveau moderner Consumer-Apps (Picnic, Bring!, Wolt): ruhig, konsistent, durchdacht — nichts darf „zusammengeklickt" aussehen. Verbindliche Feinschliff-Checkliste:

- [ ] **Abstände auf konsistentem Raster** (Tailwind-Spacing-Skala konsequent, keine Zufallswerte); einheitliche Karten-Paddings und Abstände zwischen Sektionen.
- [ ] **Eine Typo-Skala** (z. B. 14 / 16 / 18 / 22 / 28 px), keine Ausreißer; Fließtext-Zeilenlänge ≤ ~70 Zeichen.
- [ ] **Farbdisziplin:** das Brand-Grün-Paar, warme Neutralgrautöne, eine Warnfarbe — sonst nichts. Kein reines Schwarz auf reinem Weiß (`#1A1A1A` auf `#F7F8F6`).
- [ ] **Zustände überall:** `hover`, `focus-visible`, `active`, `disabled` für jedes interaktive Element; Übergänge 150–200 ms ease-out.
- [ ] **Skeletons statt Spinner**, wo das Layout bekannt ist; kein Layout-Shift beim Laden (Platzhalter mit fester Höhe).
- [ ] **Eine Radius- und Schatten-Skala** (z. B. `rounded-lg` Buttons, `rounded-2xl` Karten); Schatten sparsam und einheitlich.
- [ ] **Keine sichtbaren Browser-Defaults:** Selects, Checkboxen, Radios, Number-Inputs und Dialoge sind durchgestylt.
- [ ] **Icons ausschließlich lucide-react**, einheitliche Größe und Strichstärke; Emojis nur als Artikel-Icons im Katalog.
- [ ] **Leere Zustände und Fehler gestaltet** (Icon + Titel + Hilfetext + Aktion über `EmptyState`) — nie nackter Text auf weißer Fläche.
- [ ] **Metadaten & App-Gefühl:** `<title>`, Favicon (einfaches SVG aus Brand-Initialen), `theme-color`, Web-App-Manifest mit Icon („Zum Startbildschirm hinzufügen" sieht sauber aus), OG-Title/-Description.
- [ ] **Mikrotexte poliert:** kein Lorem ipsum, keine englischen UI-Reste („Submit", „Loading…"); Datumsangaben deutsch („Fr., 18.07."), Beträge nach R11.
- [ ] **Screenshot-Selbsttest vor Abgabe:** Kern-Screens (Home, Wizard-Schritte 1–4, Statusseite, Fahrer-Übersicht, Einkaufsmodus) bei 390 px und Desktop screenshotten und gegen diese Checkliste prüfen; Auffälligkeiten beheben, dann erst abgeben.

---

## 11. Copy — verbindliche deutsche Texte

| ID  | Verwendung                | Text                                                                                                                                                                                                                                                                             |
| --- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | Home-Headline             | **Ihr Wocheneinkauf. Von uns erledigt.**                                                                                                                                                                                                                                         |
| C2  | Home-Subline              | Liste erstellen, Lieferfenster wählen — wir kaufen in Günzburg für Sie ein und liefern bis an die Wohnungstür. Sie zahlen den Ladenpreis laut Kassenbon plus eine faire, transparente Gebühr.                                                                                    |
| C3  | InfoBox Liste             | Sortieren Sie die Liste nach Wichtigkeit — ganz oben steht, was auf keinen Fall fehlen darf. Wir kaufen in dieser Reihenfolge ein und bleiben dabei immer unter Ihrem Budget. Passt ein Artikel nicht mehr hinein, lassen wir nur diesen weg und machen mit den nächsten weiter. |
| C4  | Tooltip Pflicht-Stern     | Pflicht-Artikel kaufen wir auf jeden Fall zuerst ein.                                                                                                                                                                                                                            |
| C5  | Budget-Hilfe              | Zur Orientierung: Ein typischer Wocheneinkauf für 2 Personen liegt bei 60–90 €, für eine Familie bei 90–130 €.                                                                                                                                                                   |
| C5a | Budget-Fehler             | Der Mindestbestellwert liegt bei 30 €.                                                                                                                                                                                                                                           |
| C6  | WhatsApp-Button           | Lieber per WhatsApp bestellen?                                                                                                                                                                                                                                                   |
| C6b | WhatsApp-Vorbefüllung     | Hallo! Ich möchte gerne einen Einkauf bestellen. Meine Liste:                                                                                                                                                                                                                    |
| C7  | PLZ außerhalb             | Diese Adresse liegt noch außerhalb unseres Liefergebiets (Günzburg, Leipheim, Bubesheim, Kötz, Ichenhausen). Schreiben Sie uns gern per WhatsApp — wir melden uns, sobald wir Ihren Ort beliefern.                                                                               |
| C8  | Telefon-Hilfetext         | Wir brauchen Ihre Nummer nur für Rückfragen zu Ihrem Einkauf — z. B. wenn ein Artikel ausverkauft ist.                                                                                                                                                                           |
| C9  | Gebühren-Erklärung        | Sie zahlen am Ende exakt den Kassenbon plus Liefer- und Servicegebühr. Der Kassenbon liegt Ihrer Lieferung bei — keine versteckten Aufschläge.                                                                                                                                   |
| C9a | Vorkasse-Erklärung        | Bei der ersten Bestellung bitten wir um Vorkasse in Höhe Ihrer Budget-Obergrenze. Was wir nicht ausgeben, erhalten Sie als Guthaben zurück — auf Wunsch auch als Rücküberweisung.                                                                                                |
| C10 | Altersprüfung             | Ausweis geprüft — Kunde ist 18 oder älter.                                                                                                                                                                                                                                       |
| C11 | Budget-Warnung Fahrer     | Budget fast erreicht — nur noch X € frei.                                                                                                                                                                                                                                        |
| C12 | WhatsApp Fahrer-Rückfrage | Hallo, hier ist Ihr Einkaufsservice. „{Artikel}" ist leider nicht verfügbar. Sollen wir etwas Ähnliches mitbringen?                                                                                                                                                              |

Alle weiteren Texte im selben Ton: klar, warm, ohne Werbefloskeln, Sie-Form.

---

## 12. Seed-Daten

### 12.1 Katalog (~120–150 Artikel, markenfrei)

Kategorien (Reihenfolge = Anzeige): Obst & Gemüse · Brot & Backwaren · Milchprodukte & Eier · Fleisch & Wurst · Tiefkühl · Vorrat & Nudeln · Getränke · Süßes & Snacks · Drogerie & Haushalt · Baby & Kind. Je Kategorie 12–15 sinnvolle Alltagsartikel, deutsch, mit passenden `units`, `keywords` (Synonyme, z. B. „sprudel" für Mineralwasser) und Emoji. Referenzbeispiele (Muster für alle übrigen):

```json
[
  {
    "id": "eier",
    "name": "Eier",
    "categoryId": "milchprodukte-eier",
    "emoji": "🥚",
    "units": ["Packung", "Stück"],
    "bioAvailable": true,
    "ageRestricted": false,
    "keywords": ["eier", "ei", "huehnereier"]
  },
  {
    "id": "mineralwasser-kiste",
    "name": "Mineralwasser (Kiste)",
    "categoryId": "getraenke",
    "emoji": "💧",
    "units": ["Kiste", "Flasche"],
    "bioAvailable": false,
    "ageRestricted": false,
    "keywords": ["wasser", "sprudel", "mineralwasser", "kiste wasser"]
  },
  {
    "id": "bier",
    "name": "Bier",
    "categoryId": "getraenke",
    "emoji": "🍺",
    "units": ["Kiste", "Flasche", "Dose"],
    "bioAvailable": false,
    "ageRestricted": true,
    "keywords": ["bier", "helles", "weissbier"]
  },
  {
    "id": "tiefkuehlpizza",
    "name": "Tiefkühlpizza",
    "categoryId": "tiefkuehl",
    "emoji": "🍕",
    "units": ["Stück", "Packung"],
    "bioAvailable": false,
    "ageRestricted": false,
    "keywords": ["pizza", "tk pizza", "tiefkuehlpizza"]
  },
  {
    "id": "windeln",
    "name": "Windeln",
    "categoryId": "baby-kind",
    "emoji": "🍼",
    "units": ["Packung"],
    "bioAvailable": false,
    "ageRestricted": false,
    "keywords": ["windeln", "pampers"]
  }
]
```

Pflicht im Seed enthalten: Salat, Tiefkühlpizza, Mineralwasser (Kiste), Schokolade, Nudeln (die Beispiele aus der Gründungsidee), außerdem Bier **und** Wein (`ageRestricted: true`) sowie — damit T2 funktioniert — Milch, Paprika und Toilettenpapier (mit Keyword `"klopapier"`). **Kein** Katalogartikel „Katzenstreu" (bewusst — T2 erwartet ihn als Freitext).

### 12.2 Zeitfenster

Generiert nach R5 relativ zu „heute". Seed-Belegung: das nächste verfügbare Abendfenster mit `bookedCount: 6` („Nur noch 2 Plätze"), ein Samstagsfenster mit `bookedCount: 8` (ausgebucht), alle übrigen 0–2.

### 12.3 Demo-Bestellungen (4 Stück, für die Fahrer-Ansicht)

| Code       | Status        | Fenster               | Zahlung                                        | Inhalt                                                                                           |
| ---------- | ------------- | --------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| GZ-26-0001 | `eingegangen` | nächstes Abendfenster | vorkasse (Budget 80 €, Stadt, prepaid 92,90 €) | 12 Positionen, davon 3 Pflicht (Milch, Windeln, Mineralwasser-Kiste), 1 Freitext („Katzenstreu") |
| GZ-26-0002 | `bestaetigt`  | gleiches Fenster      | tuer (Budget 60 €, Leipheim/umland)            | 8 Positionen, enthält Bier (🔞), 2 Pflicht                                                       |
| GZ-26-0003 | `im_einkauf`  | gleiches Fenster      | vorkasse (Budget 50 €, Stadt)                  | 6 Positionen: 3 `gekauft` (mit Preisen), 1 `ersetzt`, 2 `offen`                                  |
| GZ-26-0004 | `geliefert`   | gestriges Fenster     | tuer (Budget 70 €, Stadt)                      | abgeschlossen inkl. `receiptCents` 61,20 € und `finalFees`                                       |

Seed-Bestellungen mit realistisch wirkenden Namen/Adressen (fiktiv, z. B. „Maria Huber, Ulmer Str. 12, 89312 Günzburg").

---

## 13. Qualität & Abnahme

### 13.1 Definition of Done

- [ ] Alle Akzeptanzkriterien aus Abschnitt 8 + 9 erfüllt; alle Business-Regeln R1–R12 implementiert.
- [ ] `npm run dev` startet ohne Fehler; `npm run build` läuft durch; `npm run lint` fehlerfrei; keine Konsolen-Errors im Happy Path.
- [ ] Responsive 360 px – Desktop; Tastaturbedienung des kompletten Kunden-Flows möglich.
- [ ] Design-Feinschliff nach 10.1 vollständig abgehakt — inklusive Screenshot-Selbsttest.
- [ ] Projektstruktur & Konventionen aus Abschnitt 3 eingehalten (Stichproben: Komponentenordner + index.js, Query-Keys exportiert, API-Schicht einziger demoDb-Zugriff, Formular-Hook-Muster).
- [ ] README.md: Quickstart, Demo-Rundgang (Kunde `/`, Fahrer `/fahrer`), Demo-Reset, Architektur-Kurzüberblick, Hinweis auf diese SPEC, Liste getroffener Detailentscheidungen.
- [ ] `parseShoppingList`, `calculateFees`, `sortItemsForShopping`, `slotRules` sind pure Functions mit JSDoc; dazu Unit-Tests mit Vitest (mind. diese vier Module, inkl. der Zahlenbeispiele aus R6/R7).

### 13.2 Manuelle Testszenarien (müssen alle funktionieren)

- **T1 Happy Path Neukunde:** Liste mit 6 Artikeln (2 Pflicht) → Budget 80 € → REWE → Stadt-Adresse → Abendfenster → Vorkasse 92,90 € → Zahlung simulieren → Danke-Seite → Statusseite `eingegangen`.
- **T2 Paste-Import:** Text „2x Milch, Eier\n- Nudeln\n3 Paprika\nKlopapier\nKatzenstreu Marke XY" → 6 Items, davon „Katzenstreu Marke XY" als Freitext, „2x Milch" mit Menge 2, „3 Paprika" mit Menge 3.
- **T3 Budget-Grenze:** Budget 25 € → Fehlermeldung C5a, kein Weiter; 30 € → Weiter möglich.
- **T4 PLZ außerhalb:** 86150 → C7, Weiter deaktiviert.
- **T5 Umland-Gebühr:** PLZ 89340 → Schritt 4 zeigt 6,90 €.
- **T6 Kapazität:** ausgebuchtes Samstagsfenster ist sichtbar, aber nicht wählbar.
- **T7 Cutoff:** Nach 14:00 Uhr ist das heutige Abendfenster nicht mehr wählbar (Test per System-Uhr oder isoliertem Unit-Test der `slotRules`).
- **T8 Fahrer-Abrechnung:** GZ-26-0001: alle Positionen abarbeiten (1 überspringen), Bon 67,43 € eingeben → Service 6,74 €, Total 79,07 €, **Gutschrift 13,83 €**; Status wird `unterwegs`; direkter Sprung auf `geliefert` vorher unmöglich.
- **T9 Altersprüfung:** GZ-26-0002 kann erst nach Häkchen C10 auf `geliefert` gesetzt werden.
- **T10 Sortierung:** In GZ-26-0001 stehen die 3 Pflicht-Artikel im Einkaufsmodus zuerst (Listenreihenfolge), danach die übrigen.
- **T11 Reset:** „Demo zurücksetzen" stellt Katalog, Fenster und die 4 Seed-Bestellungen wieder her und leert den Draft.

---

## 14. Explizit NICHT bauen

Auth/Accounts · echte Payments oder Stripe/PayPal-SDKs · Datenbank/Netzwerk-Backend · LLM-Anbindung · Push/E-Mail/SMS · Admin-CRUD für den Katalog · Tourenplanung/Karten · i18n · Dark Mode · Cookie-Banner/Tracking (keine Third-Party-Requests!).

---

## 15. Anhang — Stil-Anker

**Form-Hook (Muster, gekürzt):**

```js
// features/order/hooks/useOrderAddressForm.js
const DEFAULT_VALUES = {
  name: "",
  street: "",
  zip: "",
  doorInfo: "",
  phone: "",
};

export default function useOrderAddressForm({ defaultValues } = {}) {
  const form = useForm({
    defaultValues: Object.fromEntries(
      Object.entries(DEFAULT_VALUES).map(([key, value]) => [
        key,
        defaultValues?.[key] ?? value,
      ]),
    ),
  });

  return {
    form,
    fields: {
      name: useController({
        control: form.control,
        name: "name",
        rules: { required: "Bitte geben Sie Ihren Namen an." },
      }),
      zip: useController({
        control: form.control,
        name: "zip",
        rules: {
          required: "Bitte geben Sie Ihre Postleitzahl an.",
          validate: (value) => isDeliverableZip(value) || C7_MESSAGE,
        },
      }),
      // … weitere Felder nach demselben Muster
    },
  };
}
```

**Fees-Service (Muster):**

```js
// features/order/services/calculateFees.js
export function serviceFeeCents(amountCents) {
  const raw = Math.round(amountCents * SERVICE_FEE_RATE);
  return Math.min(Math.max(raw, SERVICE_FEE_MIN_CENTS), SERVICE_FEE_MAX_CENTS);
}

export function deliveryFeeCents(area) {
  return area === "stadt" ? FEE_DELIVERY_CITY_CENTS : FEE_DELIVERY_SUBURB_CENTS;
}

export function prepaidCents({ budgetCents, area }) {
  return budgetCents + deliveryFeeCents(area) + serviceFeeCents(budgetCents);
}
```

---

_Ende der Spezifikation. Bei Fertigstellung: README-Rundgang schreiben, alle T-Szenarien einmal manuell durchklicken, dann abgeben._
