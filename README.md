# Language Memo - Spaced Repetition Flashcard App

A modern, intelligent flashcard application for language learning using the FSRS (Free Spaced Repetition Scheduler) algorithm. Learn vocabulary effectively with AI-powered card generation and multi-language support.

## ✨ Features

- 📚 **Spaced Repetition Learning**: Uses the advanced FSRS algorithm for optimal retention
- 🤖 **AI Card Generation**: Generate vocabulary cards automatically with OpenAI (optional)
- 🌍 **Multi-Language Support**: Learn any language with automatic translation
- 📊 **Progress Tracking**: Visual heatmaps and study statistics
- 💾 **Offline-First**: All data stored locally in IndexedDB
- 🎨 **Modern UI**: Beautiful, responsive interface built with Next.js 15 and Tailwind CSS

## 🚀 Quick Deploy

📚 **New to deployment? See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for a complete step-by-step guide!**

Deploy your own instance with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ValentinaButenko/repeat&env=OPENAI_API_KEY&envDescription=Optional%20API%20keys%20for%20enhanced%20features&envLink=https://github.com/ValentinaButenko/repeat#environment-variables&project-name=language-memo&repository-name=language-memo)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/ValentinaButenko/repeat)

## 🛠️ Environment Variables

The app works out-of-the-box without any API keys, using free translation services. For enhanced features and access control, you can optionally configure:

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for AI card generation and translation | No |
| `OPENAI_BASE_URL` | Custom OpenAI-compatible API endpoint | No |
| `OPENAI_MODEL` | Model for card generation (default: `gpt-4o-mini`) | No |
| `OPENAI_TRANSLATE_MODEL` | Model for translation (default: `gpt-4o-mini`) | No |
| `DEEPL_API_KEY` | DeepL API key for high-quality translation | No |
| `TRANSLATE_BASE_URL` | Custom LibreTranslate instance URL | No |
| `APP_ACCESS_PASSWORD` | Password to restrict app access (see [ACCESS_CONTROL.md](ACCESS_CONTROL.md)) | No |

**Without API keys**: The app uses free services (LibreTranslate, MyMemory) for translation and manual card creation.

**With API keys**: Get enhanced AI-powered card generation and higher quality translations.

See `.env.example` for a complete reference.

## 💻 Local Development

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ValentinaButenko/repeat.git
cd repeat
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Create a `.env.local` file for API keys:
```bash
cp .env.example .env.local
# Edit .env.local with your API keys (optional)
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

```bash
npm run dev      # Start development server with Turbopack
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run test     # Run tests with Vitest
```

## 📦 Deployment Options

### Deploy with Your Own API Key (For Shared Use)

If you want to deploy the app with your own OpenAI API key so all users can use AI features without needing their own keys:

#### Vercel (Recommended)

1. Push your code to GitHub
2. Visit [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. **Add your OpenAI API key** in Environment Variables:
   - Key: `OPENAI_API_KEY`
   - Value: `sk-...` (your actual API key)
   - 🔒 **This is secure**: The key is stored server-side and never exposed to users' browsers
5. Deploy!

**Your users will:**
- ✅ Be able to generate AI-powered cards
- ✅ Get automatic translations via OpenAI
- ❌ Never see or access your API key
- ❌ Not be able to modify your key

**Cost**: You'll pay for OpenAI API usage from all users. Monitor usage in your [OpenAI dashboard](https://platform.openai.com/usage).

**Security Best Practices:**
- Set usage limits in your OpenAI account to prevent unexpected costs
- Monitor API usage regularly in the OpenAI dashboard
- Consider implementing rate limiting (see [Vercel Rate Limiting](https://vercel.com/docs/security/rate-limiting))
- Set a monthly budget limit on your OpenAI account
- The app already limits card generation to max 200 cards per request

📖 **See [SECURITY.md](SECURITY.md) for detailed security guide and rate limiting setup**

🔐 **Want to restrict who can use your app? See [ACCESS_CONTROL.md](ACCESS_CONTROL.md) for password protection setup** (5 minutes, zero code changes!)

#### Netlify

1. Push your code to GitHub
2. Visit [app.netlify.com/start](https://app.netlify.com/start)
3. Connect your repository
4. Build command: `npm run build`
5. Publish directory: `.next`
6. **Add your OpenAI API key** in Site settings → Environment variables:
   - Key: `OPENAI_API_KEY`
   - Value: `sk-...` (your actual API key)
7. Deploy!

### Deploy Without API Keys (Users Provide Their Own)

Alternatively, deploy without API keys and let users know they can:
- Use the app for free with limited translation services
- Add their own OpenAI API key in settings (if you implement a settings UI)
- Manually create cards without AI generation

### Self-Hosting

Build and serve the app on any Node.js hosting:

```bash
npm run build
npm run start
```

Or use a process manager like PM2:

```bash
npm install -g pm2
npm run build
pm2 start npm --name "language-memo" -- start
```

## 🔧 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Dexie.js (IndexedDB wrapper)
- **Icons**: Phosphor Icons
- **Animation**: Lottie
- **Spaced Repetition**: Custom FSRS implementation
- **Testing**: Vitest + Testing Library

## 📱 Features Breakdown

### Flashcard Sets
- Create and organize cards into sets
- Import/export functionality
- Study mode with progress tracking

### AI Card Generation
- Generate vocabulary based on topics
- Adjustable complexity levels (Beginner/Intermediate/Advanced)
- Streaming generation with real-time updates

### Spaced Repetition
- FSRS algorithm for optimal study intervals
- Four difficulty ratings: Again, Hard, Good, Easy
- Automatic scheduling based on performance

### Progress Tracking
- Study heatmap showing daily activity
- Statistics per set and overall
- Track retention and learning speed

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- FSRS algorithm by [open-spaced-repetition](https://github.com/open-spaced-repetition)
- Next.js team for the amazing framework
- All contributors and users of this app

---

Built with ❤️ for language learners everywhere
