# Paper Bazaar 3D

نسخه فعلی: **v0.12.0**

یک prototype سه‌بعدی ماژولار برای بازار کاغذ ایران با React، TypeScript، Three.js و React Three Fiber. v0.12 ظاهر و جزئیات v0.11 را حفظ می‌کند و فقط pipeline بارگذاری/رندر را سبک‌تر می‌کند: progressive GLB streaming، staged PBR، texture residency مشترک، instancing و deferred GPU work؛ بدون تغییر قراردادهای World/Catalog/Documents/Scan.

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

## v0.12 — Progressive Loading بدون افت کیفیت

- فایل‌های GLB دوردست در startup دانلود/decode نمی‌شوند؛ در فاصله 24 متر preload و در 18 متر reveal می‌شوند.
- هنگام load شدن file-backed room، یک Booth proxy سبک داخل Suspense محلی می‌ماند تا کل World هرگز blank نشود.
- meshهای تکراری و non-interactive مدل authored به `InstancedMesh` تبدیل می‌شوند؛ hotspotهای semantic دست‌نخورده باقی می‌مانند.
- PBR variantهای یکسان ref-count/share می‌شوند و ساخت texture setها حداکثر دو مورد هم‌زمان است.
- در شروع فقط سطح‌های critical پاساژ real albedo می‌گیرند؛ mapهای کامل normal/roughness بعد از ورود و idle time فعال می‌شوند.
- PMREM reflection، floor imperfection، SoftShadows و shadow-map کامل قبل از ورود ساخته نمی‌شوند.
- Catalog Reader با dynamic import فقط در اولین interaction کاتالوگ دانلود می‌شود.
- قبل از ورود Canvas در demand mode و DPR سبک‌تر است؛ پس از ورود همان کیفیت Cinematic/Balanced قبلی برمی‌گردد.
- GLB v3، UV، bevel، decals، PBR، AgX، interactionها، mobile controls، collision و تمام contractهای scan/server بدون حذف باقی مانده‌اند.

Baseline قبل از این pass (v0.11 CI): main JS = 1,247.22 kB / 352.51 kB gzip و authored GLB = 97,412 bytes.

جزئیات فنی: [docs/DEBUG_REPORT_V012.md](docs/DEBUG_REPORT_V012.md)

## اجرا و تست کاتالوگ

داخل هر مغازه به کاتالوگ روی میز نگاه کن و `E` یا کلیک بزن. در Reader:

- `← / →` ورق زدن
- `Esc` بستن
- روی کارت محصول کلیک کن تا منبع محصول باز شود
- موبایل به حالت single-page reader می‌رود

## Versioning

نسخه‌های milestone روی branchهای release نگه داشته می‌شوند:

```text
release/v0.3.0 … release/v0.11.0
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
