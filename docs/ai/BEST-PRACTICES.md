# AI Implementation Best Practices

## Align With The Template

- Honor the OpenNextJS Cloudflare scaffolding: keep server handlers edge-friendly, avoid Node-only APIs, and review `open-next.config.ts` before shipping new routes.
- Treat `src/app/page.tsx` as the canonical layout reference: reuse the sidebar shell, spacing system, and responsive breakpoints when building new surfaces.
- Prefer colocated server components and route handlers inside `src/app/(group)/route.ts` to match current structure.

## Development Workflow

- Install and run scripts with `pnpm`; never mix in `npm` or `yarn` to protect the lockfile.
  - `pnpm install` for dependencies, `pnpm dev` for local work, `pnpm build` before deployment, and `pnpm cf:deploy` for Cloudflare publishing.
- Keep dependencies minimal; leverage existing `@radix-ui/*` and shadcn components before introducing new UI kits.
- Enforce linting and formatting through `pnpm check` and `pnpm fix`; do not bypass lefthook pre-commit checks.

## Next.js Patterns

- Default to server components; only opt into client components when browser APIs, stateful hooks, or event handlers are required.
- Use `use server` actions for data mutations and keep them colocated with the consuming component for clarity.
- For streaming AI responses, rely on built-in Next.js `app` router capabilities (`ReadableStream`, `Server-Sent Events`) while ensuring compatibility with Cloudflare edge streams.
- Cache aggressively with `revalidateTag` or `revalidatePath` patterns, but avoid long-lived caches for personalized AI content.

## v0-Inspired Design

- Reference the existing `components/ui` primitives; extend them with composition rather than modifying base styles.
- Apply v0 design heuristics: high-contrast grayscale palettes, fluid spacing (`gap-4`, `gap-6`), rounded XL corners, and polished micro-animations via Tailwind CSS 4.
- Moodboard critical flows using Dribbble inspiration; document chosen references in PR descriptions or design notes.
- Validate responsive behavior across breakpoints defined in `tailwind.config` (fallback to default if config-less) before sign-off.

## Testing & QA

- Record AI prompt/response fixtures in `docs/ai/examples` (create when needed) to support regression testing.
- Smoke test Cloudflare Worker deployment via `pnpm cf:preview` for edge-specific bugs.
- Capture manual QA steps whenever features touch the agent handoff in `AGENTS.md`.

## Documentation Expectations

- Update this folder whenever you add new AI flows, decisions, or architecture diagrams.
- Cross-link relevant files: mention updates in `AGENTS.md` and other product docs to keep the knowledge base consistent.
