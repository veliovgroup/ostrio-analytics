Package.describe({
  name: 'ostrio:analytics',
  version: '1.2.9',
  summary: 'Visitor\'s web analytics tracking code for ostr.io service',
  git: 'https://github.com/VeliovGroup/ostrio-analytics',
  documentation: 'README.md'
});

Package.onUse((api) => {
  api.versionsFrom('1.4');
  api.use('ecmascript', 'client');
  api.mainModule('./lib/analytics.js', 'client');
});
