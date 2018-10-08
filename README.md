# Analytics for [ostr.io](https://ostr.io)

[ostr.io](https://ostr.io) provides lightweight and full-featured [visitor's analytics](https://ostr.io/info/web-analytics) for websites. Our solution fully compatible and works *out of the box* with Meteor, Vue, React, Angular, Backbone, Ember and other front-end JavaScript frameworks.

## Why [ostr.io](https://ostr.io/info/web-analytics) analytics?:

- 👐 Open Source tracking code;
- 🚀 Lightweight, less than 2.5KB;
- 😎 No DOM changes;
- 😎 No heavy CPU tasks;
- 😎 No extra scripts loading;
- 🤝 Support for History API (*HTML5 History Management*);
- 🤝 Support most of JavaScript front-end based frameworks and routings;
- 📈🚀 Fast, all metrics are available in real-time;
- ⚡️ [Track Accelerated Mobile Pages (AMP)](https://github.com/VeliovGroup/ostrio/blob/master/docs/analytics/track-amp.md);
- 🛑✋ [Detect and Track AdBlock usage](https://github.com/VeliovGroup/ostrio/blob/master/docs/analytics/detect-adblock.md);
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

### Opt-out for end-users

As our analytics solution fully respects DNT signals, to opt-out end-users need to activate DNT signals in a browser. To find out how to enable DNT and read more about "Do Not Track", visit - [All About DNT](https://allaboutdnt.com/) homepage.
