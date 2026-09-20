# Versioning

## Policy

- `main`: آخرین نسخه پایدار و منبع deploy production demo.
- `feat/*`: توسعه و PR.
- `release/vX.Y.Z`: snapshot خوانا از milestone پایدار.

Snapshotهای فعلی:

- `release/v0.3.0`
- `release/v0.4.0`

بعد از merge موفق v0.5 و CI سبز، `release/v0.5.0` ساخته می‌شود.

## چرا branch release؟

Git commit history به‌تنهایی نسخه‌ها را حفظ می‌کند، اما branch release باعث می‌شود checkout/deploy یک milestone بدون پیدا کردن SHA راحت باشد. در آینده اگر release/tag API در workflow یا tooling اضافه شود، می‌توان همین milestoneها را tag و GitHub Release هم کرد.

## Rule

هیچ migration بصری یا معماری نباید release branch قبلی را force-update کند.
