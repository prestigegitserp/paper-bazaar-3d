# Paper Bazaar 3D

دموی ماژولار یک پاساژ سه‌بعدی برای عمده‌فروشان کاغذ ایران، با React، TypeScript، Three.js و React Three Fiber. هدف نسخه `0.3.0` فقط نمایش یک صحنه نیست؛ معماری پروژه عمداً طوری جدا شده که بعداً بتوان غرفه‌های procedural را با GLB/GLTF، اسکن LiDAR/photogrammetry و اتاق‌های Digital Twin جایگزین کرد، بدون اینکه مدل داده‌ی فروشنده، محصولات یا crawler به هندسه‌ی سه‌بعدی وابسته شود.

> این پروژه نمونه‌ی فنی مستقل است. نام و URL فروشندگان از صفحات عمومی وب برای دمو استفاده شده‌اند؛ طراحی غرفه‌ها مفهومی است و هویت بصری یا تأیید رسمی هیچ فروشنده‌ای محسوب نمی‌شود. قیمت‌ها snapshot هستند و قبل از معامله باید در منبع اصلی بررسی شوند.

## وضعیت فعلی

- پاساژ سه‌بعدی با ۴ غرفه‌ی مفهومی، نورپردازی، دکور و mini-map.
- حرکت First-person با `WASD`، Mouse و `Shift`.
- Pointer Lock، interaction با crosshair و کلید `E` یا کلیک.
- میز مدیریت، price board و product pedestal با hotspot مستقل.
- collision برای مرز پاساژ، مبلمان و دکور اصلی.
- Catalog مستقل از World: فروشنده و محصول دیگر مختصات یا رنگ غرفه را حمل نمی‌کنند.
- World schema مستقل شامل Room، Asset، Transform، Hotspot و Collider.
- `RoomRenderer` برای تعویض renderer هر اتاق؛ procedural و GLTF از همین حالا مسیر جدا دارند.
- API ساده‌ی Express با fallback به seed catalog.
- crawler آزمایشی با Source Adapter registry و parser قابل تست.
- GitHub Actions برای تست و build.
- عمداً بدون Docker در این مرحله.

## اجرا

نیازمندی: Node.js `20.19+` یا Node.js `22+`.

```bash
npm install
npm run dev
```

سپس:

- Web: `http://localhost:5173`
- API: `http://localhost:8787/api/catalog`
- Health: `http://localhost:8787/api/health`

برای تست و build:

```bash
npm test
npm run build
```

یا:

```bash
npm run check
```

تا زمانی که اولین `npm install` موفق انجام نشده، `package-lock.json` در repository وجود ندارد. بعد از install موفق بهتر است lockfile commit شود و CI از `npm install` به `npm ci` تغییر کند.

## کنترل‌ها

| کنترل | عملکرد |
|---|---|
| `W A S D` / Arrow keys | حرکت |
| Mouse | نگاه |
| `Shift` | حرکت سریع |
| `E` یا Left Click | تعامل با hotspot زیر crosshair |
| `M` | نمایش/مخفی‌کردن نقشه |
| `Esc` | خروج از Pointer Lock |

## اصل معماری

سه لایه‌ای که نباید دوباره با هم مخلوط شوند:

```text
Business data                 Spatial world                  Runtime engine
Catalog                       WorldDefinition                Three.js / R3F
├─ Vendor                     ├─ Room                        ├─ renderer
└─ Product                    │  ├─ Transform                ├─ collision
                              │  ├─ Asset                    ├─ interaction
Crawler / API  ───────────▶   │  ├─ Theme                    └─ player controller
                              │  └─ Hotspot
                              └─ World bounds
```

در نسخه‌ی قبلی `Vendor` شامل `boothSide` و `boothZ` بود. در `0.3.0` این coupling حذف شده است. به همین دلیل یک فروشنده می‌تواند در چند World یا چند نمایشگاه حضور داشته باشد و یک Room هم می‌تواند asset خود را از procedural geometry به GLTF یا scan تغییر دهد، بدون تغییر Catalog.

جزئیات بیشتر: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

## ساختار پروژه

```text
src/
  domain/
    catalog.ts              # Vendor / Product / Catalog
    interaction.ts          # قرارداد interaction مستقل از renderer
  data/catalog/
    catalogClient.ts        # دریافت Catalog از API
    seedCatalog.ts          # fallback snapshot
  world/
    types.ts                # World / Room / Asset / Hotspot schema
    demoWorld.ts            # layout فعلی پاساژ
    hotspots.ts             # تبدیل hotspot به interaction runtime
  engine/
    collision.ts            # collision محاسباتی مستقل از React
    interactions.ts         # raycast interaction helpers
  components/
    MallScene.tsx           # shell صحنه و فضاهای عمومی
    RoomRenderer.tsx        # انتخاب renderer بر اساس asset اتاق
    Booth.tsx               # procedural paper booth v1
    PlayerController.tsx    # FPS controller
    HUD.tsx                 # UI و minimap
server/
  catalog.mjs               # validation + live/seed fallback
  scrape.mjs                # orchestration بروزرسانی قیمت
  crawling/
    fetch-html.mjs          # network boundary
    source-registry.mjs     # registry adapterها
    generic-html-adapter.mjs
  data/catalog.seed.json    # business-data snapshot
```

## Room و Asset

هر غرفه در `src/world/demoWorld.ts` یک `RoomDefinition` است. امروز:

```ts
asset: {
  kind: 'procedural',
  renderer: 'paper-booth-v1'
}
```

بعداً همان Room می‌تواند بدون تغییر Vendor/Product چنین شود:

```ts
asset: {
  kind: 'gltf',
  url: '/assets/rooms/vendor-x.glb',
  scale: 1
}
```

یا برای pipeline اسکن:

```ts
asset: {
  kind: 'scan',
  format: 'gltf',
  url: '/assets/scans/room-12.glb'
}
```

`RoomRenderer` مسیر GLTF را از همین حالا پشتیبانی می‌کند. برای assetهای واقعی، hotspotها بهتر است با `anchor.kind = 'point'` در مختصات محلی اتاق ذخیره شوند. این همان قراردادی است که بعداً Admin/Hotspot Editor می‌تواند تولید کند.

Gaussian Splatting در schema به‌عنوان مسیر آینده شناخته شده، اما renderer آن هنوز فعال نشده و نباید قبل از تصمیم درباره‌ی library، budget حافظه و fallback موبایل وارد production شود.

## داده و قیمت

source of truth دموی Catalog:

```text
server/data/catalog.seed.json
```

frontend همان JSON را به‌عنوان fallback bundle می‌کند. در runtime ابتدا `/api/catalog` خوانده می‌شود؛ اگر API در دسترس نباشد UI از seed استفاده می‌کند و وضعیت fallback را نشان می‌دهد.

برای بروزرسانی آزمایشی:

```bash
npm run refresh:prices
```

خروجی در فایل git-ignored زیر نوشته می‌شود:

```text
server/data/catalog.live.json
```

Crawler عمداً محافظه‌کار است: اگر قیمت قابل اتکا پیدا نشود، مقدار قبلی را حدس نمی‌زند. هر Product یکی از وضعیت‌های `updated`، `seed-fallback` یا `fetch-failed` می‌گیرد.

## Source Adapterها

منطق scraping از loop اصلی جدا شده است. `server/crawling/source-registry.mjs` نقطه‌ی ثبت adapterهاست. امروز یک adapter عمومی HTML/WooCommerce وجود دارد؛ برای production بهتر است هر دامنه‌ای که ارزش تجاری دارد adapter اختصاصی، fixture HTML و test خود را داشته باشد.

مثال مسیر رشد:

```text
source-registry
├─ iranpapernet adapter
├─ kaghazforoush adapter
├─ mellat adapter
├─ kaghaz20 adapter
└─ generic fallback
```

قبل از crawl تجاری باید Terms of Service، `robots.txt`، نرخ درخواست و اجازه‌ی استفاده از داده برای هر منبع بررسی شود.

جزئیات: [`docs/DATA_INGESTION.md`](docs/DATA_INGESTION.md)

## مسیر Digital Twin

ترتیب پیشنهادی توسعه:

1. اضافه‌کردن GLB واقعی یک غرفه و point hotspotهای آن.
2. ساخت `AssetRegistry` و metadata شامل نسخه، checksum و LOD.
3. lazy load/unload اتاق‌ها بر اساس فاصله و visibility.
4. جایگزینی colliderهای procedural با colliderهای تولیدشده/author شده برای هر asset.
5. ساخت Admin/Hotspot Editor برای قرار دادن hotspot بدون کدنویسی.
6. pipeline اسکن: capture → cleanup → optimization → GLB/KTX2/Meshopt → validation.
7. انتقال Catalog/WorldDefinition به backend و object storage.
8. در صورت نیاز، WebSocket/MQTT برای telemetry و Digital Twin زنده.

جزئیات: [`docs/DIGITAL_TWIN_ROADMAP.md`](docs/DIGITAL_TWIN_ROADMAP.md)

## ملاحظات production

این نسخه هنوز prototype است. قبل از production جدی باید performance budget، mobile controls، accessibility، asset compression، loading UX، error telemetry، authentication/authorization برای پنل مدیریت، rate limiting، database migrations، crawler scheduling و تست end-to-end اضافه شوند.
