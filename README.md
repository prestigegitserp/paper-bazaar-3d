# Paper Bazaar 3D

نسخه فعلی: **v0.6.0**

یک prototype سه‌بعدی ماژولار برای بازار کاغذ ایران با React، TypeScript، Three.js و React Three Fiber. در v0.6 پروژه از یک skin واحد عبور کرده و به یک Retail Experience Platform داده‌محور نزدیک شده است: هر مغازه profile مستقل، متریال و fixture متفاوت، نمونه‌های کاغذ و کاتالوگ تعاملی دارد؛ World/Catalog/Documents هم از repositoryهای قابل‌تعویض لود می‌شوند تا مهاجرت آینده به API، CMS یا سرور ساده بماند.

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

## v0.6

- ۶ profile بصری متفاوت برای مغازه‌ها: modern gallery، warehouse، editorial library، bright retail، heritage warehouse و scan lab.
- Surface Registry procedural برای plaster، wood، brick، terrazzo، paper، fabric و brushed metal با map/bump/roughness مستقل.
- fixtureهای ماژولار: دیوار نمونه کاغذ، رول‌رک، pallet، book wall، pegboard، acrylic display، قاب نمونه چاپ و swatch fan.
- کاتالوگ سه‌بعدی روی میز هر فروشنده؛ کلیک روی آن Reader دوصفحه‌ای باز می‌کند و صفحات محصولات، نمونه رنگ/کاغذ و اطلاعات فروشنده را ورق می‌زند.
- interaction جدید `document` مستقل از mesh و renderer.
- Runtime Repository layer برای `Catalog + World + Documents`؛ فعلاً seed/API فعلی، بعداً قابل جایگزینی با backend/CMS.
- HUD/mini-map/diagnostics دیگر مستقیم به `demoWorld` وابسته نیستند و World را از runtime state می‌گیرند.
- Scan/GLB path حفظ شده و profileهای procedural فقط یکی از rendererهای قابل تعویض باقی مانده‌اند.

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

milestoneهای پایدار روی `release/vX.Y.Z` snapshot می‌شوند؛ v0.6 نیز بعد از CI و merge snapshot خواهد شد. تاریخچه‌ی Git هم commitهای قبلی را نگه می‌دارد، بنابراین تغییر skin نسخه‌های قدیمی را حذف نمی‌کند.

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
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/DEBUGGING.md](docs/DEBUGGING.md)
- [docs/MOBILE.md](docs/MOBILE.md)
- [CHANGELOG.md](CHANGELOG.md)
