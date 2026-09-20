# Paper Bazaar 3D

نسخه فعلی: **v0.5.0**

یک prototype سه‌بعدی ماژولار برای بازار کاغذ ایران با React، TypeScript، Three.js و React Three Fiber. در v0.5 طراحی از سالن نمایشگاهی فاصله گرفته و به یک راسته‌ی فشرده‌تر با حال‌وهوای مغازه‌های کاغذ و نوشت‌افزار مرکز تهران نزدیک شده است؛ این یک بازسازی دقیق مکانی نیست، بلکه skin مفهومی برای تجربه و تست Digital Twin است.

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

## v0.5

- ۶ مغازه/فضا به‌جای ۴ غرفه.
- skin جدید با سقف طاقی، رنگ‌های آجری/گچی، تابلوهای فارسی، سایه‌بان و قفسه‌های متراکم.
- فروشنده‌ی سراج سلولز به catalog افزوده شده؛ قیمت عمومی برخی اقلام به‌صورت «استعلام» نمایش داده می‌شود.
- یک اتاق مستقل برای اولین اسکن واقعی حفظ شده است.
- Wheel/Pinch دیگر layout سایت را zoom نمی‌کند و FOV دوربین را تغییر می‌دهد.
- کنترل کامل لمس برای گوشی.
- گوشی و دستگاه‌های coarse-pointer به‌طور پیش‌فرض Balanced هستند.
- instancing برای بخش‌های تکراری و حذف reflection سنگین جهت کاهش draw cost.

## Versioning

نسخه‌های milestone روی branchهای release نگه داشته می‌شوند:

```text
release/v0.3.0
release/v0.4.0
main            → latest stable
```

بعد از تثبیت v0.5 نیز `release/v0.5.0` ساخته می‌شود. تاریخچه‌ی Git هم commitهای قبلی را نگه می‌دارد، بنابراین تغییر skin نسخه‌های قدیمی را حذف نمی‌کند.

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
