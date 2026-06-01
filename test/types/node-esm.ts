import Analytics, {
  OstrioWebAnalytics,
  SUPPORTED_TRANSPORTS,
  Transport,
  type OstrioWebAnalyticsConfig,
  type OstrioWebAnalyticsDynamicConfig,
  type OstrioWebAnalyticsTransport
} from 'ostrio-analytics';

const config: OstrioWebAnalyticsConfig = {
  auto: false,
  trackErrors: false,
  trackHash: false,
  trackQuery: true,
  ignoredQueries: ['utm_source', 'gclid'],
  ignoredPaths: ['/admin/*', /^\/api\//],
  transport: 'img'
};

const dynamic: OstrioWebAnalyticsDynamicConfig = {
  trackHash: true,
  trackQuery: false,
  transport: 'beacon',
  serviceUrl: 'https://analytics.example.test'
};

const tracker: OstrioWebAnalytics = new Analytics('fffffffffffffffff', config);
tracker.applySettings(dynamic);
tracker.setTransport(Transport.Fetch);
tracker.setTransport('beacon');
tracker.ignorePath('/private/*');
tracker.ignorePaths(['/billing/', /^\/internal\//]);
tracker.ignoreQuery('fbclid');
tracker.ignoreQueries(['utm_medium']);
tracker.onTrack(() => undefined);
tracker.onPushEvent((key: string, value: number | string) => {
  void key;
  void value;
});
tracker.pushEvent('signup', 1);
const sent: boolean = tracker.track();
const transport: OstrioWebAnalyticsTransport = 'fetch';
const transports: readonly Transport[] = SUPPORTED_TRANSPORTS;

void sent;
void transport;
void transports;
tracker.destroy();
