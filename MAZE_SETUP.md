# Maze Usability Testing Setup

This app is configured with Maze for usability testing, allowing you to run:
- **Live website tests**: Test your live production website with real users
- **In-product prompts**: Show surveys and questions to users while they use the app
- **User behavior tracking**: Record and analyze how users interact with your app

## How It Works

The Maze Universal Snippet is automatically loaded on all pages via the `MazeScript` component in the root layout.

**API Key**: `df0e7fd5-06c7-4485-86f2-942db7d8bf6b`

## Configuration

### Enabling/Disabling Maze

**By default**, Maze is enabled on all environments.

To **disable** Maze (e.g., in production if you only want it in staging):

1. Add to your `.env.local` or environment variables:
   ```bash
   NEXT_PUBLIC_ENABLE_MAZE=false
   ```

2. Maze will not load when this is set to `false`

### Testing Maze Integration

1. **Start your dev server**:
   ```bash
   npm run dev
   ```

2. **Open your browser** to http://localhost:3000

3. **Open DevTools Console** and check for Maze initialization:
   - You should see the Maze script loaded in the Network tab
   - `window.mazeUniversalSnippetApiKey` should be set

4. **Create a test in Maze dashboard**:
   - Go to your Maze account
   - Create a new "Live Website Test"
   - Set the URL to your testing environment
   - The test will appear on your website when conditions are met

## Creating Tests in Maze

1. Log in to [Maze](https://maze.co)
2. Click "Create" → "Live Website Test" or "In-Product Prompt"
3. Configure your test:
   - **Targeting**: Choose which pages/users see the test
   - **Trigger**: When to show the test (on page load, after time, on click, etc.)
   - **Questions**: Add your usability questions
4. Launch the test
5. Users visiting your website will see the test based on your targeting rules

## Security & Performance

- ✅ Script loads **asynchronously** (non-blocking)
- ✅ Uses `afterInteractive` strategy (loads after page is interactive)
- ✅ Session storage tracks unique users
- ✅ No impact on page load performance
- ✅ Can be disabled via environment variable

## Environments

| Environment | Maze Status | How to Control |
|-------------|-------------|----------------|
| Development | Enabled | Set `NEXT_PUBLIC_ENABLE_MAZE=false` to disable |
| Staging | Enabled | Set `NEXT_PUBLIC_ENABLE_MAZE=false` to disable |
| Production | Enabled | Set `NEXT_PUBLIC_ENABLE_MAZE=false` to disable |

## Resources

- [Maze Documentation](https://help.maze.co/hc/en-us/articles/9800356063891-Installing-the-Maze-snippet-on-your-website)
- [Creating Live Website Tests](https://help.maze.co/)
- [Maze Dashboard](https://maze.co/dashboard)

## Files Modified

- `components/MazeScript.tsx` - Maze snippet component
- `app/layout.tsx` - Added MazeScript to root layout

## Support

For issues with Maze integration, check:
1. Browser console for errors
2. Network tab to verify script is loading
3. Maze dashboard to verify your account and API key

