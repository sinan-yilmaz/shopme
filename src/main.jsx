import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/inter";
import "@fontsource-variable/bricolage-grotesque";
import "root/root.css";
import Root from "root/Root";
import { configureDemoDb } from "common/services/demoDb";
import buildDemoSeed from "features/order/mocks/buildDemoSeed";
import refreshDemoDb from "features/order/mocks/refreshDemoDb";

configureDemoDb({ seed: buildDemoSeed, refresh: refreshDemoDb });

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
