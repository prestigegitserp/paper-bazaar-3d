import { AdaptiveDpr, Sparkles } from '@react-three/drei'
import { useAppStore } from '../store'

export default function ExperienceEffects() {
  const quality = useAppStore((state) => state.quality)

  return (
    <>
      <AdaptiveDpr pixelated />
      {quality === 'cinematic' && (
        <Sparkles
          count={42}
          scale={[10, 4.4, 36]}
          size={0.75}
          speed={0.06}
          opacity={0.11}
          color="#f3d9ad"
        />
      )}
    </>
  )
}
