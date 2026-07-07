import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'
import { WORLD_HALF, WORLD_NPCS, BUILD_GRID_SIZE, BUILD_ORIGIN } from '../data/world'
import { BLOCK_MAP } from '../data/rewards'
import { GRADES } from '../data/grades'
import { TextSprite } from './TextSprite'
import { Player } from './Player'
import type { WorldNPC } from '../types/game'

// ---------------------------------------------------------------
// 地面：エリアごとに色分けしたタイルをinstancedMeshで軽量に描く
// ---------------------------------------------------------------
function Ground() {
  const ref = useRef<THREE.InstancedMesh>(null!)
  const size = WORLD_HALF * 2 + 1

  useEffect(() => {
    const mesh = ref.current
    const dummy = new THREE.Object3D()
    const color = new THREE.Color()
    let i = 0
    for (let x = -WORLD_HALF; x <= WORLD_HALF; x++) {
      for (let z = -WORLD_HALF; z <= WORLD_HALF; z++) {
        dummy.position.set(x, -0.25, z)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
        mesh.setColorAt(i, color.set(tileColor(x, z)))
        i++
      }
    }
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [])

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, size * size]} frustumCulled={false}>
      <boxGeometry args={[1, 0.5, 1]} />
      <meshLambertMaterial />
    </instancedMesh>
  )
}

function dist(x: number, z: number, cx: number, cz: number) {
  return Math.hypot(x - cx, z - cz)
}

/** タイルの色を決める（エリアごとの色分け＋市松もよう） */
function tileColor(x: number, z: number): string {
  const checker = (x + z) % 2 === 0

  // けんちくエリア（明るいグリッド）
  const [bx, bz] = BUILD_ORIGIN
  if (x >= bx - 0.5 && x < bx + BUILD_GRID_SIZE && z >= bz - 0.5 && z < bz + BUILD_GRID_SIZE) {
    return checker ? '#e8dcc8' : '#dccfb8'
  }
  // りかのいけ（水）
  if (dist(x, z, 8, -17) < 3.2) return checker ? '#5ec8f2' : '#54bcE8'
  // はじまり広場（石だたみ）
  if (dist(x, z, 0, 0) < 4.5) return checker ? '#cfc8bb' : '#c2bab0'
  // みち（十字）
  if (Math.abs(x) < 1.3 || Math.abs(z) < 1.3) return checker ? '#d9c391' : '#d0ba88'
  // さんすうのおか（あたたかい草）
  if (dist(x, z, 14, -10) < 5.5) return checker ? '#a8c94e' : '#9cbe45'
  // こくごのもり（ふかい緑）
  if (dist(x, z, -14, -10) < 5.5) return checker ? '#4f9e4a' : '#479043'
  // しゃかいのまち（ほそう）
  if (dist(x, z, 18, 2) < 4) return checker ? '#b8aa9a' : '#ab9e8f'
  // えいごのみなと（すなはま）
  if (dist(x, z, -18, 2) < 4) return checker ? '#f0d98c' : '#e5cd7f'
  // ふつうの草原
  return checker ? '#7cc44f' : '#73b849'
}

// ---------------------------------------------------------------
// 飾り（木・花・岩など）
// ---------------------------------------------------------------
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[0.45, 1.4, 0.45]} />
        <meshLambertMaterial color="#8a5a33" />
      </mesh>
      <mesh position={[0, 1.8, 0]}>
        <boxGeometry args={[1.5, 1.1, 1.5]} />
        <meshLambertMaterial color="#3f8f3a" />
      </mesh>
      <mesh position={[0, 2.6, 0]}>
        <boxGeometry args={[0.9, 0.7, 0.9]} />
        <meshLambertMaterial color="#4aa344" />
      </mesh>
    </group>
  )
}

function Decorations() {
  const items = useMemo(() => {
    const rand = mulberry32(42)
    const flowers: { pos: [number, number, number]; color: string }[] = []
    const flowerColors = ['#ff7eb3', '#ffd54f', '#ffffff', '#9575cd']
    for (let i = 0; i < 30; i++) {
      const x = (rand() - 0.5) * (WORLD_HALF * 2 - 4)
      const z = (rand() - 0.5) * (WORLD_HALF * 2 - 4)
      // 広場・池・建築エリアの上には生やさない
      if (dist(x, z, 0, 0) < 5 || dist(x, z, 8, -17) < 4) continue
      const [bx, bz] = BUILD_ORIGIN
      if (x > bx - 1 && x < bx + BUILD_GRID_SIZE && z > bz - 1 && z < bz + BUILD_GRID_SIZE) continue
      flowers.push({
        pos: [x, 0.15, z],
        color: flowerColors[Math.floor(rand() * flowerColors.length)],
      })
    }
    return flowers
  }, [])

  const trees: [number, number, number][] = [
    // こくごのもり
    [-17, 0, -13], [-11, 0, -13], [-17, 0, -7], [-11, 0, -7], [-14, 0, -15],
    // そのほかに ちらほら
    [19, 0, -16], [12, 0, 16], [-19, 0, 16], [20, 0, 8], [-6, 0, -19],
  ]

  return (
    <group>
      {trees.map((p, i) => (
        <Tree key={i} position={p} />
      ))}
      {items.map((f, i) => (
        <mesh key={i} position={f.pos}>
          <boxGeometry args={[0.22, 0.3, 0.22]} />
          <meshLambertMaterial color={f.color} />
        </mesh>
      ))}
      {/* さんすうのおかの かずブロック */}
      {[0, 1, 2].map((i) => (
        <mesh key={`num${i}`} position={[12 + i * 1.4, 0.45 + i * 0.25, -13]}>
          <boxGeometry args={[0.9, 0.9 + i * 0.5, 0.9]} />
          <meshLambertMaterial color={['#ffd54f', '#f59e42', '#e8743b'][i]} />
        </mesh>
      ))}
      {/* えいごのみなとの ふね */}
      <group position={[-19.5, 0, 5.5]}>
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[1.4, 0.7, 2.6]} />
          <meshLambertMaterial color="#8a5a33" />
        </mesh>
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[0.15, 1.6, 0.15]} />
          <meshLambertMaterial color="#6b4423" />
        </mesh>
        <mesh position={[0.4, 1.7, 0]}>
          <boxGeometry args={[0.7, 0.9, 0.05]} />
          <meshLambertMaterial color="#ffffff" />
        </mesh>
      </group>
      {/* しゃかいのまちの いえ */}
      <group position={[19, 0, -1]}>
        <mesh position={[0, 0.8, 0]}>
          <boxGeometry args={[1.8, 1.6, 1.8]} />
          <meshLambertMaterial color="#e5d5bd" />
        </mesh>
        <mesh position={[0, 1.9, 0]}>
          <boxGeometry args={[2.1, 0.6, 2.1]} />
          <meshLambertMaterial color="#d95f3b" />
        </mesh>
      </group>
      {/* エリアのなまえ */}
      <TextSprite text="🔢 さんすうのおか" position={[14, 3.2, -10]} scale={1.5} bg="rgba(255,244,222,0.95)" />
      <TextSprite text="📖 こくごのもり" position={[-14, 3.2, -10]} scale={1.5} bg="rgba(230,246,228,0.95)" />
      <TextSprite text="🔬 りかのいけ" position={[7, 3.2, -16]} scale={1.4} bg="rgba(223,244,248,0.95)" />
      <TextSprite text="🗾 しゃかいのまち" position={[18, 3.2, 2]} scale={1.4} bg="rgba(240,235,228,0.95)" />
      <TextSprite text="🌍 えいごのみなと" position={[-18, 3.2, 2]} scale={1.4} bg="rgba(236,231,246,0.95)" />
      <TextSprite text="🏠 けんちくエリア" position={[0.5, 3.2, 16]} scale={1.5} bg="rgba(250,240,224,0.95)" />
      <TextSprite text="⛲ はじまりひろば" position={[0, 4, 0]} scale={1.5} />
    </group>
  )
}

// ---------------------------------------------------------------
// NPC・看板・宝箱
// ---------------------------------------------------------------
function NPCFigure({ npc }: { npc: WorldNPC }) {
  const group = useRef<THREE.Group>(null!)
  const isNear = useGameStore((s) => s.nearby?.id === npc.id)
  const phase = useMemo(() => npc.pos[0] * 3.1 + npc.pos[2], [npc])
  const lightColor = useMemo(
    () => '#' + new THREE.Color(npc.color).lerp(new THREE.Color('#ffffff'), 0.35).getHexString(),
    [npc.color],
  )

  useFrame(({ clock }) => {
    if (group.current && npc.kind === 'quest') {
      group.current.position.y = Math.sin(clock.elapsedTime * 2 + phase) * 0.06
    }
  })

  // 広場の方を向かせる
  const face = Math.atan2(-npc.pos[0], -npc.pos[2])

  if (npc.kind === 'sign') {
    return (
      <group position={npc.pos} rotation={[0, face, 0]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.15, 1, 0.15]} />
          <meshLambertMaterial color="#8a5a33" />
        </mesh>
        <mesh position={[0, 1.15, 0]}>
          <boxGeometry args={[1.3, 0.75, 0.12]} />
          <meshLambertMaterial color={npc.color} />
        </mesh>
        <TextSprite text={`📌 ${npc.label}`} position={[0, 1.95, 0]} scale={0.9} />
        {isNear && <NearRing />}
      </group>
    )
  }

  if (npc.kind === 'chest') {
    return (
      <group position={npc.pos}>
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[0.9, 0.6, 0.65]} />
          <meshLambertMaterial color="#b5813a" />
        </mesh>
        <mesh position={[0, 0.66, 0]}>
          <boxGeometry args={[0.95, 0.18, 0.7]} />
          <meshLambertMaterial color={npc.color} />
        </mesh>
        <mesh position={[0, 0.45, 0.34]}>
          <boxGeometry args={[0.16, 0.2, 0.06]} />
          <meshLambertMaterial color="#ffe082" />
        </mesh>
        <TextSprite text="🎁 たからばこ" position={[0, 1.5, 0]} scale={0.9} />
        {isNear && <NearRing />}
      </group>
    )
  }

  return (
    <group position={npc.pos}>
      <group ref={group} rotation={[0, face, 0]}>
        {/* からだ */}
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[0.72, 0.9, 0.5]} />
          <meshLambertMaterial color={npc.color} />
        </mesh>
        {/* あたま */}
        <mesh position={[0, 1.25, 0]}>
          <boxGeometry args={[0.62, 0.62, 0.58]} />
          <meshLambertMaterial color={lightColor} />
        </mesh>
        {/* め */}
        <mesh position={[-0.14, 1.3, 0.3]}>
          <boxGeometry args={[0.09, 0.12, 0.02]} />
          <meshBasicMaterial color="#3a3a3a" />
        </mesh>
        <mesh position={[0.14, 1.3, 0.3]}>
          <boxGeometry args={[0.09, 0.12, 0.02]} />
          <meshBasicMaterial color="#3a3a3a" />
        </mesh>
      </group>
      <TextSprite text={npc.label} position={[0, 2.15, 0]} scale={1.0} />
      {isNear && <NearRing />}
    </group>
  )
}

/** 近くにいるときに足元に出る白いリング */
function NearRing() {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    const s = 1 + Math.sin(clock.elapsedTime * 4) * 0.08
    ref.current.scale.set(s, s, 1)
  })
  return (
    <mesh ref={ref} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.9, 1.15, 24]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.85} />
    </mesh>
  )
}

// ---------------------------------------------------------------
// チュートリアル中に「つぎに行く場所」を教える矢印
// ---------------------------------------------------------------
function BouncingArrow({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 3.5) * 0.25
  })
  return (
    <group ref={ref} position={position}>
      <mesh rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.4, 0.8, 4]} />
        <meshBasicMaterial color="#ffd000" />
      </mesh>
    </group>
  )
}

function TutorialArrows() {
  const step = useGameStore((s) => (s.save && !s.save.tutorialDone ? s.save.tutorialStep : null))
  const grade = useGameStore((s) => s.save?.grade ?? 1)
  if (step === null) return null

  const targets: WorldNPC[] = []
  if (step === 1 || step === 2) {
    // かんばんへ
    const sign = WORLD_NPCS.find((n) => n.id === 'sign-welcome')
    if (sign) targets.push(sign)
  } else if (step === 3 || step === 4) {
    // 学年に合った せんせいNPCへ
    const subjects = GRADES[grade].mainSubjects
    for (const npc of WORLD_NPCS) {
      if (npc.kind === 'quest' && npc.subject && subjects.includes(npc.subject)) {
        targets.push(npc)
      }
    }
  } else if (step === 5) {
    const build = WORLD_NPCS.find((n) => n.id === 'npc-build')
    if (build) targets.push(build)
  }

  return (
    <>
      {targets.map((t) => (
        <BouncingArrow key={t.id} position={[t.pos[0], 3.1, t.pos[2]]} />
      ))}
    </>
  )
}

// ---------------------------------------------------------------
// けんちくエリアのブロック（ワールドにも表示される）
// ---------------------------------------------------------------
function BuiltBlocks() {
  const grid = useGameStore((s) => s.save?.buildGrid)
  if (!grid) return null
  const [ox, oz] = BUILD_ORIGIN
  return (
    <group>
      {grid.map((blockId, i) => {
        if (!blockId) return null
        const def = BLOCK_MAP[blockId]
        if (!def) return null
        const x = ox + (i % BUILD_GRID_SIZE)
        const z = oz + Math.floor(i / BUILD_GRID_SIZE)
        return (
          <mesh key={i} position={[x, 0.5, z]}>
            <boxGeometry args={[0.96, 0.96, 0.96]} />
            <meshLambertMaterial
              color={def.color}
              transparent={blockId === 'glass' || blockId === 'water'}
              opacity={blockId === 'glass' ? 0.55 : blockId === 'water' ? 0.75 : 1}
            />
          </mesh>
        )
      })}
    </group>
  )
}

// ---------------------------------------------------------------
// ワールド全体
// ---------------------------------------------------------------
export function WorldCanvas() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ fov: 50, position: [0, 8, 16], near: 0.1, far: 120 }}
      style={{ touchAction: 'none' }}
    >
      <color attach="background" args={['#aee7ff']} />
      <fog attach="fog" args={['#aee7ff', 35, 75]} />
      <hemisphereLight args={['#ffffff', '#8fbb6e', 0.95]} />
      <directionalLight position={[12, 20, 8]} intensity={0.75} />
      <Ground />
      <Decorations />
      {WORLD_NPCS.map((npc) => (
        <NPCFigure key={npc.id} npc={npc} />
      ))}
      <TutorialArrows />
      <BuiltBlocks />
      <Player />
    </Canvas>
  )
}
