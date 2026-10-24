const fs = require('fs');
const path = require('path');

// Cache base64 data URI of the app launcher icon for zero-latency instant mobile rendering
let cachedIconBase64 = '';
try {
  const iconPath = path.join(__dirname, '../../../public/ic_launcher-web.png');
  if (fs.existsSync(iconPath)) {
    cachedIconBase64 = `data:image/png;base64,${fs.readFileSync(iconPath).toString('base64')}`;
  }
} catch (e) {
  // Fallback to static URL
}

/**
 * Clean White / Light-Themed Responsive Invite Page for Split Boss
 * Minimal, executive, distraction-free aesthetic with only essential branding
 */
function renderInvitePage({ preview, token, playStoreUrl, appSchemeUrl, webUrl, baseUrl, iconUrl }) {
  const isValid = preview && preview.valid;
  const group = preview?.group || {};
  const inviter = preview?.inviter || {};

  const effectiveBaseUrl = baseUrl || 'https://split.udhaar.store';
  const effectiveIconUrl = iconUrl || `${effectiveBaseUrl}/static/ic_launcher-web.png`;
  const displayIcon = cachedIconBase64 || '/static/ic_launcher-web.png';

  const groupName = group.name ? escapeHtml(group.name) : 'Split Boss Group';
  const inviterName = inviter.name ? escapeHtml(inviter.name) : 'A friend';
  const memberCount = group.memberCount || 1;
  const modeLabel = (group.mode ? group.mode.charAt(0).toUpperCase() + group.mode.slice(1) : 'Group') + ' Hisaab';

  const pageTitle = isValid
    ? `Join "${groupName}" on Split Boss`
    : `Group Invitation - Split Boss`;

  const pageDesc = isValid
    ? `${inviterName} invited you to join "${groupName}" on Split Boss to split expenses and settle via UPI.`
    : `Download Split Boss to effortlessly split bills and settle debts with friends.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${pageTitle}</title>
  
  <!-- Favicon & Touch Icons -->
  <link rel="icon" type="image/png" href="${escapeHtml(effectiveIconUrl)}">
  <link rel="apple-touch-icon" href="${escapeHtml(effectiveIconUrl)}">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${pageTitle}">
  <meta property="og:description" content="${pageDesc}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${escapeHtml(webUrl)}">
  <meta property="og:site_name" content="Split Boss">
  <meta property="og:image" content="${escapeHtml(effectiveIconUrl)}">
  <meta property="og:image:width" content="512">
  <meta property="og:image:height" content="512">

  <!-- Mobile Styling -->
  <meta name="theme-color" content="#FFFFFF">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">

  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-tap-highlight-color: transparent;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #F8FAFC;
      background-image: radial-gradient(at 50% 0%, #E6FAF0 0%, #F8FAFC 65%);
      color: #0F172A;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
      position: relative;
    }

    /* Container Card */
    .container {
      width: 100%;
      max-width: 420px;
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 24px;
      padding: 32px 24px;
      box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.02);
      text-align: center;
      animation: fadeIn 0.35s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Brand Header */
    .brand-row {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 24px;
    }

    .brand-logo-img {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      object-fit: cover;
      border: 1px solid #E2E8F0;
      background-color: #E6FAF0;
    }

    .brand-name {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.4px;
      color: #0F172A;
    }

    .brand-tag {
      font-size: 11px;
      font-weight: 700;
      background: #E6FAF0;
      color: #047857;
      padding: 3px 8px;
      border-radius: 999px;
      border: 1px solid #A7F3D0;
    }

    /* Invitation Header Badge */
    .invite-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      background: #F1F5F9;
      border: 1px solid #E2E8F0;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.6px;
      color: #475569;
      text-transform: uppercase;
      margin-bottom: 16px;
    }

    .pulse-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #059669;
    }

    /* Group Card */
    .group-hero {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 18px;
      padding: 22px 18px;
      margin-bottom: 22px;
    }

    .group-title {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.4px;
      color: #0F172A;
      margin-bottom: 6px;
      word-break: break-word;
    }

    .inviter-line {
      font-size: 13px;
      color: #64748B;
      margin-bottom: 14px;
    }

    .inviter-line strong {
      color: #0F172A;
      font-weight: 600;
    }

    .group-meta-tags {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .meta-tag {
      font-size: 12px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 8px;
      background: #FFFFFF;
      color: #475569;
      border: 1px solid #E2E8F0;
    }

    /* Call To Action Buttons */
    .cta-column {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 20px;
    }

    .btn-playstore {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      padding: 15px 20px;
      border-radius: 14px;
      background: #059669;
      color: #FFFFFF;
      font-size: 15px;
      font-weight: 700;
      text-decoration: none;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(5, 150, 105, 0.25);
      transition: background 0.15s ease, transform 0.15s ease;
    }

    .btn-playstore:hover {
      background: #047857;
      transform: translateY(-1px);
    }

    .btn-playstore:active {
      transform: scale(0.98);
    }

    .play-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .btn-openapp {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 12px 18px;
      border-radius: 12px;
      background: #FFFFFF;
      color: #334155;
      font-size: 13.5px;
      font-weight: 600;
      text-decoration: none;
      border: 1px solid #CBD5E1;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .btn-openapp:hover {
      background: #F1F5F9;
    }

    /* Invite Code Box */
    .code-box {
      background: #F8FAFC;
      border: 1px dashed #CBD5E1;
      border-radius: 14px;
      padding: 12px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 20px;
    }

    .code-text {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      font-weight: 600;
      color: #334155;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-align: left;
    }

    .code-label {
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748B;
      letter-spacing: 0.5px;
      display: block;
      margin-bottom: 2px;
      text-align: left;
    }

    .btn-copy {
      flex-shrink: 0;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 700;
      color: #047857;
      background: #E6FAF0;
      border: 1px solid #A7F3D0;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .btn-copy:hover {
      background: #D1FAE5;
    }

    /* UPI Trust Line */
    .upi-strip {
      font-size: 11px;
      color: #64748B;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-weight: 500;
    }

    .upi-dot {
      color: #CBD5E1;
    }

    /* Toast Notification */
    .toast {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(70px);
      background: #0F172A;
      color: #FFFFFF;
      padding: 10px 20px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      z-index: 100;
      opacity: 0;
      transition: all 0.25s ease;
      pointer-events: none;
      white-space: nowrap;
    }

    .toast.show {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }

    /* Error card */
    .error-card {
      padding: 14px 0;
    }

    .error-title {
      font-size: 19px;
      font-weight: 700;
      color: #DC2626;
      margin-bottom: 8px;
    }

    .error-desc {
      font-size: 13.5px;
      color: #64748B;
      line-height: 1.5;
      margin-bottom: 20px;
    }

    /* Legal link */
    .footer-link-wrap {
      margin-top: 18px;
      padding-top: 14px;
      border-top: 1px solid #F1F5F9;
      font-size: 11px;
      color: #94A3B8;
    }

    .footer-link-wrap a {
      color: #059669;
      text-decoration: none;
      font-weight: 600;
    }

    .footer-link-wrap a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Brand Header -->
    <div class="brand-row">
      <img 
        src="${displayIcon}" 
        alt="Split Boss" 
        class="brand-logo-img" 
        onerror="this.src='/static/ic_launcher-web.png'"
      />
      <div class="brand-name">Split Boss</div>
      <div class="brand-tag">India</div>
    </div>

    ${isValid ? `
      <!-- Valid Invitation State -->
      <div class="invite-badge">
        <span class="pulse-dot"></span>
        Group Invitation
      </div>

      <div class="group-hero">
        <h1 class="group-title">${groupName}</h1>
        <div class="inviter-line">Invited by <strong>${inviterName}</strong></div>
        <div class="group-meta-tags">
          <span class="meta-tag">${modeLabel}</span>
          <span class="meta-tag">${memberCount} ${memberCount === 1 ? 'member' : 'members'}</span>
          <span class="meta-tag">INR</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="cta-column">
        <a id="btnInstall" href="${escapeHtml(playStoreUrl)}" class="btn-playstore" onclick="handleInstallClick(event)">
          <!-- Google Play Vector Logo -->
          <svg class="play-icon" viewBox="0 0 24 24" fill="none">
            <path d="M3.6 1.8L13.8 12L3.6 22.2C3.2 21.8 3 21.1 3 20.3V3.7C3 2.9 3.2 2.2 3.6 1.8Z" fill="#00C1A4"/>
            <path d="M17.2 8.6L13.8 12L17.2 15.4L20.8 13.4C21.8 12.8 21.8 11.2 20.8 10.6L17.2 8.6Z" fill="#FFD400"/>
            <path d="M13.8 12L3.6 1.8C4 1.4 4.6 1.3 5.3 1.7L17.2 8.6L13.8 12Z" fill="#00E676"/>
            <path d="M17.2 15.4L5.3 22.3C4.6 22.7 4 22.6 3.6 22.2L13.8 12L17.2 15.4Z" fill="#FF334B"/>
          </svg>
          <span>Install Split Boss on Google Play</span>
        </a>

        <a id="btnOpenApp" href="${escapeHtml(appSchemeUrl)}" class="btn-openapp" onclick="handleOpenAppClick(event)">
          <span>Already have the app? Open</span>
        </a>
      </div>

      <!-- Invite Code with 1-Tap Copy -->
      <div class="code-box">
        <div style="min-width: 0;">
          <span class="code-label">Invite Token</span>
          <div class="code-text" id="tokenText">${escapeHtml(token)}</div>
        </div>
        <button type="button" class="btn-copy" id="copyBtn" onclick="copyToken()">Copy</button>
      </div>
    ` : `
      <!-- Expired or Invalid State -->
      <div class="error-card">
        <h2 class="error-title">Invitation Expired or Invalid</h2>
        <p class="error-desc">${escapeHtml(preview?.error || 'This invite link may have expired or reached its maximum limit. Ask the group admin for a new link.')}</p>
        <div class="cta-column">
          <a href="${escapeHtml(playStoreUrl)}" class="btn-playstore">
            <span>Install Split Boss on Google Play</span>
          </a>
        </div>
      </div>
    `}

    <!-- UPI Compatibility Notice -->
    <div class="upi-strip">
      <span>GPay</span>
      <span class="upi-dot">•</span>
      <span>PhonePe</span>
      <span class="upi-dot">•</span>
      <span>Paytm</span>
      <span class="upi-dot">•</span>
      <span>BHIM UPI</span>
    </div>

    <!-- Legal Footer Link -->
    <div class="footer-link-wrap">
      <span>Split Boss</span>
      <span style="margin: 0 4px;">•</span>
      <a href="/privacy">Privacy Policy</a>
    </div>
  </div>

  <div class="toast" id="toast">
    <span id="toastMsg">Invite link copied to clipboard</span>
  </div>

  <script>
    const inviteToken = "${escapeJs(token)}";
    const webInviteUrl = "${escapeJs(webUrl)}";
    const playStoreUrl = "${escapeJs(playStoreUrl)}";
    const appSchemeUrl = "${escapeJs(appSchemeUrl)}";

    function showToast(msg) {
      const toast = document.getElementById('toast');
      const toastMsg = document.getElementById('toastMsg');
      if (!toast) return;
      toastMsg.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2500);
    }

    function copyToClipboard(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
      }
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (err) {}
      document.body.removeChild(textArea);
      return Promise.resolve();
    }

    function copyToken() {
      copyToClipboard(webInviteUrl).then(() => {
        const btn = document.getElementById('copyBtn');
        if (btn) btn.textContent = 'Copied';
        showToast('Invite link copied to clipboard');
        setTimeout(() => { if (btn) btn.textContent = 'Copy'; }, 2000);
      });
    }

    function handleInstallClick(e) {
      copyToClipboard(webInviteUrl);
      showToast('Invite copied! Redirecting...');
    }

    function handleOpenAppClick(e) {
      copyToClipboard(webInviteUrl);
      window.location.href = appSchemeUrl;
      setTimeout(() => {
        window.location.href = playStoreUrl;
      }, 1500);
    }
  </script>
</body>
</html>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeJs(str) {
  if (!str) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
}

module.exports = { renderInvitePage };
