Analytics for [ostr.io](https://ostr.io)
=======

[Ostr.io](https://ostr.io) provides lightweight and full-featured visitor's analytics for websites. Our solution fully compatible and works "*out-of-box*" with Meteor, Angular, Backbone, Ember and other front-end JavaScript frameworks.

##### Why analytics from [ostr.io](https://ostr.io)?:
  - Open Source tracking code;
  - Transparent data collection;
  - Support for History API (*HTML5 History Management*);
  - Respect [DNT](https://en.wikipedia.org/wiki/Do_Not_Track) policy;
  - Lightweight, less than 5KB;
  - No DOM changes;
  - No heavy CPU tasks;
  - No extra scripts loading;
  - Global runtime Errors tracking - *Whenever error happens during runtime you will be reported into* Events *section. This is super-useful as you never can test your client's code in all imaginable environments, but your website visitors do*.

##### Analytics includes:
  - Real-time users;
  - Pageviews;
  - Sessions;
  - Avg. sessions duration;
  - Pageviews per Session;
  - Unique users;
  - Bounces and Bounce rate;
  - Demographics:
    - Country;
    - City;
    - User's language (locale).
  - System:
    - Mobile devices;
    - Browsers;
    - Operating System.
  - Screen:
    - Browser's window size;
    - Device screen size;
    - Screen orientation;
    - Color palette and resolution.
  - Behavior:
    - Custom events (*see below*);
    - Referrals;
    - Exit Pages;
    - Outgoing Links.

All analytics data is available for half of year, quarter, month (*daily*), 3 days (*hourly*), 6 hours (*by minutes*, *real-time*).

Installation
=======
In control panel of your website (*at [ostr.io](https://ostr.io/en/account/servers)*) go to "Analytics" tab, and click on "How to install?". From given code you can obtain `trackingId` (*17 symbols*):
```html
<script async defer type="text/javascript" src="https://analytics.ostr.io/Asy4kHJndi84KKlpq.js"></script>
<!-- trackingId is: Asy4kHJndi84KKlpq -->
```

The simplest way is to include this `script` tag into `head` of your HTML page. Or (*for better efficiency*) include code from this repository into main website's script file (or install via NPM/Atmosphere), so you can have all application's code in single file.

##### Meteor
```shell
meteor add ostrio:analytics
```

##### NPM:
```shell
npm install ostrio-analytics --save
```

If you're using any compilation for NPM and/or JavaScript, all JS-source code of your application will be compiled and minified into single file.

Usage
=======

##### Constructor `new OstrioTrackerClass(trackingId)`
 - `trackingId` {*String*} - [Required] Website identifier. For finding trackingId see "Installation" section above

Meteor:
```js
Meteor.startup(function() {
  this.OstrioTracker = new OstrioTrackerClass('trackingId');
});
```

Browser:
```js
var OstrioTracker = new OstrioTrackerClass('trackingId');
```

RequireJS (+AMD Module):
```js
var Analytics = require('ostrio-analytics');
var OstrioTracker = new Analytics('trackingId');
```

*From this point you're good to go. All visitor's actions will be collected by ostr.io analytics. For custom events - see below.*


##### `OstrioTracker.pushEvent(key, value)`
Custom events is useful for tracking certain activity on your website, like clicks, form submits and others user's behaviors.

 - `key` {*String*} - [Required] Length of event key must be between 1 and 24 symbols
 - `value` {*String*} - [Required] Length of event value must be between 1 and 64 symbols

If length of `key` or `value` is higher than limits, it will be truncated without throwing exception.


##### `OstrioTracker.track()`
Use to manually send tracking info of current page and user, to ostr.io analytics service.


Other examples
=======
##### Deep router integration:
```js
var OstrioTracker = new OstrioTrackerClass('trackingId', false);

router({
  '/': function() {
    OstrioTracker.track();
  },

  '/two': function() {
    OstrioTracker.track();
  },

  '/three': function() {
    OstrioTracker.track();
  }
});
```

##### Deep History.js Integration
Although History.js and History API supported "*out-of-box*", you may want to optimize tracking behavior to meet your needs.
```js
var OstrioTracker = new OstrioTrackerClass('trackingId', false);

History.Adapter.bind(window, 'statechange', function(){
  OstrioTracker.track();
});
```