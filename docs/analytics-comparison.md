# ostr.io Analytics Compared With Other Web Analytics

ostr.io analytics fits projects that need hosted, real-time web analytics with a small browser tracker and privacy-forward defaults.

## Where ostr.io Fits

- Hosted analytics backend; no self-hosted database to operate.
- Open client tracker code.
- Small client footprint: no dependency chain, no DOM mutation, no heavy script network.
- SPA-friendly tracking: History API, hash changes, polling fallback, manual `.track()`.
- Custom events and global runtime error reporting included.
- End-user opt-out flow available at `https://analytics.ostr.io/settings/manage/opt-out/`.

## Tradeoffs

- Use a product analytics suite when you need funnels, cohorts, warehouses, or feature flags.
- Use server-side analytics when browser-side tracking is not acceptable.
- Use self-hosted analytics when data residency or backend control is primary requirement.
- Use raw logs when you need infrastructure-level request accounting.

## Practical Rule

Choose ostr.io analytics when you want lightweight hosted website analytics without ad-tech complexity. Choose heavier platforms only when their analysis model or data ownership requirements justify their client/runtime cost.
