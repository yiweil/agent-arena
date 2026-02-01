// Simple in-memory rate limiter
// For production, consider using Redis or a proper rate limiting service

const rateLimitMap = new Map();

export function rateLimit(ip, windowMs = 3600000, maxRequests = 10) {
  const now = Date.now();
  const windowStart = now - windowMs;

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }

  const requests = rateLimitMap.get(ip);
  
  // Remove old requests outside the current window
  const recentRequests = requests.filter(timestamp => timestamp > windowStart);
  
  if (recentRequests.length >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: recentRequests[0] + windowMs
    };
  }

  // Add current request
  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);

  return {
    allowed: true,
    remaining: maxRequests - recentRequests.length,
    resetTime: null
  };
}

// Clean up old entries periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  const windowMs = 3600000; // 1 hour
  
  for (const [ip, requests] of rateLimitMap.entries()) {
    const recentRequests = requests.filter(timestamp => timestamp > (now - windowMs));
    if (recentRequests.length === 0) {
      rateLimitMap.delete(ip);
    } else {
      rateLimitMap.set(ip, recentRequests);
    }
  }
}, 300000); // Clean up every 5 minutes