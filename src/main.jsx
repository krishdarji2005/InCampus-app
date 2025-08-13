import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Auth0Provider } from "@auth0/auth0-react";
import { ErrorBoundary } from './auth/ErrorBoundary';

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <Auth0Provider
        domain="dev-2j1gwkijxrfahn1d.us.auth0.com"
        clientId="74T5XJhYBggylNn3oiy2aAUl8mI3k6U3"
        authorizationParams={{
          redirect_uri: window.location.origin,
        }}
      >
        <App />
      </Auth0Provider>
    </ErrorBoundary>
  </StrictMode>
);
