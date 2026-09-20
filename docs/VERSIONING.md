# Versioning

## Policy

- `main`: آخرین نسخه پایدار و منبع deploy production demo.
- `feat/*`: توسعه و PR.
- `release/vX.Y.Z`: snapshot خوانا و immutable از milestone پایدار.

## Snapshotهای موجود در GitHub

در زمان آماده‌سازی v0.12، این release branchها واقعاً در repository وجود دارند:

- `release/v0.3.0`
- `release/v0.4.0`
- `release/v0.5.0`
- `release/v0.6.0`
- `release/v0.7.0`
- `release/v0.8.0`
- `release/v0.9.0`
- `release/v0.10.0`
- `release/v0.11.0`

`v0.1` و `v0.2` قبل از release-snapshot policy فعلی ساخته شدند و branch مستقل `release/v0.1.0` یا `release/v0.2.0` در GitHub ندارند. بنابراین نباید ادعا شود که تمام نسخه‌ها از v0.1 به بعد به‌صورت release branch ذخیره شده‌اند.

پس از CI و merge هر milestone جدید، branch `release/vX.Y.Z` از همان commit stable ساخته می‌شود.

## چرا branch release؟

Git history نسخه‌ها را نگه می‌دارد، اما release branch checkout/deploy یک milestone را بدون پیدا کردن SHA ساده می‌کند. در آینده می‌توان همین snapshotها را با Git tags و GitHub Releases نیز mirror کرد.

## Rule

هیچ migration بصری، performance یا معماری نباید release branch قبلی را force-update کند. بهینه‌سازی‌های جدید باید روی branch جدید انجام شوند و snapshot قبلی بدون تغییر باقی بماند.
