import { AdaptiveDpr, Sparkles } from '@react-three/drei'
import { useAppStore } from '../store'

export default function ExperienceEffects() {
  const quality = useAppStore((state) => state.quality)

  return (
    <>
      <AdaptiveDpr pixelated />
      {quality === 'cinematic' && (
        <Sparkles
          count={18}
          scale={[5.2, 3.2, 35]}
          size={0.22}
          speed={0.025}
          opacity={0.045}
          color="#e7d6b8"
        />
      )}
    </>
  )
}
