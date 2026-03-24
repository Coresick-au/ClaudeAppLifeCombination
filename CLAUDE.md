# Life OS — Claude Development Rules

## Project Overview
Life OS is a personal life operating system for Brad (Brisbane, AU).
It combines a life chronicle RPG, memoir journal, financial tracker, and animated timeline.
Built with Vite + React + TypeScript + TailwindCSS + Firebase.

## Stack
- Vite + React 18 + TypeScript
- TailwindCSS (utility classes + CSS custom properties for themes)
- Firebase: Auth (Google), Firestore, Storage
- Chart.js for financial charts only
- Tone.js for RPG sound effects
- Anthropic API for AI follow-up questions
- HTML5 Canvas for spiral timeline

## Code Style
- Functional components only, no class components
- Named exports for components, default export for pages
- Custom hooks in src/hooks/ for shared logic
- Service functions in src/services/ — never fetch Firestore directly in components
- TypeScript strict mode — no `any` types
- Australian English in UI copy (colour, organisation, licence, etc.)
- Australian date format: dd/mm/yyyy
- Currency: AUD with $ prefix, toLocaleString('en-AU')
- Console.log removal before commit

## File Naming
- Components: PascalCase.tsx (e.g. QuestLog.tsx)
- Hooks: camelCase.ts (e.g. useChronicle.ts)
- Services: kebab-case.service.ts (e.g. chronicle.service.ts)
- Types: kebab-case.types.ts (e.g. chronicle.types.ts)
- Data/config: camelCase.ts (e.g. chapters.ts)

## Component Patterns
- Use React.memo for list items and cards
- useMemo for computed values (especially financial calculations)
- useCallback for event handlers passed to children
- Loading and error states on every async operation
- Skeleton loaders, not spinners

## Theme System
- Three themes: Hearthstone (warm dark), Meadow (light botanical), Dark Gold (financial)
- CSS custom properties defined per theme, applied via data-theme attribute on html element
- Wealth pillar auto-switches to Dark Gold, switches back when leaving
- Theme preference saved to localStorage key 'life-os-theme'

## Firebase Rules
- All user data scoped to authenticated user's UID
- No public reads or writes
- Photos in Storage under users/{uid}/photos/
- Update firestore.rules when adding new collections

## Aphantasia-Aware Content
Brad has aphantasia (cannot form mental images). When writing any UI copy, descriptions, or placeholder text:
- Use concrete sensory details: texture, temperature, smell, taste, physical sensation
- Use Brisbane-calibrated analogies where relevant
- Avoid abstract visual descriptions like "picture this" or "imagine a..."
- External diagrams, charts, and working prototypes are more effective than verbal descriptions

## Don't Do This
- Don't use localStorage for app data — Firestore only (localStorage OK for theme preference)
- Don't use index as React list key — use stable document IDs
- Don't hardcode colours — use CSS custom properties or Tailwind tokens
- Don't leave TODO comments without context
- Don't use alert() or confirm() — use modal components
- Don't skip loading and error states
- Don't import from relative paths with more than 2 levels of ../
- Don't use Supabase — this project uses Firebase
- Don't mix financial data into journal/memoir views
- Don't use American English spelling

## Git
- Conventional commits: feat:, fix:, chore:, refactor:, docs:
- Commit after each meaningful feature
- Never commit: .env, .env.local, node_modules, dist
