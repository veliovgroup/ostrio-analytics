export declare enum Transport {
    Fetch = "fetch",
    Beacon = "beacon",
    Img = "img"
}
export declare const SUPPORTED_TRANSPORTS: readonly [Transport.Fetch, Transport.Beacon, Transport.Img];
export type OstrioWebAnalyticsTransport = Transport | `${Transport}`;
export interface OstrioWebAnalyticsDynamicConfig {
    trackHash?: boolean;
    trackQuery?: boolean;
    transport?: OstrioWebAnalyticsTransport;
    serviceUrl?: string;
}
export interface OstrioWebAnalyticsConfig extends OstrioWebAnalyticsDynamicConfig {
    auto?: boolean;
    trackErrors?: boolean;
    ignoredQueries?: Array<string>;
    ignoredPaths?: Array<string | RegExp>;
}
type TrackCb = () => void;
type EventCb = (key: string, value: number | string) => void;
export declare class OstrioWebAnalytics {
    readonly sid: string;
    readonly version: number;
    sending: boolean;
    readonly loc: Location;
    current: string;
    trackHash: boolean;
    trackQuery: boolean;
    readonly ignoredQueries: Set<string>;
    readonly auto: boolean;
    readonly trackErrors: boolean;
    transport: Transport;
    serviceUrl: string;
    private readonly ignoredPaths;
    private readonly onTrackArr;
    private readonly onEventArr;
    private readonly cachedErrors;
    private readonly eventRemovers;
    private autoTimer;
    private lastTrackTimestamp;
    constructor(sid: string, opts?: OstrioWebAnalyticsConfig | boolean);
    private on;
    applySettings(cfg: OstrioWebAnalyticsDynamicConfig): void;
    setTransport(t: OstrioWebAnalyticsTransport): void;
    ignorePath(path: string | RegExp): void;
    ignorePaths(paths: Array<string | RegExp>): void;
    ignoreQuery(queryKey: string): void;
    ignoreQueries(queryKeys: Array<string>): void;
    onPushEvent(callback: EventCb): void;
    onTrack(callback: TrackCb): void;
    pushEvent(rawKey: string, rawValue: number | string): void;
    track(): boolean;
    private send;
    private fetch;
    private sendImage;
    private initAutoTracking;
    private initGlobalErrors;
    private isIgnored;
    private isExternalReferrer;
    private getCurrentUrl;
    destroy(): void;
    private readonly warn;
}
export default OstrioWebAnalytics;
//# sourceMappingURL=index.d.ts.map