import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Auth0Provider } from "@auth0/auth0-react";
import { ErrorBoundary } from "./auth/ErrorBoundary";

// Get Auth0 configuration from environment variables
const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  redirectUri:
    import.meta.env.VITE_AUTH0_REDIRECT_URI || window.location.origin,
};

// Validate that all required Auth0 environment variables are present
const validateAuth0Config = () => {
  const missing = [];
  if (!auth0Config.domain) missing.push("VITE_AUTH0_DOMAIN");
  if (!auth0Config.clientId) missing.push("VITE_AUTH0_CLIENT_ID");

  if (missing.length > 0) {
    console.error(
      "❌ Missing required Auth0 environment variables:",
      missing.join(", ")
    );
    console.error(
      "Please check your .env file and ensure all Auth0 variables are set."
    );
    return false;
  }

  console.log("✅ Auth0 configuration loaded successfully");
  return true;
};

// Validate configuration before rendering
if (!validateAuth0Config()) {
  // Show error message if configuration is invalid
  document.getElementById("root").innerHTML = `
    <div style="
      display: flex; 
      align-items: center; 
      justify-content: center; 
      height: 100vh; 
      font-family: system-ui, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
      padding: 2rem;
    ">
      <div>
        <h1>⚠️ Configuration Error</h1>
        <p>Auth0 environment variables are missing.</p>
        <p>Please check your .env file and restart the development server.</p>
      </div>
    </div>
  `;
} else {
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <ErrorBoundary>
        <Auth0Provider
          domain={auth0Config.domain}
          clientId={auth0Config.clientId}
          authorizationParams={{
            redirect_uri: auth0Config.redirectUri,
          }}
          cacheLocation="localstorage"
          useRefreshTokens={true}
        >
          <App />
        </Auth0Provider>
      </ErrorBoundary>
    </StrictMode>
  );
}
