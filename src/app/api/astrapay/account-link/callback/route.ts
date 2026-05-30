import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

// GET – Handle redirect from AstraPay after account linking
//
// AstraPay redirects the user here after they complete the account
// linking flow on AstraPay's side. The URL includes query params
// that identify the user and confirm the linking result.
//
// Expected query params from AstraPay redirect:
//   - merchantUserId  – the merchant user ID we sent when creating the link
//   - astrapayPhone   – the AstraPay phone number that was linked
//   - signature       – cryptographic signature from AstraPay
//   - status          – "SUCCESS" or "FAILED"
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const merchantUserId = searchParams.get('merchantUserId')
    const astrapayPhone = searchParams.get('astrapayPhone') || searchParams.get('phoneNumber')
    const signature = searchParams.get('signature')
    const status = searchParams.get('status')

    if (!merchantUserId) {
      return new Response(
        buildHtmlPage(false, 'Missing merchantUserId parameter'),
        { headers: { 'Content-Type': 'text/html' } },
      )
    }

    // Find the account link record by merchant_user_id
    const accountLink = await db.astraPayAccountLink.findFirst({
      where: { merchant_user_id: merchantUserId },
    })

    if (!accountLink) {
      return new Response(
        buildHtmlPage(false, 'Account link record not found'),
        { headers: { 'Content-Type': 'text/html' } },
      )
    }

    // Only mark as linked if AstraPay confirmed success (or if status is missing, treat as success)
    const isSuccess = !status || status.toUpperCase() === 'SUCCESS'

    if (isSuccess) {
      await db.astraPayAccountLink.update({
        where: { id: accountLink.id },
        data: {
          is_linked: true,
          linked_at: new Date(),
          astrapay_phone: astrapayPhone || null,
          signature: signature || null,
        },
      })
    }

    return new Response(
      buildHtmlPage(isSuccess, isSuccess ? 'Account linked successfully!' : 'Account linking was not completed.'),
      { headers: { 'Content-Type': 'text/html' } },
    )
  } catch (error) {
    console.error('[AstraPay Account Link Callback Error]', error)
    return new Response(
      buildHtmlPage(false, 'An error occurred during account linking'),
      { headers: { 'Content-Type': 'text/html' } },
    )
  }
}

/**
 * Build a minimal HTML page that informs the user of the result
 * and attempts to close the popup or redirect back to the app.
 */
function buildHtmlPage(success: boolean, message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AstraPay Account Linking</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #f9fafb;
      color: #111827;
    }
    .container {
      text-align: center;
      padding: 2rem;
      max-width: 400px;
    }
    .icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    .message {
      font-size: 1.125rem;
      margin-bottom: 1.5rem;
    }
    .btn {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      background: ${success ? '#059669' : '#dc2626'};
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-size: 1rem;
      cursor: pointer;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">${success ? '&#10003;' : '&#10007;'}</div>
    <p class="message">${message}</p>
    <button class="btn" onclick="closeWindow()">Close</button>
  </div>
  <script>
    function closeWindow() {
      if (window.opener) {
        window.opener.postMessage({ type: 'astrapay_account_linked', success: ${success} }, '*');
        window.close();
      } else {
        window.location.href = '/';
      }
    }
    // Auto-close after 3 seconds if this is a popup
    setTimeout(function() {
      if (window.opener) {
        window.opener.postMessage({ type: 'astrapay_account_linked', success: ${success} }, '*');
        try { window.close(); } catch(e) {}
      }
    }, 3000);
  </script>
</body>
</html>`
}
