Analytics for [ostr.io](https://ostr.io)
=======

[Ostr.io](https://ostr.io) provides lightweight and full-featured visitor's analytics for websites. Our solution fully compatible and works "*out-of-box*" with Meteor, React, Angular, Backbone, Ember and other front-end JavaScript frameworks.

#### Why [ostr.io](https://ostr.io) analytics?:
  - Open Source tracking code;
  - Transparent data collection;
  - Support for History API (*HTML5 History Management*);
  - Support most JavaScript font-end based frameworks and routings;
  - Respect [DNT](https://en.wikipedia.org/wiki/Do_Not_Track) policy;
  - Lightweight, less than 2.5KB;
  - No DOM changes;
  - No heavy CPU tasks;
  - No extra scripts loading;
  - Fast, all data available in real time;
  - Global runtime Errors tracking - *Whenever error happens during runtime you will be reported into* Events *section. This is super-useful as you never can test your client's code in all imaginable environments, but your website visitors do*.

#### Analytics includes:
  - Real-time users;
  - Pageviews;
  - Sessions;
  - Unique users;
  - Demographics:
    - Country;
    - City.
  - System:
    - Mobile devices;
    - Browsers;
    - Operating System.
  - Behavior:
    - Custom events (*see below*);
    - Global Scripts Errors and Exceptions;
    - Referrers.

Installation
=======
Installation options:
 - Include suggested `script` tag into `head` of your HTML page - The simplest way;
 - Include code from this repository into main website's script file;
 - Install via NPM;
 - Install via Atmosphere (Meteor).

To find installation instruction - go to [Analytics](https://ostr.io/service/analytics) section and select domain name for which you would like install visitors metrics. To find "trackingId" click on "Show integration guide" and pick `trackingId` (*17 symbols*).

#### Script tag:
```html
<script async defer type="text/javascript" src="https://analytics.ostr.io/trackingId.js"></script>
```

#### Meteor:
```shell
meteor add ostrio:analytics
```

#### Meteor via NPM:
```shell
meteor npm install ostrio-analytics --save
```

#### NPM:
```shell
npm install ostrio-analytics --save
```

Usage
=======

#### Constructor `new Analytics(trackingId [, auto])`
 - `trackingId` {*String*} - [Required] Website identifier. To obtain `trackingId` see "Installation" section above;
 - `auto` - {*Boolean*} - [Optional] Default - `true`. If set to `false` all visit and actions have to be tracked with `.track()` method, see below.

Script Tag:
```js
// After including script-tag
// Analytics automatically executes in 'auto' mode
// Its instance is available in global-scope as OstrioTracker
// Example: OstrioTracker.pushEvent(foo, bar);
```

Meteor:
```jsx
import Analytics from 'meteor/ostrio:analytics';
analyticsTracker = new Analytics('trackingId');
```

Meteor via NPM:
```jsx
analyticsTracker = new (require('ostrio-analytics'))('trackingId');
```

NPM (CommonJS/RequireJS/Module):
```jsx
const analyticsTracker = new (require('ostrio-analytics'))('trackingId');
```

*From this point you're good to go. All visitor's actions will be collected by ostr.io analytics. For custom events - see below.*

##### `analyticsTracker.pushEvent(key, value)`
Custom events is useful for tracking certain activity on your website, like clicks, form submits and others user's behaviors.

 - `key` {*String*} - [Required] Length of event key must be between 1 and 24 symbols
 - `value` {*String*} - [Required] Length of event value must be between 1 and 64 symbols

If length of `key` or `value` is higher than limits, it will be truncated without throwing exception.


##### `analyticsTracker.track()`
Use to manually send tracking info. This method has no arguments.

Other examples
=======
##### Deep router integration:
```jsx
const Analytics = require('ostrio-analytics');
const analyticsTracker = new Analytics('trackingId', false);

/*!pesudo code!*/
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

##### Deep History.js Integration
Although History.js and History API supported "*out-of-box*", you may want to optimize tracking behavior to meet your needs.
```jsx
const Analytics = require('ostrio-analytics');
const analyticsTracker = new Analytics('trackingId', false);

History.Adapter.bind(window, 'statechange', function(){
  analyticsTracker.track();
});
```
