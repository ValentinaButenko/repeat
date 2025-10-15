# Access Control Setup Guide

## 🔐 Password Protection (Built-in)

Your app now includes **optional password protection** that you can enable with a single environment variable.

### How It Works

- **Disabled by default**: If `APP_ACCESS_PASSWORD` is not set, anyone can access your app
- **Enabled when you add password**: Set `APP_ACCESS_PASSWORD` and only users with the password can access
- **No code changes needed**: Just set the environment variable and redeploy

### Quick Setup

#### Local Development

1. Create or edit `.env.local`:
   ```bash
   APP_ACCESS_PASSWORD=YourSecretPassword123
   ```

2. Restart your dev server:
   ```bash
   npm run dev
   ```

3. Visit `http://localhost:3000` - you'll see a login page!

#### Production (Vercel)

1. Go to your project on Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Add new variable:
   - **Key**: `APP_ACCESS_PASSWORD`
   - **Value**: `YourSecretPassword123` (choose a strong password)
   - **Environment**: Production (or all environments)
4. Click **Save**
5. **Redeploy** your app (Settings → Deployments → click ⋯ → Redeploy)

That's it! Your app is now password protected.

#### Production (Netlify)

1. Go to your site dashboard on Netlify
2. Navigate to **Site settings** → **Environment variables**
3. Add new variable:
   - **Key**: `APP_ACCESS_PASSWORD`
   - **Value**: `YourSecretPassword123`
4. **Redeploy** your site

### How Users Access the App

1. User visits your app URL (e.g., `your-app.vercel.app`)
2. They see a login page
3. They enter the password you shared with them
4. They're logged in for 30 days (cookie-based)
5. They can use the app normally

### Sharing Access

To give someone access:
1. Share your app URL: `https://your-app.vercel.app`
2. Share the password (via secure channel - Signal, WhatsApp, etc.)
3. They enter the password once
4. They're good to go for 30 days!

### Security Features

✅ Password stored securely in environment variables (server-side only)  
✅ Password never exposed to browser/client code  
✅ HTTP-only cookies (can't be accessed via JavaScript)  
✅ Session expires after 30 days  
✅ Works with all routes and API endpoints  
✅ Protects your OpenAI API key from unauthorized use  

### Disabling Password Protection

To remove password protection:

**Vercel:**
1. Go to Settings → Environment Variables
2. Delete `APP_ACCESS_PASSWORD`
3. Redeploy

**Netlify:**
1. Go to Site settings → Environment variables
2. Delete `APP_ACCESS_PASSWORD`
3. Redeploy

The app will now be publicly accessible again.

### Changing the Password

To change the password:
1. Update the `APP_ACCESS_PASSWORD` value in your deployment settings
2. Redeploy
3. All existing sessions will be invalidated
4. Users will need to log in again with the new password

### Testing

```bash
# Local testing
echo "APP_ACCESS_PASSWORD=test123" >> .env.local
npm run dev

# Visit http://localhost:3000
# You should see a login page
# Enter "test123" to access the app
```

## 🎯 When to Use Password Protection

### Use It When:
- ✅ You're deploying with your own OpenAI API key
- ✅ You want to control who uses your app
- ✅ You want to prevent random users from costing you API money
- ✅ You're sharing with a known group of people
- ✅ You want simple, quick protection

### Don't Need It When:
- ❌ You deploy without an OpenAI API key (app uses free services)
- ❌ You want a fully public app
- ❌ Each user has their own OpenAI API key

## 🔄 Alternative: Make Repo Private

If you make your GitHub repo private instead:

**Pros:**
- Code is hidden from public
- Others can't easily copy your implementation

**Cons:**
- ❌ **Doesn't protect your deployed app**
- ❌ Deployed app URL is still publicly accessible
- ❌ Anyone who finds the URL can still use it
- ❌ One-click deploy buttons won't work for others

**Recommendation:** Keep repo public + use password protection = Best of both worlds!

## 📊 Comparison

| Method | App Access | Code Visible | Setup Time | Cost |
|--------|-----------|--------------|------------|------|
| **Password Protection** | ✅ Restricted | ✅ Yes (public repo) | 5 min | Free |
| **Private Repo** | ❌ Still public | ❌ No | 2 min | Free |
| **Private Repo + Password** | ✅ Restricted | ❌ No | 7 min | Free |
| **No Protection** | ❌ Public | ✅ Yes | 0 min | Free |

## 🆘 Troubleshooting

### "Password doesn't work"
- Check that `APP_ACCESS_PASSWORD` is set correctly in environment variables
- Make sure you redeployed after adding the variable
- Try in incognito/private browser window

### "Still showing login page after entering correct password"
- Check browser console for errors
- Clear cookies and try again
- Verify the password in environment variables matches exactly

### "Want to temporarily disable without deleting password"
- Comment out the password: `# APP_ACCESS_PASSWORD=yourpass`
- Or set it to empty: `APP_ACCESS_PASSWORD=`
- Redeploy

### "Users keep getting logged out"
- Cookie expires after 30 days (by design)
- If you change the password, all sessions are invalidated

## 🎓 Advanced: Email Allowlist

Want more advanced authentication (email-based login)? See [AUTH_OPTIONS.md](AUTH_OPTIONS.md) for:
- NextAuth.js setup with magic links
- Google/GitHub OAuth integration
- Email allowlist implementation
- Per-user access control

---

**Need help?** Open an issue on GitHub or check the documentation.

