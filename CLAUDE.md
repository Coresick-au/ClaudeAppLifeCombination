# Life OS — Claude Development Rules

## Project Overview
Life OS is a personal life operating system for Brad (Brisbane, AU).
It combines a life chronicle RPG, memoir journal, financial tracker, and animated timeline.
Built with Vite + React + TypeScript + TailwindCSS. All data is stored locally in a single `.lifeos.json` file — no server, no auth, no cloud.

## Stack
- Vite + React 18 + TypeScript
- TailwindCSS (utility classes + CSS custom properties for themes)
- Local file-based persistence (JSON download/upload via DataContext)
- Chart.js for financial charts only
- Tone.js for RPG sound effects
- Anthropic API for AI follow-up questions
- HTML5 Canvas for spiral timeline

## Data Architecture
- All app state lives in a single `LifeOSData` object (defined in `src/types/data.types.ts`)
- `DataContext` (src/services/DataContext.tsx) holds the data in React state and provides domain-specific getters/setters
- Save triggers a browser file download of `.lifeos.json`; load opens a file picker
- The file format includes a `version` field for future migrations — keep it backwards-compatible
- localStorage is used for auto-save drafts (protection against accidental tab closure) and theme/sound preferences
- All persistence goes through DataContext — never read/write files directly from components

## Code Style
- Functional components only, no class components
- Named exports for components, default export for pages
- Custom hooks in src/hooks/ for shared logic
- Service functions in src/services/ — pure helpers that transform data, no side effects
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

## Aphantasia-Aware Content
Brad has aphantasia (cannot form mental images). When writing any UI copy, descriptions, or placeholder text:
- Use concrete sensory details: texture, temperature, smell, taste, physical sensation
- Use Brisbane-calibrated analogies where relevant
- Avoid abstract visual descriptions like "picture this" or "imagine a..."
- External diagrams, charts, and working prototypes are more effective than verbal descriptions

## Don't Do This
- Don't use index as React list key — use stable document IDs
- Don't hardcode colours — use CSS custom properties or Tailwind tokens
- Don't leave TODO comments without context
- Don't use alert() or confirm() — use modal components
- Don't skip loading and error states
- Don't import from relative paths with more than 2 levels of ../
- Don't use Firebase or Supabase — this project uses local file-based persistence
- Don't mix financial data into journal/memoir views
- Don't use American English spelling
- Don't read/write files directly from components — all persistence goes through DataContext
- Don't break the .lifeos.json file format — use the version field for migrations

## Git
- Conventional commits: feat:, fix:, chore:, refactor:, docs:
- Commit after each meaningful feature
- Never commit: .env, .env.local, node_modules, dist
