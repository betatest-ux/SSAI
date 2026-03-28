import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';

import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import { getDatabase } from "./db/connection";
import { initializeDefaultAdmin } from "./db/users";
import { initializeDefaultContent } from "./db/content";
import { printEnvironmentStatus } from "./utils/env-validation";

if (typeof window === 'undefined') {
  try {
    printEnvironmentStatus();
    
    const dbDir = join(process.cwd(), 'database');
    if (!existsSync(dbDir)) {
      console.log('Creating database directory...');
      mkdirSync(dbDir, { recursive: true });
    }
    
    console.log('Initializing database...');
    getDatabase();
    console.log('Database initialized successfully');
    
    initializeDefaultAdmin();
    initializeDefaultContent();
    
    console.log('✅ Backend initialization complete\n');
  } catch (err) {
    console.error('❌ Failed to initialize backend:', err);
  }
}

const app = new Hono();

app.use("*", secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", "https:"],
    fontSrc: ["'self'", "data:"],
  },
  xFrameOptions: "DENY",
  xContentTypeOptions: "nosniff",
  referrerPolicy: "strict-origin-when-cross-origin",
}));

app.use("*", cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 86400,
}));

app.use(
  "/api/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  }),
);

app.get("/", (c) => {
  return c.json({ status: "ok", message: "SocialStoryAI API is running" });
});

app.get("/health", (c) => {
  try {
    getDatabase();
    return c.json({ status: "healthy", database: "connected", timestamp: new Date().toISOString() });
  } catch (error) {
    return c.json({ status: "unhealthy", error: String(error) }, 500);
  }
});

export default app;
