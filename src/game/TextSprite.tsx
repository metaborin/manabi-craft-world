import { useMemo } from 'react'
import * as THREE from 'three'

/**
 * 日本語ラベルをCanvasに描いてスプライトとして表示する。
 * フォントファイル不要で軽量に日本語を3D空間に出せる。
 */
export function TextSprite({
  text,
  position,
  scale = 1,
  bg = 'rgba(255,255,255,0.92)',
  color = '#4a3728',
}: {
  text: string
  position: [number, number, number]
  scale?: number
  bg?: string
  color?: string
}) {
  const { texture, aspect } = useMemo(() => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const fontSize = 44
    const pad = 26
    ctx.font = `bold ${fontSize}px 'Hiragino Maru Gothic ProN', 'BIZ UDGothic', 'Yu Gothic', sans-serif`
    const w = Math.ceil(ctx.measureText(text).width) + pad * 2
    const h = fontSize + pad * 2
    canvas.width = w
    canvas.height = h
    // 角丸の吹き出し背景
    ctx.fillStyle = bg
    const r = h / 2
    ctx.beginPath()
    ctx.moveTo(r, 0)
    ctx.lineTo(w - r, 0)
    ctx.arc(w - r, r, r, -Math.PI / 2, Math.PI / 2)
    ctx.lineTo(r, h)
    ctx.arc(r, r, r, Math.PI / 2, (Math.PI * 3) / 2)
    ctx.closePath()
    ctx.fill()
    ctx.font = `bold ${fontSize}px 'Hiragino Maru Gothic ProN', 'BIZ UDGothic', 'Yu Gothic', sans-serif`
    ctx.fillStyle = color
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, w / 2, h / 2 + 2)
    const texture = new THREE.CanvasTexture(canvas)
    texture.anisotropy = 4
    return { texture, aspect: w / h }
  }, [text, bg, color])

  const height = 0.55 * scale
  return (
    <sprite position={position} scale={[height * aspect, height, 1]}>
      <spriteMaterial map={texture} transparent depthWrite={false} />
    </sprite>
  )
}
