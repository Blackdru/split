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
 * Split Boss Official Web Landing Page
 * High-converting, neo-fintech showcase for Google Play Store app downloads
 */
function renderHomePage({ baseUrl, playStoreUrl, iconUrl }) {
  const effectiveBaseUrl = baseUrl || 'https://split.udhaar.store';
  const effectiveIconUrl = iconUrl || `${effectiveBaseUrl}/static/ic_launcher-web.png`;
  const effectivePlayStoreUrl = playStoreUrl || 'https://play.google.com/store/apps/details?id=com.budrock.splitboss';
  const displayIcon = cachedIconBase64 || '/static/ic_launcher-web.png';

  const pageTitle = 'Split Boss - India’s Smartest Group Expense & UPI Settlement App';
  const pageDesc = 'Effortlessly split bills with flatmates, friends, and travel buddies. Settle balances instantly with 1-tap UPI (GPay, PhonePe, Paytm). 100% Free.';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>${pageTitle}</title>
  
  <meta name="description" content="${pageDesc}">
  <meta name="keywords" content="split bills, group expenses, expense sharing, splitwise alternative india, upi settlement, hisaab, split boss, trip expense tracker, flatmate bills">
  
  <!-- Favicon & Touch Icons -->
  <link rel="icon" type="image/png" href="${effectiveIconUrl}">
  <link rel="apple-touch-icon" href="${effectiveIconUrl}">
  
  <!-- Open Graph / Facebook / WhatsApp -->
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

  <!-- Mobile Browser Styling -->
  <meta name="theme-color" content="#061210">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">

  <style>
    :root {
      --bg-canvas: #061210;
      --bg-card: rgba(10, 27, 23, 0.82);
      --bg-card-hover: rgba(14, 38, 32, 0.9);
      --border-card: rgba(52, 211, 153, 0.18);
      --border-card-hover: rgba(52, 211, 153, 0.38);
      --brand-primary: #1CB08F;
      --brand-dark: #059669;
      --brand-mint: #E6FAF0;
      --brand-mint-text: #34D399;
      --text-main: #F8FAFC;
      --text-muted: #94A3B8;
      --text-subtle: #64748B;
      --accent-pill-bg: rgba(28, 176, 143, 0.14);
      --accent-pill-border: rgba(52, 211, 153, 0.3);
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
      background-image: 
        radial-gradient(at 0% 0%, rgba(28, 176, 143, 0.16) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(5, 150, 105, 0.12) 0px, transparent 55%),
        radial-gradient(at 50% 40%, rgba(16, 185, 129, 0.08) 0px, transparent 60%);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      overflow-x: hidden;
      line-height: 1.6;
    }

    /* Ambient Lighting Glows */
    .glow-orb-top {
      position: fixed;
      top: -180px;
      left: 50%;
      transform: translateX(-50%);
      width: 650px;
      height: 650px;
      background: radial-gradient(circle, rgba(28, 176, 143, 0.25) 0%, rgba(28, 176, 143, 0) 70%);
      filter: blur(80px);
      pointer-events: none;
      z-index: 0;
    }

    .glow-orb-side {
      position: fixed;
      bottom: -150px;
      right: -100px;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0) 70%);
      filter: blur(90px);
      pointer-events: none;
      z-index: 0;
    }

    .container {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 1140px;
      padding: 0 24px;
    }

    /* Sticky Navigation */
    .nav-bar {
      width: 100%;
      padding: 18px 0;
      position: sticky;
      top: 0;
      z-index: 50;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(52, 211, 153, 0.12);
      background: rgba(6, 18, 16, 0.75);
    }

    .nav-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .brand-link {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: inherit;
    }

    .brand-logo {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      object-fit: cover;
      box-shadow: 0 6px 18px rgba(28, 176, 143, 0.35);
      border: 1px solid rgba(230, 250, 240, 0.4);
      background-color: var(--brand-mint);
      transition: transform 0.25s ease;
    }

    .brand-link:hover .brand-logo {
      transform: scale(1.05);
    }

    .brand-text-block {
      display: flex;
      flex-direction: column;
    }

    .brand-title {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.4px;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .brand-tag {
      font-size: 10px;
      font-weight: 700;
      background: var(--accent-pill-bg);
      color: var(--brand-mint-text);
      padding: 2px 7px;
      border-radius: 999px;
      border: 1px solid var(--accent-pill-border);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .brand-subtitle {
      font-size: 11px;
      color: var(--text-muted);
      font-weight: 500;
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .nav-link {
      font-size: 14px;
      font-weight: 600;
      color: #CBD5E1;
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .nav-link:hover {
      color: var(--brand-mint-text);
    }

    .btn-nav-download {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border-radius: 12px;
      background: linear-gradient(135deg, #1CB08F 0%, #059669 100%);
      color: #051A14;
      font-size: 13.5px;
      font-weight: 700;
      text-decoration: none;
      box-shadow: 0 4px 14px rgba(28, 176, 143, 0.35);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .btn-nav-download:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(28, 176, 143, 0.5);
    }

    /* Hero Section */
    .hero-section {
      padding: 72px 0 56px;
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
        gap: 40px;
      }
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 7px 16px;
      background: rgba(28, 176, 143, 0.12);
      border: 1px solid rgba(52, 211, 153, 0.28);
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      color: #A7F3D0;
      letter-spacing: 0.4px;
      margin-bottom: 22px;
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
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }

    .hero-title {
      font-size: 48px;
      line-height: 1.15;
      font-weight: 800;
      letter-spacing: -1.2px;
      color: #FFFFFF;
      margin-bottom: 18px;
    }

    @media (max-width: 640px) {
      .hero-title {
        font-size: 34px;
        letter-spacing: -0.8px;
      }
    }

    .highlight-gradient {
      background: linear-gradient(135deg, #34D399 0%, #10B981 50%, #059669 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-subtitle {
      font-size: 17px;
      color: var(--text-muted);
      line-height: 1.6;
      margin-bottom: 32px;
      max-width: 540px;
    }

    @media (max-width: 900px) {
      .hero-subtitle {
        margin-left: auto;
        margin-right: auto;
      }
    }

    /* CTA Buttons in Hero */
    .hero-cta-group {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 14px;
      margin-bottom: 32px;
    }

    @media (max-width: 900px) {
      .hero-cta-group {
        justify-content: center;
      }
    }

    .btn-playstore-hero {
      display: inline-flex;
      align-items: center;
      gap: 14px;
      padding: 14px 26px;
      border-radius: 16px;
      background: linear-gradient(135deg, #1CB08F 0%, #059669 100%);
      color: #051A14;
      text-decoration: none;
      box-shadow: 
        0 14px 32px -4px rgba(28, 176, 143, 0.5), 
        inset 0 1px 1px rgba(255, 255, 255, 0.4);
      transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .btn-playstore-hero:hover {
      background: linear-gradient(135deg, #22C55E 0%, #059669 100%);
      transform: translateY(-2px);
      box-shadow: 0 18px 36px -4px rgba(28, 176, 143, 0.65);
    }

    .btn-playstore-hero:active {
      transform: scale(0.98);
    }

    .playstore-icon-svg {
      width: 28px;
      height: 28px;
      flex-shrink: 0;
    }

    .btn-playstore-text {
      display: flex;
      flex-direction: column;
      text-align: left;
    }

    .playstore-sub {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      opacity: 0.85;
      line-height: 1;
      margin-bottom: 3px;
    }

    .playstore-main {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: -0.4px;
      line-height: 1.1;
    }

    .btn-openapp-hero {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 16px 22px;
      border-radius: 16px;
      background: rgba(28, 176, 143, 0.08);
      color: #E2E8F0;
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      border: 1px solid rgba(52, 211, 153, 0.22);
      transition: all 0.2s ease;
    }

    .btn-openapp-hero:hover {
      background: rgba(28, 176, 143, 0.16);
      border-color: rgba(52, 211, 153, 0.38);
      color: #FFFFFF;
      transform: translateY(-1px);
    }

    /* Trust Pill Bar */
    .hero-trust-bar {
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 12.5px;
      color: var(--text-muted);
    }

    @media (max-width: 900px) {
      .hero-trust-bar {
        justify-content: center;
      }
    }

    .trust-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .trust-check {
      color: #34D399;
      font-weight: bold;
    }

    /* Smartphone Mockup Preview in Hero */
    .hero-mockup-wrapper {
      position: relative;
      display: flex;
      justify-content: center;
    }

    .phone-card {
      width: 100%;
      max-width: 360px;
      background: rgba(10, 27, 23, 0.88);
      border: 1px solid rgba(52, 211, 153, 0.22);
      border-radius: 36px;
      padding: 26px 22px;
      box-shadow: 
        0 30px 60px -15px rgba(0, 0, 0, 0.8),
        0 0 0 1px rgba(255, 255, 255, 0.05),
        inset 0 1px 1px rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(28px);
      -webkit-backdrop-filter: blur(28px);
      transform: perspective(1000px) rotateY(-4deg) rotateX(2deg);
      transition: transform 0.4s ease;
    }

    .phone-card:hover {
      transform: perspective(1000px) rotateY(0deg) rotateX(0deg);
    }

    .mock-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      padding-bottom: 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .mock-group-title {
      font-size: 17px;
      font-weight: 800;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .mock-badge {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 8px;
      background: rgba(28, 176, 143, 0.18);
      color: #34D399;
      border: 1px solid rgba(52, 211, 153, 0.25);
    }

    .mock-balance-card {
      background: linear-gradient(135deg, rgba(28, 176, 143, 0.2) 0%, rgba(5, 150, 105, 0.1) 100%);
      border: 1px solid rgba(52, 211, 153, 0.3);
      border-radius: 20px;
      padding: 18px;
      margin-bottom: 18px;
      text-align: left;
    }

    .mock-balance-label {
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.6px;
      color: #A7F3D0;
      margin-bottom: 4px;
    }

    .mock-balance-val {
      font-size: 30px;
      font-weight: 800;
      letter-spacing: -0.6px;
      color: #FFFFFF;
      margin-bottom: 10px;
    }

    .mock-upi-btn {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 10px 14px;
      border-radius: 12px;
      background: #34D399;
      color: #051A14;
      font-size: 12px;
      font-weight: 800;
      border: none;
      box-shadow: 0 6px 14px rgba(52, 211, 153, 0.35);
    }

    .mock-expenses-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .mock-expense-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(0, 0, 0, 0.32);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 14px;
      padding: 12px 14px;
    }

    .mock-expense-left {
      display: flex;
      align-items: center;
      gap: 10px;
      text-align: left;
    }

    .mock-expense-icon {
      font-size: 20px;
    }

    .mock-expense-desc {
      font-size: 13px;
      font-weight: 700;
      color: #F1F5F9;
    }

    .mock-expense-sub {
      font-size: 11px;
      color: #94A3B8;
    }

    .mock-expense-amount {
      font-size: 14px;
      font-weight: 800;
      color: #34D399;
      font-family: 'JetBrains Mono', monospace;
    }

    /* UPI Ecosystem Strip */
    .ecosystem-strip {
      padding: 38px 0;
      border-top: 1px solid rgba(52, 211, 153, 0.12);
      border-bottom: 1px solid rgba(52, 211, 153, 0.12);
      text-align: center;
      margin-bottom: 64px;
    }

    .ecosystem-label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 700;
      color: var(--text-subtle);
      margin-bottom: 18px;
    }

    .ecosystem-logos {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 20px 32px;
    }

    .upi-badge-chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 999px;
      background: rgba(28, 176, 143, 0.08);
      border: 1px solid rgba(52, 211, 153, 0.18);
      font-size: 13px;
      font-weight: 700;
      color: #E2E8F0;
    }

    /* Feature Grid Section */
    .section-title-wrap {
      text-align: center;
      margin-bottom: 48px;
    }

    .section-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: var(--brand-mint-text);
      background: var(--accent-pill-bg);
      border: 1px solid var(--accent-pill-border);
      padding: 4px 12px;
      border-radius: 999px;
      margin-bottom: 12px;
    }

    .section-title {
      font-size: 34px;
      font-weight: 800;
      letter-spacing: -0.8px;
      color: #FFFFFF;
      margin-bottom: 12px;
    }

    .section-desc {
      font-size: 15px;
      color: var(--text-muted);
      max-width: 620px;
      margin: 0 auto;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 72px;
    }

    .feature-card {
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      border-radius: 24px;
      padding: 28px 24px;
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      transition: all 0.25s ease;
      box-shadow: 0 16px 36px -10px rgba(0, 0, 0, 0.5);
    }

    .feature-card:hover {
      background: var(--bg-card-hover);
      border-color: var(--border-card-hover);
      transform: translateY(-4px);
    }

    .feature-card-icon {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: rgba(28, 176, 143, 0.16);
      border: 1px solid rgba(52, 211, 153, 0.28);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      margin-bottom: 18px;
    }

    .feature-card-title {
      font-size: 18px;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 8px;
      letter-spacing: -0.3px;
    }

    .feature-card-desc {
      font-size: 13.5px;
      color: var(--text-muted);
      line-height: 1.6;
    }

    /* Steps Section */
    .steps-section {
      background: linear-gradient(180deg, rgba(10, 27, 23, 0.6) 0%, rgba(6, 18, 16, 0.9) 100%);
      border: 1px solid rgba(52, 211, 153, 0.16);
      border-radius: 32px;
      padding: 48px 36px;
      margin-bottom: 72px;
      box-shadow: 0 24px 50px -12px rgba(0,0,0,0.6);
    }

    .steps-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      margin-top: 36px;
    }

    @media (max-width: 768px) {
      .steps-grid {
        grid-template-columns: 1fr;
        gap: 28px;
      }
    }

    .step-item {
      text-align: left;
      position: relative;
    }

    .step-number {
      font-size: 13px;
      font-weight: 800;
      color: var(--brand-mint-text);
      background: rgba(28, 176, 143, 0.2);
      border: 1px solid rgba(52, 211, 153, 0.3);
      width: 32px;
      height: 32px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }

    .step-title {
      font-size: 17px;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 8px;
    }

    .step-desc {
      font-size: 13.5px;
      color: var(--text-muted);
      line-height: 1.6;
    }

    /* FAQ Section */
    .faq-section {
      max-width: 760px;
      margin: 0 auto 80px;
    }

    .faq-item {
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      border-radius: 18px;
      margin-bottom: 14px;
      padding: 20px 24px;
      transition: all 0.2s ease;
    }

    .faq-item:hover {
      border-color: var(--border-card-hover);
    }

    .faq-q {
      font-size: 16px;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .faq-a {
      font-size: 14px;
      color: var(--text-muted);
      line-height: 1.6;
    }

    /* Bottom Big Download Banner */
    .download-banner {
      background: linear-gradient(135deg, rgba(28, 176, 143, 0.22) 0%, rgba(5, 150, 105, 0.12) 100%);
      border: 1px solid rgba(52, 211, 153, 0.32);
      border-radius: 32px;
      padding: 54px 36px;
      text-align: center;
      margin-bottom: 64px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 24px 60px -12px rgba(28, 176, 143, 0.25);
    }

    .banner-title {
      font-size: 36px;
      font-weight: 800;
      letter-spacing: -0.8px;
      color: #FFFFFF;
      margin-bottom: 12px;
    }

    .banner-desc {
      font-size: 16px;
      color: #CBD5E1;
      max-width: 580px;
      margin: 0 auto 30px;
    }

    /* Footer */
    .site-footer {
      border-top: 1px solid rgba(52, 211, 153, 0.14);
      padding: 40px 0 50px;
      width: 100%;
      background: rgba(6, 18, 16, 0.95);
    }

    .footer-inner {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }

    .footer-links {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 20px;
      font-size: 13px;
    }

    .footer-links a {
      color: var(--text-muted);
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .footer-links a:hover {
      color: var(--brand-mint-text);
    }

    .footer-copy {
      font-size: 12.5px;
      color: var(--text-subtle);
    }
  </style>
</head>
<body>
  <div class="glow-orb-top"></div>
  <div class="glow-orb-side"></div>

  <!-- Navigation -->
  <nav class="nav-bar">
    <div class="container nav-inner">
      <a href="${effectiveBaseUrl}/" class="brand-link">
        <img 
          src="${displayIcon}" 
          alt="Split Boss Icon" 
          class="brand-logo" 
          onerror="this.src='/static/ic_launcher-web.png'"
        />
        <div class="brand-text-block">
          <div class="brand-title">
            <span>Split Boss</span>
            <span class="brand-tag">India</span>
          </div>
          <span class="brand-subtitle">India-First Expense Sharing</span>
        </div>
      </a>

      <div class="nav-actions">
        <a href="#features" class="nav-link" style="display: none; @media(min-width: 640px) { display: block; }">Features</a>
        <a href="/privacy" class="nav-link">Privacy</a>
        <a href="${effectivePlayStoreUrl}" class="btn-nav-download" target="_blank" rel="noopener">
          <span>Get App</span>
          <span>↓</span>
        </a>
      </div>
    </div>
  </nav>

  <!-- Hero Section -->
  <main class="container">
    <section class="hero-section">
      <div class="hero-left">
        <div class="hero-badge">
          <span class="pulse-dot"></span>
          <span>India’s #1 Smart Hisaab App • 100% Free</span>
        </div>

        <h1 class="hero-title">
          Split Bills with Friends. Settle Instantly via <span class="highlight-gradient">UPI</span>.
        </h1>

        <p class="hero-subtitle">
          Say goodbye to messy spreadsheets, endless calculations, and awkward money reminders. Split Boss simplifies group debt and lets everyone settle in 1 tap with Google Pay, PhonePe, and Paytm.
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
            <span>Open Split Boss</span>
            <span>↗</span>
          </a>
        </div>

        <!-- Trust Features -->
        <div class="hero-trust-bar">
          <div class="trust-item">
            <span class="trust-check">✓</span>
            <span>Zero Platform Fees</span>
          </div>
          <div class="trust-item">
            <span class="trust-check">✓</span>
            <span>No Bank Details Stored</span>
          </div>
          <div class="trust-item">
            <span class="trust-check">✓</span>
            <span>Instant UPI Settle</span>
          </div>
        </div>
      </div>

      <!-- Hero Mockup Phone Card -->
      <div class="hero-mockup-wrapper">
        <div class="phone-card">
          <div class="mock-header">
            <div class="mock-group-title">
              <span>✈️</span>
              <span>Goa Trip Hisaab</span>
            </div>
            <span class="mock-badge">4 Members</span>
          </div>

          <div class="mock-balance-card">
            <div class="mock-balance-label">Overall Balance</div>
            <div class="mock-balance-val">You get ₹2,450</div>
            <button class="mock-upi-btn" onclick="window.open('${effectivePlayStoreUrl}')">
              <span>Settle via Google Pay / PhonePe</span>
              <span>→</span>
            </button>
          </div>

          <div class="mock-expenses-list">
            <div class="mock-expense-item">
              <div class="mock-expense-left">
                <span class="mock-expense-icon">🍕</span>
                <div>
                  <div class="mock-expense-desc">Beach Shack Dinner</div>
                  <div class="mock-expense-sub">Paid by Arjun • Split 4 ways</div>
                </div>
              </div>
              <div class="mock-expense-amount">₹3,200</div>
            </div>

            <div class="mock-expense-item">
              <div class="mock-expense-left">
                <span class="mock-expense-icon">⛽</span>
                <div>
                  <div class="mock-expense-desc">Thar Self-Drive Fuel</div>
                  <div class="mock-expense-sub">Paid by You • Exact Split</div>
                </div>
              </div>
              <div class="mock-expense-amount">₹4,500</div>
            </div>

            <div class="mock-expense-item">
              <div class="mock-expense-left">
                <span class="mock-expense-icon">🏖️</span>
                <div>
                  <div class="mock-expense-desc">Water Sports Scuba</div>
                  <div class="mock-expense-sub">Paid by Rohan</div>
                </div>
              </div>
              <div class="mock-expense-amount">₹6,000</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Ecosystem Strip -->
    <section class="ecosystem-strip">
      <div class="ecosystem-label">Direct 1-Tap Settlements Compatible With</div>
      <div class="ecosystem-logos">
        <div class="upi-badge-chip"><span>⚡</span><span>Google Pay</span></div>
        <div class="upi-badge-chip"><span>⚡</span><span>PhonePe</span></div>
        <div class="upi-badge-chip"><span>⚡</span><span>Paytm UPI</span></div>
        <div class="upi-badge-chip"><span>⚡</span><span>BHIM UPI</span></div>
        <div class="upi-badge-chip"><span>⚡</span><span>Cred UPI</span></div>
      </div>
    </section>

    <!-- Core Features Section -->
    <section id="features" style="padding-top: 24px;">
      <div class="section-title-wrap">
        <span class="section-badge">Why Split Boss</span>
        <h2 class="section-title">Built Specially for the Way India Splits</h2>
        <p class="section-desc">Traditional splitting apps are full of ads, clunky foreign currency converters, and complex ledgers. Split Boss gives you clean, modern, instant Indian UPI settlements.</p>
      </div>

      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-card-icon">⚡</div>
          <h3 class="feature-card-title">Instant UPI Settlement</h3>
          <p class="feature-card-desc">No middleman wallets or delays. Tap "Settle" and your phone opens Google Pay, PhonePe, or Paytm with the receiver's UPI ID and exact amount pre-filled.</p>
        </div>

        <div class="feature-card">
          <div class="feature-card-icon">🧠</div>
          <h3 class="feature-card-title">Smart Debt Simplification</h3>
          <p class="feature-card-desc">Our intelligent algorithm minimizes group transactions. Instead of 12 confusing back-and-forth transfers, Split Boss condenses it down to the fewest payments.</p>
        </div>

        <div class="feature-card">
          <div class="feature-card-icon">✈️</div>
          <h3 class="feature-card-title">Flatmates, Trips & Events</h3>
          <p class="feature-card-desc">Organize spending by Trip, Flat, Friends, or Events. Track rent, electricity, fuel, groceries, and dining with crystal-clear breakdown per person.</p>
        </div>

        <div class="feature-card">
          <div class="feature-card-icon">🔒</div>
          <h3 class="feature-card-title">Zero Financial Storage</h3>
          <p class="feature-card-desc">We never ask for your debit card, credit card, bank passwords, or UPI PINs. Peer-to-peer payments stay completely between you and your trusted banking apps.</p>
        </div>

        <div class="feature-card">
          <div class="feature-card-icon">🔗</div>
          <h3 class="feature-card-title">Seamless Group Invites</h3>
          <p class="feature-card-desc">Share an invite link via WhatsApp or Telegram. Friends can view the group on the web without logging in, or download the app for real-time ledger updates.</p>
        </div>

        <div class="feature-card">
          <div class="feature-card-icon">✨</div>
          <h3 class="feature-card-title">100% Free Forever</h3>
          <p class="feature-card-desc">No annoying subscription paywalls, no banner ads, and no hidden commission fees on your group settlements. Split expenses effortlessly.</p>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="steps-section">
      <div style="text-align: center;">
        <span class="section-badge">How It Works</span>
        <h2 class="section-title">Settling Up in 3 Simple Steps</h2>
      </div>

      <div class="steps-grid">
        <div class="step-item">
          <div class="step-number">1</div>
          <h3 class="step-title">Create a Group</h3>
          <p class="step-desc">Name your group (e.g. "Goa Trip" or "BHK 402 Flatmates") and share the invite link with friends via WhatsApp.</p>
        </div>

        <div class="step-item">
          <div class="step-number">2</div>
          <h3 class="step-title">Add Expenses as You Go</h3>
          <p class="step-desc">Enter bills in seconds. Split equally, by custom amounts, or by percentage. Split Boss keeps a real-time tally of who owes whom.</p>
        </div>

        <div class="step-item">
          <div class="step-number">3</div>
          <h3 class="step-title">Settle with 1-Tap UPI</h3>
          <p class="step-desc">Whenever you want to clear balances, tap "Settle Up" to launch your UPI app. The payment completes directly with zero friction.</p>
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
        <div class="faq-q">Is Split Boss completely free?</div>
        <div class="faq-a">Yes! Split Boss is 100% free to download and use. There are no platform charges, no subscription paywalls, and no advertisements.</div>
      </div>

      <div class="faq-item">
        <div class="faq-q">Does Split Boss access or store my bank account?</div>
        <div class="faq-a">No. We never ask for, collect, or store your bank accounts, debit cards, or UPI PINs. When you settle, Split Boss triggers a standard UPI deep link on your phone to open your own banking app (Google Pay, PhonePe, Paytm, etc.).</div>
      </div>

      <div class="faq-item">
        <div class="faq-q">How do I invite my friends to a group?</div>
        <div class="faq-a">Inside your group, simply tap "Share Invite Link". You can share it directly via WhatsApp, Telegram, or SMS. Anyone with the link can preview the group balances.</div>
      </div>

      <div class="faq-item">
        <div class="faq-q">What Android devices are supported?</div>
        <div class="faq-a">Split Boss is fully optimized for all modern Android devices running Android 6.0 and higher. You can install it directly from the Google Play Store.</div>
      </div>
    </section>

    <!-- Bottom Download Banner -->
    <section class="download-banner">
      <h2 class="banner-title">Ready to Stop Worrying About Group Hisaab?</h2>
      <p class="banner-desc">Download Split Boss on Google Play today and experience hassle-free expense tracking and instant UPI settlements with friends.</p>
      
      <a href="${effectivePlayStoreUrl}" class="btn-playstore-hero" target="_blank" rel="noopener">
        <svg class="playstore-icon-svg" viewBox="0 0 24 24" fill="none">
          <path d="M3.6 1.8L13.8 12L3.6 22.2C3.2 21.8 3 21.1 3 20.3V3.7C3 2.9 3.2 2.2 3.6 1.8Z" fill="#00C1A4"/>
          <path d="M17.2 8.6L13.8 12L17.2 15.4L20.8 13.4C21.8 12.8 21.8 11.2 20.8 10.6L17.2 8.6Z" fill="#FFD400"/>
          <path d="M13.8 12L3.6 1.8C4 1.4 4.6 1.3 5.3 1.7L17.2 8.6L13.8 12Z" fill="#00E676"/>
          <path d="M17.2 15.4L5.3 22.3C4.6 22.7 4 22.6 3.6 22.2L13.8 12L17.2 15.4Z" fill="#FF334B"/>
        </svg>
        <div class="btn-playstore-text">
          <span class="playstore-sub">INSTALL FREE ON</span>
          <span class="playstore-main">Google Play Store</span>
        </div>
      </a>
    </section>
  </main>

  <!-- Footer -->
  <footer class="site-footer">
    <div class="container footer-inner">
      <div style="display: flex; align-items: center; gap: 10px;">
        <img 
          src="${displayIcon}" 
          alt="Split Boss" 
          style="width: 28px; height: 28px; border-radius: 8px;" 
          onerror="this.src='/static/ic_launcher-web.png'"
        />
        <span style="font-weight: 800; font-size: 15px; color: #FFFFFF;">Split Boss</span>
        <span style="font-size: 11px; color: #64748B;">• India Hisaab</span>
      </div>

      <div class="footer-links">
        <a href="#features">Features</a>
        <a href="${effectivePlayStoreUrl}" target="_blank" rel="noopener">Download on Play Store</a>
        <a href="/privacy">Privacy Policy</a>
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
