export default class OrderNotFoundError extends Error {
  constructor(reference) {
    super(`Bestellung „${reference}" wurde nicht gefunden.`);
    this.name = "OrderNotFoundError";
  }
}
