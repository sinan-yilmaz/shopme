/**
 * Fake-Backend im Browser (SPEC §6): hält den gesamten Datenbestand in
 * localStorage. Domänenfrei — Seed- und Refresh-Logik werden beim App-Start
 * über configureDemoDb() injiziert (common importiert nie aus features).
 */

const STORAGE_KEY = "gzes-demo-v1";

let config = null;

/**
 * @param {Object} options
 * @param {() => Object} options.seed erzeugt den frischen Demo-Datenbestand
 * @param {(db: Object) => Object} [options.refresh] hält den Bestand beim Laden
 *   konsistent (z. B. Zeitfenster relativ zu „heute" regenerieren)
 */
export function configureDemoDb({ seed, refresh }) {
  config = { seed, refresh };
}

function assertConfigured() {
  if (!config) {
    throw new Error(
      "demoDb ist nicht konfiguriert — configureDemoDb() vor dem ersten Zugriff aufrufen.",
    );
  }
}

function loadRaw() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persist(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

/**
 * Liest den Datenbestand; seedet beim ersten Start und lässt ihn vom
 * konfigurierten Refresh auf „heute" bringen. Gibt eine Kopie zurück.
 * @returns {Object}
 */
export function readDb() {
  assertConfigured();
  const stored = loadRaw();
  const base = stored ?? config.seed();
  const refreshed = config.refresh ? config.refresh(base) : base;
  persist(refreshed);
  return structuredClone(refreshed);
}

/**
 * Persistiert einen neuen Datenbestand.
 * @param {Object} db
 */
export function writeDb(db) {
  assertConfigured();
  persist(db);
}

/** Setzt den Datenbestand auf den frischen Seed zurück. */
export function resetDb() {
  assertConfigured();
  localStorage.removeItem(STORAGE_KEY);
  persist(config.refresh ? config.refresh(config.seed()) : config.seed());
}

/**
 * Künstliche Latenz, damit Loading-States sichtbar und realistisch sind.
 * @returns {Promise<void>}
 */
export function delay() {
  const ms = 250 + Math.floor(Math.random() * 151);
  return new Promise((resolve) => setTimeout(resolve, ms));
}
