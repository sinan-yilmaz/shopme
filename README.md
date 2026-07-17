# shopme — Demo „Einkaufsservice Günzburg"

Klickbarer Demo-Prototyp des Bestell- und Fahrer-Flows für einen lokalen
Einkaufs- und Lieferservice. Kein Produktivsystem: keine Datenbank, kein
Backend, keine echte Zahlung — alle Daten leben im Browser (localStorage).

**Verbindliche Anforderungsquelle:** [SPEC.md](./SPEC.md). Alle Business-Regeln
(R1–R12), Screens und Texte stammen von dort.

## Quickstart

```bash
npm install
npm run dev        # http://localhost:5173
```

| Befehl            | Zweck                                   |
| ----------------- | --------------------------------------- |
| `npm run dev`     | Entwicklungsserver                      |
| `npm test`        | Unit-Tests (Vitest) der Business-Regeln |
| `npm run lint`    | ESLint (fehlerfrei)                     |
| `npm run build`   | Produktions-Build                       |
| `npm run preview` | Build lokal ansehen                     |
| `npm run format`  | Prettier (Defaults)                     |

## Demo-Rundgang

**Kunde — `/`**

1. „Jetzt Einkauf zusammenstellen" → 4-Schritte-Wizard:
   Liste (Suche, Kategorien, „Liste einfügen" mit deterministischem Parser,
   Sortierung per Drag **und** Pfeil-Buttons) → Budget & Markt → Lieferfenster
   & Adresse → Prüfen & Bestellen.
2. Bei „Ich bestelle zum ersten Mal" wird die Vorkasse nach R6 berechnet
   (Budget 80 €, Stadt → 92,90 €) und ein Zahlungslink simuliert.
3. Danke-Seite mit Bestellcode (z. B. `GZ-26-0005`) → Statusseite
   `/bestellung/GZ-26-0005` mit Timeline, Positionen und Gebühren-Bon.
   Der Bestellentwurf übersteht Reloads (localStorage, `gzes-draft-v1`).

**Fahrer — `/fahrer`** (Link im Footer, ohne Auth)

1. Übersicht nach Lieferfenstern gruppiert, Filter-Chips nach Status,
   Schnell-Button „Bestätigen" für neue Bestellungen.
2. `GZ-26-0001` öffnen → bestätigen → „Einkauf starten" → Einkaufsmodus mit
   Budget-Balken (Warnung ab 90 %), Pflicht-Artikel zuerst (R4).
   Je Position: „Gekauft" (optionaler Preis) oder „Nicht da"
   (Ersetzen / Überspringen / Kunde per WhatsApp fragen).
3. „Einkauf abschließen" → Kassenbon eingeben (67,43 € → Service 6,74 €,
   Total 79,07 €, Gutschrift 13,83 € — R7) → Status „unterwegs" →
   Übergabe-Checkliste (bei 🔞-Artikeln Pflicht-Häkchen nach R8) →
   „Als geliefert markieren".

**Demo-Reset:** Banner oben → „Demo zurücksetzen" stellt Katalog, Zeitfenster
und die 4 Seed-Bestellungen wieder her und leert den Entwurf (T11).

Die manuellen Testszenarien T1–T11 aus SPEC §13.2 sind mit diesem Stand
durchgespielt (inkl. der Zahlenbeispiele aus R6/R7).

## Architektur-Kurzüberblick

```
src/
├── root/        App-Shell (DemoBanner, Header, Footer), Provider, Route-Tree,
│                scopes/ (OrderDraftScope um /bestellen + /bestellung/danke/:code)
├── pages/       eine Page pro Route, komponiert Sections (kein Barrel)
├── features/
│   ├── catalog/   Katalog (129 Seed-Artikel), Suche (case-/umlaut-tolerant)
│   ├── order/     Draft-Context, Gebühren, Listen-Parser, Statusmaschine,
│   │              OrderApi + Query-/Mutation-Hooks, Formular-Hooks
│   └── delivery/  PLZ→Gebiet (R2), Zeitfenster-Regeln (R5) als pure functions
├── ui/          app-spezifische, domänenfreie Bausteine (feedback/steps/buttons)
├── lib/         generische Primitives, Layout, Formularfelder
└── common/      domänenfrei: money (Cent-Integer, de-DE), demoDb, Routen, Brand
```

- **Fake-Backend:** `common/services/demoDb.js` hält den Datenbestand in
  localStorage (`gzes-demo-v1`) und simuliert 250–400 ms Latenz. Die
  API-Schicht (`features/*/api/*Api.js`) ist der **einzige** Zugriffspunkt —
  für den echten Betrieb wird nur diese Schicht gegen Supabase getauscht,
  Hooks und Komponenten bleiben unverändert.
- **Server-State:** TanStack Query v5; Query-Keys als exportierte Konstanten,
  Mutationen invalidieren den `['order']`-Präfix (bzw. Slots nach `create`).
- **Business-Regeln als pure functions** mit Vitest-Tests:
  `calculateFees`, `parseShoppingList`, `sortItemsForShopping`, `slotRules`.
- **Branding** zentral in `common/consts/brand.js` (plus `index.html` /
  `public/site.webmanifest` für Titel/Manifest).

## Getroffene Detailentscheidungen

1. **Eigene Primitives statt shadcn/ui** (`lib/primitives/`): Die Spec sieht
   diesen Fallback ausdrücklich vor. Das shadcn-Setup (JS-Modus, Tailwind v4,
   projektspezifische Aliase, nicht-interaktiv) ist fehleranfällig, und die
   Senioren-Vorgaben (≥ 44 px, 18-px-Basis, Brand-Grün) hätten ohnehin jede
   Klasse per Wrapper überschrieben. Dialoge nutzen das native
   `<dialog>`-Element (Fokus-Falle, ESC, Scroll-Sperre vom Browser).
2. **Inter self-hosted** über `@fontsource-variable/inter`: Die Spec nennt
   Inter als Option und verbietet Third-Party-Requests — ein CDN schied aus.
3. **`statusTimestamps` am Order** (Ergänzung zum Datenmodell): versorgt die
   Status-Timeline mit „Zeitstempeln soweit vorhanden" (SPEC §8.5).
4. **demoDb bleibt domänenfrei:** Seed- und Refresh-Logik liegen in
   `features/*/mocks/` und werden in `main.jsx` per `configureDemoDb()`
   injiziert (common importiert nie aus features). Beim Laden werden die
   Zeitfenster relativ zu „heute" regeneriert; bestehende Buchungszähler
   bleiben erhalten, und vergangene Fenster, auf die Bestellungen zeigen,
   werden archiviert statt gelöscht.
5. **„Bestellung verfolgen"** im Header öffnet einen Code-Dialog und
   navigiert zu `/bestellung/:code` — so bleibt die Routen-Tabelle der Spec
   unverändert.
6. **Parser-Feinheit:** In der includes-Stufe zählt ein Katalogwort nur dann
   als Teilstring des Freitexts, wenn es ≥ 4 Zeichen hat — sonst würde
   z. B. „Eimer" wegen des Keywords „ei" als Eier erkannt. („Katzenstreu
   Marke XY" bleibt damit zuverlässig Freitext, T2.)
7. **Impressum/Datenschutz** sind Platzhalter-Dialoge mit Hinweistext
   (SPEC §7: „Platzhalterseiten-Links mit Hinweistext").
8. **Fahrer-Korrektur:** Erledigte Positionen haben einen kleinen
   „Zurücksetzen"-Button (Tippfehler im Markt passieren); nutzt dieselbe
   `updateItem`-API.
9. **Status-Übergänge in der Fahrer-UI:** „Bestätigen" (Übersicht + Detail)
   und „Einkauf starten" lösen die Übergänge der Statusmaschine aus.
   Stornieren hat bewusst **kein** UI (nicht spezifiziert) — die
   Statusmaschine unterstützt es API-seitig.
10. **Draft speichert auch den Wizard-Schritt** — „Wizard-Zustand übersteht
    Reload" (R10) schließt die Position im Wizard ein.
11. **jsconfig:** `paths: { "*": ["./src/*"] }` statt des inzwischen
    deprecateten `baseUrl` — das Import-Schema (`common/…`, `features/…`)
    bleibt exakt wie in der Spec.
12. **Freitext-Artikel** haben keinen Bio-Toggle (kein `bioAvailable`
    bekannt) und die Einheit „Stück" als Default; die Einheiten-Liste aus
    dem Datenmodell steht zur Auswahl.
