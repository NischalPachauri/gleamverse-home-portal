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
    ((): PluginOption => ({
      name: "copy-flipbook-assets",
      apply: "build" as const,
      generateBundle(this: any) {
        try {
          const jsPath = path.resolve(__dirname, "flipbook.min.js");
          const js = fs.readFileSync(jsPath);
          this.emitFile({ type: "asset", fileName: "flipbook.min.js", source: js });
        } catch {}
        try {
          const cssPath = path.resolve(__dirname, "flipbook.style.css");
          const css = fs.readFileSync(cssPath);
          this.emitFile({ type: "asset", fileName: "flipbook.style.css", source: css });
        } catch {}
        try {
          const pdfSvcPath = path.resolve(__dirname, "public/flipbook.pdfservice.min.js");
          const pdfSvc = fs.readFileSync(pdfSvcPath);
          this.emitFile({ type: "asset", fileName: "flipbook.pdfservice.min.js", source: pdfSvc });
        } catch {}
      }
    }))()
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
