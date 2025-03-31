import React from "react";
import ReactDOM from "react-dom/client";
import App from './App.tsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext'; // Import ThemeProvider

import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

const basename = import.meta.env.BASE_URL;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme"> {/* Changed defaultTheme to system */}
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
