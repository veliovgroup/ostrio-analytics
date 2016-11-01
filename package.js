Package.describe({
  name: 'ostrio:analytics',
  version: '1.1.0',
  summary: 'Visitor\'s analytics tracking code for ostr.io service',
  git: 'https://github.com/VeliovGroup/ostrio-analytics',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.4');
  api.mainModule('./lib/analytics.js', 'client');
  api.export('OstrioTrackerClass', 'client');
});