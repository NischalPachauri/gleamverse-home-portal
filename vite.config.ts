import { defineConfig, PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    strictPort: false,
    hmr: true
  },
  preview: {
    host: "::",
    port: 8081,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            "react",
            "react-dom",
            "react-router-dom"
          ],
          radix: [
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-dialog",
            "@radix-ui/react-select",
            "@radix-ui/react-menubar",
            "@radix-ui/react-popover"
          ],
          icons: [
            "lucide-react"
          ],
          supabase: [
            "@supabase/supabase-js"
          ],
          pdf: [
            "react-pdf",
            "pdfjs-dist"
          ],
          three: [
            "three",
            "@react-three/fiber",
            "@react-three/drei"
          ]
        }
      }
    }
  }
}));
