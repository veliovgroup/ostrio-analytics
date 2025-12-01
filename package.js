Package.describe({
  name: 'ostrio:analytics',
  version: '2.0.0',
  summary: 'CCPA and GDPR friendly real-time web analytics with error collection',
  git: 'https://github.com/veliovgroup/ostrio-analytics',
  documentation: 'README.md'
});

Package.onUse((api) => {
  api.versionsFrom('3.1');
  api.use('typescript@5.6.6', 'client');
  api.mainModule('./src/index.ts', 'client');
});
