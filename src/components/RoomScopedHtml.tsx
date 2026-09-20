import { Html } from '@react-three/drei'
import type { CSSProperties, ReactNode } from 'react'
import { useAppStore } from '../store'

export default function RoomScopedHtml({
  roomId,
  position,
  distanceFactor = 8.6,
  center = true,
  children,
  style
}: {
  roomId: string
  position: number[]
  distanceFactor?: number
  center?: boolean
  children: ReactNode
  style?: CSSProperties
}) {
  const visible = useAppStore((state) => state.started && state.activeRoomId === roomId)

  if (!visible) return null

  return (
    <Html
      center={center}
      position={position as [number, number, number]}
      distanceFactor={distanceFactor}
      style={{ pointerEvents: 'none', ...style }}
    >
      {children}
    </Html>
  )
}
