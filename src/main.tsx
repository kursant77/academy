import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./lib/i18n";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { initAnalytics } from "./lib/analytics";

// Initialize analytics in production
if (import.meta.env.PROD) {
  initAnalytics();
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
