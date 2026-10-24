const fs = require('fs');
const path = require('path');

// Cache base64 data URI of the app launcher icon for zero-latency instant rendering
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
 * Clean White / Light-Themed Official Landing Page for Split Boss
 * Minimal, executive, distraction-free aesthetic with only essential branding
 */
function renderHomePage({ baseUrl, playStoreUrl, iconUrl }) {
  const effectiveBaseUrl = baseUrl || 'https://split.udhaar.store';
  const effectiveIconUrl = iconUrl || `${effectiveBaseUrl}/static/ic_launcher-web.png`;
  const effectivePlayStoreUrl = playStoreUrl || 'https://play.google.com/store/apps/details?id=com.budrock.splitboss';
  const displayIcon = cachedIconBase64 || '/static/ic_launcher-web.png';

  const pageTitle = 'Split Boss - India’s Group Expense & UPI Settlement App';
  const pageDesc = 'Split bills with flatmates, friends, and travel groups. Settle balances directly via UPI (Google Pay, PhonePe, Paytm). 100% Free.';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>${pageTitle}</title>
  
  <meta name="description" content="${pageDesc}">
  
  <!-- Favicon & Touch Icons -->
  <link rel="icon" type="image/png" href="${effectiveIconUrl}">
  <link rel="apple-touch-icon" href="${effectiveIconUrl}">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${pageTitle}">
  <meta property="og:description" content="${pageDesc}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${effectiveBaseUrl}/">
  <meta property="og:image" content="${effectiveIconUrl}">
  <meta property="og:image:width" content="512">
  <meta property="og:image:height" content="512">
  <meta property="og:site_name" content="Split Boss">

  <!-- Twitter Meta -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${pageTitle}">
  <meta name="twitter:description" content="${pageDesc}">
  <meta name="twitter:image" content="${effectiveIconUrl}">

  <!-- Mobile Styling -->
  <meta name="theme-color" content="#FFFFFF">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">

  <style>
    :root {
      --bg-canvas: #FFFFFF;
      --bg-alt: #F8FAFC;
      --border: #E2E8F0;
      --border-subtle: #F1F5F9;
      --brand-primary: #059669;
      --brand-dark: #047857;
      --brand-mint: #E6FAF0;
      --brand-mint-text: #047857;
      --text-main: #0F172A;
      --text-muted: #475569;
      --text-subtle: #64748B;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-tap-highlight-color: transparent;
    }

    html {
      scroll-behavior: smooth;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: var(--bg-canvas);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      line-height: 1.6;
    }

    .container {
      width: 100%;
      max-width: 1120px;
      padding: 0 24px;
    }

    /* Clean Sticky Navigation */
    .nav-bar {
      width: 100%;
      padding: 16px 0;
      position: sticky;
      top: 0;
      z-index: 50;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
    }

    .nav-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .brand-link {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: inherit;
    }

    .brand-logo {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      object-fit: cover;
      border: 1px solid var(--border);
      background-color: var(--brand-mint);
    }

    .brand-title {
      font-size: 19px;
      font-weight: 800;
      letter-spacing: -0.4px;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .brand-tag {
      font-size: 10px;
      font-weight: 700;
      background: var(--brand-mint);
      color: var(--brand-mint-text);
      padding: 2px 7px;
      border-radius: 999px;
      border: 1px solid #A7F3D0;
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 18px;
    }

    .nav-link {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-muted);
      text-decoration: none;
      transition: color 0.15s ease;
    }

    .nav-link:hover {
      color: var(--brand-primary);
    }

    .btn-nav-download {
      display: inline-flex;
      align-items: center;
      padding: 9px 18px;
      border-radius: 10px;
      background: var(--brand-primary);
      color: #FFFFFF;
      font-size: 13.5px;
      font-weight: 700;
      text-decoration: none;
      transition: background 0.15s ease;
    }

    .btn-nav-download:hover {
      background: var(--brand-dark);
    }

    /* Hero Section */
    .hero-section {
      padding: 72px 0 60px;
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 48px;
      align-items: center;
    }

    @media (max-width: 900px) {
      .hero-section {
        grid-template-columns: 1fr;
        padding: 44px 0 36px;
        text-align: center;
        gap: 36px;
      }
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 14px;
      background: var(--brand-mint);
      border: 1px solid #A7F3D0;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      color: var(--brand-mint-text);
      margin-bottom: 20px;
    }

    .hero-title {
      font-size: 46px;
      line-height: 1.18;
      font-weight: 800;
      letter-spacing: -1px;
      color: var(--text-main);
      margin-bottom: 18px;
    }

    @media (max-width: 640px) {
      .hero-title {
        font-size: 32px;
        letter-spacing: -0.6px;
      }
    }

    .hero-title-accent {
      color: var(--brand-primary);
    }

    .hero-subtitle {
      font-size: 16.5px;
      color: var(--text-muted);
      line-height: 1.6;
      margin-bottom: 30px;
      max-width: 520px;
    }

    @media (max-width: 900px) {
      .hero-subtitle {
        margin-left: auto;
        margin-right: auto;
      }
    }

    /* CTA Buttons */
    .hero-cta-group {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
      margin-bottom: 28px;
    }

    @media (max-width: 900px) {
      .hero-cta-group {
        justify-content: center;
      }
    }

    .btn-playstore-hero {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      padding: 13px 24px;
      border-radius: 14px;
      background: #0F172A;
      color: #FFFFFF;
      text-decoration: none;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.15);
      transition: background 0.15s ease, transform 0.15s ease;
    }

    .btn-playstore-hero:hover {
      background: #1E293B;
      transform: translateY(-1px);
    }

    .playstore-icon-svg {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }

    .btn-playstore-text {
      display: flex;
      flex-direction: column;
      text-align: left;
    }

    .playstore-sub {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #94A3B8;
      line-height: 1;
      margin-bottom: 2px;
    }

    .playstore-main {
      font-size: 16px;
      font-weight: 800;
      letter-spacing: -0.3px;
      line-height: 1.1;
      color: #FFFFFF;
    }

    .btn-openapp-hero {
      display: inline-flex;
      align-items: center;
      padding: 14px 22px;
      border-radius: 14px;
      background: #FFFFFF;
      color: var(--text-main);
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      border: 1px solid var(--border);
      transition: background 0.15s ease;
    }

    .btn-openapp-hero:hover {
      background: var(--bg-alt);
    }

    .hero-trust-bar {
      display: flex;
      align-items: center;
      gap: 20px;
      font-size: 12.5px;
      color: var(--text-subtle);
      font-weight: 600;
    }

    @media (max-width: 900px) {
      .hero-trust-bar {
        justify-content: center;
      }
    }

    /* Clean Phone Mockup */
    .hero-mockup-wrapper {
      display: flex;
      justify-content: center;
    }

    .phone-card {
      width: 100%;
      max-width: 350px;
      background: #FFFFFF;
      border: 1px solid var(--border);
      border-radius: 28px;
      padding: 24px 20px;
      box-shadow: 0 16px 36px -10px rgba(0, 0, 0, 0.08);
      text-align: left;
    }

    .mock-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 18px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border-subtle);
    }

    .mock-group-title {
      font-size: 16px;
      font-weight: 800;
      color: var(--text-main);
    }

    .mock-badge {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      background: var(--bg-alt);
      color: var(--text-muted);
      border: 1px solid var(--border);
    }

    .mock-balance-card {
      background: var(--brand-mint);
      border: 1px solid #A7F3D0;
      border-radius: 16px;
      padding: 16px;
      margin-bottom: 16px;
    }

    .mock-balance-label {
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.5px;
      color: var(--brand-mint-text);
      margin-bottom: 4px;
    }

    .mock-balance-val {
      font-size: 26px;
      font-weight: 800;
      color: #064E3B;
      margin-bottom: 10px;
    }

    .mock-upi-btn {
      width: 100%;
      padding: 9px 12px;
      border-radius: 10px;
      background: var(--brand-primary);
      color: #FFFFFF;
      font-size: 12px;
      font-weight: 700;
      border: none;
      cursor: pointer;
      text-align: center;
    }

    .mock-expenses-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .mock-expense-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--bg-alt);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 10px 12px;
    }

    .mock-expense-desc {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-main);
    }

    .mock-expense-sub {
      font-size: 11px;
      color: var(--text-muted);
    }

    .mock-expense-amount {
      font-size: 13.5px;
      font-weight: 700;
      color: var(--text-main);
      font-family: 'JetBrains Mono', monospace;
    }

    /* UPI Strip */
    .ecosystem-strip {
      padding: 30px 0;
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      text-align: center;
      margin-bottom: 60px;
      background: var(--bg-alt);
    }

    .ecosystem-label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      font-weight: 700;
      color: var(--text-subtle);
      margin-bottom: 14px;
    }

    .ecosystem-logos {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 12px 24px;
      font-size: 14px;
      font-weight: 700;
      color: var(--text-main);
    }

    .ecosystem-dot {
      color: #CBD5E1;
    }

    /* Features Section */
    .section-title-wrap {
      text-align: center;
      margin-bottom: 44px;
    }

    .section-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: var(--brand-mint-text);
      background: var(--brand-mint);
      border: 1px solid #A7F3D0;
      padding: 3px 10px;
      border-radius: 999px;
      margin-bottom: 10px;
    }

    .section-title {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.6px;
      color: var(--text-main);
      margin-bottom: 10px;
    }

    .section-desc {
      font-size: 15px;
      color: var(--text-muted);
      max-width: 600px;
      margin: 0 auto;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 18px;
      margin-bottom: 64px;
    }

    .feature-card {
      background: #FFFFFF;
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 24px;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    .feature-card:hover {
      border-color: #CBD5E1;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
    }

    .feature-card-num {
      font-size: 12px;
      font-weight: 800;
      color: var(--brand-mint-text);
      margin-bottom: 14px;
      display: block;
    }

    .feature-card-title {
      font-size: 17px;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 6px;
      letter-spacing: -0.2px;
    }

    .feature-card-desc {
      font-size: 13.5px;
      color: var(--text-muted);
      line-height: 1.55;
    }

    /* Steps Section */
    .steps-section {
      background: var(--bg-alt);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 44px 32px;
      margin-bottom: 64px;
    }

    .steps-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      margin-top: 32px;
    }

    @media (max-width: 768px) {
      .steps-grid {
        grid-template-columns: 1fr;
        gap: 24px;
      }
    }

    .step-item {
      text-align: left;
    }

    .step-number {
      font-size: 13px;
      font-weight: 800;
      color: var(--brand-mint-text);
      background: var(--brand-mint);
      border: 1px solid #A7F3D0;
      width: 28px;
      height: 28px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 14px;
    }

    .step-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 6px;
    }

    .step-desc {
      font-size: 13.5px;
      color: var(--text-muted);
      line-height: 1.55;
    }

    /* FAQ */
    .faq-section {
      max-width: 720px;
      margin: 0 auto 72px;
    }

    .faq-item {
      background: #FFFFFF;
      border: 1px solid var(--border);
      border-radius: 14px;
      margin-bottom: 12px;
      padding: 18px 20px;
    }

    .faq-q {
      font-size: 15px;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 6px;
    }

    .faq-a {
      font-size: 13.5px;
      color: var(--text-muted);
      line-height: 1.55;
    }

    /* Bottom Download Banner */
    .download-banner {
      background: var(--brand-mint);
      border: 1px solid #A7F3D0;
      border-radius: 24px;
      padding: 48px 28px;
      text-align: center;
      margin-bottom: 60px;
    }

    .banner-title {
      font-size: 30px;
      font-weight: 800;
      letter-spacing: -0.6px;
      color: #064E3B;
      margin-bottom: 10px;
    }

    .banner-desc {
      font-size: 15px;
      color: #047857;
      max-width: 540px;
      margin: 0 auto 26px;
    }

    /* Footer */
    .site-footer {
      border-top: 1px solid var(--border);
      padding: 32px 0 44px;
      width: 100%;
      background: #FFFFFF;
    }

    .footer-inner {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .footer-links {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 18px;
      font-size: 13px;
    }

    .footer-links a {
      color: var(--text-muted);
      text-decoration: none;
      font-weight: 500;
    }

    .footer-links a:hover {
      color: var(--brand-primary);
    }

    .footer-copy {
      font-size: 12px;
      color: var(--text-subtle);
    }
  </style>
</head>
<body>
  <!-- Clean Navigation -->
  <nav class="nav-bar">
    <div class="container nav-inner">
      <a href="${effectiveBaseUrl}/" class="brand-link">
        <img 
          src="${displayIcon}" 
          alt="Split Boss" 
          class="brand-logo" 
          onerror="this.src='/static/ic_launcher-web.png'"
        />
        <div class="brand-title">
          <span>Split Boss</span>
          <span class="brand-tag">India</span>
        </div>
      </a>

      <div class="nav-actions">
        <a href="#features" class="nav-link">Features</a>
        <a href="/privacy" class="nav-link">Privacy</a>
        <a href="${effectivePlayStoreUrl}" class="btn-nav-download" target="_blank" rel="noopener">
          Get App
        </a>
      </div>
    </div>
  </nav>

  <!-- Hero Section -->
  <main class="container">
    <section class="hero-section">
      <div class="hero-left">
        <div class="hero-badge">
          India-First Expense Sharing • Free
        </div>

        <h1 class="hero-title">
          Split bills with friends. Settle instantly via <span class="hero-title-accent">UPI</span>.
        </h1>

        <p class="hero-subtitle">
          Say goodbye to complex spreadsheets and awkward payment reminders. Split Boss tracks group spending and lets everyone settle in one tap with Google Pay, PhonePe, and Paytm.
        </p>

        <!-- Play Store Download CTA -->
        <div class="hero-cta-group">
          <a href="${effectivePlayStoreUrl}" class="btn-playstore-hero" target="_blank" rel="noopener">
            <!-- Google Play Vector Logo -->
            <svg class="playstore-icon-svg" viewBox="0 0 24 24" fill="none">
              <path d="M3.6 1.8L13.8 12L3.6 22.2C3.2 21.8 3 21.1 3 20.3V3.7C3 2.9 3.2 2.2 3.6 1.8Z" fill="#00C1A4"/>
              <path d="M17.2 8.6L13.8 12L17.2 15.4L20.8 13.4C21.8 12.8 21.8 11.2 20.8 10.6L17.2 8.6Z" fill="#FFD400"/>
              <path d="M13.8 12L3.6 1.8C4 1.4 4.6 1.3 5.3 1.7L17.2 8.6L13.8 12Z" fill="#00E676"/>
              <path d="M17.2 15.4L5.3 22.3C4.6 22.7 4 22.6 3.6 22.2L13.8 12L17.2 15.4Z" fill="#FF334B"/>
            </svg>
            <div class="btn-playstore-text">
              <span class="playstore-sub">GET IT ON</span>
              <span class="playstore-main">Google Play</span>
            </div>
          </a>

          <a href="splitboss://open" class="btn-openapp-hero">
            Open App
          </a>
        </div>

        <div class="hero-trust-bar">
          <span>Zero Platform Fees</span>
          <span>•</span>
          <span>No Bank Details Stored</span>
          <span>•</span>
          <span>Instant UPI</span>
        </div>
      </div>

      <!-- Hero Mockup Phone Card -->
      <div class="hero-mockup-wrapper">
        <div class="phone-card">
          <div class="mock-header">
            <div class="mock-group-title">Goa Trip Hisaab</div>
            <span class="mock-badge">4 Members</span>
          </div>

          <div class="mock-balance-card">
            <div class="mock-balance-label">Overall Balance</div>
            <div class="mock-balance-val">You get ₹2,450</div>
            <button class="mock-upi-btn" onclick="window.open('${effectivePlayStoreUrl}')">
              Settle via UPI (GPay / PhonePe)
            </button>
          </div>

          <div class="mock-expenses-list">
            <div class="mock-expense-item">
              <div>
                <div class="mock-expense-desc">Beach Shack Dinner</div>
                <div class="mock-expense-sub">Paid by Arjun • Split 4 ways</div>
              </div>
              <div class="mock-expense-amount">₹3,200</div>
            </div>

            <div class="mock-expense-item">
              <div>
                <div class="mock-expense-desc">Vehicle Fuel</div>
                <div class="mock-expense-sub">Paid by You • Exact Split</div>
              </div>
              <div class="mock-expense-amount">₹4,500</div>
            </div>

            <div class="mock-expense-item">
              <div>
                <div class="mock-expense-desc">Scuba Water Sports</div>
                <div class="mock-expense-sub">Paid by Rohan</div>
              </div>
              <div class="mock-expense-amount">₹6,000</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- UPI Compatibility Notice -->
    <section class="ecosystem-strip">
      <div class="ecosystem-label">Compatible with all major UPI apps</div>
      <div class="ecosystem-logos">
        <span>Google Pay</span>
        <span class="ecosystem-dot">•</span>
        <span>PhonePe</span>
        <span class="ecosystem-dot">•</span>
        <span>Paytm</span>
        <span class="ecosystem-dot">•</span>
        <span>BHIM UPI</span>
        <span class="ecosystem-dot">•</span>
        <span>Cred UPI</span>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features">
      <div class="section-title-wrap">
        <span class="section-badge">Features</span>
        <h2 class="section-title">Built for the Way India Splits</h2>
        <p class="section-desc">Clean, simple group expense management designed for trips, flatmates, and daily group bills.</p>
      </div>

      <div class="features-grid">
        <div class="feature-card">
          <span class="feature-card-num">01</span>
          <h3 class="feature-card-title">Instant UPI Settlement</h3>
          <p class="feature-card-desc">Tap settle to launch your UPI app with the receiver's UPI ID and exact amount pre-filled. No middleman wallets or fees.</p>
        </div>

        <div class="feature-card">
          <span class="feature-card-num">02</span>
          <h3 class="feature-card-title">Debt Simplification</h3>
          <p class="feature-card-desc">Automatically calculates the minimum number of group payments, eliminating unnecessary back-and-forth transfers.</p>
        </div>

        <div class="feature-card">
          <span class="feature-card-num">03</span>
          <h3 class="feature-card-title">Zero Financial Storage</h3>
          <p class="feature-card-desc">We never ask for or store your bank accounts, card numbers, or UPI PINs. All payments occur peer-to-peer.</p>
        </div>

        <div class="feature-card">
          <span class="feature-card-num">04</span>
          <h3 class="feature-card-title">Easy Group Invites</h3>
          <p class="feature-card-desc">Share a quick link via WhatsApp or Telegram. Friends can view shared balances on the web or download the app.</p>
        </div>
      </div>
    </section>

    <!-- Steps Section -->
    <section class="steps-section">
      <div style="text-align: center;">
        <span class="section-badge">How It Works</span>
        <h2 class="section-title">Settling Up in 3 Steps</h2>
      </div>

      <div class="steps-grid">
        <div class="step-item">
          <div class="step-number">1</div>
          <h3 class="step-title">Create a Group</h3>
          <p class="step-desc">Name your group and share the invite link with friends via WhatsApp or message.</p>
        </div>

        <div class="step-item">
          <div class="step-number">2</div>
          <h3 class="step-title">Add Expenses</h3>
          <p class="step-desc">Enter bills as you spend. Split equally or by custom amounts. Split Boss tracks balances automatically.</p>
        </div>

        <div class="step-item">
          <div class="step-number">3</div>
          <h3 class="step-title">Settle via UPI</h3>
          <p class="step-desc">Whenever you want to clear dues, tap settle to launch Google Pay or PhonePe directly.</p>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="faq-section">
      <div class="section-title-wrap">
        <span class="section-badge">FAQ</span>
        <h2 class="section-title">Frequently Asked Questions</h2>
      </div>

      <div class="faq-item">
        <div class="faq-q">Is Split Boss free?</div>
        <div class="faq-a">Yes. Split Boss is 100% free to download and use with no subscription paywalls or hidden charges.</div>
      </div>

      <div class="faq-item">
        <div class="faq-q">Does Split Boss access my bank account?</div>
        <div class="faq-a">No. We never ask for or store bank credentials or UPI PINs. Settlements use standard UPI deep links to open your preferred banking app directly.</div>
      </div>

      <div class="faq-item">
        <div class="faq-q">Do my friends need to install the app to see group expenses?</div>
        <div class="faq-a">Friends can view balances through the web invite link, or download the app for real-time notifications and easier expense tracking.</div>
      </div>
    </section>

    <!-- Bottom Download Banner -->
    <section class="download-banner">
      <h2 class="banner-title">Start Splitting Expenses Effortlessly</h2>
      <p class="banner-desc">Download Split Boss on Google Play today and manage group balances with instant UPI settlements.</p>
      
      <a href="${effectivePlayStoreUrl}" class="btn-playstore-hero" target="_blank" rel="noopener">
        <svg class="playstore-icon-svg" viewBox="0 0 24 24" fill="none">
          <path d="M3.6 1.8L13.8 12L3.6 22.2C3.2 21.8 3 21.1 3 20.3V3.7C3 2.9 3.2 2.2 3.6 1.8Z" fill="#00C1A4"/>
          <path d="M17.2 8.6L13.8 12L17.2 15.4L20.8 13.4C21.8 12.8 21.8 11.2 20.8 10.6L17.2 8.6Z" fill="#FFD400"/>
          <path d="M13.8 12L3.6 1.8C4 1.4 4.6 1.3 5.3 1.7L17.2 8.6L13.8 12Z" fill="#00E676"/>
          <path d="M17.2 15.4L5.3 22.3C4.6 22.7 4 22.6 3.6 22.2L13.8 12L17.2 15.4Z" fill="#FF334B"/>
        </svg>
        <div class="btn-playstore-text">
          <span class="playstore-sub">INSTALL ON</span>
          <span class="playstore-main">Google Play</span>
        </div>
      </a>
    </section>
  </main>

  <!-- Clean Footer -->
  <footer class="site-footer">
    <div class="container footer-inner">
      <div style="display: flex; align-items: center; gap: 8px;">
        <img 
          src="${displayIcon}" 
          alt="Split Boss" 
          style="width: 24px; height: 24px; border-radius: 6px; border: 1px solid var(--border);" 
          onerror="this.src='/static/ic_launcher-web.png'"
        />
        <span style="font-weight: 700; font-size: 14px; color: var(--text-main);">Split Boss</span>
      </div>

      <div class="footer-links">
        <a href="#features">Features</a>
        <a href="${effectivePlayStoreUrl}" target="_blank" rel="noopener">Google Play</a>
        <a href="/privacy">Privacy Policy</a>
        <a href="/contact">Contact & Deletion</a>
        <a href="mailto:support@split.udhaar.store">Support</a>
      </div>

      <div class="footer-copy">
        © 2026 Split Boss. All rights reserved.
      </div>
    </div>
  </footer>
</body>
</html>`;
}

module.exports = { renderHomePage };
