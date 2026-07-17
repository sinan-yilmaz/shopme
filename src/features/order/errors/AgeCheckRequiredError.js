export default class AgeCheckRequiredError extends Error {
  constructor() {
    super(
      'Diese Bestellung enthält Artikel ab 18. Bitte zuerst „Ausweis geprüft — Kunde ist 18 oder älter." bestätigen.',
    );
    this.name = "AgeCheckRequiredError";
  }
}
