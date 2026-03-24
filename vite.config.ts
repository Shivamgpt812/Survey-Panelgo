import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { inspectAttr } from "kimi-plugin-inspect-react";

// https://vite.dev/config/
export default defineConfig({
base: "/",

server: {
proxy: {
"/api": "http://localhost:3000", // ONLY for local dev
},
},

plugins: [inspectAttr(), react()],

resolve: {
alias: {
"@": path.resolve(__dirname, "./src"),
},
},
});
