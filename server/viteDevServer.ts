import { createServer as createVite } from "vite";

export async function createViteServer() {
  return createVite({
    server: { middlewareMode: true },
    appType: "spa",
  });
}
