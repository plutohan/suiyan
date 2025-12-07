import satori from 'satori'
import { html } from 'satori-html'
import sharp from 'sharp'

export const config = {
  runtime: 'nodejs',
  // Not edge - use Node.js runtime for sharp compatibility
}

export default async function handler(req, res) {
  const { searchParams } = new URL(req.url, `http://${req.headers.host}`)

  // Get dynamic params with defaults
  const prize = searchParams.get('prize') || ''
  const prizeSui = searchParams.get('prizeSui') || ''
  const fee = searchParams.get('fee') || ''
  const slots = searchParams.get('slots') || '9'
  const filled = searchParams.get('filled') || '0'

  const available = parseInt(slots) - parseInt(filled)
  const winOdds = available > 0 ? Math.round(100 / available) : 0
  const isLotteryPage = prize && fee

  // Load fonts
  const [bangersRes, chakraRes] = await Promise.all([
    fetch('https://fonts.gstatic.com/s/bangers/v24/FeVQS0BTqb0h60ACH55Q2J5hm24.ttf'),
    fetch('https://fonts.gstatic.com/s/chakrapetch/v11/cIf6MapPsJ8e_ooMkH9v.woff2'),
  ])

  const bangersFont = await bangersRes.arrayBuffer()
  const chakraFont = await chakraRes.arrayBuffer()

  // Build the HTML template
  const markup = html`
    <div style="display: flex; width: 1200px; height: 630px; position: relative; background: #050508; font-family: 'Chakra Petch', sans-serif;">
      <!-- Background Image -->
      <img src="https://suiyan.fun/og-bg.png" style="position: absolute; width: 100%; height: 100%; object-fit: cover;" />

      <!-- Gradient Overlay -->
      <div style="display: flex; position: absolute; width: 100%; height: 100%; background: linear-gradient(90deg, rgba(5,5,8,0.95) 0%, rgba(5,5,8,0.6) 50%, rgba(5,5,8,0.2) 100%);" />

      <!-- Content -->
      <div style="display: flex; flex-direction: column; justify-content: center; padding: 60px; position: relative; z-index: 10;">
        <!-- Badge -->
        <div style="display: flex; align-items: center; padding: 6px 12px; background: rgba(0,240,255,0.1); border: 1px solid rgba(0,240,255,0.4); color: #00F0FF; font-size: 14px; letter-spacing: 0.15em; margin-bottom: 24px; width: fit-content;">
          ⚡ ON-CHAIN LOTTERY ON SUI
        </div>

        <!-- Headlines -->
        <div style="display: flex; font-family: 'Bangers'; font-size: 72px; color: white; line-height: 0.95; margin-bottom: 16px;">
          Pick a Slot,
        </div>
        <div style="display: flex; font-family: 'Bangers'; font-size: 72px; line-height: 0.95; color: #FFD700; margin-bottom: 32px;">
          Win SUIYAN Tokens
        </div>

        ${isLotteryPage ? `
          <!-- Lottery Details -->
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <!-- Prize Box -->
            <div style="display: flex; align-items: center; padding: 16px 24px; background: rgba(255,215,0,0.15); border: 2px solid #FFD700; border-radius: 8px;">
              <span style="display: flex; color: #FFD700; font-size: 32px; font-weight: bold;">🏆 Prize: ${prize} SUIYAN</span>
              ${prizeSui ? `<span style="display: flex; color: #9CA3AF; font-size: 22px; margin-left: 16px;">(~${prizeSui} SUI)</span>` : ''}
            </div>

            <!-- Stats Row -->
            <div style="display: flex; gap: 32px; font-size: 24px;">
              <div style="display: flex; color: #00F0FF;">⚡ Entry: ${fee} SUI</div>
              <div style="display: flex; color: #22C55E;">🎯 Slots: ${available}/${slots}</div>
              <div style="display: flex; color: #F97316;">📊 Win: 1/${available} (${winOdds}%)</div>
            </div>
          </div>
        ` : `
          <!-- Default Description -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            <div style="display: flex; font-size: 20px; color: #9CA3AF; max-width: 500px; border-left: 2px solid rgba(255,215,0,0.3); padding-left: 16px; line-height: 1.5;">
              Pay a small SUI fee, win BIG SUIYAN! Anyone can create their own lottery with SUIYAN tokens.
            </div>
            <div style="display: flex; gap: 24px; font-size: 18px; color: #9CA3AF;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="display: flex; width: 8px; height: 8px; border-radius: 50%; background: #22C55E;" />
                Provably fair
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="display: flex; width: 8px; height: 8px; border-radius: 50%; background: #FFD700;" />
                Instant payouts
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="display: flex; width: 8px; height: 8px; border-radius: 50%; background: #00F0FF;" />
                Create your own
              </div>
            </div>
          </div>
        `}
      </div>
    </div>
  `

  // Generate SVG with Satori
  const svg = await satori(markup, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'Bangers',
        data: bangersFont,
        weight: 400,
        style: 'normal',
      },
      {
        name: 'Chakra Petch',
        data: chakraFont,
        weight: 400,
        style: 'normal',
      },
    ],
  })

  // Convert SVG to PNG
  const png = await sharp(Buffer.from(svg))
    .png()
    .toBuffer()

  res.setHeader('Content-Type', 'image/png')
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400')
  res.send(png)
}
