import { AdaptiveDpr, Sparkles } from '@react-three/drei'
import { useAppStore } from '../store'

export default function ExperienceEffects() {
  const quality = useAppStore((state) => state.quality)

  return (
    <>
      <AdaptiveDpr pixelated />
      {quality === 'cinematic' && (
        <Sparkles
          count={110}
          scale={[24, 5.6, 50]}
          size={1.25}
          speed={0.12}
          opacity={0.18}
          color="#bfe8ff"
        />
      )}
    </>
  )
}
