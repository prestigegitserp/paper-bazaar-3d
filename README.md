# Paper Bazaar 3D

نسخه فعلی: **v0.7.0**

یک prototype سه‌بعدی ماژولار برای بازار کاغذ ایران با React، TypeScript، Three.js و React Three Fiber. v0.7 یک visual pass واقع‌گراتر با الهام از راسته‌های بازار تهران و فضای مغازه‌های محدوده ۱۵ خرداد است: راهروی باریک‌تر، طاق آجری، کف فرسوده، کرکره فلزی، پیشخوان شیشه‌ای، قفسه‌های متراکم تا سقف و PBR واقعی. این نسخه بازسازی دقیق یک پلاک یا راسته مشخص نیست و معماری ماژولار Digital Twin نسخه‌های قبلی را حفظ می‌کند.

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

## v0.7 — 15 Khordad-inspired realism

- راهرو از حالت نمایشگاهی خارج شده و به راسته‌ای باریک‌تر با طاق نیم‌استوانه آجری، پایه‌های آجری و چراغ‌های فلورسنت نزدیک شده است.
- ۶ مغازه profile مستقل دارند اما همه از زبان مشترک بازار تهران استفاده می‌کنند: قاب فلزی، کرکره باز/نیمه‌باز، تابلو فارسی، پیشخوان شیشه‌ای و قفسه متراکم.
- PBR Registry جدید برای آجر فرسوده، گچ قدیمی، کف ساییده، کرکره رنگ‌شده و plywood.
- PBRهای 1K از Poly Haven با مجوز CC0 در runtime لود می‌شوند؛ اگر CDN/CORS قطع باشد fallback procedural فعال می‌ماند.
- در Cinematic علاوه بر albedo، normal و roughness هم لود می‌شوند؛ Balanced از albedo + fallback سبک‌تر استفاده می‌کند.
- hand cart، کارتن‌های انبار، چهارپایه، رول کاغذ و دوچرخه به راسته اضافه شده‌اند و planterهای نمایشگاهی حذف شده‌اند.
- fixtureها به فایل‌های مستقل StockWall / ShopCounter / ProductDisplays / MarketProps شکسته شده‌اند تا توسعه فروشگاه‌های بعدی تمیز بماند.
- Scan/GLB، hotspotهای semantic، Catalog Reader و Runtime Repository layer بدون تغییر بنیادی حفظ شده‌اند.

> ظاهر v0.7 از ویژگی‌های عمومی و تصاویر مرجع بازار تهران/۱۵ خرداد الهام گرفته است؛ ادعای بازسازی دقیق مکانی ندارد.

## اجرا و تست کاتالوگ

داخل هر مغازه به کاتالوگ روی میز نگاه کن و `E` یا کلیک بزن. در Reader:

- `← / →` ورق زدن
- `Esc` بستن
- روی کارت محصول کلیک کن تا منبع محصول باز شود
- موبایل به حالت single-page reader می‌رود

## Versioning

نسخه‌های milestone روی branchهای release نگه داشته می‌شوند:

```text
release/v0.3.0
release/v0.4.0
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
