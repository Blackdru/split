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
  // Fallback to static URL if filesystem read fails
}

/**
 * Branded Responsive Landing Page for Split Boss Group Invitations
 * Tailored to match the Mint & Emerald Neo-Fintech App Icon Theme
 */
function renderInvitePage({ preview, token, playStoreUrl, appSchemeUrl, webUrl, baseUrl, iconUrl }) {
  const isValid = preview && preview.valid;
  const group = preview?.group || {};
  const inviter = preview?.inviter || {};

  const effectiveBaseUrl = baseUrl || 'https://split.udhaar.store';
  const effectiveIconUrl = iconUrl || `${effectiveBaseUrl}/static/ic_launcher-web.png`;
  // Use data URI for immediate inline render, fallback to static URL
  const displayIcon = cachedIconBase64 || '/static/ic_launcher-web.png';

  const modeEmojis = {
    trip: '✈️',
    flat: '🏠',
    friends: '👥',
    family: '👨‍👩‍👧',
    event: '🎉'
  };
  const modeEmoji = modeEmojis[group.mode] || '👥';
  const modeLabel = (group.mode ? group.mode.charAt(0).toUpperCase() + group.mode.slice(1) : 'Group') + ' Hisaab';

  const groupName = group.name ? escapeHtml(group.name) : 'Split Boss Group';
  const inviterName = inviter.name ? escapeHtml(inviter.name) : 'A friend';
  const memberCount = group.memberCount || 1;

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
  
  <!-- Open Graph & Social Cards -->
  <meta property="og:title" content="${pageTitle}">
  <meta property="og:description" content="${pageDesc}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${escapeHtml(webUrl)}">
  <meta property="og:site_name" content="Split Boss">
  <meta property="og:image" content="${escapeHtml(effectiveIconUrl)}">
  <meta property="og:image:width" content="512">
  <meta property="og:image:height" content="512">

  <!-- Twitter Meta -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${pageTitle}">
  <meta name="twitter:description" content="${pageDesc}">
  <meta name="twitter:image" content="${escapeHtml(effectiveIconUrl)}">

  <!-- Mobile Browser Styling -->
  <meta name="theme-color" content="#061210">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">

  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-tap-highlight-color: transparent;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #061210;
      background-image: 
        radial-gradient(at 0% 0%, rgba(28, 176, 143, 0.12) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(5, 150, 105, 0.10) 0px, transparent 50%);
      color: #F8FAFC;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
      position: relative;
      overflow-x: hidden;
    }

    /* Ambient background emerald glows matching the icon */
    .glow-top {
      position: fixed;
      top: -140px;
      left: 50%;
      transform: translateX(-50%);
      width: 520px;
      height: 520px;
      background: radial-gradient(circle, rgba(28, 176, 143, 0.24) 0%, rgba(28, 176, 143, 0) 70%);
      filter: blur(60px);
      pointer-events: none;
      z-index: 0;
    }

    .glow-bottom {
      position: fixed;
      bottom: -160px;
      right: -80px;
      width: 460px;
      height: 460px;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.16) 0%, rgba(16, 185, 129, 0) 70%);
      filter: blur(65px);
      pointer-events: none;
      z-index: 0;
    }

    /* Container Card with Neo-Fintech Glassmorphism */
    .container {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 440px;
      background: rgba(10, 27, 23, 0.82);
      border: 1px solid rgba(52, 211, 153, 0.18);
      border-radius: 30px;
      padding: 34px 26px;
      backdrop-filter: blur(28px);
      -webkit-backdrop-filter: blur(28px);
      box-shadow: 
        0 24px 50px -12px rgba(0, 0, 0, 0.75), 
        0 0 0 1px rgba(255, 255, 255, 0.05),
        inset 0 1px 1px rgba(255, 255, 255, 0.1);
      text-align: center;
      animation: fadeIn 0.45s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Brand Header */
    .brand-row {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
    }

    .brand-logo-img {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      object-fit: cover;
      box-shadow: 0 6px 18px rgba(28, 176, 143, 0.35);
      border: 1px solid rgba(230, 250, 240, 0.4);
      background-color: #E6FAF0;
      transition: transform 0.25s ease;
    }

    .brand-row:hover .brand-logo-img {
      transform: scale(1.05);
    }

    .brand-name {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #FFFFFF;
    }

    .brand-tag {
      font-size: 11px;
      font-weight: 700;
      background: rgba(28, 176, 143, 0.16);
      color: #34D399;
      padding: 3px 9px;
      border-radius: 999px;
      border: 1px solid rgba(52, 211, 153, 0.32);
      letter-spacing: 0.3px;
    }

    /* Invitation Header Badge */
    .invite-badge {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 6px 14px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(52, 211, 153, 0.2);
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.8px;
      color: #A7F3D0;
      text-transform: uppercase;
      margin-bottom: 18px;
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10B981;
      box-shadow: 0 0 10px #10B981;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.75); }
      70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }

    /* Group Card */
    .group-hero {
      background: linear-gradient(180deg, rgba(16, 42, 36, 0.7) 0%, rgba(10, 27, 23, 0.75) 100%);
      border: 1px solid rgba(52, 211, 153, 0.16);
      border-radius: 22px;
      padding: 24px 20px;
      margin-bottom: 24px;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
    }

    .group-avatar {
      font-size: 46px;
      line-height: 1;
      margin-bottom: 14px;
      display: inline-block;
      filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.45));
    }

    .group-title {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #FFFFFF;
      margin-bottom: 6px;
      word-break: break-word;
    }

    .inviter-line {
      font-size: 13px;
      color: #94A3B8;
      margin-bottom: 16px;
    }

    .inviter-line strong {
      color: #F1F5F9;
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
      padding: 5px 12px;
      border-radius: 10px;
      background: rgba(28, 176, 143, 0.09);
      color: #D1FAE5;
      border: 1px solid rgba(52, 211, 153, 0.16);
    }

    /* Call To Action Buttons */
    .cta-column {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
    }

    .btn-playstore {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      width: 100%;
      padding: 16px 22px;
      border-radius: 18px;
      background: linear-gradient(135deg, #1CB08F 0%, #059669 100%);
      color: #051A14;
      font-size: 15px;
      font-weight: 800;
      text-decoration: none;
      border: none;
      cursor: pointer;
      box-shadow: 
        0 12px 28px -4px rgba(28, 176, 143, 0.48), 
        inset 0 1px 1px rgba(255, 255, 255, 0.35);
      transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .btn-playstore:hover {
      background: linear-gradient(135deg, #22C55E 0%, #059669 100%);
      transform: translateY(-1px);
      box-shadow: 0 14px 30px -4px rgba(28, 176, 143, 0.6);
    }

    .btn-playstore:active {
      transform: scale(0.98);
      box-shadow: 0 4px 14px rgba(28, 176, 143, 0.4);
    }

    .play-icon {
      width: 22px;
      height: 22px;
      flex-shrink: 0;
    }

    .btn-openapp {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 13px 18px;
      border-radius: 16px;
      background: rgba(28, 176, 143, 0.08);
      color: #E2E8F0;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      border: 1px solid rgba(52, 211, 153, 0.22);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-openapp:hover, .btn-openapp:active {
      background: rgba(28, 176, 143, 0.16);
      border-color: rgba(52, 211, 153, 0.35);
      color: #FFFFFF;
    }

    /* Invite Code Box */
    .code-box {
      background: rgba(0, 0, 0, 0.35);
      border: 1px dashed rgba(52, 211, 153, 0.24);
      border-radius: 16px;
      padding: 12px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 22px;
    }

    .code-text {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      color: #A7F3D0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-align: left;
    }

    .code-label {
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 700;
      color: #6EE7B7;
      letter-spacing: 0.6px;
      display: block;
      margin-bottom: 2px;
      text-align: left;
    }

    .btn-copy {
      flex-shrink: 0;
      padding: 7px 14px;
      font-size: 12px;
      font-weight: 700;
      color: #051A14;
      background: #34D399;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.18s ease;
    }

    .btn-copy:hover {
      background: #6EE7B7;
      transform: translateY(-1px);
    }

    .btn-copy:active {
      transform: scale(0.95);
    }

    /* Feature highlights */
    .features-list {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;
      border-top: 1px solid rgba(52, 211, 153, 0.12);
      padding-top: 20px;
      margin-bottom: 14px;
    }

    .feature-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 5px;
    }

    .feature-icon {
      font-size: 20px;
    }

    .feature-title {
      font-size: 11px;
      font-weight: 600;
      color: #94A3B8;
    }

    /* UPI trust strip */
    .upi-strip {
      font-size: 11px;
      color: #64748B;
      letter-spacing: 0.2px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    .upi-dot {
      color: #10B981;
      font-weight: bold;
    }

    /* Toast Notification */
    .toast {
      position: fixed;
      bottom: 28px;
      left: 50%;
      transform: translateX(-50%) translateY(80px);
      background: #0A1B17;
      color: #F8FAFC;
      border: 1px solid #1CB08F;
      padding: 12px 22px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      gap: 8px;
      z-index: 100;
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
      white-space: nowrap;
    }

    .toast.show {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }

    /* Error state card */
    .error-card {
      padding: 10px 0;
    }

    .error-icon {
      font-size: 46px;
      margin-bottom: 12px;
    }

    .error-title {
      font-size: 20px;
      font-weight: 700;
      color: #F87171;
      margin-bottom: 8px;
    }

    .error-desc {
      font-size: 14px;
      color: #94A3B8;
      line-height: 1.5;
      margin-bottom: 24px;
    }
  </style>
</head>
<body>
  <div class="glow-top"></div>
  <div class="glow-bottom"></div>

  <div class="container">
    <!-- Brand Title with Official Launcher Icon -->
    <div class="brand-row">
      <img 
        src="${displayIcon}" 
        alt="Split Boss Logo" 
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
        <div class="group-avatar">${modeEmoji}</div>
        <h1 class="group-title">${groupName}</h1>
        <div class="inviter-line">Invited by <strong>${inviterName}</strong></div>
        <div class="group-meta-tags">
          <span class="meta-tag">${modeLabel}</span>
          <span class="meta-tag">👥 ${memberCount} ${memberCount === 1 ? 'member' : 'members'}</span>
          <span class="meta-tag">₹ INR</span>
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
          <span>Already have the app? Open Split Boss</span>
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
        <div class="error-icon">⚠️</div>
        <h2 class="error-title">Invitation Expired or Invalid</h2>
        <p class="error-desc">${escapeHtml(preview?.error || 'This invite link may have expired or reached its maximum usage limit. Ask the group admin for a new link.')}</p>
        <div class="cta-column">
          <a href="${escapeHtml(playStoreUrl)}" class="btn-playstore">
            <span>Install Split Boss on Google Play</span>
          </a>
        </div>
      </div>
    `}

    <!-- App Features Highlights -->
    <div class="features-list">
      <div class="feature-item">
        <div class="feature-icon">⚡</div>
        <div class="feature-title">Instant UPI</div>
      </div>
      <div class="feature-item">
        <div class="feature-icon">⚖️</div>
        <div class="feature-title">Equal & Exact</div>
      </div>
      <div class="feature-item">
        <div class="feature-icon">✨</div>
        <div class="feature-title">100% Free</div>
      </div>
    </div>

    <!-- UPI Trust Line -->
    <div class="upi-strip">
      <span>GPay</span>
      <span class="upi-dot">•</span>
      <span>PhonePe</span>
      <span class="upi-dot">•</span>
      <span>Paytm</span>
      <span class="upi-dot">•</span>
      <span>BHIM UPI</span>
    </div>
  </div>

  <div class="toast" id="toast">
    <span>📋</span>
    <span id="toastMsg">Invite link copied to clipboard!</span>
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
      setTimeout(() => toast.classList.remove('show'), 3000);
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
        if (btn) btn.textContent = '✓ Copied';
        showToast('Invite link copied to clipboard!');
        setTimeout(() => { if (btn) btn.textContent = 'Copy'; }, 2500);
      });
    }

    function handleInstallClick(e) {
      // 1. Copy link & token to clipboard so the app can pick it up on first launch
      copyToClipboard(webInviteUrl);
      showToast('Invite copied! Redirecting to Google Play...');
      // Let the natural link navigation proceed to Google Play Store
    }

    function handleOpenAppClick(e) {
      // Try opening custom scheme
      copyToClipboard(webInviteUrl);
      window.location.href = appSchemeUrl;
      
      // Fallback to Play Store after 1.5s if app is not installed
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
