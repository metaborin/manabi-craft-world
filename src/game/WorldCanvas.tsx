import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'
import { WORLD_HALF, WORLD_NPCS, BUILD_GRID_SIZE, BUILD_ORIGIN, TREE_POSITIONS } from '../data/world'
import { BLOCK_MAP } from '../data/rewards'
import { GRADES } from '../data/grades'
import { UNLOCKABLE_AREAS, NPC_AREA } from '../data/areas'
import { todayString } from '../store/saveSystem'
import { TextSprite } from './TextSprite'
import { Player } from './Player'
import {
  Tree,
  SakuraTree,
  PineTree,
  Windmill,
  Fountain,
  Bridge,
  NumberTower,
  NumberStairs,
  GiantBook,
  GiantPencil,
  Workbench,
  BlockPile,
  Crane,
  ShopStall,
  SmallHouse,
  Lamp,
} from './decor'
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
  // 川（いけから みなみへ ながれる）
  if (x >= 10 && x <= 11 && z >= -15) return checker ? '#5ec8f2' : '#54bcE8'
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
  // はなばたけ（あかるい草）
  if (dist(x, z, -15, 17) < 3.5) return checker ? '#93d465' : '#89c95c'
  // ショップまえ（れんがみち）
  if (dist(x, z, 8, 10) < 2.6) return checker ? '#d9b295' : '#cfa78a'
  // ふつうの草原
  return checker ? '#7cc44f' : '#73b849'
}

// ---------------------------------------------------------------
// 飾り（木・花・ランドマーク）
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

function Decorations() {
  const flowers = useMemo(() => {
    const rand = mulberry32(42)
    const items: { pos: [number, number, number]; color: string }[] = []
    const colors = ['#ff7eb3', '#ffd54f', '#ffffff', '#9575cd']
    // 野原にちらほら
    for (let i = 0; i < 26; i++) {
      const x = (rand() - 0.5) * (WORLD_HALF * 2 - 4)
      const z = (rand() - 0.5) * (WORLD_HALF * 2 - 4)
      if (dist(x, z, 0, 0) < 5 || dist(x, z, 8, -17) < 4) continue
      if (x >= 9 && x <= 12 && z >= -15) continue // 川
      const [bx, bz] = BUILD_ORIGIN
      if (x > bx - 1 && x < bx + BUILD_GRID_SIZE && z > bz - 1 && z < bz + BUILD_GRID_SIZE) continue
      items.push({ pos: [x, 0.15, z], color: colors[Math.floor(rand() * colors.length)] })
    }
    // はなばたけ（みっしり）
    for (let i = 0; i < 40; i++) {
      const a = rand() * Math.PI * 2
      const r = rand() * 3
      items.push({
        pos: [-15 + Math.cos(a) * r, 0.15, 17 + Math.sin(a) * r],
        color: colors[Math.floor(rand() * colors.length)],
      })
    }
    return items
  }, [])

  return (
    <group>
      {/* ---- 木々（位置データはterrainの当たり判定と共有） ---- */}
      {TREE_POSITIONS.normal.map((p, i) => (
        <Tree key={`t${i}`} position={p} />
      ))}
      {TREE_POSITIONS.sakura.map((p, i) => (
        <SakuraTree key={`s${i}`} position={p} />
      ))}
      {TREE_POSITIONS.pine.map((p, i) => (
        <PineTree key={`p${i}`} position={p} />
      ))}

      {/* ---- はな ---- */}
      {flowers.map((f, i) => (
        <mesh key={i} position={f.pos}>
          <boxGeometry args={[0.22, 0.3, 0.22]} />
          <meshLambertMaterial color={f.color} />
        </mesh>
      ))}

      {/* ---- ランドマーク ---- */}
      {/* はじまり広場：ふんすい＋がいとう */}
      <Fountain position={[2.5, 0, -2.5]} />
      <Lamp position={[-3.5, 0, -3.5]} />
      <Lamp position={[3.5, 0, 3.5]} />
      <Lamp position={[-3.5, 0, 3.5]} />

      {/* さんすうのおか：かずのとう＋かいだん＋ふうしゃ */}
      <NumberTower position={[17, 0, -13]} />
      <NumberStairs position={[12.2, 0, -12]} />
      <Windmill position={[20, 0, -11]} />

      {/* こくごのもり：おおきな本＋えんぴつ */}
      <GiantBook position={[-12, 0, -13]} rotation={0.4} />
      <GiantPencil position={[-17, 0, -10]} rotation={1.1} />

      {/* 川と橋 */}
      <Bridge position={[10.5, 0, 0]} />

      {/* けんちくエリア：さぎょうだい＋ブロックおきば＋クレーン */}
      <Workbench position={[-6.5, 0, 10.5]} />
      <BlockPile position={[6, 0, 12]} />
      <Crane position={[7.5, 0, 16]} />

      {/* ショップ：やたい */}
      <ShopStall position={[9.5, 0, 11.5]} rotation={Math.PI + 0.5} />

      {/* しゃかいのまち：いえ2けん */}
      <SmallHouse position={[19, 0, -1]} />
      <SmallHouse position={[16, 0, 5]} rotation={0.6} wall="#d8e4ea" roof="#5c6bc0" />

      {/* えいごのみなと：ふね */}
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

      {/* ---- エリアのなまえ ---- */}
      <TextSprite text="🔢 さんすうのおか" position={[14, 3.4, -10]} scale={1.5} bg="rgba(255,244,222,0.95)" />
      <TextSprite text="📖 こくごのもり" position={[-14, 3.4, -10]} scale={1.5} bg="rgba(230,246,228,0.95)" />
      <TextSprite text="🔬 りかのいけ" position={[7, 3.2, -16]} scale={1.4} bg="rgba(223,244,248,0.95)" />
      <TextSprite text="🗾 しゃかいのまち" position={[18, 3.4, 2]} scale={1.4} bg="rgba(240,235,228,0.95)" />
      <TextSprite text="🌍 えいごのみなと" position={[-18, 3.2, 2]} scale={1.4} bg="rgba(236,231,246,0.95)" />
      <TextSprite text="🏠 けんちくエリア" position={[0.5, 3.2, 16]} scale={1.5} bg="rgba(250,240,224,0.95)" />
      <TextSprite text="🌼 はなばたけ" position={[-15, 2.6, 17]} scale={1.2} bg="rgba(240,251,232,0.95)" />
      <TextSprite text="⛲ はじまりひろば" position={[0, 4.2, 0]} scale={1.5} />
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

  // ロック中エリアの せんせいは 🔒つきラベルにする
  const areaLocked = useGameStore((s) => {
    const area = NPC_AREA[npc.id]
    return !!area && !!s.save && !s.save.unlockedAreas.includes(area.id)
  })

  useFrame(({ clock }) => {
    if (group.current && (npc.kind === 'quest' || npc.kind === 'guide')) {
      group.current.position.y = Math.sin(clock.elapsedTime * 2 + phase) * 0.06
    }
  })

  // 広場の方を向かせる
  const face = Math.atan2(-npc.pos[0], -npc.pos[2])
  const emissive = isNear ? '#4a3800' : '#000000'
  const scale = isNear ? 1.07 : 1

  if (npc.kind === 'sign') {
    return (
      <group position={npc.pos} rotation={[0, face, 0]} scale={scale}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.15, 1, 0.15]} />
          <meshLambertMaterial color="#8a5a33" />
        </mesh>
        <mesh position={[0, 1.15, 0]}>
          <boxGeometry args={[1.3, 0.75, 0.12]} />
          <meshLambertMaterial color={npc.color} emissive={emissive} />
        </mesh>
        <TextSprite text={`📌 ${npc.label}`} position={[0, 1.95, 0]} scale={0.9} />
        {isNear && <NearRing />}
      </group>
    )
  }

  if (npc.kind === 'chest' || npc.kind === 'treasure') {
    return <ChestFigure npc={npc} isNear={isNear} />
  }

  return (
    <group position={npc.pos} scale={scale}>
      <group ref={group} rotation={[0, face, 0]}>
        {/* からだ */}
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[0.72, 0.9, 0.5]} />
          <meshLambertMaterial color={npc.color} emissive={emissive} />
        </mesh>
        {/* あたま */}
        <mesh position={[0, 1.25, 0]}>
          <boxGeometry args={[0.62, 0.62, 0.58]} />
          <meshLambertMaterial color={lightColor} emissive={emissive} />
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
      {/* ちかづくと 吹き出しが出る（ロック中は🔒） */}
      {isNear ? (
        <TextSprite
          text={areaLocked ? `🔒 ${npc.label}` : `💬 ${npc.label}`}
          position={[0, 2.2, 0]}
          scale={1.05}
          bg="rgba(255,249,224,0.97)"
        />
      ) : (
        <TextSprite text={areaLocked ? `🔒 ${npc.label}` : npc.label} position={[0, 2.15, 0]} scale={1.0} />
      )}
      {isNear && <NearRing />}
    </group>
  )
}

// ---------------------------------------------------------------
// エリア解放：ロック中のゲートと、解放後のとくべつひろば
// ---------------------------------------------------------------
function AreaGates() {
  const unlockedAreas = useGameStore((s) => s.save?.unlockedAreas)
  if (!unlockedAreas) return null
  return (
    <>
      {UNLOCKABLE_AREAS.map((a) => {
        if (unlockedAreas.includes(a.id)) return null
        return (
          <group key={a.id} position={a.gatePos}>
            {/* ロックのゲート（とおりぬけはできる。じゃまはしない） */}
            {[-1.1, 1.1].map((x) => (
              <mesh key={x} position={[x, 1, 0]}>
                <boxGeometry args={[0.3, 2, 0.3]} />
                <meshLambertMaterial color="#9aa0a6" />
              </mesh>
            ))}
            <mesh position={[0, 2.1, 0]}>
              <boxGeometry args={[2.5, 0.3, 0.3]} />
              <meshLambertMaterial color="#9aa0a6" />
            </mesh>
            <mesh position={[0, 1.1, 0]}>
              <boxGeometry args={[0.7, 0.8, 0.25]} />
              <meshLambertMaterial color="#e8b93e" />
            </mesh>
            <TextSprite text={`🔒 ${a.icon} ${a.name}`} position={[0, 3, 0]} scale={1.1} />
            <TextSprite
              text={a.conditionText}
              position={[0, 2.5, 0]}
              scale={0.75}
              bg="rgba(255,255,255,0.85)"
            />
          </group>
        )
      })}
      {/* とくべつひろば（解放されると にじのアーチと ほしの柱があらわれる） */}
      {unlockedAreas.includes('tokubetsu') && (
        <group position={[-15, 0, 17]}>
          {['#e57373', '#ffd54f', '#81c784', '#64b5f6', '#ba68c8'].map((c, i) => (
            <mesh key={i} position={[0, 2.6 + i * 0.28, 0]} rotation={[0, 0.4, 0]}>
              <boxGeometry args={[5 - i * 0.7, 0.26, 0.3]} />
              <meshLambertMaterial color={c} />
            </mesh>
          ))}
          {[-2.2, 2.2].map((x) => (
            <mesh key={x} position={[x * Math.cos(0.4), 1.3, -x * Math.sin(0.4)]} rotation={[0, 0.4, 0]}>
              <boxGeometry args={[0.35, 2.6, 0.35]} />
              <meshLambertMaterial color="#fdf6e9" />
            </mesh>
          ))}
          <mesh position={[0, 3.9, 0]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.5, 0.5, 0.3]} />
            <meshBasicMaterial color="#ffd54f" />
          </mesh>
          <TextSprite text="🌈 とくべつひろば" position={[0, 4.8, 0]} scale={1.3} bg="rgba(255,249,224,0.95)" />
        </group>
      )}
    </>
  )
}

/** 宝箱（まいにちボックス＆たんけんのたからばこ） */
function ChestFigure({ npc, isNear }: { npc: WorldNPC; isNear: boolean }) {
  const sparkle = useRef<THREE.Group>(null!)
  const isTreasure = npc.kind === 'treasure'
  const opened = useGameStore((s) => {
    if (!s.save) return false
    return isTreasure
      ? s.save.openedChests.includes(npc.id)
      : s.save.chestDate === todayString()
  })

  useFrame(({ clock }) => {
    if (sparkle.current) {
      sparkle.current.position.y = 1.35 + Math.sin(clock.elapsedTime * 3) * 0.15
    }
  })

  const bodyColor = opened ? '#8a6a4a' : isTreasure ? '#a8442f' : '#b5813a'
  const lidColor = opened ? '#75593d' : isTreasure ? '#c0392b' : '#e8b93e'

  return (
    <group position={npc.pos} scale={isNear ? 1.07 : 1}>
      {/* どうたい */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.9, 0.6, 0.65]} />
        <meshLambertMaterial color={bodyColor} emissive={isNear ? '#3a2a00' : '#000000'} />
      </mesh>
      {/* ふた（あけると うしろに ひらく） */}
      <group position={[0, 0.6, -0.32]} rotation={[opened ? -2.0 : 0, 0, 0]}>
        <mesh position={[0, 0.09, 0.35]}>
          <boxGeometry args={[0.95, 0.18, 0.7]} />
          <meshLambertMaterial color={lidColor} />
        </mesh>
      </group>
      {/* かなぐ */}
      <mesh position={[0, 0.45, 0.34]}>
        <boxGeometry args={[0.16, 0.2, 0.06]} />
        <meshLambertMaterial color="#ffe082" />
      </mesh>
      {/* あいているときは 中がきらり */}
      {opened && (
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[0.7, 0.15, 0.45]} />
          <meshBasicMaterial color="#ffe9a8" />
        </mesh>
      )}
      {/* まだあけていない たからばこは ✨がうかぶ */}
      {!opened && (
        <group ref={sparkle}>
          <TextSprite text="✨" position={[0, 0, 0]} scale={0.7} bg="rgba(255,255,255,0)" />
        </group>
      )}
      {!isTreasure && <TextSprite text={`🎁 ${npc.label}`} position={[0, 1.9, 0]} scale={0.9} />}
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
  const openedChests = useGameStore((s) => s.save?.openedChests)
  if (step === null) return null

  const targets: WorldNPC[] = []
  if (step === 1 || step === 2) {
    // かんばんと ナビちゃん
    for (const id of ['sign-welcome', 'npc-guide']) {
      const npc = WORLD_NPCS.find((n) => n.id === id)
      if (npc) targets.push(npc)
    }
  } else if (step === 3 || step === 4) {
    const subjects = GRADES[grade].mainSubjects
    for (const npc of WORLD_NPCS) {
      if (npc.kind === 'quest' && npc.subject && subjects.includes(npc.subject)) {
        targets.push(npc)
      }
    }
  } else if (step === 5) {
    const build = WORLD_NPCS.find((n) => n.id === 'npc-build')
    if (build) targets.push(build)
  } else if (step === 7) {
    // まだあけていない たからばこ
    for (const npc of WORLD_NPCS) {
      if (npc.kind === 'treasure' && !openedChests?.includes(npc.id)) targets.push(npc)
    }
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
// けんちくエリアのブロック（ワールドにも表示され、上に乗れる）
// ---------------------------------------------------------------
function BuiltBlocks() {
  const layers = useGameStore((s) => s.save?.buildLayers)
  if (!layers) return null
  const [ox, oz] = BUILD_ORIGIN
  const hasAny = layers.some((layer) => layer.some(Boolean))
  return (
    <group>
      {layers.map((layer, li) =>
        layer.map((blockId, i) => {
          if (!blockId) return null
          const def = BLOCK_MAP[blockId]
          if (!def) return null
          const x = ox + (i % BUILD_GRID_SIZE)
          const z = oz + Math.floor(i / BUILD_GRID_SIZE)
          return (
            <mesh key={`${li}-${i}`} position={[x, 0.5 + li, z]}>
              <boxGeometry args={[0.96, 0.96, 0.96]} />
              <meshLambertMaterial
                color={def.color}
                transparent={blockId === 'glass' || blockId === 'water'}
                opacity={blockId === 'glass' ? 0.55 : blockId === 'water' ? 0.75 : 1}
              />
            </mesh>
          )
        }),
      )}
      {/* なにか たてると「じぶんの けんちく」の めじるしが出る */}
      {hasAny && (
        <TextSprite
          text="✨ じぶんの けんちく"
          position={[0.5, 4.6, 16.5]}
          scale={1.1}
          bg="rgba(255,249,224,0.95)"
        />
      )}
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
      <AreaGates />
      <TutorialArrows />
      <BuiltBlocks />
      <Player />
    </Canvas>
  )
}
