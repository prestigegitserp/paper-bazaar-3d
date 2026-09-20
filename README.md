# Paper Bazaar 3D

نسخه فعلی: **v0.9.0**

یک prototype سه‌بعدی ماژولار برای بازار کاغذ ایران با React، TypeScript، Three.js و React Three Fiber. v0.8 علاوه بر فضای واقع‌گرای الهام‌گرفته از بازار تهران، اولین مغازه‌ی authored را به‌صورت GLB مستقل وارد pipeline می‌کند. تعامل‌ها به nodeهای نام‌دار GLB متصل‌اند، نوشته‌های داخلی فقط داخل Room فعال نمایش داده می‌شوند، و قرارداد World/Asset/Hotspot همچنان برای اسکن واقعی و backend آینده مستقل باقی مانده است.

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

## v0.9 — Charsou-inspired passage + authored detail pass

- فضای عمومی از brick-vault سنگین به corridor روشن‌تر با porcelain tile، پنل سفید، شیشه، فلز تیره و نور خطی منتقل شده است.
- آجر فقط به‌عنوان heritage accent محدود باقی مانده است.
- تابلوهای سردر، wayfinding، shelf label و price board از DOM overlay به `CanvasTexture` روی mesh واقعی تبدیل شده‌اند؛ بنابراین depth buffer آن‌ها را پشت geometry پنهان می‌کند.
- مدل authored به `iran-paper-authored-v2.glb` ارتقا یافته و جزئیات بیشتری مثل shelf lip، bundle strap، receipt printer، tape dispenser، pen cup، drawer/handle، CCTV، HVAC vent، outlet، cable trunk و price ticket دارد.
- public props تمیزتر شده‌اند: planter، bench و kiosk مدرن در ورودی؛ hand-cart و paper roll به لبه‌ی مسیر منتقل شده‌اند.
- API/CMS/World/Document/Scan contracts بدون coupling به skin جدید حفظ شده‌اند.

### اصل جدید برای نوشته‌های داخل World

UI روی HUD می‌تواند DOM باشد، اما هیچ نوشته‌ی محیطی داخل Canvas نباید با Drei `Html` ساخته شود. برای متن محیطی از `WorldTextPanel` یا texture/material واقعی استفاده می‌شود.

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
