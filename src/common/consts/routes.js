/**
 * Zentrale Routen-Definition. Statische Patterns für den Router,
 * die *Path-Helfer bauen konkrete URLs für Links und Navigation.
 */
const routes = {
  home: "/",
  orderWizard: "/bestellen",
  orderConfirmation: "/bestellung/danke/:code",
  orderStatus: "/bestellung/:code",
  driverOverview: "/fahrer",
  driverOrder: "/fahrer/bestellung/:id",
};

export const orderConfirmationPath = (code) =>
  `/bestellung/danke/${encodeURIComponent(code)}`;
export const orderStatusPath = (code) =>
  `/bestellung/${encodeURIComponent(code)}`;
export const driverOrderPath = (id) =>
  `/fahrer/bestellung/${encodeURIComponent(id)}`;

export default routes;
