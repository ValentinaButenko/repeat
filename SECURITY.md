# Security Guide

## Deploying with Your Own API Key

When you deploy this app with your own OpenAI API key for shared use, the key is **secure by default**:

### ✅ What's Already Secure

1. **Server-Side Only**: API keys are stored as environment variables on the server (Vercel/Netlify)
2. **Never Exposed**: Keys are never sent to users' browsers or visible in client-side code
3. **Request Validation**: Built-in validation limits card generation to max 200 cards per request
4. **No API Key in URLs**: Keys are never included in URLs or query parameters

### 🛡️ Additional Protection (Optional)

To further protect your API key from abuse, you can enable rate limiting:

#### Option 1: Enable Built-in Rate Limiting (Simple)

Add rate limiting to your API routes by uncommenting the rate limit code:

**File: `app/api/generate-cards/route.ts`**

```typescript
import { NextResponse } from 'next/server';
import { rateLimit, getClientIP } from '@/lib/rate-limit';

export async function POST(req: Request) {
  // Rate limit: 10 card generations per IP per hour
  const ip = getClientIP(req);
  const rateLimitResult = rateLimit(ip, { 
    limit: 10, 
    windowInSeconds: 3600 
  });

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          'X-RateLimit-Reset': String(rateLimitResult.resetTime),
        }
      }
    );
  }

  // ... rest of your existing code
}
```

**File: `app/api/translate/route.ts`**

```typescript
import { NextResponse } from 'next/server';
import { rateLimit, getClientIP } from '@/lib/rate-limit';

export async function POST(req: Request) {
  // Rate limit: 30 translations per IP per minute
  const ip = getClientIP(req);
  const rateLimitResult = rateLimit(ip, { 
    limit: 30, 
    windowInSeconds: 60 
  });

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  // ... rest of your existing code
}
```

#### Option 2: Use Vercel's Edge Config Rate Limiting (Production)

For production deployments on Vercel, use their built-in rate limiting:

1. Install Vercel Rate Limiting:
   ```bash
   npm install @vercel/edge-config
   ```

2. Set up rate limiting in Vercel dashboard:
   - Go to your project settings
   - Navigate to Edge Config
   - Configure rate limits per route

See: [Vercel Rate Limiting Docs](https://vercel.com/docs/security/rate-limiting)

#### Option 3: Use Upstash Redis (Recommended for Scale)

For high-traffic deployments:

1. Create a free Upstash Redis database at [upstash.com](https://upstash.com)
2. Install Upstash SDK:
   ```bash
   npm install @upstash/redis @upstash/ratelimit
   ```
3. Add environment variables:
   ```env
   UPSTASH_REDIS_REST_URL=...
   UPSTASH_REDIS_REST_TOKEN=...
   ```

See: [Upstash Rate Limiting](https://upstash.com/docs/redis/features/ratelimiting)

## Cost Management

### Set OpenAI Budget Limits

1. Go to [OpenAI Usage Settings](https://platform.openai.com/account/billing/limits)
2. Set a **monthly budget limit** (e.g., $20/month)
3. Set up **email alerts** when you reach 75% and 90% of your limit
4. Set a **hard limit** to stop all API calls when budget is exceeded

### Monitor Usage

- Check usage daily at [OpenAI Dashboard](https://platform.openai.com/usage)
- Set up email notifications for unusual activity
- Review the usage logs regularly

### Current API Costs (as of 2024)

With GPT-4o-mini (default model):
- **Card Generation**: ~$0.0001 per card (1000 cards ≈ $0.10)
- **Translation**: ~$0.00005 per translation

Example: If 100 users each generate 50 cards, that's:
- 100 × 50 = 5,000 cards
- Cost: ~$0.50

### Cost-Saving Tips

1. **Use free translation first**: The app tries free services (LibreTranslate, MyMemory) before OpenAI
2. **Limit generation amounts**: Current limit is 200 cards/request - consider lowering it
3. **Cache translations**: Consider adding a translation cache for common words
4. **Monitor top users**: Check logs to identify heavy users

## Environment Variables Security

### Never Commit These

✅ `.env.example` - Template file (safe to commit)  
❌ `.env.local` - Your actual keys (never commit)  
❌ `.env` - Your actual keys (never commit)

### Rotation

If your API key is ever compromised:

1. **Immediately revoke** the old key in OpenAI dashboard
2. **Generate a new key**
3. **Update** environment variables in Vercel/Netlify
4. **Redeploy** the application

## Reporting Security Issues

If you find a security vulnerability, please email the maintainer directly rather than opening a public issue.

## Additional Resources

- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/deploying/production-checklist#security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Vercel Security](https://vercel.com/docs/security)

