# Paper Bazaar 3D

یک prototype سه‌بعدی ماژولار برای بازار عمده‌فروشان کاغذ، ساخته‌شده با React، TypeScript، Three.js و React Three Fiber.

نسخه فعلی: **v0.4.0**

هدف پروژه فقط ساخت یک پاساژ سه‌بعدی نیست. ساختار از ابتدا برای رشد به سمت **Digital Twin** طراحی شده: داده فروشنده و محصول، World/Room، asset سه‌بعدی، collision، hotspot و crawler از هم جدا هستند تا بعداً بتوان یک غرفه procedural را با GLB، photogrammetry یا LiDAR جایگزین کرد بدون اینکه منطق تجاری یا UI بازنویسی شود.

> طراحی غرفه‌ها مفهومی است و نمایندگی یا هویت بصری رسمی فروشندگان نیست. قیمت‌ها snapshot دمو هستند و برای معامله باید در منبع اصلی استعلام شوند.

## سریع اجرا کن

نیازمندی: Node.js `20.19+` یا `22+`.

```bash
npm install
npm run dev
```

- Web: `http://localhost:5173`
- API: `http://localhost:8787/api/catalog`
- Health: `http://localhost:8787/api/health`

کنترل‌ها:

| کلید | کار |
|---|---|
| WASD / Arrow | حرکت |
| Mouse | نگاه |
| Shift | حرکت سریع |
| E / Click | تعامل |
| R | بازگشت به ورودی |
| M | نقشه |
| Q | Cinematic / Balanced |
| F3 | Runtime diagnostics |
| Esc | آزاد کردن موس |

## چه چیزهایی در v0.4 بهتر شده؟

- کف مرکزی reflective در حالت Cinematic و fallback سبک‌تر در Balanced.
- معماری سقف، نورهای خطی، تابلوهای راه‌یابی و portal نورانی غرفه‌ها.
- حرکت با acceleration/deceleration، head-bob و FOV نرم هنگام دویدن.
- mini-map قابل کلیک برای رفتن سریع به غرفه.
- تشخیص اینکه بازیکن در کدام Room قرار دارد.
- halo تعاملی برای hotspot هدف.
- diagnostics داخلی برای draw calls، triangles، geometries، textures و asset errors.
- asset-level Error Boundary برای اینکه خرابی یک GLB کل پاساژ را crash نکند.

## معماری

```text
Business domain              Spatial world                   Runtime
Catalog                      WorldDefinition                 R3F / Three.js
├─ Vendor                    ├─ Room                         ├─ Player
└─ Product                   │  ├─ Asset                     ├─ Interaction
                             │  ├─ Hotspot                   ├─ Collision
Crawler/API  ─────────────▶  │  ├─ Collider                  └─ Diagnostics
                             │  └─ Entry / Footprint
                             └─ Bounds
```

قانون مهم: **Vendor هیچ مختصات سه‌بعدی ندارد.** مختصات، asset، collider و hotspot متعلق به World هستند.

## مسیر GLB و Scan

Room امروز می‌تواند procedural باشد:

```ts
asset: {
  kind: 'procedural',
  renderer: 'paper-booth-v1',
  assetId: 'procedural:vendor-x',
  version: '1.0.0',
  metersPerUnit: 1
}
```

و فردا بدون تغییر Catalog تبدیل شود به:

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

Hotspotهای scan بهتر است `point` باشند و در مختصات محلی Room ذخیره شوند. Colliderها نیز مستقل از renderer هستند؛ بنابراین mesh واقعی می‌تواند collider سبک‌شده خودش را داشته باشد.

راهنمای دقیق pipeline: [`docs/ASSET_PIPELINE.md`](docs/ASSET_PIPELINE.md)

## تست و build

```bash
npm test
npm run build
```

یا:

```bash
npm run check
```

GitHub Actions همین تست و production build را برای Pull Request و `main` اجرا می‌کند.

## دمو روی GitHub Pages

Workflow آماده در `.github/workflows/pages.yml` است.

برای اولین بار در GitHub برو به:

```text
Settings → Pages → Build and deployment → Source → GitHub Actions
```

بعد از merge/push روی `main`، workflow نسخه static را build و deploy می‌کند. آدرس استاندارد این repo:

```text
https://prestigegitserp.github.io/paper-bazaar-3d/
```

در GitHub Pages بک‌اند Express اجرا نمی‌شود؛ دمو عمداً با seed catalog اجرا می‌شود. برای production با API/crawler، frontend را می‌توان روی Vercel/Cloudflare Pages و API را روی یک Node host یا serverless backend قرار داد.

## نکته درباره asset path

برای سازگاری با GitHub Pages، فایل GLB را با URL نسبی تعریف کن:

```ts
url: 'models/vendor-x/room.glb'
```

نه:

```ts
url: '/models/vendor-x/room.glb'
```

`resolveAssetUrl()` آن را با `BASE_URL` محیط deploy ترکیب می‌کند.

## اسناد

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/ASSET_PIPELINE.md`](docs/ASSET_PIPELINE.md)
- [`docs/DATA_INGESTION.md`](docs/DATA_INGESTION.md)
- [`docs/DIGITAL_TWIN_ROADMAP.md`](docs/DIGITAL_TWIN_ROADMAP.md)
- [`docs/DEBUGGING.md`](docs/DEBUGGING.md)
- [`CHANGELOG.md`](CHANGELOG.md)

## مرحله بعدی پیشنهادی

به‌جای بزرگ‌تر کردن procedural scene، یک غرفه واقعی را به GLB تبدیل می‌کنیم و این مسیر را end-to-end تست می‌کنیم:

`capture → cleanup → optimization → asset metadata → collider → point hotspots → streaming`

بعد از آن Admin/Hotspot Editor ارزش ساخت دارد.
