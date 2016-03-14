Analytics for [ostr.io](https://ostr.io)
=======

[Ostr.io](https://ostr.io) provides lightweight and full-featured website visitor's analytics.

Analytics includes:
  - Real-time users;
  - Pageviews;
  - Sessions;
  - Avg. sessions duration;
  - Pageviews / Session;
  - Unique users;
  - Bounces and Bounce rate;
  - Demographics:
    - Country;
    - City;
    - User's language.
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
In control panel of your website (*at [ostr.io](https://ostr.io/en/account/servers)*) go to "Analytics" tab, and click on "How to install?". From given code you can obtain `websiteId` (*17 symbols*):
```html
<script async defer type="text/javascript" src="https://analytics.ostr.io/Asy4kHJndi84KKlpq.js"></script>
<!-- serverId is: Asy4kHJndi84KKlpq -->
```

The simplest way is to include this `script` tag into `head` of your HTML page. Or (*for better efficiency*) include code from this repository into main website's script file (or install via NPM/Atmosphere), so you can have all website-related code in single file.

##### Meteor
```shell
meteor add ostrio:analytics
```

##### NPM:
```shell
npm install ostrio-analytics --save
```

Or if you're using any compilation for NPM and/or JavaScript, all JS-source code of your application will be compiled and minified into single file.

Usage
=======

##### Constructor `new OstrioTrackerClass(serverId)`
 - `serverId` {*String*} - [Required] Server identification. For finding serverId see "Installation" section above

For Meteor:
```js
Meteor.startup(function() {
  this.OstrioTracker = new OstrioTrackerClass('yGicWg6G7XWM4avuJ');
});
```

For others:
```js
var OstrioTracker = new OstrioTrackerClass('Asy4kHJndi84KKlpq');
```

*From this point you're good to go. All visitor's actions will be collected by ostr.io analytics. For custom events - see below.*


##### `OstrioTracker.pushEvent(key, value)`
*Custom events is useful for tracking certain activity on your website, like clicks, form submissions and other user's behaviors.*

 - `key` {*String*} - [Required] Length of event key must be between 1 and 24 symbols
 - `value` {*String*} - [Required] Length of event value must be between 1 and 64 symbols

*If length of* `key` *or* `value` *is higher than limits, it will be truncated without throwing exception.*


##### `OstrioTracker.track()`
*Use to manually send tracking info of current page and user to ostr.io analytics service.*


