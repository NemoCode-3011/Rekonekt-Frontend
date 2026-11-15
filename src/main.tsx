import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./features/auth/AuthProvider";
import ErrorBoundary from "./components/ErrorBoundary";
import { MotionConfig } from "framer-motion";
import SmoothScroll from "./components/navigation/SmoothScroll";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <MotionConfig reducedMotion="user">
            <SmoothScroll>
              <App />
            </SmoothScroll>
          </MotionConfig>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);