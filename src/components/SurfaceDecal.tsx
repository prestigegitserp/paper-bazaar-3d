import { useEffect, useMemo } from 'react'
import { CanvasTexture, LinearFilter, SRGBColorSpace } from 'three'
import type { AssetDecalKind } from '../assets/detailProfiles'

function seeded(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0
    return state / 4294967296
  }
}

function buildTexture(kind: AssetDecalKind, seed: number) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')
  const random = seeded(seed)
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  if (kind === 'smudge') {
    for (let i = 0; i < 24; i += 1) {
      const x = 80 + random() * 350
      const y = 55 + random() * 145
      const radius = 18 + random() * 58
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
      gradient.addColorStop(0, `rgba(50,43,37,${0.04 + random() * 0.09})`)
      gradient.addColorStop(1, 'rgba(50,43,37,0)')
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.ellipse(x, y, radius, radius * (0.25 + random() * 0.45), (random() - 0.5) * 0.7, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  if (kind === 'scuff') {
    ctx.lineCap = 'round'
    for (let i = 0; i < 18; i += 1) {
      const x = 60 + random() * 390
      const y = 80 + random() * 95
      ctx.strokeStyle = `rgba(44,48,49,${0.05 + random() * 0.10})`
      ctx.lineWidth = 1 + random() * 3
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.quadraticCurveTo(x + 30 + random() * 85, y + (random() - 0.5) * 22, x + 95 + random() * 140, y + (random() - 0.5) * 34)
      ctx.stroke()
    }
  }

  if (kind === 'fingerprint') {
    ctx.strokeStyle = 'rgba(225,235,233,.12)'
    ctx.lineWidth = 2
    for (let ring = 0; ring < 8; ring += 1) {
      ctx.beginPath()
      ctx.ellipse(
        256 + (random() - 0.5) * 8,
        132 + (random() - 0.5) * 6,
        42 + ring * 9,
        24 + ring * 6,
        -0.18,
        Math.PI * 0.12,
        Math.PI * 1.82
      )
      ctx.stroke()
    }
    for (let i = 0; i < 6; i += 1) {
      ctx.globalAlpha = 0.35
      ctx.beginPath()
      ctx.arc(210 + random() * 95, 88 + random() * 95, 5 + random() * 12, 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  texture.needsUpdate = true
  return texture
}

export default function SurfaceDecal({
  kind,
  seed,
  position,
  rotation,
  size,
  opacity
}: {
  kind: AssetDecalKind
  seed: number
  position: [number, number, number]
  rotation: [number, number, number]
  size: [number, number]
  opacity: number
}) {
  const texture = useMemo(() => buildTexture(kind, seed), [kind, seed])
  useEffect(() => () => texture.dispose(), [texture])

  return (
    <mesh position={position} rotation={rotation} renderOrder={5}>
      <planeGeometry args={size} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={opacity}
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-3}
        toneMapped={false}
      />
    </mesh>
  )
}
