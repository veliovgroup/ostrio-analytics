# Web Analytics by [ostr.io](https://ostr.io)

[ostr.io](https://ostr.io) provides lightweight, privacy-respectful, real-time [web analytics](https://ostr.io/info/web-analytics) for modern SPAs and MPAs. The tracker works out-of-the-box with WordPress, WebFlow, React, Next.js, Vue, Nuxt, Svelte, Angular, Meteor/Blaze, Backbone, Ember, and vanilla JS.

## Table of Contents

- [Why ostr.io analytics?](#why-ostrio-analytics)
- [What is tracked](#what-is-tracked)
- [Installation](#installation)
  - [`<script>` tag](#script-tag)
  - [NPM/YARN](#npm)
  - [NPM](#npm)
  - [Meteor.js](https://github.com/veliovgroup/ostrio-analytics/blob/master/docs/meteorjs.md)
- [Usage](#usage)
  - [Constructor: `new Analytics()`](#constructor)
  - [All Methods](#all-methods)
  - [Events via `.pushEvent()`](#track-custom-events)
  - [Manual Tracking via `.track()`](#custom-navigation-tracking)
  - [Event Callbacks via `.onPushEvent()`](#event-callbacks)
  - [Tracking Callbacks via `.onTrack()`](#tracking-callbacks)
  - [Stop tracking via `.destroy()`](#destroy-tracker)
- [Advanced](#advanced)
  - [Transports](#transports)
  - [Ignoring paths](#ignoring-paths)
  - [Ignoring queries / search params](#ignoring-queries--search-params)
  - [Hash & query tracking controls](#hash--query-tracking-controls)
- [Examples](#examples)
  - [Google Analytics integration](#google-analytics-integration)
  - [Google Tag Manager integration](#google-tag-manager-integration)
- [Opt-out for end-users](#opt-out-for-end-users)

## Why ostr.io analytics?

- 👐 Open-source tracking code.
- 📦 Lightweight.
- 🚀 Real-time metrics.
- 😎 No DOM mutations; no heavy CPU tasks; no extra script chains.
- 📡 Uses the [Beacon API](https://developer.mozilla.org/en-US/docs/Web/API/Beacon_API) when available; falls back gracefully.
- 🤝 SPA-friendly: HTML5 History API support out-of-the-box.
- ⚡️ [AMP tracking](https://github.com/veliovgroup/ostrio/blob/master/docs/analytics/track-amp.md).
- 🛑 [AdBlock detection](https://github.com/veliovgroup/ostrio/blob/master/docs/analytics/detect-adblock.md).
- 🔍 Transparent data collection; GDPR/CCPA-aligned controls.
- 🙆 Easy, hosted **opt-out** for your users.
- 🐞 Global runtime error reporting (including `unhandled` *Promise* rejections).

## What is tracked

- **Real-time** users, sessions, unique users.
- **Pageviews**
  - Page title
  - Page URL (sanitized per your config)
- **Demographics**
  - Country
  - City
- **System**
  - Device (mobile/desktop)
  - Browser
  - OS
- **Behavior**
  - Custom events (see `pushEvent`)
  - Referrers
- **Global script errors & exceptions**
  - Error message and source
  - Browser and OS
  - Device data
  - File name and line/column

## Installation

To get your `trackingId`, open the [Analytics](https://ostr.io/service/analytics) section in your ostr.io dashboard, select the domain, then click **Show integration guide**.

---

### Script tag

> [!TIP]
> Easiest way — no build tooling required.
> See "integration guide" in ostr.io analytics panel to copy-paste `<script>` element

```html
<!--
After including script-tag
analytics automatically executes in 'auto' mode,
its instance is available in global scope as `OstrioTracker`
Example: OstrioTracker.pushEvent(foo, bar);
-->
<link rel="preconnect" href="https://analytics.ostr.io/" crossorigin>
<link rel="dns-prefetch" href="https://analytics.ostr.io/">
<script async defer src="https://analytics.ostr.io/{{trackingId}}.js"></script>
```

---

### NPM

Install from NPM or YARN

```bash
npm install ostrio-analytics --save
```

Then `import` or `require()`

```js
// TypeScript
import Analytics from "ostrio-analytics/source";
const analyticsTracker = new Analytics('{{trackingId}}');

// ESM
import Analytics from 'ostrio-analytics';
const analyticsTracker = new Analytics('{{trackingId}}');

// CommonJS
const analyticsClass = require('ostrio-analytics');
const analyticsTracker = new analyticsClass('{{trackingId}}');
```

---

### Minifed version

Copy-paste minified version of the analytics script.

> [!NOTE]
> After adding minified analytics code to a project — it will be available as `OstrioTrackerClass` in the global scope

```js
// Example:
const analyticsTracker = new OstrioTrackerClass('{{trackingId}}');
// Example 2:
const analyticsTracker = new window.OstrioTrackerClass('{{trackingId}}');
```

## Usage

Use one-liner or extend with additional `options` object

---

### Constructor

```ts
new Analytics(trackingId: string, options?: {
  auto?: boolean;            // default: true
  trackErrors?: boolean;     // default: true
  trackHash?: boolean;       // default: true
  trackQuery?: boolean;      // default: true
  ignoredQueries?: string[]; // case-insensitive query keys to drop
  ignoredPaths?: (string|RegExp)[]; // '/path/*' prefix, '/path/' exact, or RegExp
  transport?: 'fetch' | 'beacon' | 'img';  // default: 'fetch'
} as OstrioWebAnalyticsConfig);
```

- `trackingId` {*string*} - [Required] Website' identifier. To obtain `trackingId` go to [Analytics](https://ostr.io/service/analytics) section and select a domain name;
- `options` - {*OstrioWebAnalyticsConfig*} - [Optional]
- `options.auto` - {*boolean*} - Set to `false` to disable automated page navigation tracking
- `options.trackErrors` - {*boolean*} - Set to `false` to disable automated page-level JS errors and exceptions tracking
- `options.trackHash` - {*boolean*} - Set to `false` to disable automated tracking of changes in `#hash` of the page; All reported URLs will have hash omitted
- `options.trackQuery` - {*boolean*} - Set to `false` to disable tracking changes in get query `?get=query`; All reported URLs will have get-query omitted
- `options.ignoredQueries` - {*string[]*} - Array of case-**insensitive** query keys to exclude from analytics tracking
- `options.ignoredPaths` - {*(string|RegExp)[]*} - Array of case-**sensitive** paths and RegExp with URI paths that will be ignored and excluded from web analytics; Use `/*` to define "beginning" or the path; Use to exclude "service" URLs from tracking like `/admin/*`; Examples: `['/path/starts/with/*', '/exact-path/', /^\/category\/[0-9a-zA-Z]{10}\/?$/]`
- `options.transport` - {*'fetch' | 'beacon' | 'img'*} - Set preferred transport; Default: `fetch`

> [!TIP]
> After initializing `new Analytics()` — it's good to go, visitor navigation will be collected and reported in ostr.io analytics. For custom events - see below.*

---

### All Methods

List of all methods and its arguments available on `OstrioWebAnalytics` instance:

```ts
import Analytics from "ostrio-analytics/source";
const analyticsTracker = new Analytics('{{trackingId}}');

// CHANGE SETTINGS DURING RUNTIME
analyticsTracker.applySettings({
  trackHash?: boolean;
  trackQuery?: boolean;
  transport?: Transport;
  serviceUrl?: string;
} as OstrioWebAnalyticsDynamincConfig);

// CHANGE TRANSPORT DURING RUNTIME
analyticsTracker.setTransport(Transport); // [Transport.Fetch, Transport.Beacon, Transport.Img]

// ADD IGNORED PATH DURING RUNTIME
analyticsTracker.ignorePath(path: string | RegExp);

// ADD MULTIPLE IGNORED PATHS DURING RUNBTIME
analyticsTracker.ignorePaths(paths: Array<string | RegExp>);

// ADD IGNORED GET-QUERY DURING RUNTIME
analyticsTracker.ignoreQuery(queryKey: string);

// ADD  MULTIPLEIGNORED GET-QUERIES DURING RUNTIME
analyticsTracker.ignoreQueries(queryKeys: Array<string>);

// ADD HOOK FOR .pushEvent() CALLS
analyticsTracker.onPushEvent(callback: Function);

// ADD HOOK FOR .track() CALLS
analyticsTracker.onTrack(callback: Function);

// TRACK CUSTOM EVENT
analyticsTracker.pushEvent(key: string, value: number | string);

// TRACK PAGEVIEW; USE WITH {auto: false} SETTING
analyticsTracker.track();

// STOP AUTO-TRACKING
analyticsTracker.destroy();
```

---

### Track Custom Events

Use `analyticsTracker.pushEvent(key, value)` method to collect and track custom user's events. Custom events are useful for tracking certain activity on your website, like clicks, form submits and others user's behaviors.

- `key` {*string*} - [Required] The length of the event key must be between 1 and 24 symbols;
- `value` {*string*} - [Required] The length of the event value must be between 1 and 64 symbols.

If the length of `key` or `value` is longer than limits, it will be truncated without throwing an exception.

Examples:

```js
// Various examples on tracking custom user's actions
analyticsTracker.pushEvent('userAction', 'login');
analyticsTracker.pushEvent('userAction', 'logout');
analyticsTracker.pushEvent('userAction', 'signup');

analyticsTracker.pushEvent('click', 'purchase');
analyticsTracker.pushEvent('click', 'purchase-left');
analyticsTracker.pushEvent('click', 'pricing - more info');
```

```html
<script type="text/javascript">
  // make analyticsTracker global variable
  window.analyticsTracker = analyticsTracker;
</script>

<form>
  <h2>Buy Now</h2>
  <select>
    <option disabled>Select product</option>
    <option>Blue</option>
    <option>Red</option>
    <option>Green</option>
  </select>
  <input name="qty" />
  <!-- Example on tracking form submit -->
  <button type="submit" onClick="analyticsTracker.pushEvent('checkout', 'buy-now-form')">Checkout</button>
</form>
```

In a similar way using `.pushEvent` you can detect and track [AdBlock usage](https://github.com/veliovgroup/ostrio/blob/master/docs/analytics/detect-adblock.md) and [Accelerated Mobile Pages (AMP)](https://github.com/veliovgroup/ostrio/blob/master/docs/analytics/track-amp.md).

---

### Custom Navigation Tracking

Manually dispatch a pageview.

> [!TIP]
> Use `.track()` method with `{auto: false}` to manually and precisely control navigation's events and send tracking info. This method has no arguments.

Examples:

```js
/* jQuery or any other similar case: */
$(document).ready(() => {
  analyticsTracker.track();
});

/* JS-router definition (pseudo-code!) */
router({
  '/'() {
    analyticsTracker.track();
  },
  '/two'() {
    analyticsTracker.track();
  },
  '/three'() {
    analyticsTracker.track();
  }
});

/* Although "History.js" and "History API" supported out-of-box,
you may want to optimize tracking behavior to meet your needs. */
History.Adapter.bind(window, 'statechange', () => {
  analyticsTracker.track();
});
```

---

### Event Callbacks

Use `.onPushEvent()` to hook into [`.pushEvent()` method](https://github.com/veliovgroup/ostrio-analytics#track-custom-events). Read how to use this method for deep [Google Analytics integration](https://github.com/veliovgroup/ostrio-analytics#google-analytics-integration).

Examples:

```js
analyticsTracker.onPushEvent((key, value) => {
  console.log({ key, value }); // { key: 'testKey', value: 'testValue' }
});

analyticsTracker.pushEvent('testKey', 'testValue');
```

---

### Tracking Callbacks

Use `.onTrack()` to hook into [`.track()` method](https://github.com/veliovgroup/ostrio-analytics#custom-navigation-tracking) and browser navigation in `{auto: true}` mode. Read how to use this method for deep [Google Analytics integration](https://github.com/veliovgroup/ostrio-analytics#google-analytics-integration).

Examples:

```js
// Callback will be executed on every browser navigation and upon calling `.track()` method
analyticsTracker.onTrack(() => {
  console.log('Tacking a session'); // Tacking a session
});
```

---

### Destroy Tracker

Call `.destroy()` to unbind listeners and timers (useful on SPA teardown/HMR).

```js
analyticsTracker.destroy();
```

## Advanced

Explode advanced settings and its usage

---

### Transports

- `{ transport: 'beacon' }` – uses `navigator.sendBeacon` when available (best for unload/background sends, but commonly blocked by browsers)
- `{ transport: 'fetch' }` (default) – uses `fetch` with `{ mode: 'no-cors', cache: 'no-store' }`
- `{ transport: 'img' }` – legacy image-pixel transport for top compatibility with various browsers

```js
const analyticsTracker = new Analytics('{{trackingId}}', { transport: 'img' });

// OR DURING RUNTIME:
analyticsTracker.setTransport('beacon');
```

---

### Ignoring paths

Exclude paths from tracking with exact match, prefix, or RegExp. Use `.ignorePath()` or `.ignorePaths()` to add ignored paths during runtime:

```js
analyticsTracker.ignorePath('/admin/*');
analyticsTracker.ignorePath('/payment/status/complete');
analyticsTracker.ignorePath(/^\/_next\//i);

// OR ADD ALL AS ARRAY IN ONE CALL
analyticsTracker.ignorePaths(['/admin/*', '/payment/status/complete']);
```

Use `ignoredPaths` as part of the *Constructor* config object:

```js
const analyticsTracker = new Analytics('{{trackingId}}', {
  ignoredPaths: [
    '/admin/',      // exact match
    '/api/*',       // prefix match
    /^\/_next\//    // RegExp
  ]
});
```

---

### Ignoring queries / search params

> [!NOTE]
> Note: Referral source is tracked via HTTP headers

Remove noisy query keys (case-insensitive) from URL change detection and payload. Use `.ignoreQuery()` or `.ignoreQueries()` to add ignored paths during runtime:

```js
analyticsTracker.ignoreQuery('utm');
analyticsTracker.ignoreQuery('ref');

// OR ADD ALL AS ARRAY IN ONE CALL
analyticsTracker.ignoreQueries(['gclid', 'fbclid', 'sessionid']);
```

Use `ignoredQueries` as part of the *Constructor* config object:

```js
const analyticsTracker = new Analytics('{{trackingId}}', {
  ignoredQueries: ['utm_source', 'utm_medium', 'gclid', 'fbclid', 'sessionid']
});
```

---

### Hash & query tracking controls

Control what constitutes a “new page” for SPAs:

```js
const analyticsTracker = new Analytics('{{trackingId}}', {
  trackHash: false,   // don't treat #hash changes as navigation (default: true)
  trackQuery: false   // don't treat ?query changes as navigation (default: true)
});

// OR UPDATE SETTING DURING RUNTIME:
analyticsTracker.applySettings({
  trackHash: false,
  trackQuery: false
});
```

## Examples

Explore various custom usage examples

---

### Google Analytics integration

Using [`.onTrack()` method](https://github.com/veliovgroup/ostrio-analytics#tracking-callbacks) and [`.onPushEvent()` method](https://github.com/veliovgroup/ostrio-analytics#event-callbacks) we can send tracking-data to Google Analytics upon navigation or event.

In your `<head>` add Google Analytics as instructed:

```html
<script async src="https://www.google-analytics.com/analytics.js"></script>
<script type='text/javascript'>
  window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
  ga('create', 'UA-XXXXXXXXX-X', 'auto');
</script>
```

```js
import Analytics from 'ostrio-analytics';
const analyticsTracker = new Analytics('{{trackingId}}');

analyticsTracker.onTrack(() => {
  // Track navigation with Google Analytics
  ga('send', {
    hitType: 'pageview',
    page: document.location.pathname,
    location: document.location.href,
    title: document.title
  });
});

analyticsTracker.onPushEvent((name, value) => {
  // Send events to Google Analytics
  ga('send', {
    hitType: 'event',
    eventCategory: name,
    eventAction: value
  });
});
```

---

### Google Tag Manager integration

Using [`.onTrack()` method](https://github.com/veliovgroup/ostrio-analytics#tracking-callbacks) and [`.onPushEvent()` method](https://github.com/veliovgroup/ostrio-analytics#event-callbacks) we can send tracking-data to Google Tag Manager upon navigation or event.

In your `<head>` add Google Tag Manager as instructed:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-XXXXXXXXX-X"></script>
<script type='text/javascript'>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
</script>
```

```js
import Analytics from 'ostrio-analytics';
const analyticsTracker = new Analytics('{{trackingId}}');

analyticsTracker.onTrack(() => {
  // Track navigation with Google Analytics
  gtag('config', 'UA-XXXXXXXXX-X', {
    page_title: document.title,
    page_path: document.location.pathname,
    page_location: document.location.href
  });
});

analyticsTracker.onPushEvent((name, value) => {
  // Send events to Google Analytics
  gtag('event', name, { value });
});
```

---

### Opt-out for end-users

> [!TIP]
> Provide a one-click opt-out link in your legal/settings pages to follow the best privacy experience practices

```plain
https://analytics.ostr.io/settings/manage/opt-out/
```

- Add **[one-click opt-out](https://analytics.ostr.io/settings/manage/opt-out/) link** to legal documents and "settings" page.
- **[Click here](https://analytics.ostr.io/settings/manage/)** to check your browser current settings
