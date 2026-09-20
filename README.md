# Paper Bazaar 3D

نسخه فعلی: **v0.13.0**

یک prototype سه‌بعدی ماژولار برای بازار کاغذ ایران با React، TypeScript، Three.js و React Three Fiber. v0.13 روی پایه‌ی v0.12 دو ارتقای هم‌زمان دارد: هزینه‌ی static scene پایین‌تر با shadow event-driven، raycast محدود و نورپردازی پوششی؛ و texture واقعی‌تر با 2K نزدیک و micro-detail بدون شبکه. قراردادهای World/Catalog/Documents/Scan دست‌نخورده‌اند.

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

## v0.13 — Photoreal Texture + Static-Scene Performance

- shadow map در Cinematic دیگر هر frame regenerate نمی‌شود؛ فقط در start/quality/asset-load refresh می‌شود.
- meshهای authored که interaction ندارند از raycast حذف و matrix محلی‌شان freeze می‌شود.
- distance probe فایل‌های GLB هر 10 frame اجرا می‌شود و از squared-distance استفاده می‌کند.
- ظاهر 13 چراغ سقفی حفظ شده اما point light واقعی فقط هر سومین fixture است؛ پوشش نور با intensity/range تنظیم شده است.
- authored shop نزدیک در Cinematic از PBR 2K استفاده می‌کند؛ اگر CDN 2K fail شود خودکار به 1K fallback می‌کند.
- پاساژ و دید دور همچنان 1K progressive باقی می‌ماند تا startup سنگین نشود.
- micro-bump 128px procedural و cache‌شده روی PBR واقعی اضافه می‌شود؛ network request جدید ندارد.
- micro-detail روی procedural materials و authored GLB هر دو اعمال می‌شود.
- GLB v3، UV، bevel، decals، labels، AgX، environment reflections، progressive loading، instancing و تمام interaction/collision contracts حفظ شده‌اند.

جزئیات فنی: [docs/DEBUG_REPORT_V013.md](docs/DEBUG_REPORT_V013.md)

## اجرا و تست کاتالوگ

داخل هر مغازه به کاتالوگ روی میز نگاه کن و `E` یا کلیک بزن. در Reader:

- `← / →` ورق زدن
- `Esc` بستن
- روی کارت محصول کلیک کن تا منبع محصول باز شود
- موبایل به حالت single-page reader می‌رود

## Versioning

نسخه‌های milestone روی branchهای release نگه داشته می‌شوند:

```text
release/v0.3.0 … release/v0.12.0
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
