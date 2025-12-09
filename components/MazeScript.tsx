"use client";
import Script from 'next/script';

/**
 * Maze usability testing script component
 * 
 * Loads the Maze Universal Snippet to enable:
 * - Live website testing
 * - In-product prompts
 * - User behavior tracking for usability tests
 * 
 * To disable: Set NEXT_PUBLIC_ENABLE_MAZE=false in environment variables
 * Documentation: https://help.maze.co/hc/en-us/articles/9800356063891
 */

export default function MazeScript() {
  // Check if Maze is enabled (default: true for development/staging, can be disabled via env var)
  const isEnabled = process.env.NEXT_PUBLIC_ENABLE_MAZE !== 'false';

  if (!isEnabled) {
    return null;
  }

  return (
    <Script
      id="maze-snippet"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
(function (m, a, z, e) {
  var s, t, u, v;
  try {
    t = m.sessionStorage.getItem('maze-us');
  } catch (err) {}

  if (!t) {
    t = new Date().getTime();
    try {
      m.sessionStorage.setItem('maze-us', t);
    } catch (err) {}
  }

  u = document.currentScript || (function () {
    var w = document.getElementsByTagName('script');
    return w[w.length - 1];
  })();
  v = u && u.nonce;

  s = a.createElement('script');
  s.src = z + '?apiKey=' + e;
  s.async = true;
  if (v) s.setAttribute('nonce', v);
  a.getElementsByTagName('head')[0].appendChild(s);
  m.mazeUniversalSnippetApiKey = e;
})(window, document, 'https://snippet.maze.co/maze-universal-loader.js', 'df0e7fd5-06c7-4485-86f2-942db7d8bf6b');
        `,
      }}
    />
  );
}

