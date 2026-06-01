import Analytics, { Transport, type OstrioWebAnalyticsConfig } from 'ostrio-analytics';

const config = {
  auto: false,
  transport: 'fetch'
} satisfies OstrioWebAnalyticsConfig;

const tracker = new Analytics('fffffffffffffffff', config);
tracker.setTransport('img');
tracker.setTransport(Transport.Beacon);
tracker.destroy();
