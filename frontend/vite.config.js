import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/auth": { target: "http://localhost:4001", changeOrigin: true, credentials: true },
      "/me": { target: "http://localhost:4001", changeOrigin: true, credentials: true },
      "/token": { target: "http://localhost:4001", changeOrigin: true, credentials: true },
      "/premium": { target: "http://localhost:4001", changeOrigin: true, credentials: true },
      "/todos": { target: "http://localhost:4002", changeOrigin: true },
      "/health": { target: "http://localhost:4001", changeOrigin: true },
    },
  },
});
