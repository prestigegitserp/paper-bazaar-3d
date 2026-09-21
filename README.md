# Paper Bazaar 3D

نسخه فعلی: **v0.13.0**

یک prototype سه‌بعدی ماژولار برای بازار کاغذ ایران با React، TypeScript، Three.js و React Three Fiber. v0.13 جدید مستقیماً از release/v0.12.0 بازسازی شده و دو هدف دارد: سرعت بالاتر در صحنه‌ی تقریباً ثابت و تکسچر/جنس واقعی‌تر در نمای نزدیک، بدون حذف دستاوردهای World/Catalog/Documents/Scan و authored GLB v3.

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

## v0.13 — Photoreal Performance Rebuild

این نسخه **از release/v0.12.0** ساخته شده و v0.13/v0.14/v0.15 آزمایشی قبلی مبنای آن نیستند.

### Performance
- shadow map سینمایی برای صحنه‌ی ثابت event-driven شده و هر فریم دوباره render نمی‌شود.
- پنل‌های سقف، چراغ‌های قابل‌دیدن و ستون‌های تکراری با instancing رسم می‌شوند.
- subdivision بی‌استفاده‌ی کف حذف شده؛ ظاهر و UV material عوض نشده است.
- هر 13 fixture سقف دیده می‌شود، اما فقط هر سومین fixture یک PointLight واقعی دارد.
- probe فاصله‌ی GLB هر 10 فریم و با squared-distance انجام می‌شود.
- transformهای authored ثابت freeze می‌شوند.
- diagnostics فقط وقتی F3 باز است frame callback دارد.
- store موقعیت بازیکن هنگام سکون بی‌جهت update نمی‌شود.
- texture decode مسیر ImageBitmap دارد و GPU uploadها در idle window سریالی warm می‌شوند.
- هنگام حرکت/چرخش دوربین فقط pixel ratio موقتاً regress می‌شود و بعد از توقف به fidelity کامل برمی‌گردد.
- shader variantها در idle با compileAsync گرم می‌شوند تا hitch ناشی از compile دیرهنگام کمتر شود.
- PMREM فقط هنگام start ساخته می‌شود؛ تغییر Quality دیگر environment را از صفر regenerate نمی‌کند.

### Texture / material realism
- PBR پایه همچنان 1K و progressive است.
- روی سیستم دسکتاپ مناسب در Cinematic، سطوح high-value و authored room اجازه‌ی 2K دارند.
- هر درخواست 2K در صورت خطا خودکار به 1K برمی‌گردد.
- micro normal مستقل برای clearcoat سطوح صیقلی اضافه شده است.
- کاغذ و مقوا micro bump + roughness اختصاصی دارند تا در نمای نزدیک تخت دیده نشوند.
- fiber albedo محلی و deterministic برای paper/cardboard روی UV واقعی GLB اضافه شده تا رنگ سطح کاملاً تخت نباشد.
- micro roughness در فاز albedo-only فاصله‌ی بین fallback و full PBR را بدون network asset اضافی پر می‌کند.
- normal واقعی PBR با bump جعلی overwrite نمی‌شود؛ کانال‌های detail با مسیر فیزیکی سازگار استفاده می‌شوند.
- AgX، PMREM، decals، fingerprints، UV، bevel و cylinderهای v0.11/v0.12 حفظ شده‌اند.

### Interaction safety
- بهینه‌سازی raycast فقط برای batchهای تزئینی ریز اعمال می‌شود.
- دیوار، قفسه و سطوح ساختاری همچنان occluder هستند؛ تعامل از پشت دیوار دوباره ایجاد نمی‌شود.

جزئیات فنی: [docs/DEBUG_REPORT_V013_REBUILD.md](docs/DEBUG_REPORT_V013_REBUILD.md) و [docs/DEBUG_REPORT_V013_DEEP_PERF.md](docs/DEBUG_REPORT_V013_DEEP_PERF.md)

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
release/v0.13.0 → snapshot پایدار v0.13 پس از CI نهایی
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
