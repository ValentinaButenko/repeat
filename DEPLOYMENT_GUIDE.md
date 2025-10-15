# 🚀 Complete Deployment Guide

## Quick Decision Tree

### Do you want your code visible to everyone?

**YES** → Keep repo **public**  
**NO** → Make repo **private**

### Do you want anyone to use your deployed app?

**YES** → Don't set `APP_ACCESS_PASSWORD`  
**NO** → Set `APP_ACCESS_PASSWORD` (see [ACCESS_CONTROL.md](ACCESS_CONTROL.md))

## Common Scenarios

### Scenario 1: Open Source + Public App
*"I want to share my code AND let anyone use the app"*

- ✅ Repo: **Public**
- ✅ Password: **Not set**
- ⚠️ Don't add your OpenAI key (or accept the cost)
- 💡 Users can deploy their own instance with the one-click button

**Good for:** Portfolio projects, learning resources, community apps

---

### Scenario 2: Open Source + Private App (RECOMMENDED)
*"I want to share my code but only specific users can use my deployed instance"*

- ✅ Repo: **Public**
- ✅ Password: **Set** (`APP_ACCESS_PASSWORD`)
- ✅ OpenAI Key: **Your own** (safe because password protects it)
- 💡 Best of both worlds!

**Good for:** Sharing with friends/family while showcasing code

**Setup:**
```bash
# On Vercel/Netlify, set:
APP_ACCESS_PASSWORD=YourSecretPassword123
OPENAI_API_KEY=sk-your-key-here
```

---

### Scenario 3: Private Code + Private App
*"I don't want anyone to see my code or use my app (except invited users)"*

- ✅ Repo: **Private**
- ✅ Password: **Set** (`APP_ACCESS_PASSWORD`)
- ✅ OpenAI Key: **Your own**
- ⚠️ One-click deploy won't work for others

**Good for:** Proprietary projects, commercial apps

---

### Scenario 4: Private Code + Public App
*"I want to hide my code but let anyone use the app"*

- ✅ Repo: **Private**
- ✅ Password: **Not set**
- ⚠️ Don't add your OpenAI key (or accept the cost)

**Good for:** Protecting IP while providing free service

---

## Your Situation (Most Likely)

Based on your questions, you probably want **Scenario 2**:

### 📋 Checklist

- [ ] Keep GitHub repo **PUBLIC** (great for portfolio!)
- [ ] Push all the new code to GitHub
- [ ] Deploy to Vercel
- [ ] Set `APP_ACCESS_PASSWORD=YourSecretPassword` in Vercel environment variables
- [ ] Set `OPENAI_API_KEY=sk-...` in Vercel environment variables
- [ ] Share your app URL + password with chosen users
- [ ] Done! 🎉

### What This Gives You

✅ Your code is visible on GitHub (portfolio!)  
✅ Only users with password can access deployed app  
✅ Your OpenAI API key is protected from unauthorized use  
✅ You control who uses your AI features  
✅ Others can still deploy their own instance if they want  
✅ No cost from random strangers  

## Step-by-Step: Full Setup

### 1. Push Your Code

```bash
git add .
git commit -m "Add deployment configs and access control"
git push origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Select your `repeat` repository
3. Click "Import"

### 3. Add Environment Variables

In Vercel deployment settings, add:

| Name | Value | Purpose |
|------|-------|---------|
| `OPENAI_API_KEY` | `sk-...` | Your OpenAI key for AI features |
| `APP_ACCESS_PASSWORD` | `SecretPass123` | Restricts app access |

### 4. Deploy

Click "Deploy" and wait ~2 minutes.

### 5. Test

Visit your app URL (e.g., `repeat-xyz.vercel.app`)

- You should see a login page
- Enter your password
- You're in!

### 6. Share

Send to your users:
- 🔗 URL: `https://repeat-xyz.vercel.app`
- 🔑 Password: `SecretPass123`

## Managing Access

### Add New Users
Just share the URL + password with them.

### Remove User Access
Change the password in Vercel and redeploy. All existing sessions are invalidated.

### Temporarily Disable Access
Set `APP_ACCESS_PASSWORD` to a very long random string that only you know.

### Make Public Again
Delete `APP_ACCESS_PASSWORD` from environment variables and redeploy.

## Cost Estimates

### With Password Protection (10 active users)

Assuming each user generates 20 cards/week:
- 10 users × 20 cards × 4 weeks = 800 cards/month
- Cost: ~$0.08/month with gpt-4o-mini

**Very affordable!**

### Without Password Protection (Public)

Could be anyone... potentially hundreds of users.
- **Risky** if you have your OpenAI key configured
- **Safe** if you don't set any API keys (app uses free services)

## FAQ

**Q: If my repo is public, can people see my API key?**  
A: No! API keys are stored as environment variables on Vercel/Netlify, never in your code.

**Q: If my repo is private, does that protect my deployed app?**  
A: No! The deployed app URL is still publicly accessible. Use `APP_ACCESS_PASSWORD` instead.

**Q: Can someone steal my password from the code?**  
A: No! The password is stored as an environment variable, never in your code.

**Q: What if someone shares the password?**  
A: Change it in Vercel settings and redeploy. You can also implement more advanced auth (see [AUTH_OPTIONS.md](AUTH_OPTIONS.md)).

**Q: Is this password protection secure enough?**  
A: For protecting API costs and casual use, yes! For highly sensitive data, consider OAuth (see [AUTH_OPTIONS.md](AUTH_OPTIONS.md)).

**Q: Can I use both password protection AND make repo private?**  
A: Yes! That's Scenario 3. You get double protection.

## Next Steps

1. ✅ Review this guide
2. ✅ Decide which scenario fits your needs
3. ✅ Push code to GitHub
4. ✅ Deploy to Vercel with appropriate environment variables
5. ✅ Test the deployment
6. ✅ Share with your users!

Need more help? Check:
- [ACCESS_CONTROL.md](ACCESS_CONTROL.md) - Password protection details
- [SECURITY.md](SECURITY.md) - API security and rate limiting
- [AUTH_OPTIONS.md](AUTH_OPTIONS.md) - Advanced authentication options

