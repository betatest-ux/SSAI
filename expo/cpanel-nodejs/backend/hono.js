import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";

import { appRouter } from "./trpc/app-router.js";
import { createContext } from "./trpc/create-context.js";
import { getDatabase } from "./db/connection.js";
import { initializeDefaultAdmin } from "./db/users.js";
import { initializeDefaultContent } from "./db/content.js";
import { printEnvironmentStatus } from "./utils/env-validation.js";

try {
  printEnvironmentStatus();
  
  console.log('Initializing database connection...');
  getDatabase();
  console.log('Database connection initialized successfully');
  
  initializeDefaultAdmin();
  initializeDefaultContent();
  
  console.log('✅ Backend initialization complete\n');
} catch (err) {
  console.error('❌ Failed to initialize backend:', err);
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
  return c.json({ 
    status: "ok", 
    message: "SocialStoryAI API is running",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      api: "/api/trpc"
    }
  });
});

app.get("/health", (c) => {
  try {
    getDatabase();
    return c.json({ 
      status: "healthy", 
      database: "connected", 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    return c.json({ 
      status: "unhealthy", 
      error: String(error),
      timestamp: new Date().toISOString()
    }, 500);
  }
});

export default app;
