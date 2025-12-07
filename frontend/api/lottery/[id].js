// This API endpoint serves dynamic HTML with proper OG tags for lottery pages
// Social crawlers will hit this and get the right meta tags

export const config = {
  runtime: 'edge',
}

export default async function handler(req) {
  const url = new URL(req.url)
  const pathParts = url.pathname.split('/')
  const lotteryId = pathParts[pathParts.length - 1]

  // Get lottery params from query string
  const prize = url.searchParams.get('prize') || ''
  const prizeSui = url.searchParams.get('prizeSui') || ''
  const fee = url.searchParams.get('fee') || ''
  const slots = url.searchParams.get('slots') || '9'
  const filled = url.searchParams.get('filled') || '0'

  // Build OG image URL with params
  const ogImageParams = new URLSearchParams()
  if (prize) ogImageParams.set('prize', prize)
  if (prizeSui) ogImageParams.set('prizeSui', prizeSui)
  if (fee) ogImageParams.set('fee', fee)
  if (slots) ogImageParams.set('slots', slots)
  if (filled) ogImageParams.set('filled', filled)

  const ogImageUrl = `https://suiyan.fun/api/og${ogImageParams.toString() ? '?' + ogImageParams.toString() : ''}`

  const available = parseInt(slots) - parseInt(filled)
  const title = prize
    ? `Win ${prize} SUIYAN - suiyan.fun Lottery`
    : 'suiyan.fun - On-Chain Lottery on Sui'
  const description = prize && fee
    ? `Prize: ${prize} SUIYAN (~${prizeSui} SUI) | Entry: ${fee} SUI | Win odds: 1/${available} (${(100/available).toFixed(0)}%)`
    : 'Pick your slot, win big! Decentralized lottery game with up to 1,000,000 $SUIYAN prizes.'

  // Return HTML that redirects to the SPA but has correct OG tags
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <meta name="description" content="${description}">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://suiyan.fun/lottery/${lotteryId}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${ogImageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@suiyan_fun">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${ogImageUrl}">

  <!-- Redirect to SPA for real users (crawlers don't execute JS) -->
  <script>window.location.href = '/lottery/${lotteryId}';</script>
  <noscript>
    <meta http-equiv="refresh" content="0;url=/lottery/${lotteryId}">
  </noscript>
</head>
<body>
  <p>Redirecting to lottery...</p>
  <p><a href="/lottery/${lotteryId}">Click here if not redirected</a></p>
</body>
</html>`

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=60',
    },
  })
}
