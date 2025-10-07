# Analytics for [ostr.io](https://ostr.io)

[ostr.io](https://ostr.io) provides lightweight and full-featured [visitor's analytics](https://ostr.io/info/web-analytics) for websites. Our solution fully compatible and works *out of the box* with React.js, Next.js, Vue.js, Nuxt.js, Svelte.js, Meteor.js, Blaze.js, Angular.js, Backbone.js, Ember.js and other front-end JavaScript frameworks.

## ToC:

- [Why ostr.io analytics?](https://github.com/veliovgroup/ostrio-analytics#why-ostrio-analytics)
- [List of tracked data](https://github.com/veliovgroup/ostrio-analytics#analytics-includes)
- [Installation](https://github.com/veliovgroup/ostrio-analytics#installation):
  - [`<script>` tag](https://github.com/veliovgroup/ostrio-analytics#script-tag)
  - [NPM](https://github.com/veliovgroup/ostrio-analytics#npm)
  - [Meteor (NPM)](https://github.com/veliovgroup/ostrio-analytics#meteor-via-npm)
  - [Meteor (Atmosphere)](https://github.com/veliovgroup/ostrio-analytics#meteor-via-atmosphere)
- [API](https://github.com/veliovgroup/ostrio-analytics#usage):
  - [`new Analytics(/*...*/)`](https://github.com/veliovgroup/ostrio-analytics#constructor-new-analyticstrackingid--auto)
  - [`Analytics#track()`](https://github.com/veliovgroup/ostrio-analytics#track-method)
  - [`Analytics#pushEvent()`](https://github.com/veliovgroup/ostrio-analytics#pusheventkey-value-method)
  - [`Analytics#onTrack()`](https://github.com/veliovgroup/ostrio-analytics#ontrack-method)
  - [`Analytics#onPushEvent()`](https://github.com/veliovgroup/ostrio-analytics#onpushevent-method)
- [Examples](https://github.com/veliovgroup/ostrio-analytics#other-examples):
  - [Router integration](https://github.com/veliovgroup/ostrio-analytics#deep-router-integration)
  - [History.js integration](https://github.com/veliovgroup/ostrio-analytics#deep-historyjs-integration)
  - [Google Analytics integration](https://github.com/veliovgroup/ostrio-analytics#google-analytics-integration)
  - [Google Tag Manager integration](https://github.com/veliovgroup/ostrio-analytics#google-tag-manager-integration)
- [__Opt-out for end-users__](https://github.com/veliovgroup/ostrio-analytics#opt-out-for-end-users)

## Why [ostr.io](https://ostr.io/info/web-analytics) analytics?:

- 👐 Open Source tracking code;
- 📦 Lightweight, less than 2.8KB;
- 🚀 Fast, all metrics are available in real-time;
- 😎 No DOM changes;
- 😎 No heavy CPU tasks;
- 😎 No extra scripts loading;
- 📡 Utilizes [Beacon API](https://developer.mozilla.org/en-US/docs/Web/API/Beacon_API) when available;
- 🤝 Support for History API (*HTML5 History Management*);
- 🤝 Support most of JavaScript front-end based frameworks and routings;
- ⚡️ [Track Accelerated Mobile Pages (AMP)](https://github.com/veliovgroup/ostrio/blob/master/docs/analytics/track-amp.md);
- 🛑 [Detect and Track AdBlock usage](https://github.com/veliovgroup/ostrio/blob/master/docs/analytics/detect-adblock.md);
- 🔍 Transparent data collection;
- 👨‍⚖️ Follows latest GDPR recommendations;
- 🙆 [Easy opt-out procedure for end-users](#opt-out-for-end-users);
- 🐞 Global Runtime Errors tracking - *Whenever an error happens during runtime you will receive report to* "Errors" *section. This is super-useful as errors reported right from user's device allowing to website visitors participate in testing of all imaginable devices and software combinations*.

## Analytics includes:

- Real-time users;
- Sessions;
- Unique users;
- Pageviews:
  - Page title;
  - Page URL.
- Demographics:
  - Country;
  - City.
- System:
  - Mobile devices;
  - Browsers;
  - Operating System.
- Behavior:
  - Custom events (*see below*);
  - Referrers.
- Global Scripts Errors and Exceptions:
  - Catch all JS-runtime errors and exceptions;
  - Browser name and release;
  - Operating System name and release;
  - Device name and version;
  - Script name and line number where the error occurred.

## Installation

Installation options:

- Include suggested `script` tag into `head` of your HTML page - The simplest way;
- Include code from this repository into main website' script file;
- Install via NPM;
- Install via Atmosphere (Meteor).

To find installation instruction - go to [Analytics](https://ostr.io/service/analytics) section and select domain name for which you would like to install visitors metrics. To find "Tracking ID" click on "Show integration guide" and pick `{{trackingId}}` (*17 symbols*).

### Script tag:

```html
<script async defer type="text/javascript" src="https://analytics.ostr.io/{{trackingId}}.js"></script>
```

### Meteor via Atmosphere:

```shell
meteor add ostrio:analytics
```

### Meteor via NPM:

```shell
meteor npm install ostrio-analytics --save
```

### NPM:

```shell
npm install ostrio-analytics --save
```

## Usage

### Constructor `new Analytics(trackingId [, auto])`

- `trackingId` {*String*} - [Required] Website' identifier. To obtain `trackingId` go to [Analytics](https://ostr.io/service/analytics) section and select a domain name;
- `auto` - {*Boolean*} - [Optional] Default - `true`. If set to `false` all visits and actions have to be tracked with `.track()` method, see below.

#### Script Tag:

```js
// After including script-tag
// analytics automatically executes in 'auto' mode,
// its instance is available in global scope as `OstrioTracker`
// Example: OstrioTracker.pushEvent(foo, bar);
```

#### Meteor/ES6:

```js
import Analytics from 'meteor/ostrio:analytics';
const analyticsTracker = new Analytics('trackingId');
```

#### Meteor/NPM:

```js
const analyticsTracker = new (require('ostrio-analytics'))('trackingId');
```

#### NPM (CommonJS/RequireJS/Module):

```js
const analyticsTracker = new (require('ostrio-analytics'))('trackingId');
```

#### Using minifed version:

```js
// After adding minified analytics code to your project
// In global scope as `OstrioTrackerClass` and `OTC`
// as a short (short name was used in initial release,
// we keep it for compatibility reasons)

// Example:
const analyticsTracker = new OstrioTrackerClass('trackingId');
// Example 2:
const analyticsTracker = new window.OstrioTrackerClass('trackingId');
// Example 3 (shorthand):
const analyticsTracker = new OTC('trackingId');
// Example 4 (shorthand):
const analyticsTracker = new window.OTC('trackingId');
// Example 5: Initiate class with disabled "auto" tracking
// With disabled "auto" tracking you need to use
// `.track()` method to track a "visit"
const analyticsTracker = new window.OTC('trackingId', false);
whenUserVisit(() => {
  analyticsTracker.track();
});
```

*From this point, you're good to go. All visitor's actions will be collected by ostr.io analytics. For custom events - see below.*

### `.pushEvent(key, value)` method

Custom events are useful for tracking certain activity on your website, like clicks, form submits and others user's behaviors.

- `key` {*String*} - [Required] The length of the event key must be between 1 and 24 symbols;
- `value` {*String*} - [Required] The length of the event value must be between 1 and 64 symbols.

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

### `.track()` method

Use to manually send tracking info. This method has no arguments.

Examples:

```js
const Analytics = require('ostrio-analytics');
const analyticsTracker = new Analytics('trackingId', false);

// jQuery or any other similar case:
$(document).ready(() => {
  analyticsTracker.track();
});
```

### `.onPushEvent()` method

Use to hook on [`.pushEvent()` method](https://github.com/veliovgroup/ostrio-analytics#pusheventkey-value-method). Read how to use this method for deep [Google Analytics integration](https://github.com/veliovgroup/ostrio-analytics#google-analytics-integration).

Examples:

```js
const Analytics = require('ostrio-analytics');
const analyticsTracker = new Analytics('trackingId');

analyticsTracker.onPushEvent((key, value) => {
  console.log({ key, value });
  // OUTPUT:
  // { key: 'testKey', value: 'testValue' }
});

analyticsTracker.pushEvent('testKey', 'testValue');
```

### `.onTrack()` method

Use to hook on [`.track()` method](https://github.com/veliovgroup/ostrio-analytics#track-method) and browser navigation. Read how to use this method for deep [Google Analytics integration](https://github.com/veliovgroup/ostrio-analytics#google-analytics-integration).

Examples:

```js
const Analytics = require('ostrio-analytics');
const analyticsTracker = new Analytics('trackingId');

analyticsTracker.onTrack(() => {
  console.log('Tacking a session');
  // OUTPUT :
  // Tacking a session
});

// Callback will be executed on every browser navigation
// or upon calling `.track()` method
analyticsTracker.track();
```

## Other examples

### Deep router integration:

```js
const Analytics = require('ostrio-analytics');
const analyticsTracker = new Analytics('trackingId', false);

/* router definition */
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
```

### Deep History.js Integration

Although "History.js" and "History API" supported out-of-box, you may want to optimize tracking behavior to meet your needs.

```js
const Analytics = require('ostrio-analytics');
const analyticsTracker = new Analytics('trackingId', false);

History.Adapter.bind(window, 'statechange', () => {
  analyticsTracker.track();
});
```

### Google Analytics integration

Using [`.onTrack()` method](https://github.com/veliovgroup/ostrio-analytics#ontrack-method) and [`.onPushEvent()` method](https://github.com/veliovgroup/ostrio-analytics#onpushevent-method) we can send tracking-data to Google Analytics upon navigation or event.

In your `<head>` add Google Analytics as instructed:

```html
<script async src="https://www.google-analytics.com/analytics.js"></script>
<script type='text/javascript'>
  window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
  ga('create', 'UA-XXXXXXXXX-X', 'auto');
  if ('sendBeacon' in navigator) {
    ga('set', 'transport', 'beacon');
  }
</script>
```

```js
const Analytics = require('ostrio-analytics');
const analyticsTracker = new Analytics('trackingId');

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

### Google Tag Manager integration

Using [`.onTrack()` method](https://github.com/veliovgroup/ostrio-analytics#ontrack-method) and [`.onPushEvent()` method](https://github.com/veliovgroup/ostrio-analytics#onpushevent-method) we can send tracking-data to Google Tag Manager upon navigation or event.

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
const Analytics = require('ostrio-analytics');
const analyticsTracker = new Analytics('trackingId', false);

analyticsTracker.onTrack(() => {
  // Track navigation with Google Analytics
  gtag('config', 'UA-XXXXXXXXX-X', {
    page_title: document.title,
    page_path: document.location.pathname,
    page_location: document.location.href
  });
});

_app.OstrioTracker.onPushEvent((name, value) => {
  // Send events to Google Analytics
  gtag('event', name, { value });
});
```

### Opt-out for end-users

[One-click opt-out](https://analytics.ostr.io/settings/manage/opt-out/) procedure. Webmasters can add "opt-out link" to their legal documents and "settings" pages to follow the best privacy experience practices.
