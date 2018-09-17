Package.describe({
  name: 'ostrio:analytics',
  version: '1.2.5',
  summary: 'Visitor\'s web analytics tracking code for ostr.io service',
  git: 'https://github.com/VeliovGroup/ostrio-analytics',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.4');
  api.use('ecmascript', 'client');
  api.mainModule('./lib/meteor.js', 'client');
});

Npm.depends({
  'ostrio-analytics': '1.1.5'
});
