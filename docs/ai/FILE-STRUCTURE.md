# File Structure Guidelines

## High-Level Map

- `src/app` — Next.js App Router entry points. Keep page segments grouped by feature (e.g., `(marketing)`, `(dashboard)`), and colocate API route handlers alongside the page when the logic is tightly coupled.
- `src/components` — Shared UI. Use `components/app-sidebar.tsx` and `components/ui/*` as references for typography, spacing, and interactions.
- `src/hooks` — Reusable React hooks. Store AI client hooks (`useCompletion`, `useChat`) here and guard browser-only logic behind dynamic imports when necessary.
- `src/utils` — Pure helpers (formatting, parsing, prompt assembly). Avoid side effects; favor TypeScript modules that work in both Node and edge runtimes.
- `public/` — Static assets. Organize inspiration captures or Dribbble moodboards under `public/design/` with date-based folders if included in the repo.

## AI-Specific Placement

- AI agent prompts, system definitions, and workflow schemas live in `docs/ai/prompts/` (create folder when needed) to separate them from runtime code but keep them versioned.
- Streaming adapters or provider SDK wrappers belong in `src/utils/ai/` to reinforce modular separation.
- UI-specific AI components (chat panels, status toasts) should extend existing `components/ui` primitives to maintain v0 consistency.

## Naming & Consistency Rules

- Use kebab-case for Markdown files (`best-practices.md`) except when mirroring established conventions; React/TypeScript files remain PascalCase or camelCase per Next.js norms.
- Include index signatures only when needed; prefer explicit exports to aid tree-shaking with OpenNextJS bundling.
- Maintain barrel files sparingly—only at stable boundaries like `components/ui/index.ts` to prevent circular imports.

## Environment and Deployment Notes

- Store environment types in `cloudflare-env.d.ts` and mirror required variables in Worker dashboards.
- Any new edge middleware goes to `src/middleware.ts`; ensure compatibility with OpenNextJS Cloudflare adapters prior to deployment.
- Verify `pnpm cf:build` succeeds locally before merging structural changes.

## Documentation Cross-References

- Document modifications impacting agent behavior in `AGENTS.md`.
- When adding net-new directories or changing architecture, append rationale and diagram links in `docs/ai/BEST-PRACTICES.md` to keep the knowledge loop tight.
