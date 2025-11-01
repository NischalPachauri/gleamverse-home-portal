import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/error-image.css";

createRoot(document.getElementById("root")!).render(<App />);

// Basic scroll reveal
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if ((e as IntersectionObserverEntry).isIntersecting) {
      (e.target as HTMLElement).classList.add('visible');
      io.unobserve(e.target);
    }
  }
}, { threshold: 0.15 });

window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
});