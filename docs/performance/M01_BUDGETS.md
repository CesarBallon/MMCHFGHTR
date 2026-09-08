# M01 performance budgets

Status: enforced in CI

## Baseline measurements

Measurements use the canonical `dist/` tree at merge commit `291d703d0a7a1958639bcd164b80dc08c5a0054e`.

| Area | Measured | CI ceiling |
| --- | ---: | ---: |
| Complete public `dist/` | 100.13 MiB | 105 MiB |
| Fighter images | 50.79 MiB | 55 MiB |
| Audio | 46.24 MiB | 50 MiB |
| Stages | 2.04 MiB | 3 MiB |
| UI images | 1.01 MiB | 2 MiB |
| HTML/CSS/JavaScript shell | 49.63 KiB | 100 KiB |
| Deterministic simulation | 20,000 frames | 2,000 ms |
| Browser boot to playable title | measured per CI run | 60,000 ms |
| Browser startup transfer | measured per CI run | 70 MiB |
| Render-frame interval, p95 | measured over 120 frames | 50 ms |
| Chromium used JavaScript heap | measured when exposed | 256 MiB |

The static checks are deterministic byte ceilings. CPU, rendering, loading, and JavaScript-heap ceilings intentionally include CI variance and are regression guards rather than minimum-device certification.

Decoded image memory and GPU allocation are not exposed consistently by the browser Performance API. They remain an explicit M2 profiling task on the agreed minimum device; M01 enforces Chromium's available JavaScript-heap measurement without presenting it as total process memory.

## Commands

```sh
npm run test:performance
npm run test:browser
```

Any intentional budget increase requires measurements, rationale, and review in the pull request that changes the ceiling.
