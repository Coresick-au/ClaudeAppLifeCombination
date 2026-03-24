/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Event category colours
        'cat-career': '#3b82f6',
        'cat-family': '#f59e0b',
        'cat-home': '#10b981',
        'cat-education': '#a855f7',
        'cat-travel': '#eab308',
        'cat-health': '#06b6d4',
        'cat-milestone': '#f43f5e',
        'cat-relationships': '#ec4899',
        'cat-thoughts': '#8b5cf6',
        // Theme-aware custom properties
        surface: 'var(--color-surface)',
        'surface-alt': 'var(--color-surface-alt)',
        'surface-card': 'var(--color-surface-card)',
        accent: 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        border: 'var(--color-border)',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['DM Sans', 'sans-serif'],
        rpg: ['"Press Start 2P"', 'monospace'],
        serif: ['Crimson Pro', 'serif'],
      },
    },
  },
  plugins: [],
};
