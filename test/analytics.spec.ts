/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect } from 'chai';
import sinon from 'sinon';
import globalJsdom from 'global-jsdom';

// Import TS source; switch to ../dist/index.cjs if you test the bundle
import Analytics, { Transport } from '../src/index.ts';

let beaconStub: sinon.SinonStub | undefined;
const VALID_ID = 'fffffffffffffffff'; // 17 chars

const getQueryFromUrl = (url: string): URLSearchParams => {
  const [, q] = url.split('?');
  return new URLSearchParams(q || '');
};

describe('OstrioWebAnalytics', () => {
  let cleanup: () => void;
  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    cleanup = globalJsdom('', {
      url: 'https://ostr.io/page?utm_source=x&b=2#hash',
      referrer: 'https://google.com/',
    });
    document.title = 'Test Title';
    clock = sinon.useFakeTimers({ now: Date.now() });

    // network stubs
    (global as any).fetch = sinon.stub().resolves({});

    // DO NOT replace navigator; add/override the method on the existing object
    const nav: any = globalThis.navigator;
    if (typeof nav.sendBeacon === 'function') {
      beaconStub = sinon.stub(nav, 'sendBeacon').returns(true);
    } else {
      Object.defineProperty(nav, 'sendBeacon', {
        value: sinon.stub().returns(true),
        configurable: true
      });
    }

    // image ping stub
    const images: any[] = [];
    (global as any).__images = images;
    (global as any).Image = class {
      public onload?: () => void;
      set src(u: string) {
        (this as any).__src = u;
        images.push(this);
        if (this.onload) setTimeout(this.onload, 0);
      }
    };
  });

  afterEach(() => {
    clock.restore();
    delete (global as any).fetch;

    // restore/remove only the patched member, not the whole navigator
    if (beaconStub && beaconStub.restore) beaconStub.restore();
    else delete (globalThis.navigator as any).sendBeacon;
    beaconStub = undefined;

    delete (global as any).__images;
    delete (global as any).Image;

    cleanup();
  });

  it('throws on invalid tracking id', () => {
    expect(() => new (Analytics as any)('bad-id')).to.throw('[init] {{trackingId}} is missing or incorrect!');
  });

  it('constructs with auto:false and does not auto-track', () => {
    const a = new (Analytics as any)(VALID_ID, { auto: false });
    expect(a).to.be.instanceOf(Analytics);
    expect((global as any).fetch.callCount).to.equal(0);
  });

  it('applySettings updates flags and normalizes serviceUrl', () => {
    const a = new (Analytics as any)(VALID_ID, { auto: false, trackHash: true, trackQuery: true });
    a.applySettings({ trackHash: false, trackQuery: false, serviceUrl: 'https://x.y' });
    expect(a.trackHash).to.equal(false);
    expect(a.trackQuery).to.equal(false);
    expect(a.serviceUrl.endsWith('/')).to.equal(true);
  });

  it('setTransport falls back to IMG when fetch is unavailable', () => {
    const a = new (Analytics as any)(VALID_ID, { auto: false });
    const saved = (global as any).fetch;
    (global as any).fetch = undefined;
    a.setTransport(Transport.Fetch);
    expect(a.transport).to.equal(Transport.Img);
    (global as any).fetch = saved;
  });

  it('ignorePath(s) prevents track()', () => {
    cleanup();
    cleanup = globalJsdom('', {
      url: 'https://ostr.io/admin/dashboard',
      referrer: 'https://google.com/',
    });
    const a = new (Analytics as any)(VALID_ID, { auto: false });
    a.ignorePaths(['/admin/*', '/exact/', /^\/re\/\d+$/]);
    a.track();
    clock.tick(70);
    expect((global as any).fetch.callCount).to.equal(0);
  });

  it('ignoreQuery/ignoredQueries filter URL search; trackHash=false strips hash', () => {
    document.title = 'T';
    const fetchStub: sinon.SinonStub = (global as any).fetch;
    const a = new (Analytics as any)(VALID_ID, { auto: false, trackHash: false, trackQuery: true });
    a.ignoreQuery('utm_source');
    a.track();
    clock.tick(70);
    const url = fetchStub.lastCall.args[0] as string;
    const q = getQueryFromUrl(url);
    const href = decodeURIComponent(q.get('6') || '');
    expect(href.includes('#')).to.equal(false);
    expect(href.includes('utm_source')).to.equal(false);
    expect(href.includes('b=2')).to.equal(true);
  });

  it('onTrack callback fires on track()', () => {
    const a = new (Analytics as any)(VALID_ID, { auto: false });
    const spy = sinon.spy();
    a.onTrack(spy);
    a.track();
    clock.tick(70);
    expect(spy.callCount).to.equal(1);
  });

  it('onPushEvent fires and pushEvent sends ?3= payload', () => {
    const a = new (Analytics as any)(VALID_ID, { auto: false });
    const cb = sinon.spy();
    a.onPushEvent(cb);
    a.pushEvent('signup', 'ok');
    const fetchStub: sinon.SinonStub = (global as any).fetch;
    expect(cb.callCount).to.equal(1);
    const url = fetchStub.lastCall.args[0] as string;
    expect(url.includes('?3=')).to.equal(true);
  });

  it('pushEvent suppresses duplicate [Global Error] values', () => {
    const a = new (Analytics as any)(VALID_ID, { auto: false });
    const fetchStub: sinon.SinonStub = (global as any).fetch;
    fetchStub.resetHistory();
    a.pushEvent('[Global Error]', 'boom');
    a.pushEvent('[Global Error]', 'boom');
    expect(fetchStub.callCount).to.equal(1);
  });

  it('track() (fetch transport) sends href/title/referrer and noise/version', () => {
    const a = new (Analytics as any)(VALID_ID, { auto: false, transport: Transport.Fetch });
    const fetchStub: sinon.SinonStub = (global as any).fetch;
    const sent = a.track();
    expect(sent).to.equal(true);
    clock.tick(70);
    const url = fetchStub.lastCall.args[0] as string;
    const q = getQueryFromUrl(url);
    expect(q.get('6')).to.be.a('string');
    expect(q.get('2')).to.equal(document.title);
    expect(q.get('1')).to.be.a('string');
    expect(q.get('9')).to.have.lengthOf(7);
    expect(q.get('v')).to.equal(String(a.version));
  });

  it('beacon transport uses navigator.sendBeacon', () => {
    const a = new (Analytics as any)(VALID_ID, { auto: false, transport: Transport.Beacon });
    const sendBeacon = (global as any).navigator.sendBeacon as sinon.SinonStub;
    a.track();
    clock.tick(70);
    expect(sendBeacon.callCount).to.equal(1);
    const calledWith = sendBeacon.lastCall.args[0] as string;
    expect(calledWith.includes('.gif?')).to.equal(true);
  });

  it('img transport sets Image.src', () => {
    const a = new (Analytics as any)(VALID_ID, { auto: false, transport: Transport.Img });
    a.track();
    clock.tick(70);
    const images = (global as any).__images as any[];
    expect(images.length).to.equal(1);
    expect((images[0] as any).__src.includes(`${VALID_ID}.gif?`)).to.equal(true);
  });

  it('auto mode binds popstate (+hashchange when enabled) and destroy() unbinds + clears timer', () => {
    const a = new (Analytics as any)(VALID_ID, { auto: true, trackHash: true });
    const before = (a as any).eventRemovers.length;
    expect(before >= 2).to.equal(true); // popstate + maybe hashchange listeners registered
    a.destroy();
    const after = (a as any).eventRemovers.length;
    expect(after).to.equal(0);
  });

  it('hashchange listener is not attached when trackHash=false', () => {
    const fetchStub: sinon.SinonStub = (global as any).fetch;
    fetchStub.resetHistory();
    const a = new (Analytics as any)(VALID_ID, { auto: true, trackHash: false });
    // Initial autoTrack may have pinged already, clear it:
    fetchStub.resetHistory();

    // Fire hashchange without changing URL
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    clock.tick(0);

    // No network call expected because hash listener is not bound
    expect(fetchStub.callCount).to.equal(0);

    a.destroy();
  });

  it('setTransport validates input and keeps previous transport on bad value', () => {
    const a = new (Analytics as any)(VALID_ID, { auto: false, transport: Transport.Fetch });
    const prev = a.transport;
    a.setTransport('bad' as any);
    expect(a.transport).to.equal(prev);
  });

  describe('transports — calls underlying implementation', () => {
    it('uses fetch when transport=Fetch', () => {
      const fetchStub: sinon.SinonStub = (global as any).fetch;
      const images: any[] = (global as any).__images;
      fetchStub.resetHistory();
      if (beaconStub && beaconStub.resetHistory) { beaconStub.resetHistory(); }
      images.length = 0;

      const a = new (Analytics as any)(VALID_ID, { auto: false, transport: Transport.Fetch });
      a.track();
      clock.tick(70);

      expect(fetchStub.callCount).to.equal(1);
      expect(images.length).to.equal(0);
      if (beaconStub) { expect(beaconStub.callCount).to.equal(0); }
    });

    it('uses navigator.sendBeacon when transport=Beacon and API exists', () => {
      const fetchStub: sinon.SinonStub = (global as any).fetch;
      const images: any[] = (global as any).__images;
      fetchStub.resetHistory();
      if (beaconStub && beaconStub.resetHistory) { beaconStub.resetHistory(); }
      images.length = 0;

      const a = new (Analytics as any)(VALID_ID, { auto: false, transport: Transport.Beacon });
      a.track();
      clock.tick(70);

      if (beaconStub) { expect(beaconStub.callCount).to.equal(1); }
      expect(fetchStub.callCount).to.equal(0);
      expect(images.length).to.equal(0);
    });

    it('falls back to fetch when transport=Beacon but sendBeacon is unavailable', () => {
      const fetchStub: sinon.SinonStub = (global as any).fetch;
      const images: any[] = (global as any).__images;
      fetchStub.resetHistory();
      images.length = 0;

      // simulate lack of Beacon support
      const nav: any = globalThis.navigator;
      if (beaconStub && beaconStub.restore) { beaconStub.restore(); }
      delete nav.sendBeacon;

      const a = new (Analytics as any)(VALID_ID, { auto: false, transport: Transport.Beacon });
      a.track();
      clock.tick(70);

      expect(fetchStub.callCount).to.equal(1);
      expect(images.length).to.equal(0);
    });

    it('uses Image when transport=Img', () => {
      const fetchStub: sinon.SinonStub = (global as any).fetch;
      const images: any[] = (global as any).__images;
      fetchStub.resetHistory();
      if (beaconStub && beaconStub.resetHistory) { beaconStub.resetHistory(); }
      images.length = 0;

      const a = new (Analytics as any)(VALID_ID, { auto: false, transport: Transport.Img });
      a.track();
      clock.tick(70);

      expect(images.length).to.equal(1);
      expect((images[0] as any).__src.includes('.gif?')).to.equal(true);
      expect(fetchStub.callCount).to.equal(0);
      if (beaconStub) { expect(beaconStub.callCount).to.equal(0); }
    });

    it('falls back to Image when transport=Fetch but fetch is unavailable', () => {
      const saved = (global as any).fetch;
      const images: any[] = (global as any).__images;
      images.length = 0;

      (global as any).fetch = undefined;
      const a = new (Analytics as any)(VALID_ID, { auto: false, transport: Transport.Fetch });
      a.track();
      clock.tick(70);

      expect(images.length).to.equal(1);
      expect((images[0] as any).__src.includes('.gif?')).to.equal(true);

      (global as any).fetch = saved;
    });
  });
});
