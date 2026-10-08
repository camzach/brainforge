import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import basicSsl from "@vitejs/plugin-basic-ssl";

const isHosted = process.argv.includes("--host");

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    ...(isHosted ? [basicSsl()] : []),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  base: "/",
});
