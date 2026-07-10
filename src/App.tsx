import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Sweepstakes } from "./pages/Sweepstakes";
import { DEFAULT_LEAGUE_ID } from "./lib/league";
import { PersonFixtures } from "./pages/PersonFixtures";

// Mirror the OS prefers-color-scheme onto a `.dark` class on <html>. Using
// the class strategy (rather than Tailwind's media strategy) gives us a
// single source of truth that can later be flipped manually too.
function useSystemDarkMode(): void {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = (dark: boolean) => document.documentElement.classList.toggle("dark", dark);
    apply(mq.matches);
    const handler = (e: MediaQueryListEvent) => apply(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
}

export function App() {
  useSystemDarkMode();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={`/${DEFAULT_LEAGUE_ID}`} replace />} />
        <Route path="/:league/:user" element={<PersonFixtures />} />
        <Route path="/:league" element={<Sweepstakes />} />
      </Routes>
    </BrowserRouter>
  );
}
