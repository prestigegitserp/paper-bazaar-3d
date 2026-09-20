import { useFrame, useThree } from '@react-three/fiber'
import { Euler, Raycaster, Vector2, Vector3 } from 'three'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { buildWorldAabbColliders, isPositionBlocked } from '../engine/collision'
import { interactionFromObject, interactionKey } from '../engine/interactions'
import { useAppStore } from '../store'
import type { WorldDefinition } from '../world/types'

const CENTER = new Vector2(0, 0)
const RAYCASTER = new Raycaster()
const PLAYER_RADIUS = 0.32
const INTERACTION_DISTANCE = 5.2

export default function PlayerController({ world }: { world: WorldDefinition }) {
  const { camera, gl, scene } = useThree()
  const started = useAppStore((s) => s.started)
  const setSelected = useAppStore((s) => s.setSelected)
  const setNearby = useAppStore((s) => s.setNearby)
  const setPlayer = useAppStore((s) => s.setPlayer)
  const keys = useRef(new Set<string>())
  const yaw = useRef(0)
  const pitch = useRef(0)
  const frameCount = useRef(0)
  const lastNearby = useRef('')
  const lookEuler = useRef(new Euler(0, 0, 0, 'YXZ'))
  const yawEuler = useRef(new Euler(0, 0, 0, 'YXZ'))
  const forward = useRef(new Vector3())
  const right = useRef(new Vector3())
  const movement = useRef(new Vector3())
  const furnitureBlocks = useMemo(() => buildWorldAabbColliders(world), [world])

  const clearNearby = useCallback(() => {
    if (!lastNearby.current) return
    lastNearby.current = ''
    setNearby(null)
  }, [setNearby])

  const findTarget = useCallback(() => {
    RAYCASTER.setFromCamera(CENTER, camera)
    const firstHit = RAYCASTER.intersectObjects(scene.children, true)[0]
    if (!firstHit || firstHit.distance > INTERACTION_DISTANCE) return null
    return interactionFromObject(firstHit.object)
  }, [camera, scene])

  const activateTarget = useCallback(() => {
    const target = findTarget()
    if (!target) return
    setSelected(target)
    clearNearby()
    if (document.pointerLockElement === gl.domElement) document.exitPointerLock()
  }, [clearNearby, findTarget, gl.domElement, setSelected])

  useEffect(() => {
    camera.position.set(...world.spawn)
    camera.rotation.order = 'YXZ'
    setPlayer(world.spawn[0], world.spawn[2])
  }, [camera, setPlayer, world])

  useEffect(() => {
    const canvas = gl.domElement
    const clearKeys = () => keys.current.clear()

    const onMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== canvas) return
      yaw.current -= event.movementX * 0.0022
      pitch.current -= event.movementY * 0.002
      pitch.current = Math.max(-1.25, Math.min(1.25, pitch.current))
    }

    const onKeyDown = (event: KeyboardEvent) => {
      keys.current.add(event.code)
      if (event.code === 'KeyE' && !event.repeat && document.pointerLockElement === canvas) activateTarget()
    }
    const onKeyUp = (event: KeyboardEvent) => keys.current.delete(event.code)

    const onPointerLockChange = () => {
      clearKeys()
      if (document.pointerLockElement !== canvas) clearNearby()
    }

    const onCanvasMouseDown = (event: MouseEvent) => {
      if (!started) return
      if (document.pointerLockElement === canvas) {
        if (event.button === 0) activateTarget()
        return
      }
      if (!useAppStore.getState().selected && canvas.requestPointerLock) {
        try {
          void canvas.requestPointerLock()
        } catch {
          // Pointer Lock can be denied by browser policy; click interactions remain available.
        }
      }
    }

    const onContextMenu = (event: MouseEvent) => {
      if (document.pointerLockElement === canvas) event.preventDefault()
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('pointerlockchange', onPointerLockChange)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', clearKeys)
    canvas.addEventListener('mousedown', onCanvasMouseDown)
    canvas.addEventListener('contextmenu', onContextMenu)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('pointerlockchange', onPointerLockChange)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', clearKeys)
      canvas.removeEventListener('mousedown', onCanvasMouseDown)
      canvas.removeEventListener('contextmenu', onContextMenu)
    }
  }, [activateTarget, clearNearby, gl.domElement, started])

  const blocked = useCallback(
    (x: number, z: number) => isPositionBlocked(world, furnitureBlocks, x, z, PLAYER_RADIUS),
    [furnitureBlocks, world]
  )

  useFrame((_, delta) => {
    if (!started) return

    const look = lookEuler.current.set(pitch.current, yaw.current, 0, 'YXZ')
    camera.quaternion.setFromEuler(look)

    const pointerLocked = document.pointerLockElement === gl.domElement
    if (pointerLocked) {
      const horizontalRotation = yawEuler.current.set(0, yaw.current, 0, 'YXZ')
      forward.current.set(0, 0, -1).applyEuler(horizontalRotation)
      right.current.set(1, 0, 0).applyEuler(horizontalRotation)
      movement.current.set(0, 0, 0)

      if (keys.current.has('KeyW') || keys.current.has('ArrowUp')) movement.current.add(forward.current)
      if (keys.current.has('KeyS') || keys.current.has('ArrowDown')) movement.current.sub(forward.current)
      if (keys.current.has('KeyD') || keys.current.has('ArrowRight')) movement.current.add(right.current)
      if (keys.current.has('KeyA') || keys.current.has('ArrowLeft')) movement.current.sub(right.current)

      if (movement.current.lengthSq() > 0) {
        const speed = keys.current.has('ShiftLeft') || keys.current.has('ShiftRight') ? 8.2 : 5.2
        movement.current.normalize().multiplyScalar(speed * Math.min(delta, 0.04))
        const nextX = camera.position.x + movement.current.x
        const nextZ = camera.position.z + movement.current.z
        if (!blocked(nextX, camera.position.z)) camera.position.x = nextX
        if (!blocked(camera.position.x, nextZ)) camera.position.z = nextZ
      }
    }

    camera.position.y = world.spawn[1]
    frameCount.current += 1

    if (pointerLocked && frameCount.current % 5 === 0) {
      const target = findTarget()
      const key = interactionKey(target)
      if (key !== lastNearby.current) {
        lastNearby.current = key
        setNearby(target)
      }
    } else if (!pointerLocked) {
      clearNearby()
    }

    if (frameCount.current % 8 === 0) setPlayer(camera.position.x, camera.position.z)
  })

  return null
}
