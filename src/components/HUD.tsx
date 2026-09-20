import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useAppStore } from '../store'
import type { CrawlStatus, Product, Vendor } from '../domain/catalog'
import type { Interaction } from '../domain/interaction'
import { demoWorld } from '../world/demoWorld'

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      dateStyle: 'medium',
      timeStyle: value.includes('T') ? 'short' : undefined
    }).format(new Date(value))
  } catch {
    return value
  }
}

function crawlStatusLabel(status?: CrawlStatus) {
  if (status === 'updated') return 'به‌روزرسانی خودکار'
  if (status === 'seed-fallback') return 'قیمت seed؛ قیمت تازه پیدا نشد'
  if (status === 'fetch-failed') return 'خطای دریافت؛ قیمت seed نمایش داده می‌شود'
  return null
}

function VendorPanel({ vendor, selected }: { vendor: Vendor; selected: Interaction }) {
  const product: Product | undefined = selected.kind === 'product' ? vendor.products.find((p) => p.id === selected.productId) : undefined
  const room = demoWorld.rooms.find((candidate) => candidate.vendorId === vendor.id)
  const accent = room?.theme.accent ?? '#38bdf8'

  return (
    <div className="detail-body">
      <div className="detail-brand" style={{ '--brand': accent } as CSSProperties}>
        <span>{vendor.shortName}</span>
        <h2>{vendor.name}</h2>
        <p>{vendor.tagline}</p>
      </div>

      {selected.kind === 'vendor' && (
        <>
          <div className="info-card">
            <span className="kicker">وب‌سایت غرفه</span>
            <strong dir="ltr">{vendor.sourceLabel}</strong>
            <p>این میز نقش کانتر مدیریت غرفه را دارد. در نسخه بعد می‌تواند به پروفایل فروشنده، CRM یا چت فروش متصل شود.</p>
          </div>
          <a className="primary-action" href={vendor.website} target="_blank" rel="noreferrer">باز کردن سایت فروشنده ↗</a>
        </>
      )}

      {selected.kind === 'products' && (
        <div className="product-list">
          {vendor.products.map((item) => {
            const status = crawlStatusLabel(item.crawlStatus)
            return (
              <a key={item.id} className="product-row" href={item.sourceUrl} target="_blank" rel="noreferrer">
                <div>
                  <strong>{item.name}</strong>
                  <small>{item.unit}</small>
                  {status && <small className={`crawl-status ${item.crawlStatus ?? ''}`}>{status}</small>}
                </div>
                <span>{item.priceText}</span>
              </a>
            )
          })}
        </div>
      )}

      {product && (
        <>
          <div className="product-focus">
            <span className="kicker">محصول انتخاب‌شده</span>
            <h3>{product.name}</h3>
            <div className="big-price">{product.priceText}</div>
            <p>{product.unit}</p>
            <small>مشاهده قیمت: {formatDate(product.observedAt)}</small>
            {crawlStatusLabel(product.crawlStatus) && (
              <small className={`crawl-status ${product.crawlStatus ?? ''}`}>{crawlStatusLabel(product.crawlStatus)}</small>
            )}
            {product.note && <small>{product.note}</small>}
          </div>
          <a className="primary-action" href={product.sourceUrl} target="_blank" rel="noreferrer">مشاهده منبع قیمت ↗</a>
        </>
      )}

      <div className="source-note">قیمت‌ها برای دمو از صفحات عمومی وب برداشت شده‌اند و قیمت قطعی معامله نیستند.</div>
    </div>
  )
}

function MiniMap({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const player = useAppStore((s) => s.player)
  const vendors = useAppStore((s) => s.catalog.vendors)
  const vendorsById = useMemo(() => new Map(vendors.map((vendor) => [vendor.id, vendor])), [vendors])
  const { bounds } = demoWorld
  const px = ((player.x - bounds.minX) / (bounds.maxX - bounds.minX)) * 100
  const py = ((bounds.maxZ - player.z) / (bounds.maxZ - bounds.minZ)) * 100

  if (!open) {
    return <button className="minimap-reopen" onClick={onToggle}>نقشه <kbd>M</kbd></button>
  }

  return (
    <div className="minimap-shell">
      <div className="minimap-title">
        <span>نقشه پاساژ</span>
        <button type="button" onClick={onToggle} aria-label="بستن نقشه"><kbd>M</kbd></button>
      </div>
      <div className="minimap">
        <div className="minimap-aisle" />
        {demoWorld.rooms.map((room) => {
          const vendor = vendorsById.get(room.vendorId)
          if (!vendor) return null
          const x = ((room.position[0] - bounds.minX) / (bounds.maxX - bounds.minX)) * 100 - 10
          const y = ((bounds.maxZ - room.position[2]) / (bounds.maxZ - bounds.minZ)) * 100 - 7.5
          return (
            <div key={room.id} className="minimap-booth" style={{ left: `${x}%`, top: `${y}%`, borderColor: room.theme.accent }} title={vendor.name}>
              <span>{vendor.name.replace('انتشارات ملت / کیمیا تجارت', 'ملت')}</span>
            </div>
          )
        })}
        <div className="minimap-entry">ورودی</div>
        <div className="minimap-player" style={{ left: `${px}%`, top: `${py}%` }} />
      </div>
    </div>
  )
}

export default function HUD() {
  const catalog = useAppStore((s) => s.catalog)
  const catalogMode = useAppStore((s) => s.catalogMode)
  const catalogError = useAppStore((s) => s.catalogError)
  const selected = useAppStore((s) => s.selected)
  const nearby = useAppStore((s) => s.nearby)
  const started = useAppStore((s) => s.started)
  const setSelected = useAppStore((s) => s.setSelected)
  const setStarted = useAppStore((s) => s.setStarted)
  const [mapOpen, setMapOpen] = useState(true)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'KeyM' || event.repeat) return
      setMapOpen((value) => !value)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const selectedVendor = useMemo(() => {
    if (!selected) return null
    return catalog.vendors.find((vendor) => vendor.id === selected.vendorId) ?? null
  }, [catalog.vendors, selected])

  const enter = () => {
    setStarted(true)
    const canvas = document.querySelector('canvas')
    if (canvas instanceof HTMLCanvasElement && canvas.requestPointerLock) {
      try {
        void canvas.requestPointerLock()
      } catch {
        // The scene remains usable with click interactions even when Pointer Lock is unavailable.
      }
    }
  }

  return (
    <div className="hud" dir="rtl">
      <div className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark">P3</div>
          <div><strong>Paper Bazaar 3D</strong><span>دموی Digital Twin بازار کاغذ</span></div>
        </div>
        <div className="data-status" title={catalogError ?? undefined}>
          <i className={catalogMode === 'api' ? 'live' : catalogError ? 'error' : ''} />
          {catalogMode === 'api' ? 'API catalog' : catalogError ? 'Seed fallback' : 'Seed snapshot'} · {formatDate(catalog.generatedAt)}
        </div>
      </div>

      <MiniMap open={mapOpen} onToggle={() => setMapOpen((value) => !value)} />
      {started && !selected && <div className="crosshair" />}

      {nearby && started && !selected && (
        <div className="interaction-prompt">
          <span>تعامل</span>
          <strong>{nearby.label}</strong>
          <kbd>E</kbd><em>یا کلیک</em>
        </div>
      )}

      {started && !selected && (
        <div className="controls-hint">
          <span><kbd>WASD</kbd> حرکت</span>
          <span><kbd>Shift</kbd> سریع</span>
          <span><kbd>M</kbd> نقشه</span>
          <span><kbd>Mouse</kbd> نگاه</span>
          <span><kbd>Esc</kbd> آزاد کردن موس</span>
        </div>
      )}

      {selected && selectedVendor && (
        <aside className="detail-panel">
          <div className="detail-head">
            <span>{selected.kind === 'products' ? 'تابلوی قیمت' : selected.kind === 'product' ? 'ویترین محصول' : 'مدیریت غرفه'}</span>
            <button onClick={() => setSelected(null)} aria-label="بستن">×</button>
          </div>
          <VendorPanel vendor={selectedVendor} selected={selected} />
          <div className="panel-footer">برای ادامه حرکت، پنل را ببند و روی صحنه کلیک کن.</div>
        </aside>
      )}

      {!started && (
        <div className="intro-overlay">
          <div className="intro-card">
            <div className="intro-eyebrow">PROTOTYPE · 0.3</div>
            <h1>پاساژ سه‌بعدی<br /><span>عمده‌فروشان کاغذ ایران</span></h1>
            <p>داخل پاساژ راه برو، وارد غرفه‌ها شو، روی میز مدیریت و بورد قیمت نشانه بگیر و اطلاعات واقعیِ نمونه را ببین.</p>
            <div className="intro-features">
              <span>۴ غرفه مفهومی</span><span>تعامل سه‌بعدی</span><span>قیمت منبع‌دار</span><span>آماده برای GLB</span>
            </div>
            <button className="enter-button" onClick={enter}>ورود به پاساژ <b>↵</b></button>
            <small>بهتر است روی دسکتاپ و با موس اجرا شود. برای خروج از Pointer Lock کلید Esc را بزن.</small>
          </div>
        </div>
      )}
    </div>
  )
}
