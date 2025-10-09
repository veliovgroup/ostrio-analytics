Package.describe({
  name: 'ostrio:analytics',
  version: '1.4.0',
  summary: 'CCPA and GDPR friendly real-time web analytics with errors collection',
  git: 'https://github.com/veliovgroup/ostrio-analytics',
  documentation: 'README.md'
});

Package.onUse((api) => {
  api.versionsFrom('1.4');
  api.use('ecmascript', 'client');
  api.mainModule('./lib/analytics.js', 'client');
});
