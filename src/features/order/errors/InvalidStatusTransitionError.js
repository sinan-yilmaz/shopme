export default class InvalidStatusTransitionError extends Error {
  constructor(from, to) {
    super(`Statuswechsel von „${from}" nach „${to}" ist nicht erlaubt.`);
    this.name = "InvalidStatusTransitionError";
  }
}
