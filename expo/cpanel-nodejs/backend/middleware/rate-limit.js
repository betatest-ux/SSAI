const rateLimitStore = new Map();

const RATE_LIMITS = {
  login: { maxAttempts: 5, windowMs: 15 * 60 * 1000 },
  register: { maxAttempts: 3, windowMs: 60 * 60 * 1000 },
  default: { maxAttempts: 100, windowMs: 15 * 60 * 1000 },
};

export async function checkRateLimit(identifier, action = 'default') {
  const limit = RATE_LIMITS[action] || RATE_LIMITS.default;
  const key = `${action}:${identifier}`;
  const now = Date.now();
  
  const record = rateLimitStore.get(key);
  
  if (!record) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + limit.windowMs,
    });
    return true;
  }
  
  if (now > record.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + limit.windowMs,
    });
    return true;
  }
  
  if (record.count >= limit.maxAttempts) {
    return false;
  }
  
  record.count++;
  rateLimitStore.set(key, record);
  return true;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000);
