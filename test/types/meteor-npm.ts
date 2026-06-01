import Analytics, { type OstrioWebAnalyticsConfig } from 'ostrio-analytics';

const config: OstrioWebAnalyticsConfig = {
  auto: false,
  trackErrors: true,
  ignoredPaths: ['/admin/*'],
  ignoredQueries: ['utm_source'],
  transport: 'beacon'
};

const analyticsTracker = new Analytics('fffffffffffffffff', config);
analyticsTracker.pushEvent('meteor', 'client');
analyticsTracker.destroy();
