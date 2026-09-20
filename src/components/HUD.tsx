import { useProgress } from '@react-three/drei'
import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useAppStore } from '../store'
import type { CrawlStatus, Product, Vendor } from '../domain/catalog'
import type { Interaction } from '../domain/interaction'
import { roomEntryPoint, roomEntryYaw } from '../world/spatial'
import type { RoomDefinition } from '../world/types'
import MobileControls from './MobileControls'

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
  const product: Product | undefined = selected.kind === 'product' ? vendor.products.find((item) => item.id === selected.productId) : undefined
  const world = useAppStore((state) => state.world)
  const room = world.rooms.find((candidate) => candidate.vendorId === vendor.id)
  const accent = room?.theme.accent ?? '#c99a55'

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
            <span className="kicker">وب‌سایت مغازه</span>
            <strong dir="ltr">{vendor.sourceLabel}</strong>
            <p>میز فروش می‌تواند بعداً به CRM، چت فروش، تقویم جلسه یا پنل اختصاصی فروشنده متصل شود.</p>
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
            <span className="kicker">کالای انتخاب‌شده</span>
            <h3>{product.name}</h3>
            <div className="big-price">{product.priceText}</div>
            <p>{product.unit}</p>
            <small>مشاهده قیمت: {formatDate(product.observedAt)}</small>
            {crawlStatusLabel(product.crawlStatus) && (
              <small className={`crawl-status ${product.crawlStatus ?? ''}`}>{crawlStatusLabel(product.crawlStatus)}</small>
            )}
            {product.note && <small>{product.note}</small>}
          </div>
          <a className="primary-action" href={product.sourceUrl} target="_blank" rel="noreferrer">مشاهده منبع ↗</a>
        </>
      )}

      <div className="source-note">قیمت‌ها برای دمو از صفحات عمومی وب برداشت شده‌اند و قیمت قطعی معامله نیستند.</div>
    </div>
  )
}

function MiniMap({
  open,
  onToggle,
  onNavigate,
  activeRoomId
}: {
  open: boolean
  onToggle: () => void
  onNavigate: (room: RoomDefinition) => void
  activeRoomId: string | null
}) {
  const player = useAppStore((state) => state.player)
  const vendors = useAppStore((state) => state.catalog.vendors)
  const world = useAppStore((state) => state.world)
  const vendorsById = useMemo(() => new Map(vendors.map((vendor) => [vendor.id, vendor])), [vendors])
  const { bounds } = world
  const px = ((player.x - bounds.minX) / (bounds.maxX - bounds.minX)) * 100
  const py = ((bounds.maxZ - player.z) / (bounds.maxZ - bounds.minZ)) * 100

  if (!open) {
    return <button className="minimap-reopen" onClick={onToggle}>نقشه <kbd>M</kbd></button>
  }

  return (
    <div className="minimap-shell">
      <div className="minimap-title">
        <span>نقشه راسته · لمس/کلیک برای رفتن</span>
        <button type="button" onClick={onToggle} aria-label="بستن نقشه"><kbd>M</kbd></button>
      </div>
      <div className="minimap">
        <div className="minimap-aisle" />
        {world.rooms.map((room, index) => {
          const vendor = room.vendorId ? vendorsById.get(room.vendorId) : undefined
          const label = vendor?.name ?? room.label
          const x = ((room.position[0] - bounds.minX) / (bounds.maxX - bounds.minX)) * 100 - 11
          const y = ((bounds.maxZ - room.position[2]) / (bounds.maxZ - bounds.minZ)) * 100 - 7
          return (
            <button
              key={room.id}
              type="button"
              className={`minimap-booth ${activeRoomId === room.id ? 'active' : ''}`}
              style={{ left: `${x}%`, top: `${y}%`, borderColor: room.theme.accent }}
              title={`رفتن سریع به ${label}`}
              onClick={() => onNavigate(room)}
            >
              <span>{label.replace('انتشارات ملت / کیمیا تجارت', 'ملت')}</span>
              <b>{index + 1}</b>
            </button>
          )
        })}
        <div className="minimap-entry">ورودی</div>
        <div className="minimap-player" style={{ left: `${px}%`, top: `${py}%` }} />
      </div>
      <small className="minimap-help">دسکتاپ: Esc سپس کلیک روی غرفه · موبایل: مستقیم لمس کن.</small>
    </div>
  )
}

function DebugPanel() {
  const player = useAppStore((state) => state.player)
  const diagnostics = useAppStore((state) => state.diagnostics)
  const quality = useAppStore((state) => state.quality)
  const activeRoomId = useAppStore((state) => state.activeRoomId)
  const world = useAppStore((state) => state.world)
  const visitedRoomIds = useAppStore((state) => state.visitedRoomIds)
  const assetErrors = useAppStore((state) => state.assetErrors)

  return (
    <div className="debug-panel" dir="ltr">
      <strong>Runtime diagnostics · F3</strong>
      <div><span>position</span><b>{player.x.toFixed(2)}, {player.z.toFixed(2)}</b></div>
      <div><span>room</span><b>{activeRoomId ?? 'alley'}</b></div>
      <div><span>quality</span><b>{quality}</b></div>
      <div><span>draw calls</span><b>{diagnostics.calls}</b></div>
      <div><span>triangles</span><b>{diagnostics.triangles.toLocaleString()}</b></div>
      <div><span>geometries</span><b>{diagnostics.geometries}</b></div>
      <div><span>textures</span><b>{diagnostics.textures}</b></div>
      <div><span>visited</span><b>{visitedRoomIds.length}/{world.rooms.length}</b></div>
      <div><span>asset errors</span><b>{Object.keys(assetErrors).length}</b></div>
    </div>
  )
}

export default function HUD() {
  const catalog = useAppStore((state) => state.catalog)
  const catalogMode = useAppStore((state) => state.catalogMode)
  const catalogError = useAppStore((state) => state.catalogError)
  const selected = useAppStore((state) => state.selected)
  const nearby = useAppStore((state) => state.nearby)
  const started = useAppStore((state) => state.started)
  const quality = useAppStore((state) => state.quality)
  const activeRoomId = useAppStore((state) => state.activeRoomId)
  const world = useAppStore((state) => state.world)
  const setSelected = useAppStore((state) => state.setSelected)
  const setStarted = useAppStore((state) => state.setStarted)
  const setQuality = useAppStore((state) => state.setQuality)
  const requestNavigation = useAppStore((state) => state.requestNavigation)
  const { active: loadingAssets, progress } = useProgress()
  const [mapOpen, setMapOpen] = useState(true)
  const [debugOpen, setDebugOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return
      if (event.code === 'KeyM') setMapOpen((value) => !value)
      if (event.code === 'F3') {
        event.preventDefault()
        setDebugOpen((value) => !value)
      }
      if (event.code === 'KeyQ') setQuality(quality === 'cinematic' ? 'balanced' : 'cinematic')
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [quality, setQuality])

  const selectedVendor = useMemo(() => {
    if (!selected) return null
    return catalog.vendors.find((vendor) => vendor.id === selected.vendorId) ?? null
  }, [catalog.vendors, selected])

  const activeRoom = useMemo(
    () => world.rooms.find((room) => room.id === activeRoomId) ?? null,
    [activeRoomId, world.rooms]
  )

  const enter = () => {
    setStarted(true)
    const canvas = document.querySelector('canvas')
    const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false
    if (!coarse && canvas instanceof HTMLCanvasElement && canvas.requestPointerLock) {
      try {
        void canvas.requestPointerLock()
      } catch {
        // Pointer Lock may be unavailable in embedded previews.
      }
    }
  }

  const navigateToRoom = (room: RoomDefinition) => {
    if (document.pointerLockElement) document.exitPointerLock()
    setSelected(null)
    setStarted(true)
    requestNavigation({
      target: roomEntryPoint(room),
      yaw: roomEntryYaw(room),
      label: room.label
    })
  }

  return (
    <div className="hud" dir="rtl">
      <div className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark">P3</div>
          <div><strong>Paper Bazaar 3D</strong><span>15 Khordad realism · v0.7</span></div>
        </div>

        <div className="top-actions">
          <button
            className="quality-toggle"
            type="button"
            onClick={() => setQuality(quality === 'cinematic' ? 'balanced' : 'cinematic')}
            title="میانبر Q"
          >
            {quality === 'cinematic' ? 'Cinematic' : 'Balanced'} <kbd>Q</kbd>
          </button>
          <div className="data-status" title={catalogError ?? undefined}>
            <i className={catalogMode === 'api' ? 'live' : catalogError ? 'error' : ''} />
            {catalogMode === 'api' ? 'API catalog' : catalogError ? 'Seed fallback' : 'Seed snapshot'} · {formatDate(catalog.generatedAt)}
          </div>
        </div>
      </div>

      <MiniMap
        open={mapOpen}
        onToggle={() => setMapOpen((value) => !value)}
        onNavigate={navigateToRoom}
        activeRoomId={activeRoomId}
      />

      {loadingAssets && progress < 100 && (
        <div className="asset-loader">
          <span>Loading 3D assets</span>
          <strong>{Math.round(progress)}%</strong>
          <i><b style={{ width: `${progress}%` }} /></i>
        </div>
      )}

      {activeRoom && started && !selected && (
        <div className="room-toast" style={{ '--room-accent': activeRoom.theme.accent } as CSSProperties}>
          <span>محدوده فعلی</span>
          <strong>{activeRoom.label}</strong>
        </div>
      )}

      {started && !selected && <div className="crosshair" />}

      {nearby && started && !selected && (
        <div className="interaction-prompt">
          <span>تعامل نزدیک</span>
          <strong>{nearby.label}</strong>
          <kbd>E</kbd><em>یا لمس/کلیک</em>
        </div>
      )}

      {started && !selected && (
        <div className="controls-hint">
          <span><kbd>WASD</kbd> حرکت</span>
          <span><kbd>Shift</kbd> سریع</span>
          <span><kbd>Wheel</kbd> زوم محیط</span>
          <span><kbd>0</kbd> ریست زوم</span>
          <span><kbd>R</kbd> ورودی</span>
          <span><kbd>M</kbd> نقشه</span>
          <span><kbd>Q</kbd> کیفیت</span>
          <span><kbd>F3</kbd> دیباگ</span>
        </div>
      )}

      {debugOpen && <DebugPanel />}
      <MobileControls />

      {selected && selected.kind !== 'document' && selectedVendor && (
        <aside className="detail-panel">
          <div className="detail-head">
            <span>{selected.kind === 'products' ? 'تابلوی قیمت' : selected.kind === 'product' ? 'کالای روی پیشخوان' : 'میز فروش'}</span>
            <button onClick={() => setSelected(null)} aria-label="بستن">×</button>
          </div>
          <VendorPanel vendor={selectedVendor} selected={selected} />
          <div className="panel-footer">برای ادامه حرکت پنل را ببند؛ در موبایل کنترل‌ها خودکار برمی‌گردند.</div>
        </aside>
      )}

      {!started && (
        <div className="intro-overlay">
          <div className="intro-card">
            <div className="intro-eyebrow">15 KHORDAD-INSPIRED MARKET · v0.7.0</div>
            <h1>راسته‌ی سه‌بعدی<br /><span>کاغذفروشان بازار تهران</span></h1>
            <p>نسخه‌ی واقع‌گراتر با الهام از مغازه‌ها و راسته‌های محدوده‌ی ۱۵ خرداد و بازار تهران: طاق آجری، کف فرسوده، کرکره و قاب فلزی، پیشخوان شیشه‌ای، قفسه‌های تا سقف و شلوغی واقعی‌تر فروش عمده.</p>
            <div className="intro-features">
              <span>۱۵ خرداد-inspired alley</span>
              <span>CC0 PBR materials</span>
              <span>Glass counters & dense shelves</span>
              <span>Interactive catalogs</span>
              <span>Scan-ready architecture</span>
            </div>
            <button className="enter-button" onClick={enter}>ورود به بازار <b>↵</b></button>
            <small>دسکتاپ: WASD + Mouse + Wheel · موبایل: Joystick + Look pad + Pinch/±.</small>
          </div>
        </div>
      )}
    </div>
  )
}
