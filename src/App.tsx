import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/home";
import { AuthProvider } from "./context/AuthContext";
import AuthForms from "./components/AuthForms";

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<p>Loading...</p>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<AuthForms />} />
          <Route path="/history" element={<Home />} />
          {import.meta.env.VITE_TEMPO === "true" && (
            <Route path="/tempobook/*" />
          )}
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
