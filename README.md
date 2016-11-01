Analytics for [ostr.io](https://ostr.io)
=======

[Ostr.io](https://ostr.io) provides lightweight and full-featured visitor's analytics for websites. Our solution fully compatible and works "*out-of-box*" with Meteor, Angular, Backbone, Ember and other front-end JavaScript frameworks.

##### Why analytics from [ostr.io](https://ostr.io)?:
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

##### Analytics includes:
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
    - Referrers.

Installation
=======
Go to [Analytics](https://ostr.io/service/analytics) section and select domain name for which you would like install visitors metrics. Go to "Show integration guide" and pick `trackingId` (*17 symbols*):
```html
<script async defer type="text/javascript" src="https://analytics.ostr.io/Asy4kHJndi84KKlpq.js"></script>
<!-- trackingId is: Asy4kHJndi84KKlpq -->
```

Installation options:
 - Include suggested `script` tag into `head` of your HTML page - The simplest way;
 - Include code from this repository into main website's script file;
 - Install via NPM/Atmosphere.

##### Meteor
```shell
meteor add ostrio:analytics
```

##### NPM:
```shell
npm install ostrio-analytics --save
```

Usage
=======

##### Constructor `new OstrioTrackerClass(trackingId)`
 - `trackingId` {*String*} - [Required] Website identifier. To obtain `trackingId` see "Installation" section above

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
Use to manually send tracking info. This method has no arguments.


Other examples
=======
##### Deep router integration:
```js
var OstrioTracker = new OstrioTrackerClass('trackingId', false);
/*!pesudo code!*/
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