# Asset and scan pipeline

## هدف

یک اسکن واقعی نباید فقط «فایل سه‌بعدی قابل نمایش» باشد. برای Digital Twin باید identity، scale، origin، collision، hotspot و version پایدار داشته باشد.

## قرارداد asset

هر asset حداقل باید این metadata را داشته باشد:

- `assetId`: شناسه پایدار که با rename فایل عوض نشود.
- `version`: نسخه asset برای cache invalidation و rollback.
- `metersPerUnit`: نسبت واحد فایل به متر.
- `kind`: procedural / gltf / scan.
- `url`: برای assetهای فایل‌محور.
- `capture`: برای scan، روش capture مثل LiDAR یا photogrammetry.

## pipeline پیشنهادی

```text
Capture
  ↓
Raw point cloud / photos / LiDAR
  ↓
Alignment + cleanup
  ↓
Mesh / reconstruction
  ↓
Decimation + texture bake
  ↓
GLB + compressed textures
  ↓
Scale/origin validation
  ↓
Collider authoring
  ↓
Hotspot authoring
  ↓
Asset registry / CDN
```

## Coordinate system

قبل از ورود asset، یک origin ثابت تعریف کن؛ مثلاً مرکز کف ورودی Room. مدل باید تا حد ممکن با Y-up و واحد متر normalize شود. جبران scale یا rotation اضطراری باید metadata باشد، نه transformهای پراکنده داخل componentها.

## Collision

Renderer و collider دو چیز جدا هستند. mesh اسکن می‌تواند میلیون‌ها triangle داشته باشد اما collider باید ساده باشد. `RoomDefinition.colliders` فعلاً box/circle سبک دارد؛ بعداً می‌تواند به navmesh یا physics collider reference توسعه پیدا کند.

## Hotspot

برای scan از mesh index یا triangle index خام به‌عنوان identity تجاری استفاده نکن. export مجدد مدل ممکن است topology را عوض کند. در نسخه فعلی `point` anchor پایدارتر است. در آینده می‌توان `node` anchor برای nodeهای نام‌دار GLTF اضافه کرد.

## Error isolation

هر Room داخل `RoomAssetBoundary` است. failure در decode/load یک asset باید فقط همان Room را به fallback تبدیل کند و در F3 ثبت شود، نه اینکه کل React tree crash کند.

## Performance budget پیشنهادی برای شروع

- یک GLB مستقل برای هر Room.
- texture atlas محدود و power-of-two.
- نسخه desktop و در صورت نیاز LOD سبک‌تر.
- collision ساده مستقل از render mesh.
- hotspot JSON مستقل از فایل binary.

اعداد دقیق triangle/texture budget باید بعد از تست روی دستگاه‌های هدف تعیین شود؛ از یک عدد ثابت برای همه اسکن‌ها استفاده نکن.
