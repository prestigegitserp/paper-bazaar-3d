import { useFrame, useThree } from '@react-three/fiber'
import { Euler, PerspectiveCamera, Raycaster, Vector2, Vector3 } from 'three'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { buildWorldColliders, isPositionBlocked } from '../engine/collision'
import { interactionFromObject, interactionKey } from '../engine/interactions'
import { useAppStore } from '../store'
import { findActiveRoom } from '../world/spatial'
import type { WorldDefinition } from '../world/types'

const CENTER = new Vector2(0, 0)
const RAYCASTER = new Raycaster()
const PLAYER_RADIUS = 0.32
const INTERACTION_DISTANCE = 5.2

export default function PlayerController({ world }: { world: WorldDefinition }) {
  const { camera, gl, scene } = useThree()
  const started = useAppStore((state) => state.started)
  const navigationRequest = useAppStore((state) => state.navigationRequest)
  const clearNavigationRequest = useAppStore((state) => state.clearNavigationRequest)
  const setSelected = useAppStore((state) => state.setSelected)
  const setNearby = useAppStore((state) => state.setNearby)
  const setPlayer = useAppStore((state) => state.setPlayer)
  const setActiveRoom = useAppStore((state) => state.setActiveRoom)
  const keys = useRef(new Set<string>())
  const yaw = useRef(0)
  const pitch = useRef(0)
  const frameCount = useRef(0)
  const lastNearby = useRef('')
  const lastActiveRoom = useRef<string | null>(null)
  const lookEuler = useRef(new Euler(0, 0, 0, 'YXZ'))
  const yawEuler = useRef(new Euler(0, 0, 0, 'YXZ'))
  const forward = useRef(new Vector3())
  const right = useRef(new Vector3())
  const desiredVelocity = useRef(new Vector3())
  const velocity = useRef(new Vector3())
  const bobPhase = useRef(0)
  const collisions = useMemo(() => buildWorldColliders(world), [world])

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

  const moveTo = useCallback((target: readonly [number, number, number], nextYaw: number) => {
    camera.position.set(target[0], target[1], target[2])
    yaw.current = nextYaw
    pitch.current = 0
    velocity.current.set(0, 0, 0)
    desiredVelocity.current.set(0, 0, 0)
    bobPhase.current = 0
    setPlayer(target[0], target[2])
  }, [camera, setPlayer])

  useEffect(() => {
    moveTo(world.spawn, 0)
  }, [moveTo, world])

  useEffect(() => {
    if (!started) return
    moveTo(world.spawn, 0)
  }, [moveTo, started, world.spawn])

  useEffect(() => {
    if (!navigationRequest) return
    moveTo(navigationRequest.target, navigationRequest.yaw)
    setSelected(null)
    clearNearby()
    clearNavigationRequest()
  }, [clearNavigationRequest, clearNearby, moveTo, navigationRequest, setSelected])

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

      if (event.code === 'KeyR' && !event.repeat) {
        useAppStore.getState().requestNavigation({ target: world.spawn, yaw: 0, label: 'ورودی پاساژ' })
      }
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
  }, [activateTarget, clearNearby, gl.domElement, started, world.spawn])

  const blocked = useCallback(
    (x: number, z: number) => isPositionBlocked(world, collisions, x, z, PLAYER_RADIUS),
    [collisions, world]
  )

  useFrame(({ clock }, delta) => {
    if (!started) {
      const t = clock.elapsedTime
      camera.position.set(Math.sin(t * 0.18) * 0.55, world.spawn[1] + 0.09 + Math.sin(t * 0.4) * 0.025, world.spawn[2])
      const idleLook = lookEuler.current.set(-0.02, Math.sin(t * 0.16) * 0.045, 0, 'YXZ')
      camera.quaternion.setFromEuler(idleLook)
      return
    }

    const look = lookEuler.current.set(pitch.current, yaw.current, 0, 'YXZ')
    camera.quaternion.setFromEuler(look)

    const pointerLocked = document.pointerLockElement === gl.domElement
    let moving = false
    let sprinting = false

    if (pointerLocked) {
      const horizontalRotation = yawEuler.current.set(0, yaw.current, 0, 'YXZ')
      forward.current.set(0, 0, -1).applyEuler(horizontalRotation)
      right.current.set(1, 0, 0).applyEuler(horizontalRotation)
      desiredVelocity.current.set(0, 0, 0)

      if (keys.current.has('KeyW') || keys.current.has('ArrowUp')) desiredVelocity.current.add(forward.current)
      if (keys.current.has('KeyS') || keys.current.has('ArrowDown')) desiredVelocity.current.sub(forward.current)
      if (keys.current.has('KeyD') || keys.current.has('ArrowRight')) desiredVelocity.current.add(right.current)
      if (keys.current.has('KeyA') || keys.current.has('ArrowLeft')) desiredVelocity.current.sub(right.current)

      moving = desiredVelocity.current.lengthSq() > 0
      sprinting = moving && (keys.current.has('ShiftLeft') || keys.current.has('ShiftRight'))
      const speed = sprinting ? 8.15 : 5.1

      if (moving) desiredVelocity.current.normalize().multiplyScalar(speed)
      const response = 1 - Math.exp(-(moving ? 11 : 8) * Math.min(delta, 0.05))
      velocity.current.lerp(desiredVelocity.current, response)

      const step = velocity.current.clone().multiplyScalar(Math.min(delta, 0.04))
      const nextX = camera.position.x + step.x
      const nextZ = camera.position.z + step.z

      if (!blocked(nextX, camera.position.z)) camera.position.x = nextX
      else velocity.current.x = 0

      if (!blocked(camera.position.x, nextZ)) camera.position.z = nextZ
      else velocity.current.z = 0
    } else {
      desiredVelocity.current.set(0, 0, 0)
      velocity.current.multiplyScalar(Math.max(0, 1 - delta * 10))
    }

    const horizontalSpeed = Math.hypot(velocity.current.x, velocity.current.z)
    if (pointerLocked && horizontalSpeed > 0.2) bobPhase.current += delta * (sprinting ? 11.5 : 8.6)
    const bobAmount = pointerLocked && horizontalSpeed > 0.2 ? Math.sin(bobPhase.current) * (sprinting ? 0.045 : 0.03) : 0
    camera.position.y = world.spawn[1] + bobAmount

    if (camera instanceof PerspectiveCamera) {
      const targetFov = sprinting && horizontalSpeed > 2 ? 71 : 67
      const nextFov = camera.fov + (targetFov - camera.fov) * (1 - Math.exp(-5 * delta))
      if (Math.abs(nextFov - camera.fov) > 0.005) {
        camera.fov = nextFov
        camera.updateProjectionMatrix()
      }
    }

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

    if (frameCount.current % 8 === 0) {
      setPlayer(camera.position.x, camera.position.z)
      const activeRoom = findActiveRoom(world, camera.position.x, camera.position.z)
      const activeId = activeRoom?.id ?? null
      if (activeId !== lastActiveRoom.current) {
        lastActiveRoom.current = activeId
        setActiveRoom(activeId)
      }
    }
  })

  return null
}
