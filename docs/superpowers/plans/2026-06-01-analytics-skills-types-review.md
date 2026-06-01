# Analytics Skills Types Review Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add portable AI skill support, fix TypeScript/CommonJS usability gaps, update compact docs, verify package contents, and complete focused package review.

**Architecture:** Keep existing browser tracker API intact. Add small verification fixtures around built package outputs, then make minimal source/build/docs/package changes needed to satisfy those fixtures and review criteria.

**Tech Stack:** TypeScript 5.9, Rollup 4, Mocha, Node.js, Meteor package metadata, `npx skills` portable skill layout.

---

## File Structure

- Create `skills/ostrio-analytics/SKILL.md`: compact portable AI skill installable by `npx skills add`.
- Create `docs/analytics-comparison.md`: deeper comparison and tradeoffs outside README.
- Modify `README.md`: skill install example, import examples, compact ostr.io positioning.
- Modify `docs/meteorjs.md`: typo fixes and TypeScript-friendly Meteor examples.
- Modify `src/index.ts`: type transport string literals correctly and restore `window.onerror` on `destroy()`.
- Modify `rollup.config.mjs`: make CommonJS default require return constructor while retaining named exports.
- Modify `test/analytics.spec.ts`: regression test for `destroy()` restoring `window.onerror`.
- Create `test/exports/esm.mjs` and `test/exports/cjs.cjs`: built export shape checks.
- Create `test/types/*.ts` and `test/types/tsconfig.*.json`: Node, Bun-style bundler, and Meteor NPM type fixtures.
- Modify `package.json`: add `test:exports`, `test:types`, publish `docs/*.md` and `skills`.
- Modify `.npmignore`, `.meteorignore`, `.gitignore` only for meaningful package/platform exclusions.

---

### Task 1: Add Export And Type Verification Fixtures

**Files:**
- Create: `test/exports/esm.mjs`
- Create: `test/exports/cjs.cjs`
- Create: `test/types/node-esm.ts`
- Create: `test/types/bun-bundler.ts`
- Create: `test/types/meteor-npm.ts`
- Create: `test/types/tsconfig.node.json`
- Create: `test/types/tsconfig.bun.json`
- Create: `test/types/tsconfig.meteor.json`
- Modify: `package.json`

- [ ] **Step 1: Add ESM export fixture**

Create `test/exports/esm.mjs`:

```js
import assert from 'node:assert/strict';
import Analytics, { OstrioWebAnalytics, SUPPORTED_TRANSPORTS, Transport } from '../../dist/index.js';

assert.equal(typeof Analytics, 'function');
assert.equal(Analytics, OstrioWebAnalytics);
assert.equal(Transport.Fetch, 'fetch');
assert.equal(Transport.Beacon, 'beacon');
assert.equal(Transport.Img, 'img');
assert.deepEqual(SUPPORTED_TRANSPORTS, [Transport.Fetch, Transport.Beacon, Transport.Img]);
```

- [ ] **Step 2: Add CommonJS export fixture**

Create `test/exports/cjs.cjs`:

```js
const assert = require('node:assert/strict');
const Analytics = require('../../dist/index.cjs');

assert.equal(typeof Analytics, 'function');
assert.equal(Analytics.default, Analytics);
assert.equal(Analytics.OstrioWebAnalytics, Analytics);
assert.equal(Analytics.Transport.Fetch, 'fetch');
assert.equal(Analytics.Transport.Beacon, 'beacon');
assert.equal(Analytics.Transport.Img, 'img');
assert.deepEqual(Analytics.SUPPORTED_TRANSPORTS, [Analytics.Transport.Fetch, Analytics.Transport.Beacon, Analytics.Transport.Img]);
```

- [ ] **Step 3: Add Node ESM TypeScript fixture**

Create `test/types/node-esm.ts`:

```ts
import Analytics, {
  OstrioWebAnalytics,
  SUPPORTED_TRANSPORTS,
  Transport,
  type OstrioWebAnalyticsConfig,
  type OstrioWebAnalyticsDynamicConfig,
  type OstrioWebAnalyticsTransport
} from 'ostrio-analytics';

const config: OstrioWebAnalyticsConfig = {
  auto: false,
  trackErrors: false,
  trackHash: false,
  trackQuery: true,
  ignoredQueries: ['utm_source', 'gclid'],
  ignoredPaths: ['/admin/*', /^\/api\//],
  transport: 'img'
};

const dynamic: OstrioWebAnalyticsDynamicConfig = {
  trackHash: true,
  trackQuery: false,
  transport: 'beacon',
  serviceUrl: 'https://analytics.example.test'
};

const tracker: OstrioWebAnalytics = new Analytics('fffffffffffffffff', config);
tracker.applySettings(dynamic);
tracker.setTransport(Transport.Fetch);
tracker.setTransport('beacon');
tracker.ignorePath('/private/*');
tracker.ignorePaths(['/billing/', /^\/internal\//]);
tracker.ignoreQuery('fbclid');
tracker.ignoreQueries(['utm_medium']);
tracker.onTrack(() => undefined);
tracker.onPushEvent((key: string, value: number | string) => {
  void key;
  void value;
});
tracker.pushEvent('signup', 1);
const sent: boolean = tracker.track();
const transport: OstrioWebAnalyticsTransport = 'fetch';
const transports: readonly Transport[] = SUPPORTED_TRANSPORTS;

void sent;
void transport;
void transports;
tracker.destroy();
```

- [ ] **Step 4: Add Bun-style bundler TypeScript fixture**

Create `test/types/bun-bundler.ts`:

```ts
import Analytics, { Transport, type OstrioWebAnalyticsConfig } from 'ostrio-analytics';

const config = {
  auto: false,
  transport: 'fetch'
} satisfies OstrioWebAnalyticsConfig;

const tracker = new Analytics('fffffffffffffffff', config);
tracker.setTransport('img');
tracker.setTransport(Transport.Beacon);
tracker.destroy();
```

- [ ] **Step 5: Add Meteor NPM TypeScript fixture**

Create `test/types/meteor-npm.ts`:

```ts
import Analytics, { type OstrioWebAnalyticsConfig } from 'ostrio-analytics';

const config: OstrioWebAnalyticsConfig = {
  auto: false,
  trackErrors: true,
  ignoredPaths: ['/admin/*'],
  ignoredQueries: ['utm_source'],
  transport: 'beacon'
};

const analyticsTracker = new Analytics('fffffffffffffffff', config);
analyticsTracker.pushEvent('meteor', 'client');
analyticsTracker.destroy();
```

- [ ] **Step 6: Add Node ESM tsconfig**

Create `test/types/tsconfig.node.json`:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "noEmit": true,
    "types": []
  },
  "include": ["./node-esm.ts"]
}
```

- [ ] **Step 7: Add Bun-style bundler tsconfig**

Create `test/types/tsconfig.bun.json`:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "noEmit": true,
    "types": []
  },
  "include": ["./bun-bundler.ts"]
}
```

- [ ] **Step 8: Add Meteor NPM tsconfig**

Create `test/types/tsconfig.meteor.json`:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "noEmit": true,
    "types": []
  },
  "include": ["./meteor-npm.ts"]
}
```

- [ ] **Step 9: Add package scripts**

In `package.json`, add scripts after `test`:

```json
"test:exports": "node test/exports/esm.mjs && node test/exports/cjs.cjs",
"test:types": "tsc -p test/types/tsconfig.node.json && tsc -p test/types/tsconfig.bun.json && tsc -p test/types/tsconfig.meteor.json",
```

- [ ] **Step 10: Run fixtures to verify current failures**

Run:

```bash
npm run build
npm run test:exports
npm run test:types
```

Expected before fixes:

- `npm run test:exports` fails because `require('../../dist/index.cjs')` returns an object instead of a constructor.
- `npm run test:types` fails because string transports like `'img'` and `'beacon'` are not assignable to `Transport`.

- [ ] **Step 11: Commit verification fixtures**

```bash
git add package.json test/exports test/types
git commit -m "test: verify package exports and types"
```

---

### Task 2: Fix Type Surface, CommonJS Shape, And Error Cleanup

**Files:**
- Modify: `src/index.ts`
- Modify: `rollup.config.mjs`
- Modify: `test/analytics.spec.ts`

- [ ] **Step 1: Add failing `window.onerror` cleanup test**

In `test/analytics.spec.ts`, add this test before `describe('transports — calls underlying implementation', () => {`:

```ts
  it('destroy() restores window.onerror installed by trackErrors', () => {
    const previous = (() => undefined) as OnErrorEventHandler;
    window.onerror = previous;

    const a = new (Analytics as any)(VALID_ID, { auto: false, trackErrors: true });
    expect(window.onerror).to.not.equal(previous);

    a.destroy();
    expect(window.onerror).to.equal(previous);
  });
```

- [ ] **Step 2: Run focused test to verify failure**

Run:

```bash
npm test -- --grep "destroy\\(\\) restores window.onerror"
```

Expected: FAIL because `destroy()` does not restore `window.onerror`.

- [ ] **Step 3: Add public transport literal type**

In `src/index.ts`, after `SUPPORTED_TRANSPORTS`, add:

```ts
export type OstrioWebAnalyticsTransport = Transport | `${Transport}`;
```

Update config interfaces:

```ts
export interface OstrioWebAnalyticsDynamicConfig {
  trackHash?: boolean;
  trackQuery?: boolean;
  transport?: OstrioWebAnalyticsTransport;
  serviceUrl?: string;
}
```

Update `setTransport`:

```ts
  public setTransport(t: OstrioWebAnalyticsTransport): void {
    const transport = t as Transport;
    if (SUPPORTED_TRANSPORTS.includes(transport)) {
      if (transport === Transport.Fetch && typeof fetch !== 'function') {
        this.transport = Transport.Img;
      } else {
        this.transport = transport;
      }
    }
  }
```

- [ ] **Step 4: Restore `window.onerror` on destroy**

In `src/index.ts`, replace handler assignment in `initGlobalErrors()` with this structure:

```ts
    const handler = ((msg: Event | string, url: string, line: number, column: number, error: Error): void => {
      const m = String(msg || DEFAULTS.globalError.msg);
      const u = String(url || DEFAULTS.globalError.url);
      const ln = String(line || DEFAULTS.globalError.line);
      const col = String(column || DEFAULTS.globalError.column);

      if (u.includes(this.loc.origin)) {
        this.pushEvent(EventName.GlobalError, `Error: ${m}. File: ${u.replace(this.loc.origin, '')} at ${this.loc.href}:${ln}:${col}`);
      }

      if (typeof prev === 'function') {
        prev.call(window, msg, url, line, column, error);
      }
    }) as OnErrorEventHandlerNonNull;

    window.onerror = handler;
    this.eventRemovers.push((): void => {
      if (window.onerror === handler) {
        window.onerror = prev;
      }
    });
```

- [ ] **Step 5: Add CommonJS compatibility footer**

In `rollup.config.mjs`, after `banner`, add:

```js
const cjsCompatFooter = 'module.exports = Object.assign(exports.default, exports);';
```

Update the CommonJS output object:

```js
  output: { file: 'dist/index.cjs', format: 'cjs', exports: 'named', sourcemap: true, banner, footer: cjsCompatFooter },
```

- [ ] **Step 6: Run focused runtime tests**

Run:

```bash
npm test -- --grep "destroy\\(\\) restores window.onerror|transports"
```

Expected: PASS for cleanup and transport tests.

- [ ] **Step 7: Rebuild and verify exports/types**

Run:

```bash
npm run build
npm run test:exports
npm run test:types
```

Expected:

- `test:exports` passes for ESM and CommonJS.
- `test:types` passes for Node ESM, Bun-style bundler, and Meteor NPM fixtures.

- [ ] **Step 8: Commit compatibility fixes**

```bash
git add src/index.ts rollup.config.mjs test/analytics.spec.ts dist package-lock.json package.json test/exports test/types
git commit -m "fix: align tracker exports and types"
```

---

### Task 3: Add Portable AI Skill And Compact Documentation

**Files:**
- Create: `skills/ostrio-analytics/SKILL.md`
- Create: `docs/analytics-comparison.md`
- Modify: `README.md`
- Modify: `docs/meteorjs.md`

- [ ] **Step 1: Add portable skill**

Create `skills/ostrio-analytics/SKILL.md`:

```markdown
---
name: ostrio-analytics
description: Use when adding, configuring, or reviewing ostr.io web analytics in browser, SPA, Bun.js, Node.js, or Meteor.js projects.
---

# ostrio-analytics

Lightweight browser analytics tracker for ostr.io. Client-side only.

## Install

```bash
npm install ostrio-analytics --save
```

AI skill:

```bash
npx skills add veliovgroup/ostrio-analytics -g --skill ostrio-analytics
```

Meteor:

```bash
meteor add ostrio:analytics
```

## Use

```ts
import Analytics, { Transport, type OstrioWebAnalyticsConfig } from 'ostrio-analytics';

const config: OstrioWebAnalyticsConfig = {
  auto: true,
  trackErrors: true,
  transport: Transport.Fetch,
  ignoredQueries: ['utm_source', 'gclid'],
  ignoredPaths: ['/admin/*']
};

const analyticsTracker = new Analytics('{{trackingId}}', config);
```

## Events

```ts
analyticsTracker.pushEvent('signup', 'header');
analyticsTracker.onPushEvent((key, value) => console.log({ key, value }));
analyticsTracker.onTrack(() => console.log('pageview'));
```

## Manual Routing

```ts
const analyticsTracker = new Analytics('{{trackingId}}', { auto: false });
analyticsTracker.track();
```

## Teardown

```ts
analyticsTracker.destroy();
```

## Notes

- Browser globals required for tracker instances: `window`, `document`, `location`.
- Node.js and Bun.js projects should import this from browser/client code.
- Meteor Atmosphere import: `import Analytics from 'meteor/ostrio:analytics';`.
- NPM import for Meteor, Node.js, Bun.js, Vite, Next.js, Nuxt, SvelteKit: `import Analytics from 'ostrio-analytics';`.
- Use `transport: 'img'` for widest browser fallback, `transport: 'beacon'` for unload/background sends, `transport: 'fetch'` by default.
```

- [ ] **Step 2: Add comparison doc**

Create `docs/analytics-comparison.md`:

```markdown
# ostr.io Analytics Compared With Other Web Analytics

ostr.io analytics fits projects that need hosted, real-time web analytics with a small browser tracker and privacy-forward defaults.

## Where ostr.io Fits

- Hosted analytics backend; no self-hosted database to operate.
- Open client tracker code.
- Small client footprint: no dependency chain, no DOM mutation, no heavy script network.
- SPA-friendly tracking: History API, hash changes, polling fallback, manual `.track()`.
- Custom events and global runtime error reporting included.
- End-user opt-out flow available at `https://analytics.ostr.io/settings/manage/opt-out/`.

## Tradeoffs

- Use a product analytics suite when you need funnels, cohorts, warehouses, or feature flags.
- Use server-side analytics when browser-side tracking is not acceptable.
- Use self-hosted analytics when data residency or backend control is primary requirement.
- Use raw logs when you need infrastructure-level request accounting.

## Practical Rule

Choose ostr.io analytics when you want lightweight hosted website analytics without ad-tech complexity. Choose heavier platforms only when their analysis model or data ownership requirements justify their client/runtime cost.
```

- [ ] **Step 3: Update README table of contents**

In `README.md`, add:

```markdown
- [AI Skill](#ai-skill)
```

under Installation entries, and add:

```markdown
- [Why ostr.io vs other analytics services?](#why-ostrio-vs-other-analytics-services)
```

under Why section entry.

- [ ] **Step 4: Add compact comparison section to README**

After existing `## Why ostr.io analytics?` bullet list, add:

```markdown
### Why ostr.io vs other analytics services?

ostr.io uses an open, small browser tracker with a hosted analytics backend. It avoids heavy third-party script chains, DOM mutation, and ad-tech complexity while keeping SPA navigation, custom events, runtime errors, and opt-out support built in.

Use ostr.io when you need lightweight hosted website analytics with privacy-forward defaults. Use heavier product analytics suites only when funnels, cohorts, warehouses, or feature-flag workflows justify their runtime and operational cost.

See [analytics comparison](docs/analytics-comparison.md) for tradeoffs.
```

- [ ] **Step 5: Add AI skill install section to README**

After NPM installation section or before Minified version, add:

```markdown
### AI Skill

Install portable AI skill globally:

```bash
npx skills add veliovgroup/ostrio-analytics -g --skill ostrio-analytics
```

Use it when adding or reviewing ostr.io analytics integrations in Node.js, Bun.js, Meteor.js, or browser SPA projects.
```

- [ ] **Step 6: Fix README NPM examples**

Replace current NPM import block with:

```markdown
Then `import` or `require()`:

```js
// TypeScript / ESM
import Analytics, { Transport } from 'ostrio-analytics';
const analyticsTracker = new Analytics('{{trackingId}}', { transport: Transport.Fetch });

// CommonJS
const Analytics = require('ostrio-analytics');
const analyticsTrackerCjs = new Analytics('{{trackingId}}');
```
```

- [ ] **Step 7: Update README all-methods import**

Replace:

```ts
import Analytics from "ostrio-analytics/source";
```

with:

```ts
import Analytics, { Transport } from 'ostrio-analytics';
```

- [ ] **Step 8: Fix Meteor docs typo and add TS example**

In `docs/meteorjs.md`, replace `packeage` with `package`, and add after Meteor/NPM import:

```markdown
### TypeScript

```ts
import Analytics, { type OstrioWebAnalyticsConfig } from 'ostrio-analytics';

const config: OstrioWebAnalyticsConfig = {
  auto: true,
  trackErrors: true,
  transport: 'fetch'
};

const analyticsTracker = new Analytics('trackingId', config);
```
```

- [ ] **Step 9: Commit docs and skill**

```bash
git add README.md docs/analytics-comparison.md docs/meteorjs.md skills/ostrio-analytics/SKILL.md
git commit -m "docs: add analytics skill and comparison"
```

---

### Task 4: Tighten Package And Platform Ignore Rules

**Files:**
- Modify: `package.json`
- Modify: `.npmignore`
- Modify: `.meteorignore`
- Modify: `.gitignore`

- [ ] **Step 1: Publish docs and skill intentionally**

In `package.json`, update `files` to:

```json
"files": [
  "dist",
  "src",
  "docs/*.md",
  "skills",
  "README.md",
  "LICENSE",
  "package.json"
],
```

- [ ] **Step 2: Update `.npmignore` for generated/planning files**

Ensure `.npmignore` contains:

```gitignore
*.md
.DS_Store
.eslintcache
.eslintrc
.github
.meteor
.meteorignore
.npm
.versions
docs/superpowers
test
node_modules
npm-debug.log*
package.js
eslint.config.mjs
rollup.config.mjs
tsconfig.json
tsconfig.test.json
tsconfig.types.json
```

- [ ] **Step 3: Update `.meteorignore` for NPM-only assets**

Ensure `.meteorignore` contains:

```gitignore
.github
.gitignore
.npmignore
.npm
.DS_Store
.eslintcache
.eslintrc
docs
dist
skills
test
eslint.config.mjs
rollup.config.mjs
node_modules
CHANGELOG.md
CODE_OF_CONDUCT.md
CONTRIBUTING.md
HISTORY.md
LICENCE
LICENSE
README.md
package.json
package-lock.json
tsconfig.json
tsconfig.test.json
tsconfig.types.json
```

- [ ] **Step 4: Update `.gitignore` for local noise only**

Ensure `.gitignore` contains:

```gitignore
.DS_Store
.npm
node_modules
coverage
npm-debug.log*
*.tsbuildinfo
```

- [ ] **Step 5: Commit package filters**

```bash
git add package.json .npmignore .meteorignore .gitignore
git commit -m "chore: tighten package filters"
```

---

### Task 5: Run Full Verification And Publish Dry Run

**Files:**
- Read: generated `dist/*`
- Read: `package.json`
- Read: `README.md`

- [ ] **Step 1: Build**

Run:

```bash
npm run build
```

Expected: exits `0`; `dist/index.js`, `dist/index.cjs`, `dist/index.d.ts`, UMD files regenerated.

- [ ] **Step 2: Runtime tests**

Run:

```bash
npm test
```

Expected: exits `0`; all Mocha tests pass.

- [ ] **Step 3: Export checks**

Run:

```bash
npm run test:exports
```

Expected: exits `0`; ESM and CJS checks pass.

- [ ] **Step 4: Type checks**

Run:

```bash
npm run test:types
```

Expected: exits `0`; Node, Bun-style bundler, and Meteor NPM fixtures compile.

- [ ] **Step 5: Meteor package check**

Run:

```bash
meteor --version
meteor test-packages ./ --driver-package=meteortesting:mocha --once
```

Expected if Meteor tooling is available: exits `0`. If blocked by missing package download, network, or unsupported local Meteor setup, capture exact error and include it in final risks.

- [ ] **Step 6: Publish dry run**

Run:

```bash
npm pack --dry-run --json
```

Expected package contents include:

- `dist/index.cjs`
- `dist/index.d.ts`
- `dist/index.js`
- `dist/ostrio-analytics.min.js`
- `dist/ostrio-analytics.umd.js`
- `src/index.ts`
- `src/umd.ts`
- `docs/analytics-comparison.md`
- `docs/meteorjs.md`
- `skills/ostrio-analytics/SKILL.md`
- `README.md`
- `LICENSE`
- `package.json`

Expected package contents exclude:

- `docs/superpowers/*`
- `test/*`
- `.github/*`
- `node_modules/*`
- `eslint.config.mjs`
- `rollup.config.mjs`
- `tsconfig*.json`

- [ ] **Step 7: Review generated diff**

Run:

```bash
git status --short
git diff --stat
git diff -- package.json src/index.ts rollup.config.mjs README.md docs/meteorjs.md .npmignore .meteorignore .gitignore
```

Expected: only planned files changed.

- [ ] **Step 8: Commit generated build output if changed**

```bash
git add dist package-lock.json package.json
git commit -m "build: refresh package artifacts"
```

Skip commit if `git status --short` shows no generated build changes.

---

### Task 6: Focused Package Review

**Files:**
- Read: `src/index.ts`
- Read: `package.json`
- Read: `package.js`
- Read: `README.md`
- Read: `docs/*.md`
- Read: `.gitignore`, `.npmignore`, `.meteorignore`
- Read: `npm pack --dry-run --json` output

- [ ] **Step 1: Review runtime behavior**

Check:

- `track()` returns `false` for ignored paths and duplicate pending URL sends.
- `send()` never sends duplicate pageview for unchanged URL.
- Transport fallback order matches docs: fetch default, beacon when requested and available, image fallback for missing fetch.
- `destroy()` removes listeners, interval, and installed `window.onerror` handler.
- `pushEvent()` truncates keys and values per documented limits.

- [ ] **Step 2: Review TypeScript declarations**

Check `dist/index.d.ts` includes:

```ts
export declare enum Transport
export type OstrioWebAnalyticsTransport
export interface OstrioWebAnalyticsDynamicConfig
export interface OstrioWebAnalyticsConfig
export declare class OstrioWebAnalytics
export default OstrioWebAnalytics
```

- [ ] **Step 3: Review package exports**

Check `package.json` keeps:

```json
"main": "./dist/index.cjs",
"module": "./dist/index.js",
"types": "./dist/index.d.ts",
"exports": {
  ".": {
    "types": "./dist/index.d.ts",
    "import": "./dist/index.js",
    "require": "./dist/index.cjs",
    "default": "./dist/index.js"
  }
}
```

- [ ] **Step 4: Review docs compactness**

Check README:

- Shows root TypeScript import, not `ostrio-analytics/source`.
- Shows direct CommonJS require only after CJS build passes.
- Includes AI skill install with `-g`.
- Keeps detailed comparison in `docs/analytics-comparison.md`.
- Does not duplicate long third-party platform notes in README.

- [ ] **Step 5: Review package footprint**

From dry-run JSON, record package size, unpacked size, and file count. Flag only material bloat: tests, tooling config, node_modules, `.github`, or `docs/superpowers`.

- [ ] **Step 6: Produce final verdict**

Final response must include:

1. Summary verdict: pass, pass with issues, or fail.
2. Critical issues.
3. Recommended improvements: high-impact only.
4. Documentation gaps.
5. Packaging and publishing checklist.
6. Exact changes made, with rationale.
7. Remaining risks or assumptions.

- [ ] **Step 7: Commit final review notes if a file was created**

No review file is required. If implementation creates `docs/review.md`, commit it:

```bash
git add docs/review.md
git commit -m "docs: add package review notes"
```

Otherwise skip.

---

## Self-Review

- Spec coverage: tasks cover skill, docs, TypeScript declarations, Node/Bun/Meteor type scenarios, runtime export checks, publish dry run, dotfiles, and final review output.
- Placeholder scan: no TBD/TODO/fill-later placeholders.
- Type consistency: `OstrioWebAnalyticsTransport`, `OstrioWebAnalyticsConfig`, and `OstrioWebAnalyticsDynamicConfig` names match source and fixtures.
- Scope check: focused single package update; no public API redesign or style-only refactor.
