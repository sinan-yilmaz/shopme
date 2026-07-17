# HANDOFF — shopme Design- & UX-Pass → Claude Code

**Quelle der Wahrheit:** dieser Text + der klickbare Prototyp `shopme Redesign.dc.html` (alle Screens über die dunkle Leiste oben erreichbar; echt resizebar — 390 px und 1280 px prüfen). Der Prototyp zeigt Ziel-Layout, Farben, Abstände, Motion und alle fünf Illustrations-Szenen. Bei Widerspruch: DESIGN-BRIEF.md > Prototyp > SPEC.md (nur Design-Fragen; Business-Regeln R1–R12 und T1–T11 bleiben unantastbar).

Der Prototyp ist Referenz, kein Code-Spender für React-Komponenten — aber **die SVG-Geometrie der Szenen und des Logos kann 1:1 übernommen werden** (im Prototyp-HTML nach `viewBox` suchen; alle Szenen sind reine Shape-SVGs in Palette-Farben).

---

## 1. Tokens — `src/root/root.css` komplett auf Brief 3.1–3.3 umstellen

Das bestehende `@theme` ersetzen (Tailwind v4). Verbindliche Werte:

```css
@theme {
  /* Farbe (Brief 3.1) — warm statt kalt */
  --color-bg: #FAF8F4;            /* App-Hintergrund, ersetzt --color-surface #F7F8F6 */
  --color-surface: #FFFFFF;       /* Karten, Sheets */
  --color-ink: #1F2A24;           /* ersetzt #1A1A1A */
  --color-muted: #5C6B62;
  --color-brand: #1E5C43;         /* ersetzt brand-700 #1F5C41 als Primär */
  --color-brand-deep: #174935;
  --color-brand-soft: #E7F1EA;
  --color-accent: #E8A13D;        /* sparsam: Pflicht-Stern, Badges, Preis-Highlight */
  --color-warn: #9A6B1F;
  --color-warn-bg: #FBF1DD;
  --color-danger: #A3402F;

  /* Zusatztöne aus dem Prototyp (Borders/Flächen, warm) */
  --color-line: #ECE7DD;          /* Kartenborder */
  --color-line-strong: #E2DCD0;   /* Input-/Chip-Border */
  --color-field: #EDE9E0;         /* inaktive Flächen (Stepper-Kreis todo, Tracks) */

  /* Typografie (Brief 3.2) */
  --font-display: "Bricolage Grotesque Variable", "Inter Variable", system-ui, sans-serif;
  --font-sans: "Inter Variable", system-ui, sans-serif;
  /* Skala exakt: 14 / 16 / 18 / 22 / 28 / 36 — die 34px-Stufe entfernen */

  /* Schatten grün getönt (Brief 3.1), zwei Stufen */
  --shadow-card: 0 1px 3px rgb(23 73 53 / 0.05), 0 6px 18px rgb(23 73 53 / 0.07);
  --shadow-float: 0 8px 24px rgb(23 73 53 / 0.12), 0 20px 48px rgb(23 73 53 / 0.10);

  /* Radius-Skala (Brief 3.3): 12px Buttons/Inputs/Chips · 20px Karten/Sheets. Sonst nichts. */
  --radius-control: 12px;
  --radius-card: 20px;
}
```

- Alle `rounded-2xl`-Karten → 20 px, alle Buttons/Inputs → 12 px (Pills/Chips dürfen `rounded-full`).
- Fokusring überall: `focus-visible:ring-2 ring-brand` mit Offset (existiert schon — Farbe auf `#1E5C43`).
- Kein reines Schwarz, keine kalten Grays mehr (`neutral-*`-Palette auf die warmen Töne oben mappen).

## 2. Fonts (self-hosted, SPEC verbietet CDN)

```
npm i @fontsource-variable/bricolage-grotesque
```
In `main.jsx` (neben dem bestehenden Inter-Import): `import "@fontsource-variable/bricolage-grotesque";`
**Einsatz:** `font-display` NUR für Headlines (h1/h2/h3, Bestellcode, große Beträge, Logo-Wortmarke). UI/Fließtext bleibt Inter. Gewichte im Prototyp: Display 700/800, UI 400–700.

## 3. Logo / Wortmarke (neu)

Wortmarke: `shopme` in Bricolage Grotesque 800, lowercase, `#1F2A24`, letter-spacing −0.01em. Bildmarke: **Einkaufstasche mit Lächeln** (Henkel-Bogen + gerundetes Rechteck + 2 Punktaugen + Lächel-Pfad, alles `#1E5C43`/`#FAF8F4`) — SVG im Prototyp-Header, 1:1 übernehmen. Auch für `public/favicon.svg`, `icon-maskable.svg` (Tasche auf `#1E5C43`-Grund) und `theme-color: #1E5C43` verwenden. Ablage der Marke weiter über `common/consts/brand.js`.

## 4. Die sechs UX-Fixes (Brief §2) — Datei für Datei

### 2.1 Kachel-Mengensteuerung — `features/catalog/components/CatalogItemButton/`
Ersetzt den Check-Badge-Zustand:
- Kachel-Tap = hinzufügen/Menge +1 (wie bisher `addCatalogItem`).
- Ist der Artikel in der Liste: **Mengen-Badge oben rechts** (brand-Kreis, weiße Zahl, min 24 px, ploppt mit Scale-Spring ~300 ms `cubic-bezier(.3,1.4,.5,1)`) und **„−“-Button oben links** (26 px, weiß, Border `line-strong`; `stopPropagation`).
- **− bei Menge 1 entfernt den Artikel** (Badge/Controls verschwinden animiert). Neue Props: `quantity`, `onDecrement`. Quelle für beides: `useOrderDraft` (Grid und Liste bleiben automatisch synchron).
- Kachel-Zustand „in Liste“: Border `brand` 1.5 px, bg `#F2F8F4`.
- Artikelzähler im Sticky-Footer bekommt `aria-live="polite"` und tickt hoch (existiert; Zahl kurz aufploppen lassen ist nice-to-have).

### 2.2 Kategorie-Browsing — `StepShoppingList`
Ist bereits inline (kein Dialog) — so lassen, aber: Grid-Karte mit `fadeUp`-Einblendung (200 ms), Kacheln nach 2.1, Sticky-Footer bleibt immer sichtbar. `PasteImportDialog` bleibt Dialog (ok, ist ein Werkzeug, kein Browsing).

### 2.3 Markt-Auswahl — `features/order/consts/markets.js` + `MarketPicker`
- `markets.js`: jedem Markt `description` geben — REWE „Vollsortiment, größere Auswahl“ · Lidl/Aldi „Discounter, günstige Preise“ · dm „Drogerie, Baby & Haushalt — keine frischen Lebensmittel“ · Egal „Wir wählen den passenden Markt für Ihre Liste“.
- Karten: Radio-Kreis links (Border-Morph zu 7px-Ring bei Auswahl, 180 ms), Label 16.5/700, description 14/muted. „Egal“ über volle Breite mit **„Empfohlen“-Badge** (accent-Pill, oben rechts überlappend).
- **dm-Hinweis:** neue pure Function `features/order/services/hasFreshFoodItems.js` — true, wenn ein Item `catalogItemId == null` ist oder seine Kategorie NICHT in {`drogerie-haushalt`, `baby-kind`} liegt. Bei `market === 'dm' && hasFreshFoodItems(items)`: Inline-Box unter dem Picker (warn-bg, Copy exakt: „dm führt keine frischen Lebensmittel. Sollen wir die übrigen Artikel in einem Supermarkt kaufen?“) mit Ein-Klick-Button „Auf ‚Egal — Sie entscheiden‘ wechseln“. Kein Fehler, blockiert nichts.

### 2.4 Gebühren-Texte — HomePage-Gebührenkarte, `FeeBreakdown`, Statusseite
Pattern (im Prototyp auf Home, Schritt 4, Status, Fahrer-Abrechnung identisch):
```html
<div class="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4">
  <span class="text-muted">Servicegebühr 10 % vom Kassenbon (mind. 3 €, max. 12 €)</span>
  <span class="text-right font-semibold tabular-nums">3–12 €</span>
</div>
```
Label darf mehrzeilig umbrechen (`text-wrap: pretty`), Betrag rechtsbündig `tabular-nums`, nie `whitespace-nowrap`/`truncate` auf Labels. Gesamt-Zeile: stärkste Zeile (17/700 Label, Betrag 21–22 px Bricolage in `brand-deep`) über gestrichelter Trennlinie.

### 2.5 Liefer-Erlebnis
- **OrderStatusTimeline → horizontal + Szene** (siehe §5, Szene 3). Fortschrittslinie füllt per `width`-Transition 900 ms `cubic-bezier(.45,0,.2,1)`; Häkchen ploppen (`plop` 300 ms Spring) beim Erreichen; aktuelle Station pulsiert (`pulseSoft` box-shadow, 2.6 s, NUR aktive Station, nicht bei „geliefert“); Liefer-PKW fährt per `left`-Transition zur aktuellen Station.
- **OrderConfirmationPage:** Häkchen-Kreis 92 px brand, `springIn` 600 ms Spring; **einmaliges** Konfetti (~26 absolute Spans in Palette-Farben, `confettiFall` 0.9–1.8 s, forwards, endet unsichtbar — nichts loopt); darunter Übergabe-Szene (§5, Szene 4); Bestellcode-Karte (Code in Bricolage 30/800, brand-deep).
- **Wizard:** Schrittwechsel `stepIn` (opacity + translateX 22 px, 200 ms ease-out) auf dem Step-Container; Stepper animiert (Kreis-Farbe/Bar 180 ms).
- `prefers-reduced-motion: reduce` ist in root.css schon global neutralisiert — reicht, weil alle Animationen `both/forwards` auf ihren Endzustand laufen. Prüfen, dass Konfetti dann unsichtbar bleibt.

### 2.6 Mobile-Pass (primär 360–430 px)
- Kachel-Grid `grid-cols-[repeat(auto-fill,minmax(100px,1fr))]` → 3 Spalten bei 390, gap 10 px.
- **Wizard-Stepper mobil** (<760 px): „Schritt X von 4 · Label“ links + 4 Punkte rechts (aktiver Punkt 22 px breit, Pille). Desktop: Kreise+Labels (Labels `whitespace-nowrap`).
- Sticky-CTA: `pb-[calc(12px+env(safe-area-inset-bottom))]`, bg `white/94` + `backdrop-blur`.
- Horizontale Scroller nur Kategorie-Chips, Tages-Leiste, Filter-Chips — mit `-mx` Bleed, sodass das nächste Element angeschnitten sichtbar ist; Scrollbar versteckt (Utility existiert).
- Hero mobil: Illustration **unter** der Headline (Grid `auto-fit minmax(300px,1fr)` erledigt das).
- Alle Fahrer-Aktionen (Gekauft/Nicht da) ≥ 50 px hoch, volle Breite geteilt ~60/40.

## 5. Illustrations-System (Brief 3.5) — `src/ui/illustrations/`

Eine Komponente pro Szene + wiederverwendbare Basis-Motive. Nur Palette-Farben. Alle Szenen `aria-hidden="true"`, Props `size`/`variant` wo sinnvoll. **Geometrie aus dem Prototyp übernehmen** (dort final austariert):

| Komponente | Einsatz | Animation (einmalig) |
|---|---|---|
| `DeliveryCar` | Held-Motiv: brand-Karosserie, brand-soft-Fenster, accent-Scheinwerfer, **Logo-Tasche an der Tür**, Kiste im Fenster | Räder: `wheelSpin` 0.9 s ×2 nur beim Einfahren |
| `HeroScene` | Home-Hero: Wolken (2 Gruppen), gestrichelte Straße, Karten-Duo (Liste rotiert −2°, Bon +1.5° mit Zackenkante), Punktraster-Hintergrund | Auto `driveIn` 1.6 s beim Laden, danach Idle: `bob` 4.5 s + `cloudDrift` 26/34 s (einzige erlaubte Loops, sehr ruhig); Karten `floaty` 7/8 s |
| `StoryboardScene` (3 Varianten) | „So funktioniert's“: 1 Figur+Liste (Häkchen ploppen gestaffelt +260 ms) · 2 Einkaufswagen (3 Pakete `dropIn` gestaffelt +300 ms) · 3 Tür+Übergabe (`bagPass` 1 s) | scroll-getriggert via IntersectionObserver (threshold ~0.25), Panels faden gestaffelt (+220 ms), verbindende gestrichelte Linie zeichnet sich (`drawLine`, stroke-dashoffset, nur ≥760 px) |
| `TimelineScene` | Statusseite: Straße mit 5 Stationen (Flex, Zentren bei 10/30/50/70/90 %), Haus mit accent-Klinke rechts, PKW auf der Linie | PKW `left`-Transition 900 ms je Statuswechsel; bei „geliefert“: PKW vor dem Haus + winkende Figur (`waveArm` 1.4 s ×2, transform-origin unten rechts) |
| `HandoverScene` | Danke-Seite: zwei Figuren + Tür, accent-Tasche wechselt die Hand | `bagPass` 1.1 s, delay 0.5 s |
| `EmptyBag` / `LostCar` | EmptyStates (leere Liste) / 404 (PKW + „?“-Blase in warn-bg) | statisch |

**Figuren-Regeln:** Kopf = brand-soft-Kreis mit 1.6 px brand-deep-Outline, 2 Punktaugen, ein Lächel-Quadratkurven-Pfad; Körper = gerundetes Rechteck brand (Zweitfigur `muted`); Arme = dicke runde Linien. Keine Hände, keine realistischen Gesichter. Tasche = accent mit warn-Henkel. Technik: Inline-SVG, CSS-Keyframes (kein `motion` nötig außer ggf. für den Timeline-PKW); keine externen Dateien.

**Keyframes** (Namen/Kurven im Prototyp-`<style>`-Block, übernehmen): `plop`, `springIn`, `stepIn`, `fadeUp`, `listIn`, `pulseSoft`, `driveIn`, `bob`, `cloudDrift`, `wheelSpin`, `drawLine`, `confettiFall`, `waveArm`, `bagPass`, `floaty`, `floaty2`, `dropIn`. Standard-Timing 150–200 ms ease-out; Springs (`cubic-bezier(.3,1.4,.5,1)`) nur für Erfolgs-Momente.

## 6. Screen-Notizen (Abgleich mit Prototyp)

- **Home:** Eyebrow „Einkaufsservice für Günzburg“ (brand, uppercase, tracking .14em) → H1 zweizeilig Bricolage 800 `clamp(34px,5vw,52px)` → Subline C2 (18/muted, max 54ch) → ein Primär-CTA + WhatsApp als Ghost-Button (1.5 px brand-Border, transparent). Storyboard mit nummerierten brand-soft-Kreisen (Bricolage). Drei Vertrauens-Karten (Bon-Icon / Gebühren nach 2.4 / Liefergebiet). Footer: Fahrer-Link dezent unterstrichen, kein Button-Look.
- **Schritt 1:** Suchfeld ist der Held: 58 px, Radius 14, Lupe links, Fokus = brand-Border + 3 px brand-soft-Glow; Dropdown als Float-Karte (Treffer: Emoji-Chip 36 px + Name + Kategorie rechts; kein Treffer: „‚X‘ als eigenen Artikel hinzufügen (Enter)“). Listen-Karten kompakt: Pfeile klein & muted links gestapelt (Drag-Handle sekundär), Emoji in brand-soft-Chip 40 px, Stern = accent gefüllt bei aktiv (Tooltip C4), Mengen-Pille (− n +, 34 px), Unit-Select als Pille, Bio-/Notiz-Chips, Notiz als Inline-Reveal. Neue Items `listIn` 220 ms; Entfernen: Höhe sanft kollabieren (hier darf `motion`/FLIP helfen — einziger sinnvoller `motion`-Einsatz neben dem Timeline-PKW). InfoBox brand-soft mit Icon, fett eingeleiteter erster Satz.
- **Schritt 2:** Budget zentriert: Zahl 40 px Bricolage `tabular-nums` mit €, flankiert von − / + (52 px), Chips darunter, Fehler C5a in danger, Hilfe C5 zentriert. Markt nach 2.3.
- **Schritt 3:** Tages-Kacheln (Wochentag 15.5/700, Datum klein; aktiv = brand gefüllt; So ausgegraut „keine Lieferung“), Slot-Karten mit Restplatz-Badge: brand-soft „Verfügbar“ → warn-bg „Nur noch X Plätze“ (≤2) → grau-Text „Ausgebucht“/„Bestellschluss vorbei“ (Karte bg `#F1EEE7`, opacity .8, sichtbar aber disabled). Adresse: Labels über Feldern (14.5/600), Ort readonly aus PLZ, Telefon-Hilfetext C8, Umland-InfoBox (brand-soft) und C7-Hinweis (warn-bg) direkt am Feld.
- **Schritt 4:** Zusammenfassung als **Bon**: zentrierter `SHOPME`-Kopf (Bricolage, tracking .3em), Positionen mit gepunkteter Führungslinie, gestrichelte Trenner, Gebühren nach 2.4, Gesamt-Obergrenze stärkste Zeile, **Zackenkante** unten (bestehende `receipt-zigzag`-Utility, auf 16×9 px vergrößern + dezenter drop-shadow). Jede Sektion „Bearbeiten“. Vorkasse/Tür als Radio-Karten mit Inline-Erklärung (C9a) und Betrag. Vorkasse → gestalteter Zwischenscreen (Link-Kasten gestrichelt, mono; Betrag groß Bricolage; „Zahlung simulieren“).
- **Statusseite:** Demo-/Zeitstempel unverändert aus Daten; Layout siehe Prototyp (Positionsliste mit Badges gekauft=brand-soft / ersetzt=field-grau / übersprungen=warn-bg; Endabrechnung als Bon inkl. „Bereits bezahlt (Vorkasse)“ und Guthaben-Box brand-soft). Die Demo-Statuswechsel-Leiste im Prototyp ist NUR Prototyp-Chrome — nicht nachbauen.
- **Fahrer:** gleiche Token, höhere Dichte: Code tabular 17/700, Status-Badges (eingegangen=warn-bg/warn · bestätigt=brand-soft/brand-deep · im Einkauf=brand gefüllt · unterwegs=ink-grau · geliefert=field/muted), 🔞 als „18+“-Badge (danger-Border) statt Emoji. BudgetBar: 10 px Track, Verlauf `brand-hell → brand`, ab 90 % `brand → warn` + Hinweis C11. ShoppingItemRow: Nummern-Kreis, „Gekauft“ brand 50 px mit Check (Badge ploppt), „Nicht da“ ghost (bestehender Dialog Ersetzen/Überspringen/WhatsApp bleibt!), erledigte Rows bg `#F6F4EE` + „Rückgängig“. Abrechnung als Bon; Übergabe-Karte mit C10-Checkbox (warm getönter Kasten) vor „Als geliefert markieren“.
- **404/EmptyStates:** Szenen aus §5, Titel Bricolage, ein CTA.

## 7. Nicht anfassen

`demoDb`, APIs, Hooks, `calculateFees`, `parseShoppingList`, `sortItemsForShopping`, `slotRules`, Statusmaschine, Seeds (Ausnahme: `markets.js` +description), Tests. Neue Dependency nur `@fontsource-variable/bricolage-grotesque` (+ `motion` falls für Listen-Kollaps/PKW nötig). Keine Third-Party-Requests.

## 8. Abnahme (Brief §5)

- [ ] Fixes 2.1–2.6 im Screenshot nachweisbar; Grid/Liste synchron (2.1 mit − bei Menge 1 testen)
- [ ] 5 Szenen laufen einmalig, statisches reduced-motion-Fallback (DevTools → Emulate `prefers-reduced-motion`)
- [ ] SPEC-Checkliste 10.1 komplett (Zustände, Skeletons — Skeleton-Farbe auf warme Töne umstellen, Metadaten/Favicon neu nach §3)
- [ ] Screenshot-Paare 390/1280: Home, Schritt 1–4, Danke, Status, Fahrer-Übersicht, Einkaufsmodus
- [ ] `npm run lint` + Tests grün; T1–T11 manuell
- [ ] Zeitungs-Frage pro Screen — Referenz: sieht es aus wie der Prototyp?
