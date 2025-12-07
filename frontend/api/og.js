import { ImageResponse } from '@vercel/og'

export const config = {
  runtime: 'edge',
}

export default async function handler(req) {
  const { searchParams } = new URL(req.url)

  // Get dynamic params with defaults
  const prize = searchParams.get('prize') || ''
  const prizeSui = searchParams.get('prizeSui') || ''
  const fee = searchParams.get('fee') || ''
  const slots = searchParams.get('slots') || '9'
  const filled = searchParams.get('filled') || '0'

  const available = parseInt(slots) - parseInt(filled)
  const winOdds = available > 0 ? (100 / available).toFixed(0) : 0

  // Check if this is a lottery-specific page
  const isLotteryPage = prize && fee

  // Load fonts
  const [bangersFont, chakraFont] = await Promise.all([
    fetch(new URL('https://fonts.gstatic.com/s/bangers/v24/FeVQS0BTqb0h60ACH55Q2J5hm24.ttf')).then(res => res.arrayBuffer()),
    fetch(new URL('https://fonts.gstatic.com/s/chakrapetch/v11/cIf6MapPsJ8e_ooMkH9v.woff2')).then(res => res.arrayBuffer()),
  ])

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          fontFamily: 'Chakra Petch, sans-serif',
          background: '#050508',
        }}
      >
        {/* Background Image */}
        <img
          src="https://suiyan.fun/og-bg.png"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Gradient Overlay */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, rgba(5,5,8,0.95) 0%, rgba(5,5,8,0.6) 50%, rgba(5,5,8,0.2) 100%)',
            display: 'flex',
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '60px',
            zIndex: 10,
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              background: 'rgba(0, 240, 255, 0.1)',
              border: '1px solid rgba(0, 240, 255, 0.4)',
              color: '#00F0FF',
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              marginBottom: '24px',
              width: 'fit-content',
            }}
          >
            ⚡ On-Chain Lottery on Sui
          </div>

          {/* Headline */}
          <div
            style={{
              fontFamily: 'Bangers',
              fontSize: '72px',
              fontWeight: 'normal',
              color: 'white',
              lineHeight: 0.95,
              marginBottom: '16px',
              textShadow: '0 4px 20px rgba(0,0,0,0.5)',
              display: 'flex',
            }}
          >
            Pick a Slot,
          </div>
          <div
            style={{
              fontFamily: 'Bangers',
              fontSize: '72px',
              fontWeight: 'normal',
              lineHeight: 0.95,
              background: 'linear-gradient(to right, #FFD700, #FDE68A, #F97316)',
              backgroundClip: 'text',
              color: 'transparent',
              marginBottom: '32px',
              display: 'flex',
            }}
          >
            Win SUIYAN Tokens
          </div>

          {/* Lottery-specific info or default description */}
          {isLotteryPage ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {/* Prize Row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 20px',
                    background: 'rgba(255, 215, 0, 0.15)',
                    border: '2px solid #FFD700',
                    borderRadius: '8px',
                  }}
                >
                  <span style={{ color: '#FFD700', fontSize: '28px', fontWeight: 'bold', display: 'flex' }}>
                    🏆 Prize: {prize} SUIYAN
                  </span>
                  {prizeSui && (
                    <span style={{ color: '#9CA3AF', fontSize: '20px', marginLeft: '12px', display: 'flex' }}>
                      (~{prizeSui} SUI)
                    </span>
                  )}
                </div>
              </div>

              {/* Stats Row */}
              <div
                style={{
                  display: 'flex',
                  gap: '24px',
                  fontSize: '22px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00F0FF' }}>
                  <span>⚡ Entry: {fee} SUI</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#22C55E' }}>
                  <span>🎯 Slots: {available}/{slots} left</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F97316' }}>
                  <span>📊 Win: 1/{available} ({winOdds}%)</span>
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              <div
                style={{
                  fontSize: '20px',
                  color: '#9CA3AF',
                  maxWidth: '500px',
                  borderLeft: '2px solid rgba(255, 215, 0, 0.3)',
                  paddingLeft: '16px',
                  lineHeight: 1.5,
                  display: 'flex',
                }}
              >
                Pay a small SUI fee, win BIG SUIYAN! Anyone can create their own lottery with SUIYAN tokens.
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '24px',
                  fontSize: '18px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9CA3AF' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E', display: 'flex' }}></span>
                  Provably fair
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9CA3AF' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FFD700', display: 'flex' }}></span>
                  Instant payouts
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9CA3AF' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00F0FF', display: 'flex' }}></span>
                  Create your own
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Bangers',
          data: bangersFont,
          style: 'normal',
        },
        {
          name: 'Chakra Petch',
          data: chakraFont,
          style: 'normal',
        },
      ],
    }
  )
}
