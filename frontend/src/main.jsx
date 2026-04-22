import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import "./pages/Auth.css";
import { AuthProvider } from "./context/AuthContext.jsx";
import Landing  from "./pages/Landing.jsx";
import Login    from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import AppPage  from "./pages/AppPage.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"         element={<Landing />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/app"      element={<AppPage />} />
          <Route path="*"         element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
