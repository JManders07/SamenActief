import express, { type Express } from "express";
import fs from "fs";
import path, { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import * as vite from "vite";
import type { ViteDevServer } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function createDevServer() {
  const app = express();
  
  const viteServer = await vite.createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    root: resolve(__dirname, '../client'),
  });

  app.use(viteServer.middlewares);

  return { app, vite: viteServer };
}

export async function setupVite(app: Express, server: Server) {
  const viteServer = await vite.createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    root: resolve(__dirname, '../client'),
  });

  app.use(viteServer.middlewares);

  return viteServer;
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "..", "dist", "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
