import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import Bootstrap from "./Bootstrap";
import { ThemeProvider } from "./ThemeContext";
import { AuthProvider } from "./auth/AuthContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <Bootstrap>
        <AuthProvider>
          <App />
        </AuthProvider>
      </Bootstrap>
    </ThemeProvider>
  </StrictMode>
);
