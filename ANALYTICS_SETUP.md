# Analytics Setup Guide

This project uses **Mixpanel** for tracking user events and behavior analytics.

## 🚀 Quick Setup

### 1. Create a Mixpanel Account

1. Go to [https://mixpanel.com/](https://mixpanel.com/)
2. Sign up for a free account
3. Create a new project
4. Copy your **Project Token** from Settings → Project Settings

### 2. Add Environment Variable

**For Local Development:**
```bash
# Add to .env.local
NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token_here
```

**For Vercel Deployment:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add new variable:
   - **Key**: `NEXT_PUBLIC_MIXPANEL_TOKEN`
   - **Value**: Your Mixpanel project token
   - **Environments**: Check all (Production, Preview, Development)
3. Redeploy your app

### 3. Verify Setup

1. Run your app locally or deploy to Vercel
2. Click on a Study button (onboarding or home screen)
3. Check Mixpanel Dashboard → Events → Live View
4. You should see "Study Button Clicked" events appearing

## 📊 Tracked Events

### Study Button Clicks

| Event Name | Properties | Source |
|------------|------------|--------|
| `Study Button Clicked` | `source: 'onboarding'`, `screen: 'onboarding_review'` | Onboarding review page |
| `Study Button Clicked` | `source: 'home'`, `screen: 'home'`, `setId`, `setName` | Home page |
| `Study Button Clicked` | `source: 'set_details'`, `screen: 'set_details'`, `setId`, `setName` | Set details page |

### Other Events

- **Onboarding Started** - When user starts onboarding
- **Onboarding Completed** - When user completes language selection
  - Properties: `learningLanguage`, `nativeLanguage`
- **Cards Generated** - When user generates cards
  - Properties: `amount`, `complexity`, `source`
- **Set Created** - When user creates a new set
  - Properties: `setName`
- **Card Created** - When user creates a card manually
  - Properties: `source`

## 📈 How to View Analytics

### Unique Users Who Clicked Study Button

**In Mixpanel Dashboard:**

1. Go to **Insights** → **Create Report**
2. Select event: `Study Button Clicked`
3. Add filter: `source` = `onboarding`
4. Set "Counted by": **Unique Users**
5. Set date range
6. View the total unique users

**For Home Screen:**

1. Same steps, but filter by `source` = `home`

### Create a Comparison Report

1. Go to **Insights** → **Create Report**
2. Add event: `Study Button Clicked`
3. Click "Break down by" → Select `source`
4. View comparison between `onboarding`, `home`, and `set_details`

## 🔧 Custom Tracking

To add new events, use the analytics helper:

```typescript
import { analytics } from '../lib/analytics';

// Track custom event
analytics.trackEvent('My Custom Event', {
  customProperty: 'value',
});
```

## 🎯 Funnels

Create a funnel to track user journey:

1. **Onboarding Started**
2. **Onboarding Completed**
3. **Cards Generated**
4. **Study Button Clicked**

This shows drop-off rates at each step.

## 🔒 Privacy

- Mixpanel data is stored on Mixpanel's servers
- No personally identifiable information (PII) is tracked
- User IDs are anonymous
- For GDPR compliance, see [Mixpanel's GDPR guide](https://mixpanel.com/legal/gdpr-support/)

## 💡 Tips

- Use the **Live View** to debug events in real-time
- Create **Cohorts** to segment users by behavior
- Set up **Alerts** for important metrics
- Use **Retention Reports** to see user engagement over time

## 🆓 Free Tier Limits

- **100,000 events/month** (generous for most apps)
- **1,000 user profiles**
- Unlimited reports and dashboards

If you need more, consider upgrading or switching to PostHog (open source alternative).

