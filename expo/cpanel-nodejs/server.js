import { serve } from '@hono/node-server';
import app from './backend/hono.js';

const port = process.env.PORT || 3000;

console.log('🚀 Starting SocialStoryAI Backend Server...');
console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🌐 Port: ${port}`);

serve({
  fetch: app.fetch,
  port: parseInt(port),
}, (info) => {
  console.log(`✅ Server is running on http://localhost:${info.port}`);
  console.log(`🔗 API endpoint: http://localhost:${info.port}/api/trpc`);
  console.log(`🏥 Health check: http://localhost:${info.port}/health`);
});
