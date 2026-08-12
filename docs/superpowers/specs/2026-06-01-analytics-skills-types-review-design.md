# ostrio-analytics Skills, Types, Docs, And Review Design

Date: 2026-06-01

## Goal

Add portable AI skill support and complete TypeScript package usability checks for Node.js, Bun.js, and Meteor.js consumers. Then review package quality, exports, docs, ignore files, publish contents, and runtime behavior.

## Scope

- Add one condensed portable skill at `skills/ostrio-analytics/SKILL.md`.
- Document skill installation with `npx skills add ostr-io/ostrio-analytics -g --skill ostrio-analytics`.
- Keep README compact and example-driven.
- Move deeper service-comparison and platform notes into `docs/*.md`.
- Verify and fix TypeScript declarations, exports, and import/require usability.
- Run focused code review and apply only high-impact fixes.

Out of scope:

- Public API redesign.
- Style-only refactors.
- Multiple skills or large skill catalog.
- Backend analytics service changes.

## Approach

Use package-native minimal changes. Keep runtime API intact, add skill files and docs, then adjust package metadata, type declarations, tests, or ignores only when review finds measurable impact on correctness, compatibility, publish footprint, or developer experience.

Rejected approaches:

- Expanded skill catalog: more discoverable, but higher context overhead and against terse skill requirement.
- Full package rework: unnecessary risk unless review finds defects requiring it.

## Package Shape

Skill layout:

```text
skills/
  ostrio-analytics/
    SKILL.md
```

Skill content:

- Install and initialize examples.
- Root TypeScript import.
- Config, events, manual tracking, teardown.
- Short Node.js, Bun.js, and Meteor.js notes.
- No long background or duplicated README content.

README:

- Add AI skill installation section.
- Keep main install examples aligned with actual package exports.
- Prefer root import for TypeScript: `import Analytics, { Transport } from 'ostrio-analytics';`.

Docs:

- Add `docs/analytics-comparison.md`.
- Keep comparison short in README.
- Put tradeoffs, edge cases, and third-party analytics platform notes in docs.

## TypeScript And Runtime Compatibility

Public TypeScript surface must cover:

- Default export: `OstrioWebAnalytics`.
- Named exports: `OstrioWebAnalytics`, `Transport`, `SUPPORTED_TRANSPORTS`.
- Interfaces: `OstrioWebAnalyticsConfig`, `OstrioWebAnalyticsDynamicConfig`.
- Runtime methods already documented in README.

Verification scenarios:

- Node.js ESM import.
- Node.js CommonJS `require`.
- Bun-style TypeScript/bundler resolution.
- Meteor client import from NPM package.
- Meteor Atmosphere import from `meteor/ostrio:analytics` when local Meteor tooling permits.

## Analytics Positioning

README gets compact “Why ostr.io vs other analytics” explanation:

- Open client tracker code with hosted ostr.io backend.
- Privacy-first defaults and opt-out flow.
- Small client footprint: no DOM mutation, no dependency chain, no heavy ad-tech stack.
- SPA-friendly navigation tracking, manual tracking, custom events, and runtime error reporting.
- Best fit: sites wanting lightweight hosted analytics without ad-tech complexity.

Avoid broad superiority claims. Deeper tradeoffs live in `docs/analytics-comparison.md`.

## Error Handling And Review Focus

Review must inspect:

- Transport fallback behavior: fetch, beacon, image.
- Browser global assumptions in package entry points.
- `destroy()` listener/timer cleanup.
- URL normalization, ignored paths, ignored queries, hash/query settings.
- Published package contents and ignored files.
- README examples versus actual exports.
- Type declarations versus runtime API.

Fix only defects or high-impact maintainability, compatibility, performance, package-size, or developer-experience issues.

## Verification Plan

Run:

```bash
npm run build
npm test
npm pack --dry-run --json
```

Also verify exports and declarations with small fixture projects or direct compiler invocations:

- Node ESM import.
- Node CJS require.
- TypeScript Node resolution.
- TypeScript Bundler/Bun-style resolution.
- Meteor import scenario.

Run `meteor test-packages` if Meteor is installed and usable. If blocked, document exact reason.

## Review Output

Final review must include:

1. Summary verdict: pass, pass with issues, or fail.
2. Critical issues.
3. Recommended high-impact improvements.
4. Documentation gaps.
5. Packaging and publishing checklist.
6. Exact changes made with rationale.
7. Remaining risks or assumptions.

Completion requires passing tests/build, verified exports, verified type declarations, published contents dry run, and docs matching behavior.
