// Labels sit near the side they point from, so a label near an edge grows inwards, not off the picture.
export function labelAnchor(x) {
  if (x < 250) return 0
  if (x > 750) return 1
  return 0.5
}

const INK = '#17233a'
const SECONDARY_INK = '#4f5b6b'

// Draws the stage labels into the picture for download. The browser shapes Devanagari and Tamil
// correctly on a canvas, which the image model and the server's image tools cannot.
export async function labelledPictureBlob(image, stages, positions) {
  const picture = new Image()
  picture.src = image
  await picture.decode()
  await document.fonts.ready

  const canvas = document.createElement('canvas')
  canvas.width = picture.naturalWidth
  canvas.height = picture.naturalHeight
  const ctx = canvas.getContext('2d')
  ctx.drawImage(picture, 0, 0)

  const size = Math.round(canvas.width / 34)
  const padX = size * 0.5
  const height = size * 1.7
  const gap = size * 0.45
  ctx.textBaseline = 'middle'
  ctx.lineWidth = Math.max(2, size / 10)

  for (const p of positions) {
    const number = String(p.stage)
    const label = stages[p.stage - 1]?.label ?? ''
    ctx.font = `700 ${size}px Mukta, "Mukta Malar", sans-serif`
    const numberWidth = ctx.measureText(number).width
    ctx.font = `600 ${size}px Mukta, "Mukta Malar", sans-serif`
    const width = padX * 2 + numberWidth + gap + ctx.measureText(label).width

    const cx = (p.x / 1000) * canvas.width
    const cy = (p.y / 1000) * canvas.height
    const left = Math.min(Math.max(cx - width * labelAnchor(p.x), 4), canvas.width - width - 4)
    const top = Math.min(Math.max(cy - height / 2, 4), canvas.height - height - 4)

    ctx.fillStyle = '#ffffff'
    ctx.strokeStyle = INK
    ctx.beginPath()
    ctx.roundRect(left, top, width, height, 4)
    ctx.fill()
    ctx.stroke()

    ctx.font = `700 ${size}px Mukta, "Mukta Malar", sans-serif`
    ctx.fillStyle = SECONDARY_INK
    ctx.fillText(number, left + padX, top + height / 2)
    ctx.font = `600 ${size}px Mukta, "Mukta Malar", sans-serif`
    ctx.fillStyle = INK
    ctx.fillText(label, left + padX + numberWidth + gap, top + height / 2)
  }

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9))
}
