/**
 * Branded Responsive Landing Page for Split Boss Group Invitations
 * Renders high-converting, glassmorphic UI for mobile browsers
 */
function renderInvitePage({ preview, token, playStoreUrl, appSchemeUrl, webUrl }) {
  const isValid = preview && preview.valid;
  const group = preview?.group || {};
  const inviter = preview?.inviter || {};

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
  
  <!-- Open Graph & Social Cards -->
  <meta property="og:title" content="${pageTitle}">
  <meta property="og:description" content="${pageDesc}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${escapeHtml(webUrl)}">
  <meta property="og:site_name" content="Split Boss">
  <meta name="theme-color" content="#06B6D4">
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
      background-color: #070B14;
      color: #F8FAFC;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px 16px;
      position: relative;
      overflow-x: hidden;
    }

    /* Ambient background gradient glows */
    .glow-cyan {
      position: fixed;
      top: -120px;
      left: 50%;
      transform: translateX(-50%);
      width: 480px;
      height: 480px;
      background: radial-gradient(circle, rgba(6, 182, 212, 0.22) 0%, rgba(6, 182, 212, 0) 70%);
      filter: blur(50px);
      pointer-events: none;
      z-index: 0;
    }

    .glow-indigo {
      position: fixed;
      bottom: -150px;
      right: -100px;
      width: 420px;
      height: 420px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.16) 0%, rgba(99, 102, 241, 0) 70%);
      filter: blur(60px);
      pointer-events: none;
      z-index: 0;
    }

    /* Container Card */
    .container {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 430px;
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 28px;
      padding: 32px 24px;
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      box-shadow: 0 24px 50px -12px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.05);
      text-align: center;
      animation: fadeIn 0.4s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(14px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Brand Header */
    .brand-row {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 24px;
    }

    .brand-icon {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: linear-gradient(135deg, #06B6D4 0%, #0284C7 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 20px;
      color: #070B14;
      box-shadow: 0 4px 14px rgba(6, 182, 212, 0.35);
    }

    .brand-name {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #F8FAFC;
    }

    .brand-tag {
      font-size: 11px;
      font-weight: 600;
      background: rgba(6, 182, 212, 0.15);
      color: #22D3EE;
      padding: 3px 8px;
      border-radius: 999px;
      border: 1px solid rgba(6, 182, 212, 0.3);
    }

    /* Invitation Header Badge */
    .invite-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.09);
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.8px;
      color: #94A3B8;
      text-transform: uppercase;
      margin-bottom: 16px;
    }

    .pulse-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10B981;
      box-shadow: 0 0 8px #10B981;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }

    /* Group Card */
    .group-hero {
      background: linear-gradient(180deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.6) 100%);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      padding: 22px 18px;
      margin-bottom: 24px;
    }

    .group-avatar {
      font-size: 44px;
      line-height: 1;
      margin-bottom: 12px;
      display: inline-block;
      filter: drop-shadow(0 6px 12px rgba(0,0,0,0.4));
    }

    .group-title {
      font-size: 23px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #FFFFFF;
      margin-bottom: 6px;
      word-break: break-word;
    }

    .inviter-line {
      font-size: 13px;
      color: #94A3B8;
      margin-bottom: 14px;
    }

    .inviter-line strong {
      color: #E2E8F0;
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
      background: rgba(255, 255, 255, 0.06);
      color: #CBD5E1;
      border: 1px solid rgba(255, 255, 255, 0.06);
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
      padding: 16px 20px;
      border-radius: 16px;
      background: linear-gradient(135deg, #06B6D4 0%, #0891B2 100%);
      color: #070B14;
      font-size: 15px;
      font-weight: 700;
      text-decoration: none;
      border: none;
      cursor: pointer;
      box-shadow: 0 10px 24px -4px rgba(6, 182, 212, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.3);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .btn-playstore:active {
      transform: scale(0.98);
      box-shadow: 0 4px 12px rgba(6, 182, 212, 0.4);
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
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.06);
      color: #E2E8F0;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      border: 1px solid rgba(255, 255, 255, 0.1);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-openapp:hover, .btn-openapp:active {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.2);
    }

    /* Invite Code Box */
    .code-box {
      background: rgba(0, 0, 0, 0.35);
      border: 1px dashed rgba(255, 255, 255, 0.16);
      border-radius: 14px;
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
      color: #94A3B8;
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
    }

    .btn-copy {
      flex-shrink: 0;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 600;
      color: #22D3EE;
      background: rgba(6, 182, 212, 0.12);
      border: 1px solid rgba(6, 182, 212, 0.25);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-copy:active {
      background: rgba(6, 182, 212, 0.25);
    }

    /* Feature highlights */
    .features-list {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;
      border-top: 1px solid rgba(255, 255, 255, 0.07);
      padding-top: 18px;
    }

    .feature-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 4px;
    }

    .feature-icon {
      font-size: 18px;
    }

    .feature-title {
      font-size: 11px;
      font-weight: 600;
      color: #94A3B8;
    }

    /* Toast Notification */
    .toast {
      position: fixed;
      bottom: 28px;
      left: 50%;
      transform: translateX(-50%) translateY(80px);
      background: #0F172A;
      color: #F8FAFC;
      border: 1px solid #06B6D4;
      padding: 12px 20px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
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
  <div class="glow-cyan"></div>
  <div class="glow-indigo"></div>

  <div class="container">
    <!-- Brand Title -->
    <div class="brand-row">
      <div class="brand-icon">₹</div>
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
          <span>Install Split Boss from Play Store</span>
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

    <!-- App Features -->
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
      showToast('Invite copied! Redirecting to Play Store...');
      
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
