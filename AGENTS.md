# Agent Operations Guide

## Context

- Always refer to `docs/ai/` for context before starting work.
- Project built on Next.js 15 App Router and the OpenNextJS Cloudflare Workers template (`@opennextjs/cloudflare`).
- Package management uses `pnpm` with workspace support (`pnpm-workspace.yaml`).
- UI foundation follows shadcn-inspired components and Tailwind CSS 4 via the `v0` design system. Use Dribbble shots for interaction references when visualizing.

## Core Principles

1. Default to Next.js best practices: server-first data fetching, React Server Components, and colocation within `src/app`.
2. Preserve the OpenNextJS deployment contract: ensure compatibility with Cloudflare Workers (`next.config.ts`, `open-next.config.ts`).
3. Use `pnpm` for all dependency and script operations (`pnpm dev`, `pnpm build`, `pnpm cf:deploy`).
4. Maintain consistent design decisions: reuse tokens/components, reference `components/` and `styles/` before creating new primitives, and align with v0 design language (rounded geometry, micro-interactions, high-contrast neutrals).
5. Validate UX ideas against the existing template navigation (sidebar shell in `src/app/page.tsx`) and gather inspiration from relevant Dribbble case studies.

## Workflow Expectations

- After completing each prompt or task, run `pnpm check` to surface issues immediately.
- Run `pnpm check` before committing changes; fix linting with `pnpm fix` if needed.
- Keep features modular: colocate hooks in `src/hooks`, utilities in `src/utils`, and UI in `src/components/ui`.
- Document AI automation flows in `docs/ai` (see new best practices and file structure guides).
- For design deliverables, capture moodboards or references (Dribbble links) alongside implementation notes.

## Handoff Checklist

- Tests or manual QA notes recorded where applicable.
- Update documentation when touching agent workflows or AI integrations.
- Confirm Cloudflare-specific environment variables are declared in `cloudflare-env.d.ts`.
