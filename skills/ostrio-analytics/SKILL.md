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
npx skills add ostr-io/ostrio-analytics -g --skill ostrio-analytics
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
- `ignoredPaths` / `ignorePath(s)` apply to pageviews only; `pushEvent` and automatic error reports are not filtered by path ignores.
