# Meteor.js docs

How to install and use analytics by ostr.io within Meteor.js project

## Installation

Install via Atmosphere or as NPM packeage

### Meteor via Atmosphere:

```shell
meteor add ostrio:analytics
```

### Meteor via NPM:

```shell
meteor npm install ostrio-analytics --save
```

## Initialize

Initialize tracking code in the application's codebase

### Meteor/Atmosphere

Import from Atmosphere package

```js
import Analytics from 'meteor/ostrio:analytics';
const analyticsTracker = new Analytics('trackingId');
```

### Meteor/NPM

Meteor works well with NPM packages

#### Import

Import from NPM package

```js
import Analytics from 'ostrio-analytics';
const analyticsTracker = new Analytics('trackingId');
```

#### Require

Require from NPM package

```js
const analyticsTracker = new (require('ostrio-analytics'))('trackingId');
```
