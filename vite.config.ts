import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // allow external host used by ngrok (developer requested)
    allowedHosts: ["carmelo-uncertifiable-overhotly.ngrok-free.dev"]
  }
});
