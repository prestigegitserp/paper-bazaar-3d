# Paper Bazaar 3D

نسخه فعلی: **v0.14.0**

یک prototype سه‌بعدی ماژولار برای بازار کاغذ ایران با React، TypeScript، Three.js و React Three Fiber. v0.14 روی پایه‌ی تمام نسخه‌های قبل، رندر را activity-driven می‌کند، renderer فایل‌محور را code-split می‌کند و texture pipeline را به mixed-resolution PBR با ARM/AO ارتقا می‌دهد؛ بدون حذف جزئیات authored یا تغییر قراردادهای World/Catalog/Documents/Scan.

## اجرا

```bash
npm install
npm run dev
```

- Web: `http://localhost:5173`
- API: `http://localhost:8787/api/catalog`

## کنترل‌ها

| محیط | کنترل |
|---|---|
| Desktop | WASD / Mouse / Shift / E |
| Zoom desktop | Mouse wheel؛ داخل دوربین سه‌بعدی |
| Reset zoom | 0 |
| Reset position | R |
| Map | M |
| Quality | Q |
| Diagnostics | F3 |
| Mobile move | joystick سمت چپ |
| Mobile look | drag در نیمه راست |
| Mobile interact | E |
| Mobile zoom | pinch یا +/- |

## v0.14 — Demand Render + Packed Photoreal PBR

- Canvas بعد از ورود هم `frameloop="demand"` است؛ فقط هنگام حرکت، look، zoom، navigation، async asset/material update یا ورودی موبایل فریم بعدی درخواست می‌شود.
- bridge مستقل `renderWakeup` ورودی موبایل را بدون coupling به React Three Fiber بیدار می‌کند.
- distance streaming دیگر per-room `useFrame` ندارد؛ با تغییر player/activeRoom event-driven اجرا می‌شود و teleport از minimap را هم درست پوشش می‌دهد.
- `FileBackedRoom` با dynamic import از startup chunk جدا شده است. در شعاع preload، JS chunk و GLB bytes گرم می‌شوند؛ parse واقعی نزدیک room انجام می‌شود.
- authored shop در Cinematic از **2K albedo + 1K normal + 1K ARM** استفاده می‌کند. در v0.13 هر سه map نزدیک می‌توانستند 2K باشند.
- ARM بسته‌بندی‌شده همان texture را برای Roughness و AO مصرف می‌کند؛ اگر ARM در CDN موجود نباشد، سیستم خودکار به roughness-only 1K برمی‌گردد.
- `SurfaceMaterial` دیگر bumpMap را هم‌زمان با normalMap bind نمی‌کند؛ طبق رفتار Three.js آن مسیر مؤثر نبود.
- GLB generated حالا `TEXCOORD_1` هم (با همان UV accessor) صادر می‌کند تا AO compatibility صریح باشد.
- transparent gloss overlay بزرگ کف حذف شده؛ clearcoat/roughness خود PBR مسئول برق سطح است، بنابراین هم texture کمتر wash می‌شود هم overdraw کم می‌شود.
- StaticShadowController، instancing، GLB v3، bevel/cylinder، decals/labels، AgX، progressive loading، mobile controls، catalog/document و scan/server contracts همه حفظ شده‌اند.

Baseline v0.13 CI:
- main JS: **1,249.78 kB / 354.08 kB gzip**
- CatalogReader chunk: **4.75 kB / 1.69 kB gzip**
- authored GLB: **97,412 bytes**

جزئیات فنی: [docs/DEBUG_REPORT_V014.md](docs/DEBUG_REPORT_V014.md)

## اجرا و تست کاتالوگ

داخل هر مغازه به کاتالوگ روی میز نگاه کن و `E` یا کلیک بزن. در Reader:

- `← / →` ورق زدن
- `Esc` بستن
- روی کارت محصول کلیک کن تا منبع محصول باز شود
- موبایل به حالت single-page reader می‌رود

## Versioning

نسخه‌های milestone روی branchهای release نگه داشته می‌شوند:

```text
release/v0.3.0 … release/v0.13.0
main            → latest stable
```

milestoneهای پایدار روی `release/vX.Y.Z` snapshot می‌شوند؛ هر milestone پایدار بعد از CI و merge snapshot می‌شود. تاریخچه‌ی Git هم commitهای قبلی را نگه می‌دارد، بنابراین تغییر skin نسخه‌های قدیمی را حذف نمی‌کند.

جزئیات: [docs/VERSIONING.md](docs/VERSIONING.md)

## Deploy آخرین نسخه

Workflow: `.github/workflows/pages.yml`

یک‌بار در GitHub:

```text
Settings → Pages → Build and deployment → Source → GitHub Actions
```

بعد از آن، هر merge/push به `main` به‌طور خودکار آخرین نسخه را build/test/deploy می‌کند. اجرای دستی هم از:

```text
Actions → Deploy latest to GitHub Pages → Run workflow
```

ممکن است.

آدرس استاندارد:

```text
https://prestigegitserp.github.io/paper-bazaar-3d/
```

GitHub Pages نسخه static را با seed catalog اجرا می‌کند؛ Express/crawler برای host سروری جدا است.

جزئیات: [docs/DEPLOY.md](docs/DEPLOY.md)

## Digital Twin / Scan

Business data از World مستقل است. Room می‌تواند procedural یا GLB/scan باشد و collider/hotspot خودش را داشته باشد:

```ts
asset: {
  kind: 'scan',
  format: 'gltf',
  capture: 'lidar',
  url: 'models/vendor-x/room.glb',
  assetId: 'scan:vendor-x:room',
  version: '2026.09.20',
  metersPerUnit: 1
}
```

مدل اسکن واقعی باید runtime asset بهینه باشد؛ raw photo set یا point cloud چندگیگابایتی نباید داخل repository اپ commit شود.

- [docs/ASSET_PIPELINE.md](docs/ASSET_PIPELINE.md)
- [docs/ASSET_CREDITS.md](docs/ASSET_CREDITS.md)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/DEBUGGING.md](docs/DEBUGGING.md)
- [docs/MOBILE.md](docs/MOBILE.md)
- [CHANGELOG.md](CHANGELOG.md)
