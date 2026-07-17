import { delay, readDb } from "common/services/demoDb";

const CatalogApi = {
  /**
   * Alle Katalogartikel in Seed-Reihenfolge.
   * @returns {Promise<import('../types/CatalogItem').CatalogItem[]>}
   */
  async getItems() {
    await delay();
    const db = readDb();
    return db.catalogItems;
  },
};

export default CatalogApi;
