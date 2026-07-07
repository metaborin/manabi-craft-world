// ワールドのランドマーク・かざりオブジェクト。
// すべて軽いボックス中心で作り、3D負荷を上げすぎないようにする。

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { TextSprite } from './TextSprite'

/** ふつうの木 */
export function Tree({ position }: { position: [number, number, number] }) {
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

/** さくらの木（ピンク） */
export function SakuraTree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[0.4, 1.2, 0.4]} />
        <meshLambertMaterial color="#7a5238" />
      </mesh>
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[1.7, 0.9, 1.7]} />
        <meshLambertMaterial color="#f5a8c8" />
      </mesh>
      <mesh position={[0, 2.3, 0]}>
        <boxGeometry args={[1.1, 0.6, 1.1]} />
        <meshLambertMaterial color="#f9bdd6" />
      </mesh>
    </group>
  )
}

/** まつの木（三角がさなる） */
export function PineTree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.35, 1, 0.35]} />
        <meshLambertMaterial color="#6b4423" />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 1.2 + i * 0.7, 0]}>
          <boxGeometry args={[1.6 - i * 0.45, 0.6, 1.6 - i * 0.45]} />
          <meshLambertMaterial color={i % 2 === 0 ? '#2e7d4f' : '#35905a'} />
        </mesh>
      ))}
    </group>
  )
}

/** 風車（はねが回るランドマーク） */
export function Windmill({ position }: { position: [number, number, number] }) {
  const blades = useRef<THREE.Group>(null!)
  useFrame((_, dt) => {
    blades.current.rotation.z += dt * 0.8
  })
  return (
    <group position={position}>
      {/* とう */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[1.7, 4, 1.7]} />
        <meshLambertMaterial color="#efe3cd" />
      </mesh>
      <mesh position={[0, 4.4, 0]}>
        <coneGeometry args={[1.5, 1.2, 4]} />
        <meshLambertMaterial color="#d95f3b" />
      </mesh>
      {/* まど */}
      <mesh position={[0, 2.6, 0.88]}>
        <boxGeometry args={[0.5, 0.5, 0.05]} />
        <meshLambertMaterial color="#7ec8e3" />
      </mesh>
      {/* はね */}
      <group ref={blades} position={[0, 3.7, 1.0]}>
        <mesh>
          <boxGeometry args={[0.3, 4.2, 0.12]} />
          <meshLambertMaterial color="#8a5a33" />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.3, 4.2, 0.12]} />
          <meshLambertMaterial color="#8a5a33" />
        </mesh>
      </group>
    </group>
  )
}

/** ふんすい（広場の中心の目印） */
export function Fountain({ position }: { position: [number, number, number] }) {
  const water = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    water.current.position.y = 0.75 + Math.sin(clock.elapsedTime * 2.4) * 0.12
    water.current.rotation.y += 0.01
  })
  return (
    <group position={position}>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[1.5, 1.7, 0.5, 8]} />
        <meshLambertMaterial color="#b9b2a6" />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.15, 8]} />
        <meshLambertMaterial color="#5ec8f2" />
      </mesh>
      <mesh ref={water} position={[0, 0.75, 0]}>
        <boxGeometry args={[0.45, 0.6, 0.45]} />
        <meshLambertMaterial color="#8fdcff" transparent opacity={0.85} />
      </mesh>
    </group>
  )
}

/** 川にかかる木の橋 */
export function Bridge({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* ゆか板 */}
      {[-1.2, -0.6, 0, 0.6, 1.2].map((x, i) => (
        <mesh key={i} position={[x, 0.3, 0]}>
          <boxGeometry args={[0.55, 0.14, 2.4]} />
          <meshLambertMaterial color={i % 2 === 0 ? '#b07a44' : '#a06f3c'} />
        </mesh>
      ))}
      {/* てすり */}
      {[-1, 1].map((z) => (
        <group key={z}>
          <mesh position={[-1.35, 0.65, z]}>
            <boxGeometry args={[0.14, 0.7, 0.14]} />
            <meshLambertMaterial color="#8a5a33" />
          </mesh>
          <mesh position={[1.35, 0.65, z]}>
            <boxGeometry args={[0.14, 0.7, 0.14]} />
            <meshLambertMaterial color="#8a5a33" />
          </mesh>
          <mesh position={[0, 0.92, z]}>
            <boxGeometry args={[2.9, 0.12, 0.12]} />
            <meshLambertMaterial color="#8a5a33" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** かずのとう（算数エリアのランドマーク） */
export function NumberTower({ position }: { position: [number, number, number] }) {
  const colors = ['#e8743b', '#f59e42', '#ffd54f', '#fff3b0']
  return (
    <group position={position}>
      {colors.map((c, i) => (
        <mesh key={i} position={[0, 0.7 + i * 1.15, 0]}>
          <boxGeometry args={[2 - i * 0.4, 1.15, 2 - i * 0.4]} />
          <meshLambertMaterial color={c} />
        </mesh>
      ))}
      <TextSprite text="１２３" position={[0, 5.4, 0]} scale={1.1} bg="rgba(255,244,222,0.95)" />
    </group>
  )
}

/** かずのかいだん（1,2,3…とのぼるキューブ） */
export function NumberStairs({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[i * 1.05, (0.5 + i * 0.5) / 2, 0]}>
          <boxGeometry args={[1, 0.5 + i * 0.5, 1]} />
          <meshLambertMaterial color={['#ffd54f', '#f5b73b', '#f59e42', '#e8863b'][i]} />
        </mesh>
      ))}
    </group>
  )
}

/** おおきな本（国語エリアのランドマーク） */
export function GiantBook({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[2.6, 0.4, 2]} />
        <meshLambertMaterial color="#c0392b" />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[2.4, 0.35, 1.8]} />
        <meshLambertMaterial color="#fdf6e9" />
      </mesh>
      <mesh position={[0, 0.73, 0]}>
        <boxGeometry args={[2.6, 0.18, 2]} />
        <meshLambertMaterial color="#2e86c1" />
      </mesh>
      <TextSprite text="あいうえお" position={[0, 1.6, 0]} scale={0.85} bg="rgba(230,246,228,0.95)" />
    </group>
  )
}

/** おおきな えんぴつ */
export function GiantPencil({ position, rotation = 0.5 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.55, 0.55, 3]} />
        <meshLambertMaterial color="#ffd54f" />
      </mesh>
      <mesh position={[0, 0.3, 1.85]}>
        <boxGeometry args={[0.4, 0.4, 0.7]} />
        <meshLambertMaterial color="#e0b084" />
      </mesh>
      <mesh position={[0, 0.3, 2.3]}>
        <boxGeometry args={[0.18, 0.18, 0.25]} />
        <meshLambertMaterial color="#4a3728" />
      </mesh>
      <mesh position={[0, 0.3, -1.65]}>
        <boxGeometry args={[0.56, 0.56, 0.35]} />
        <meshLambertMaterial color="#f5a8c8" />
      </mesh>
    </group>
  )
}

/** さぎょうだい（建築エリア） */
export function Workbench({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[1.8, 0.18, 1]} />
        <meshLambertMaterial color="#b07a44" />
      </mesh>
      {[-0.75, 0.75].map((x) =>
        [-0.35, 0.35].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.35, z]}>
            <boxGeometry args={[0.16, 0.7, 0.16]} />
            <meshLambertMaterial color="#8a5a33" />
          </mesh>
        )),
      )}
      {/* どうぐ */}
      <mesh position={[-0.4, 0.95, 0]}>
        <boxGeometry args={[0.3, 0.22, 0.3]} />
        <meshLambertMaterial color="#e8b93e" />
      </mesh>
      <mesh position={[0.4, 0.92, 0.1]}>
        <boxGeometry args={[0.5, 0.14, 0.2]} />
        <meshLambertMaterial color="#9aa0a6" />
      </mesh>
    </group>
  )
}

/** ブロックおきば（つみあげたブロック） */
export function BlockPile({ position }: { position: [number, number, number] }) {
  const blocks: { p: [number, number, number]; c: string }[] = [
    { p: [0, 0.4, 0], c: '#d95f3b' },
    { p: [0.85, 0.4, 0.1], c: '#9aa0a6' },
    { p: [0.4, 1.2, 0.05], c: '#c98f4e' },
    { p: [-0.8, 0.4, 0.3], c: '#6abe30' },
  ]
  return (
    <group position={position}>
      {blocks.map((b, i) => (
        <mesh key={i} position={b.p}>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshLambertMaterial color={b.c} />
        </mesh>
      ))}
    </group>
  )
}

/** クレーンふうオブジェクト（先のブロックがゆれる） */
export function Crane({ position }: { position: [number, number, number] }) {
  const hook = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    hook.current.rotation.z = Math.sin(clock.elapsedTime * 0.9) * 0.12
  })
  return (
    <group position={position}>
      <mesh position={[0, 2.2, 0]}>
        <boxGeometry args={[0.35, 4.4, 0.35]} />
        <meshLambertMaterial color="#f5b73b" />
      </mesh>
      <mesh position={[-1.4, 4.3, 0]}>
        <boxGeometry args={[3.2, 0.28, 0.28]} />
        <meshLambertMaterial color="#f5b73b" />
      </mesh>
      <group ref={hook} position={[-2.8, 4.3, 0]}>
        <mesh position={[0, -0.9, 0]}>
          <boxGeometry args={[0.06, 1.8, 0.06]} />
          <meshLambertMaterial color="#5f6b7a" />
        </mesh>
        <mesh position={[0, -2.1, 0]}>
          <boxGeometry args={[0.7, 0.7, 0.7]} />
          <meshLambertMaterial color="#d95f3b" />
        </mesh>
      </group>
    </group>
  )
}

/** やたい（ショップの目印） */
export function ShopStall({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* カウンター */}
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[2.6, 1.1, 1]} />
        <meshLambertMaterial color="#b07a44" />
      </mesh>
      {/* はしら */}
      {[-1.2, 1.2].map((x) => (
        <mesh key={x} position={[x, 1.5, -0.4]}>
          <boxGeometry args={[0.14, 3, 0.14]} />
          <meshLambertMaterial color="#8a5a33" />
        </mesh>
      ))}
      {/* しましまのやね */}
      {[-1.1, -0.55, 0, 0.55, 1.1].map((x, i) => (
        <mesh key={i} position={[x, 3.05, 0]} rotation={[0.18, 0, 0]}>
          <boxGeometry args={[0.55, 0.12, 1.7]} />
          <meshLambertMaterial color={i % 2 === 0 ? '#e74c3c' : '#fdf6e9'} />
        </mesh>
      ))}
      {/* コインかんばん */}
      <mesh position={[0, 2.2, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 0.12, 12]} />
        <meshLambertMaterial color="#f5c518" />
      </mesh>
      {/* しなもの */}
      <mesh position={[-0.7, 1.3, 0.1]}>
        <boxGeometry args={[0.45, 0.45, 0.45]} />
        <meshLambertMaterial color="#b388ff" />
      </mesh>
      <mesh position={[0.6, 1.25, 0.15]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshLambertMaterial color="#5ec8f2" />
      </mesh>
    </group>
  )
}

/** ちいさな いえ */
export function SmallHouse({
  position,
  rotation = 0,
  wall = '#e5d5bd',
  roof = '#d95f3b',
}: {
  position: [number, number, number]
  rotation?: number
  wall?: string
  roof?: string
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[1.8, 1.6, 1.8]} />
        <meshLambertMaterial color={wall} />
      </mesh>
      <mesh position={[0, 1.95, 0]}>
        <coneGeometry args={[1.65, 1.1, 4]} />
        <meshLambertMaterial color={roof} />
      </mesh>
      {/* ドア・まど */}
      <mesh position={[0, 0.5, 0.92]}>
        <boxGeometry args={[0.5, 1, 0.06]} />
        <meshLambertMaterial color="#8a5a33" />
      </mesh>
      <mesh position={[0.55, 1.05, 0.92]}>
        <boxGeometry args={[0.4, 0.4, 0.05]} />
        <meshLambertMaterial color="#aee7ff" />
      </mesh>
    </group>
  )
}

/** がいとう（ひかるランプ） */
export function Lamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[0.14, 1.6, 0.14]} />
        <meshLambertMaterial color="#5f6b7a" />
      </mesh>
      <mesh position={[0, 1.75, 0]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshBasicMaterial color="#ffe9a8" />
      </mesh>
    </group>
  )
}
