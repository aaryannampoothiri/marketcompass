import * as React from "react";
import { createRoot } from "react-dom/client";
import HeroDemo from "./components/ui/hero-demo";
import CorridorToBusinessPage from "./app/corridor-to-business/page";
import BusinessToCorridorPage from "./app/business-to-corridor/page";

// Mount Hero
const heroContainer = document.getElementById("react-hero-root");
if (heroContainer) {
  const heroRoot = createRoot(heroContainer);
  heroRoot.render(<HeroDemo />);
}

// Mount Corridor to Business Page (Workflow 1)
const c2bContainer = document.getElementById("react-c2b-root");
if (c2bContainer) {
  const c2bRoot = createRoot(c2bContainer);
  c2bRoot.render(<CorridorToBusinessPage />);
}

// Mount Business to Corridor Page (Workflow 2)
const b2cContainer = document.getElementById("react-b2c-root");
if (b2cContainer) {
  const b2cRoot = createRoot(b2cContainer);
  b2cRoot.render(<BusinessToCorridorPage />);
}
