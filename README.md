# Analytics for [ostr.io](https://ostr.io)

[ostr.io](https://ostr.io) provides lightweight and full-featured [visitor's analytics](https://ostr.io/info/web-analytics) for websites. Our solution fully compatible and works *out of the box* with Meteor, Vue, React, Angular, Backbone, Ember and other front-end JavaScript frameworks.

## ToC:

- [Why ostr.io analytics?](https://github.com/VeliovGroup/ostrio-analytics#why-ostrio-analytics)
- [List of tracked data](https://github.com/VeliovGroup/ostrio-analytics#analytics-includes)
- [Installation](https://github.com/VeliovGroup/ostrio-analytics#installation):
  - [`<script>` tag](https://github.com/VeliovGroup/ostrio-analytics#script-tag)
  - [NPM](https://github.com/VeliovGroup/ostrio-analytics#npm)
  - [Meteor (NPM)](https://github.com/VeliovGroup/ostrio-analytics#meteor-via-npm)
  - [Meteor (Atmosphere)](https://github.com/VeliovGroup/ostrio-analytics#meteor)
- [API](https://github.com/VeliovGroup/ostrio-analytics#usage):
  - [`new Analytics(/*...*/)`](https://github.com/VeliovGroup/ostrio-analytics#constructor-new-analyticstrackingid--auto)
  - [`Analytics#track()`](https://github.com/VeliovGroup/ostrio-analytics#track-method)
  - [`Analytics#pushEvent()`](https://github.com/VeliovGroup/ostrio-analytics#pusheventkey-value-method)
  - [`Analytics#onTrack()`](https://github.com/VeliovGroup/ostrio-analytics#ontrack-method)
  - [`Analytics#onPushEvent()`](https://github.com/VeliovGroup/ostrio-analytics#onpushevent-method)
- [Examples](https://github.com/VeliovGroup/ostrio-analytics#other-examples):
  - [Router integration](https://github.com/VeliovGroup/ostrio-analytics#deep-router-integration)
  - [History.js integration](https://github.com/VeliovGroup/ostrio-analytics#deep-historyjs-integration)
  - [Google Analytics integration](https://github.com/VeliovGroup/ostrio-analytics#google-analytics-integration)
- [__Opt-out for end-users__](https://github.com/VeliovGroup/ostrio-analytics#opt-out-for-end-users)

## Why [ostr.io](https://ostr.io/info/web-analytics) analytics?:

- 👐 Open Source tracking code;
- 🚀 Lightweight, less than 2.4KB;
- 😎 No DOM changes;
- 😎 No heavy CPU tasks;
- 😎 No extra scripts loading;
- 🤝 Support for History API (*HTML5 History Management*);
- 🤝 Support most of JavaScript front-end based frameworks and routings;
- 📈🚀 Fast, all metrics are available in real-time;
- ⚡️ [Track Accelerated Mobile Pages (AMP)](https://github.com/VeliovGroup/ostrio/blob/master/docs/analytics/track-amp.md);
- 🛑 [Detect and Track AdBlock usage](https://github.com/VeliovGroup/ostrio/blob/master/docs/analytics/detect-adblock.md);
- 🔍 Transparent data collection;
- 😎 Respect [DNT](https://en.wikipedia.org/wiki/Do_Not_Track) policy;
- 👨‍⚖️ Follows latest GDPR recommendations;
- 🙆 [Easy opt-out procedure for end-users](#opt-out-for-end-users);
- 🐞 Global Runtime Errors tracking - *Whenever an error happens during runtime you will be reported to* "Errors" *section. This is super-useful as you never can test your client's code in all imaginable environments, but your website visitors do*.

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

### Meteor:

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

- `trackingId` {*String*} - [Required] Website' identifier. To obtain `trackingId` see "Installation" section above;
- `auto` - {*Boolean*} - [Optional] Default - `true`. If set to `false` all visits and actions have to be tracked with `.track()` method, see below.

#### Script Tag:

```js
// After including script-tag
// analytics automatically executes in 'auto' mode,
// its instance is available in global scope as `OstrioTracker`
// Example: OstrioTracker.pushEvent(foo, bar);
```

#### Meteor:

```js
import Analytics from 'meteor/ostrio:analytics';
const analyticsTracker = new Analytics('trackingId');
```

#### Meteor via NPM:

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
// Example 3:
const analyticsTracker = new OTC('trackingId');
// Example 4:
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

In a similar way using `.pushEvent` you can detect and track [AdBlock usage](https://github.com/VeliovGroup/ostrio/blob/master/docs/analytics/detect-adblock.md) and [Accelerated Mobile Pages (AMP)](https://github.com/VeliovGroup/ostrio/blob/master/docs/analytics/track-amp.md).

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

Use to hook on [`.pushEvent()` method](https://github.com/VeliovGroup/ostrio-analytics#pusheventkey-value-method). Read how to use this method for deep [Google Analytics integration](https://github.com/VeliovGroup/ostrio-analytics#google-analytics-integration).

Examples:

```js
const Analytics = require('ostrio-analytics');
const analyticsTracker = new Analytics('trackingId', false);

analyticsTracker.onPushEvent((key, value) => {
  console.log({ key, value });
  // OUTPUT:
  // { key: 'testKey', value: 'testValue' }
});

analyticsTracker.pushEvent('testKey', 'testValue');
```

### `.onTrack()` method

Use to hook on [`.track()` method](https://github.com/VeliovGroup/ostrio-analytics#track-method) and browser navigation. Read how to use this method for deep [Google Analytics integration](https://github.com/VeliovGroup/ostrio-analytics#google-analytics-integration).

Examples:

```js
const Analytics = require('ostrio-analytics');
const analyticsTracker = new Analytics('trackingId', false);

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

/*!pseudo code!*/
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

Using [`.onTrack()` method](https://github.com/VeliovGroup/ostrio-analytics#ontrack-method) and [`.onPushEvent()` method](https://github.com/VeliovGroup/ostrio-analytics#onpushevent-method) we can send tracking-data to Google Analytics upon navigation or event.

In your `<head>` add Google Analytics as instructed:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=google-tracking-id"></script>
<script type='text/javascript'>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
</script>
```

```js
const Analytics = require('ostrio-analytics');
const analyticsTracker = new Analytics('google-tracking-id', false);

analyticsTracker.onTrack(() => {
  // Track navigation with Google Analytics
  gtag('config', 'google-tracking-id', {
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

### Opt-out for end-users

As our analytics solution fully respects DNT signals, to opt-out end-users need to activate DNT signals in a browser. To find out how to enable DNT and read more about "Do Not Track", visit - [All About DNT](https://allaboutdnt.com/) homepage.
