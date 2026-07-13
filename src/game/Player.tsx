import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'
import { WORLD_HALF, WORLD_NPCS } from '../data/world'
import { PET_MAP, petLevel, petScale } from '../data/rewards'
import { AVATARS } from '../data/avatars'
import { inputState } from './input'
import { playerState } from './playerState'
import { petMood } from './effects'
import { playSound } from './sound'
import { sampleGround, STEP_UP } from './terrain'
import { UI } from '../data/uiText'
import { TextSprite } from './TextSprite'
import type { WorldNPC } from '../types/game'

// 毎フレームnewしないための使い回しベクトル
const _camTarget = new THREE.Vector3()
const _petTarget = new THREE.Vector3()
const _unitScale = new THREE.Vector3(1, 1, 1)

/** プレイヤー（移動・ジャンプ・カメラ追従・ちかくのNPC判定・ペット） */
export function Player() {
  const group = useRef<THREE.Group>(null!)
  const body = useRef<THREE.Group>(null!)
  const petRef = useRef<THREE.Group>(null!)
  const velocityY = useRef(0)
  /** なめらかな加減速のための今の速度 */
  const vel = useRef({ x: 0, z: 0 })
  const airborne = useRef(false)
  /** 着地スカッシュの残り時間 */
  const squash = useRef(0)
  /** 水に落ちたときにもどる、さいごに立っていた安全な場所 */
  const lastSafe = useRef<[number, number]>([0, 5])
  /** 水からもどった直後は、すこしのあいだ水判定をしない（連続で落ちない） */
  const splashCooldown = useRef(0)
  /** チュートリアル①「あるいてみよう」用の移動量 */
  const walkedDistance = useRef(0)
  /** ペットの宝箱センサーのチェック間隔 */
  const senseTimer = useRef(0)
  const camera = useThree((s) => s.camera)
  const avatar = useGameStore((s) => s.save?.avatar ?? 0)
  const petType = useGameStore((s) => s.save?.pet?.type ?? null)
  const petGrowth = useGameStore((s) => s.save?.pet?.growth ?? 0)
  const questOpen = useGameStore((s) => s.quest !== null)
  const dialogOpen = useGameStore((s) => s.dialog !== null)
  const bossOpen = useGameStore((s) => s.boss !== null)
  const avatarDef = AVATARS[avatar % AVATARS.length]
  const color = avatarDef.color
  const petDef = petType ? PET_MAP[petType] : null

  useFrame(({ clock }, dt) => {
    const delta = Math.min(dt, 0.05)
    const g = group.current
    if (!g) return

    // 「ひろばへもどる」ボタンが押されたら安全な広場へ
    if (playerState.respawnQueued) {
      playerState.respawnQueued = false
      g.position.set(0, 0.1, 5)
      vel.current.x = 0
      vel.current.z = 0
      velocityY.current = 0
      lastSafe.current = [0, 5]
    }

    const paused = questOpen || dialogOpen || bossOpen
    const buildLayers = useGameStore.getState().save?.buildLayers ?? null

    // 入力の合成（キーボード＋タッチパッド）
    let mx = inputState.moveX + inputState.touchX
    let mz = inputState.moveZ + inputState.touchZ
    const len = Math.hypot(mx, mz)
    if (len > 1) {
      mx /= len
      mz /= len
    }
    if (paused) {
      mx = 0
      mz = 0
    }

    // カメラの向きに合わせて移動方向を回転
    const yaw = inputState.cameraYaw
    const c = Math.cos(yaw)
    const s = Math.sin(yaw)
    const dirX = c * mx + s * mz
    const dirZ = -s * mx + c * mz

    // なめらかな加減速（すっと歩き出し、すっと止まる）
    const speed = 5.5
    const smoothing = 1 - Math.exp(-delta * 11)
    vel.current.x += (dirX * speed - vel.current.x) * smoothing
    vel.current.z += (dirZ * speed - vel.current.z) * smoothing
    const moveSpeed = Math.hypot(vel.current.x, vel.current.z)

    // ---- 地形をみながら横に動く（壁と高い段差は入れない） ----
    const feetY = g.position.y
    const canEnter = (nx: number, nz: number) => {
      const t = sampleGround(nx, nz, buildLayers)
      if (t.wall) return false
      // いまの足の高さから STEP_UP より高い場所へは、上からしか入れない
      if (t.height - feetY > STEP_UP) return false
      return true
    }
    let nx = THREE.MathUtils.clamp(g.position.x + vel.current.x * delta, -WORLD_HALF + 1, WORLD_HALF - 1)
    let nz = THREE.MathUtils.clamp(g.position.z + vel.current.z * delta, -WORLD_HALF + 1, WORLD_HALF - 1)
    // X・Zを別々に判定すると、壁ぞいでも引っかからずスライドできる
    if (!canEnter(nx, g.position.z)) {
      nx = g.position.x
      vel.current.x = 0
    }
    if (!canEnter(nx, nz)) {
      nz = g.position.z
      vel.current.z = 0
    }
    g.position.x = nx
    g.position.z = nz

    // ---- いまいる場所の地面の高さ ----
    const here = sampleGround(nx, nz, buildLayers)
    const ground = here.height

    // ジャンプ（地面に立っているときだけ）
    if (inputState.jump && g.position.y <= ground + 0.001 && !paused) {
      velocityY.current = 6.2
      airborne.current = true
      playSound('jump')
    }

    // 重力と着地
    velocityY.current -= 17 * delta
    let newY = g.position.y + velocityY.current * delta
    if (newY > ground + 0.02 && velocityY.current < 0) airborne.current = true
    if (newY <= ground) {
      if (airborne.current && velocityY.current < -4) {
        squash.current = 0.16 // 着地でぷにっとつぶれる
        if (ground > 0.01) playSound('place') // ブロックの上にコトン
      }
      newY = ground
      airborne.current = false
      velocityY.current = 0
    }
    // なだらかな段差はすっとのぼる
    if (!airborne.current && newY < ground) newY = ground
    g.position.y = newY

    // ---- 水に落ちたら、さいごに立っていた場所へもどす ----
    splashCooldown.current = Math.max(0, splashCooldown.current - delta)
    if (here.water && g.position.y <= 0.02 && splashCooldown.current <= 0) {
      const [sx, sz] = lastSafe.current
      g.position.set(sx, 0.1, sz)
      vel.current.x = 0
      vel.current.z = 0
      velocityY.current = 0
      airborne.current = false
      splashCooldown.current = 1.2
      playSound('jump')
      useGameStore.getState().showToast(UI.world2.splash)
    } else if (!airborne.current && !here.water) {
      // 安全な場所をおぼえておく
      lastSafe.current = [g.position.x, g.position.z]
    }

    // 体の向きと歩きアニメ（速度に合わせてはずむ）
    const speedRatio = Math.min(1, moveSpeed / speed)
    if (body.current) {
      if (moveSpeed > 0.4) {
        const target = Math.atan2(vel.current.x, vel.current.z)
        let diff = target - body.current.rotation.y
        while (diff > Math.PI) diff -= Math.PI * 2
        while (diff < -Math.PI) diff += Math.PI * 2
        body.current.rotation.y += diff * Math.min(1, delta * 12)
      }
      body.current.position.y = Math.abs(Math.sin(clock.elapsedTime * 9)) * 0.09 * speedRatio

      // 着地スカッシュ
      if (squash.current > 0) {
        squash.current -= delta
        body.current.scale.set(1.12, 0.82, 1.12)
      } else {
        body.current.scale.lerp(_unitScale, Math.min(1, delta * 14))
      }
    }

    // 位置を覚えておく（建築・ショップから戻っても同じ場所）
    playerState.pos = [g.position.x, 0, g.position.z]

    // チュートリアル①：すこし歩いたら達成（一度呼んだら以後は判定しない）
    if (walkedDistance.current >= 0 && moveSpeed > 0.4) {
      walkedDistance.current += moveSpeed * delta
      if (walkedDistance.current > 2.5) {
        useGameStore.getState().advanceTutorial(0)
        walkedDistance.current = -1
      }
    }

    if (import.meta.env.DEV) {
      ;(window as unknown as Record<string, unknown>).__playerPos = [
        Math.round(g.position.x * 10) / 10,
        Math.round(g.position.y * 100) / 100,
        Math.round(g.position.z * 10) / 10,
      ]
    }

    // カメラ追従（急に動かないようゆっくり追いかける）
    const dist = 10.5
    _camTarget.set(
      g.position.x + Math.sin(yaw) * dist,
      g.position.y + 7,
      g.position.z + Math.cos(yaw) * dist,
    )
    camera.position.lerp(_camTarget, 1 - Math.exp(-delta * 6))
    camera.lookAt(g.position.x, g.position.y + 1.2, g.position.z)

    // ちかくのNPCをさがす
    let nearest: WorldNPC | null = null
    let nearestD = 3.0
    for (const npc of WORLD_NPCS) {
      const d = Math.hypot(npc.pos[0] - g.position.x, npc.pos[2] - g.position.z)
      if (d < nearestD) {
        nearestD = d
        nearest = npc
      }
    }
    useGameStore.getState().setNearby(nearest)

    // ペットのとくぎ（レベル2）：ちかくの あけていない たからばこを かんじる
    senseTimer.current -= delta
    if (senseTimer.current <= 0) {
      senseTimer.current = 0.7
      const st = useGameStore.getState()
      const save = st.save
      let sensing = false
      if (save?.pet && petLevel(save.pet.growth) >= 2) {
        for (const npc of WORLD_NPCS) {
          if (npc.kind !== 'treasure' || save.openedChests.includes(npc.id)) continue
          if (Math.hypot(npc.pos[0] - g.position.x, npc.pos[2] - g.position.z) < 9) {
            sensing = true
            break
          }
        }
      }
      st.setPetSense(sensing)
    }

    // ペットがついてくる＆正解するとよろこぶ
    if (petRef.current) {
      const p = petRef.current
      _petTarget.set(
        g.position.x - vel.current.x * 0.28 - 1.0,
        p.position.y,
        g.position.z - vel.current.z * 0.28 + 0.6,
      )
      p.position.lerp(_petTarget, Math.min(1, delta * 3))
      // ペットも地面の高さにあわせてふわふわ（ブロックの上にもついてくる）
      const petGroundH = sampleGround(p.position.x, p.position.z, buildLayers).height
      const celebrating = performance.now() < petMood.celebrateUntil
      if (celebrating) {
        // くるくるまわって おおよろこび
        p.rotation.y += delta * 9
        p.position.y = petGroundH + 0.8 + Math.abs(Math.sin(clock.elapsedTime * 8)) * 0.5
      } else {
        p.rotation.y += (0 - (p.rotation.y % (Math.PI * 2))) * Math.min(1, delta * 5)
        p.position.y = petGroundH + 0.7 + Math.sin(clock.elapsedTime * 3) * 0.15
      }
    }
  })

  return (
    <>
      <group ref={group} position={playerState.pos}>
        <group ref={body}>
          {/* からだ */}
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[0.6, 0.7, 0.42]} />
            <meshLambertMaterial color={color} />
          </mesh>
          {/* あし */}
          <mesh position={[-0.16, 0.12, 0]}>
            <boxGeometry args={[0.22, 0.28, 0.3]} />
            <meshLambertMaterial color="#5f6b7a" />
          </mesh>
          <mesh position={[0.16, 0.12, 0]}>
            <boxGeometry args={[0.22, 0.28, 0.3]} />
            <meshLambertMaterial color="#5f6b7a" />
          </mesh>
          {/* あたま */}
          <mesh position={[0, 1.15, 0]}>
            <boxGeometry args={[0.58, 0.58, 0.54]} />
            <meshLambertMaterial color="#ffdbac" />
          </mesh>
          {/* かみのけ・ぼうし（アバタータイプで変わる） */}
          <mesh position={[0, 1.42, -0.05]}>
            <boxGeometry args={[0.62, 0.2, 0.5]} />
            <meshLambertMaterial color={avatarDef.hair} />
          </mesh>
          {avatarDef.hat === 'cap' && (
            <mesh position={[0, 1.4, 0.34]}>
              <boxGeometry args={[0.52, 0.09, 0.3]} />
              <meshLambertMaterial color={avatarDef.hair} />
            </mesh>
          )}
          {avatarDef.hat === 'leaf' && (
            <mesh position={[0, 1.58, 0]} rotation={[0, 0.5, 0.12]}>
              <boxGeometry args={[0.14, 0.08, 0.34]} />
              <meshLambertMaterial color="#3f8f3a" />
            </mesh>
          )}
          {avatarDef.hat === 'band' && (
            <mesh position={[0, 1.31, 0]}>
              <boxGeometry args={[0.63, 0.1, 0.59]} />
              <meshLambertMaterial color="#fff3e0" />
            </mesh>
          )}
          {avatarDef.hat === 'star' && (
            <mesh position={[0, 1.62, 0]} rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[0.2, 0.2, 0.12]} />
              <meshLambertMaterial color="#ffd54f" />
            </mesh>
          )}
          {/* め */}
          <mesh position={[-0.13, 1.18, 0.28]}>
            <boxGeometry args={[0.08, 0.1, 0.02]} />
            <meshBasicMaterial color="#3a3a3a" />
          </mesh>
          <mesh position={[0.13, 1.18, 0.28]}>
            <boxGeometry args={[0.08, 0.1, 0.02]} />
            <meshBasicMaterial color="#3a3a3a" />
          </mesh>
        </group>
        {/* かげ */}
        <mesh position={[0, 0.011, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.45, 16]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.18} />
        </mesh>
      </group>
      {petDef && (
        <group ref={petRef} position={[-1, 0.7, 6]} scale={petScale(petGrowth)}>
          <mesh>
            <boxGeometry args={[0.45, 0.45, 0.45]} />
            <meshLambertMaterial color={petDef.color} />
          </mesh>
          <mesh position={[-0.1, 0.05, 0.23]}>
            <boxGeometry args={[0.07, 0.09, 0.02]} />
            <meshBasicMaterial color="#3a3a3a" />
          </mesh>
          <mesh position={[0.1, 0.05, 0.23]}>
            <boxGeometry args={[0.07, 0.09, 0.02]} />
            <meshBasicMaterial color="#3a3a3a" />
          </mesh>
          {/* なまえ（スプライトなのでスピンしても正面を向く） */}
          <TextSprite text={petDef.name} position={[0, 0.75, 0]} scale={0.6} bg="rgba(255,255,255,0.85)" />
        </group>
      )}
    </>
  )
}
