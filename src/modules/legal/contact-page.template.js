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
 * Clean White / Light-Themed Official Contact & Deletion Request Page
 * Meets Google Play Store Account & Data Deletion Requirements & Indian DPDPA 2023
 */
function renderContactPage({ baseUrl, iconUrl, successData = null, errorMessage = null }) {
  const effectiveBaseUrl = baseUrl || 'https://split.udhaar.store';
  const effectiveIconUrl = iconUrl || `${effectiveBaseUrl}/static/ic_launcher-web.png`;
  const displayIcon = cachedIconBase64 || '/static/ic_launcher-web.png';

  const isPreSubmitted = !!successData;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>Data & Account Deletion Request - Split Boss</title>
  
  <meta name="description" content="Official data and account deletion request form for Split Boss. Request deletion of your account credentials, expense history, or personal data.">
  
  <!-- Favicon & Touch Icons -->
  <link rel="icon" type="image/png" href="${effectiveIconUrl}">
  <link rel="apple-touch-icon" href="${effectiveIconUrl}">
  
  <!-- Open Graph -->
  <meta property="og:title" content="Data & Account Deletion - Split Boss">
  <meta property="og:description" content="Submit an official request to delete your Split Boss account and financial data.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${effectiveBaseUrl}/contact">
  <meta property="og:image" content="${effectiveIconUrl}">
  <meta property="og:site_name" content="Split Boss">

  <!-- Mobile Styling -->
  <meta name="theme-color" content="#FFFFFF">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">

  <style>
    :root {
      --bg-canvas: #F8FAFC;
      --bg-card: #FFFFFF;
      --border-card: #E2E8F0;
      --border-focus: #059669;
      --brand-primary: #059669;
      --brand-dark: #064E3B;
      --brand-mint: #E6FAF0;
      --brand-mint-text: #047857;
      --accent-coral: #E11D48;
      --accent-coral-bg: #FFE4E6;
      --text-main: #0F172A;
      --text-muted: #475569;
      --text-subtle: #64748B;
      --shadow-sm: 0 1px 3px rgba(0,0,0,0.04);
      --shadow-md: 0 4px 14px rgba(15, 23, 42, 0.05);
      --shadow-lg: 0 12px 30px rgba(15, 23, 42, 0.08);
      --radius-lg: 20px;
      --radius-md: 14px;
      --radius-sm: 10px;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-tap-highlight-color: transparent;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: var(--bg-canvas);
      color: var(--text-main);
      line-height: 1.6;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px 16px 64px;
    }

    .wrapper {
      width: 100%;
      max-width: 720px;
    }

    /* Top Navigation Header */
    .brand-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border-card);
    }

    .brand-logo-link {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: var(--text-main);
    }

    .brand-logo-img {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(5, 150, 105, 0.15);
      object-fit: cover;
    }

    .brand-name {
      font-weight: 800;
      font-size: 20px;
      letter-spacing: -0.4px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .badge-official {
      background: var(--brand-mint);
      color: var(--brand-mint-text);
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 100px;
      letter-spacing: 0.3px;
      text-transform: uppercase;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .nav-link {
      text-decoration: none;
      color: var(--text-muted);
      font-size: 13px;
      font-weight: 600;
      transition: color 0.15s ease;
    }

    .nav-link:hover {
      color: var(--brand-primary);
    }

    /* Card Container */
    .form-card {
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      border-radius: var(--radius-lg);
      padding: 36px 32px;
      box-shadow: var(--shadow-md);
      position: relative;
    }

    @media (max-width: 600px) {
      .form-card {
        padding: 24px 20px;
      }
    }

    .header-section {
      margin-bottom: 28px;
    }

    .category-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: var(--brand-primary);
      background: var(--brand-mint);
      padding: 4px 10px;
      border-radius: 6px;
      margin-bottom: 12px;
    }

    .page-title {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.6px;
      color: var(--text-main);
      margin-bottom: 8px;
    }

    .page-subtitle {
      font-size: 14px;
      color: var(--text-muted);
      line-height: 1.6;
    }

    /* Selection Cards (Either one or both) */
    .section-label {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .section-label span {
      font-size: 11px;
      color: var(--text-subtle);
      font-weight: 500;
    }

    .selection-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
      margin-bottom: 22px;
    }

    @media (min-width: 620px) {
      .selection-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .native-radio {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
      pointer-events: none;
    }

    .choice-card {
      position: relative;
      border: 2px solid var(--border-card);
      border-radius: var(--radius-md);
      padding: 16px;
      background: var(--bg-card);
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      user-select: none;
    }

    .choice-card:hover {
      border-color: #CBD5E1;
      transform: translateY(-1px);
    }

    /* Active / Checked state via modern CSS :has() and .selected fallback */
    .choice-card:has(.native-radio:checked),
    .choice-card.selected {
      border-color: var(--brand-primary);
      background: #F0FDF4;
      box-shadow: 0 4px 14px rgba(5, 150, 105, 0.1);
    }

    .choice-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    .choice-icon-wrap {
      width: 34px;
      height: 34px;
      border-radius: 9px;
      background: var(--bg-canvas);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 17px;
      color: var(--text-main);
      transition: background 0.15s;
    }

    .choice-card:has(.native-radio:checked) .choice-icon-wrap,
    .choice-card.selected .choice-icon-wrap {
      background: var(--brand-mint);
      color: var(--brand-primary);
    }

    .radio-indicator {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 2px solid #CBD5E1;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
      background: #FFF;
    }

    .choice-card:has(.native-radio:checked) .radio-indicator,
    .choice-card.selected .radio-indicator {
      background: var(--brand-primary);
      border-color: var(--brand-primary);
    }

    .radio-indicator svg {
      width: 12px;
      height: 12px;
      stroke: #FFFFFF;
      stroke-width: 3;
      fill: none;
      display: none;
    }

    .choice-card:has(.native-radio:checked) .radio-indicator svg,
    .choice-card.selected .radio-indicator svg {
      display: block;
    }

    .choice-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 4px;
    }

    .choice-desc {
      font-size: 12px;
      color: var(--text-muted);
      line-height: 1.45;
    }

    .badge-both {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 999px;
      background: var(--brand-mint);
      color: var(--brand-mint-text);
      letter-spacing: 0.3px;
    }

    /* Form Fields */
    .form-group {
      margin-bottom: 18px;
    }

    .form-label {
      display: block;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-main);
      margin-bottom: 6px;
    }

    .form-label .req {
      color: var(--accent-coral);
    }

    .form-input, .form-textarea {
      width: 100%;
      padding: 12px 14px;
      font-family: inherit;
      font-size: 14px;
      color: var(--text-main);
      background: #FFFFFF;
      border: 1.5px solid var(--border-card);
      border-radius: var(--radius-sm);
      transition: all 0.15s ease;
      outline: none;
    }

    .form-input:focus, .form-textarea:focus {
      border-color: var(--border-focus);
      box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.12);
    }

    .form-input::placeholder, .form-textarea::placeholder {
      color: #94A3B8;
      font-weight: 400;
    }

    .form-hint {
      font-size: 11px;
      color: var(--text-subtle);
      margin-top: 4px;
    }

    /* Two column row on larger screens */
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }

    @media (max-width: 540px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }

    /* Alert Banner */
    .alert-banner {
      display: none;
      padding: 12px 16px;
      border-radius: var(--radius-sm);
      font-size: 13px;
      margin-bottom: 20px;
    }

    .alert-banner.error {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--accent-coral-bg);
      color: #9F1239;
      border: 1px solid #FECDD3;
    }

    .alert-banner.info {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      background: #EFF6FF;
      color: #1E40AF;
      border: 1px solid #BFDBFE;
      margin-bottom: 24px;
    }

    /* Submit Button */
    .btn-submit {
      width: 100%;
      padding: 15px;
      background: var(--brand-primary);
      color: #FFFFFF;
      font-family: inherit;
      font-size: 15px;
      font-weight: 700;
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 14px rgba(5, 150, 105, 0.25);
    }

    .btn-submit:hover:not(:disabled) {
      background: #047857;
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(5, 150, 105, 0.35);
    }

    .btn-submit:disabled {
      opacity: 0.65;
      cursor: not-allowed;
      transform: none;
    }

    .btn-spinner {
      display: none;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: #FFFFFF;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Success Card (Shown upon successful submission) */
    .success-container {
      display: ${isPreSubmitted ? 'block' : 'none'};
      text-align: center;
      padding: 16px 8px;
    }

    .success-icon-badge {
      width: 64px;
      height: 64px;
      border-radius: 20px;
      background: var(--brand-mint);
      color: var(--brand-primary);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 30px;
      margin-bottom: 20px;
      box-shadow: 0 8px 24px rgba(5, 150, 105, 0.15);
    }

    .ticket-badge {
      display: inline-block;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      font-weight: 600;
      background: #F1F5F9;
      color: #0F172A;
      padding: 6px 14px;
      border-radius: 8px;
      border: 1px solid var(--border-card);
      margin: 12px 0 20px;
      letter-spacing: 0.5px;
    }

    .receipt-box {
      background: #F8FAFC;
      border: 1px solid var(--border-card);
      border-radius: var(--radius-md);
      padding: 16px 20px;
      text-align: left;
      font-size: 13px;
      margin: 20px 0 24px;
    }

    .receipt-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px dashed #E2E8F0;
    }

    .receipt-row:last-child {
      border-bottom: none;
    }

    .receipt-label {
      color: var(--text-subtle);
      font-weight: 500;
    }

    .receipt-value {
      color: var(--text-main);
      font-weight: 600;
    }

    /* Policy & Compliance Information */
    .policy-info-box {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid var(--border-card);
      font-size: 12px;
      color: var(--text-subtle);
      line-height: 1.6;
    }

    .policy-info-box h4 {
      font-size: 13px;
      color: var(--text-main);
      font-weight: 700;
      margin-bottom: 6px;
    }

    .policy-info-box ul {
      padding-left: 18px;
      margin-top: 6px;
    }

    .policy-info-box li {
      margin-bottom: 4px;
    }

    /* Footer */
    .footer {
      margin-top: 36px;
      text-align: center;
      font-size: 12px;
      color: var(--text-subtle);
    }

    .footer a {
      color: var(--text-muted);
      text-decoration: underline;
      text-underline-offset: 3px;
    }
  </style>
</head>
<body>

  <div class="wrapper">
    <!-- Brand Header -->
    <header class="brand-header">
      <a href="${effectiveBaseUrl}" class="brand-logo-link">
        <img src="${displayIcon}" alt="Split Boss Icon" class="brand-logo-img">
        <div class="brand-name">
          Split Boss
          <span class="badge-official">Official</span>
        </div>
      </a>
      <nav class="nav-links">
        <a href="${effectiveBaseUrl}" class="nav-link">Home</a>
        <a href="${effectiveBaseUrl}/privacy" class="nav-link">Privacy Policy</a>
      </nav>
    </header>

    <!-- Main Card -->
    <main class="form-card">
      <div id="formContainer" style="display: ${isPreSubmitted ? 'none' : 'block'};">
        <div class="header-section">
          <span class="category-tag">Data Rights & Privacy</span>
          <h1 class="page-title">Data / Account Deletion Request</h1>
          <p class="page-subtitle">
            Submit an official request to permanently delete your Split Boss account credentials, personal expense records, or all associated group transaction logs.
          </p>
        </div>

        <!-- Info Notice -->
        <div class="alert-banner info">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0; margin-top:1px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          <div>
            <strong>Google Play Policy & DPDPA Compliance:</strong>
            You may request deletion of either your account, your data, or both. Requests are verified and processed within 48 to 72 business hours.
          </div>
        </div>

        <!-- Error alert banner -->
        <div id="errorBanner" class="alert-banner error" style="${errorMessage ? 'display:flex;' : 'display:none;'}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <span id="errorMessage">${errorMessage || 'Please fill in all required fields.'}</span>
        </div>

        <form id="deletionForm" method="POST" action="/contact">
          <!-- 1. Selection Options: Either one or both -->
          <div class="section-label">
            1. Select Request Scope <span class="req">* Tap to select either one or both</span>
          </div>

          <div class="selection-grid">
            <!-- Option 1: Account Deletion Only -->
            <label class="choice-card" for="optAccount" id="cardAccount">
              <input type="radio" name="requestType" id="optAccount" value="account_deletion" class="native-radio">
              <div class="choice-header">
                <div class="choice-icon-wrap">👤</div>
                <div class="radio-indicator">
                  <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
              </div>
              <div class="choice-title">Account Deletion</div>
              <div class="choice-desc">Permanently remove login credentials, phone profile, and session authorizations.</div>
            </label>

            <!-- Option 2: Data Deletion Only -->
            <label class="choice-card" for="optData" id="cardData">
              <input type="radio" name="requestType" id="optData" value="data_deletion" class="native-radio">
              <div class="choice-header">
                <div class="choice-icon-wrap">🧾</div>
                <div class="radio-indicator">
                  <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
              </div>
              <div class="choice-title">Data Deletion</div>
              <div class="choice-desc">Purge all split expense shares, settlement logs, activity records, and attachments.</div>
            </label>

            <!-- Option 3: Both (Complete Erasure) -->
            <label class="choice-card selected" for="optBoth" id="cardBoth">
              <input type="radio" name="requestType" id="optBoth" value="both" checked class="native-radio">
              <div class="choice-header">
                <div class="choice-icon-wrap">🛡️</div>
                <div class="radio-indicator">
                  <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
              </div>
              <div class="choice-title" style="display: flex; align-items: center; justify-content: space-between;">
                <span>Both (Complete)</span>
                <span class="badge-both">Recommended</span>
              </div>
              <div class="choice-desc">Completely erase both your account login and all personal expense/settlement data.</div>
            </label>
          </div>

          <!-- 2. Personal Information Fields -->
          <div class="section-label" style="margin-top: 10px;">
            2. Your Registered Details
          </div>

          <div class="form-group">
            <label class="form-label" for="userName">Full Name <span class="req">*</span></label>
            <input type="text" id="userName" name="name" class="form-input" placeholder="e.g. Rahul Sharma" required autocomplete="name">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="userEmail">Gmail / Email Address <span class="req">*</span></label>
              <input type="email" id="userEmail" name="email" class="form-input" placeholder="e.g. yourname@gmail.com" required autocomplete="email">
              <div class="form-hint">Confirmation receipt will be dispatched to this email.</div>
            </div>

            <div class="form-group">
              <label class="form-label" for="userPhone">Registered Mobile <span class="req">*</span></label>
              <input type="tel" id="userPhone" name="phone" class="form-input" placeholder="e.g. +91 98765 43210" required autocomplete="tel">
              <div class="form-hint">Used to verify account ownership.</div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="userReason">Reason / Additional Notes (Optional)</label>
            <textarea id="userReason" name="reason" class="form-textarea" rows="3" placeholder="Tell us if you have specific instructions or feedback (optional)..."></textarea>
          </div>

          <!-- Submit Button -->
          <button type="submit" id="submitBtn" class="btn-submit">
            <span class="btn-spinner" id="btnSpinner"></span>
            <span id="btnText">Submit Deletion Request</span>
          </button>
        </form>

        <!-- Compliance Policy Summary -->
        <div class="policy-info-box">
          <h4>What happens after you submit?</h4>
          <ul>
            <li><strong>Verification:</strong> Our privacy team validates that the request matches registered records.</li>
            <li><strong>Execution:</strong> Data is permanently wiped from our PostgreSQL databases and cloud backups within 72 hours.</li>
            <li><strong>Third Parties:</strong> Split Boss does not sell personal or financial data to any third party. Peer-to-peer UPI settlements are routed directly bank-to-bank.</li>
          </ul>
        </div>
      </div>

      <!-- Success Receipt Container (Shown on completion) -->
      <div id="successContainer" class="success-container">
        <div class="success-icon-badge">✓</div>
        <h2 style="font-size: 22px; font-weight: 800; color: var(--text-main); margin-bottom: 6px;">
          Deletion Request Submitted
        </h2>
        <p style="font-size: 14px; color: var(--text-muted); max-width: 480px; margin: 0 auto;">
          Your request has been securely logged in our separate audit database. A verification acknowledgement has been recorded.
        </p>

        <div>
          <span class="ticket-badge" id="receiptTicketRef">
            ${successData?.ticketRef ? `Ticket #${successData.ticketRef}` : '#DEL-VERIFIED'}
          </span>
        </div>

        <div class="receipt-box">
          <div class="receipt-row">
            <span class="receipt-label">Request Scope:</span>
            <span class="receipt-value" id="receiptScope">
              ${successData?.requestType === 'both' ? 'Account & Data Deletion (Complete Erasure)' : (successData?.requestType === 'data_deletion' ? 'Data Deletion' : 'Account Deletion')}
            </span>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">Requested For:</span>
            <span class="receipt-value" id="receiptName">${successData?.name || 'Verified User'}</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">Gmail / Email:</span>
            <span class="receipt-value" id="receiptEmail">${successData?.email || 'N/A'}</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">Registered Mobile:</span>
            <span class="receipt-value" id="receiptPhone">${successData?.phone || 'N/A'}</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">Status:</span>
            <span class="receipt-value" style="color: #059669; font-weight: 700;">Pending Verification (48-72h)</span>
          </div>
        </div>

        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
          <a href="${effectiveBaseUrl}" class="btn-submit" style="width: auto; padding: 12px 24px; text-decoration: none;">
            Return to Homepage
          </a>
          <a href="${effectiveBaseUrl}/privacy" class="nav-link" style="display: flex; align-items: center; padding: 12px 18px;">
            Read Privacy Policy
          </a>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <p>© 2026 Split Boss. All rights reserved. • <a href="${effectiveBaseUrl}/privacy">Privacy Policy</a> • <a href="${effectiveBaseUrl}/contact">Contact & Deletion</a></p>
    </footer>
  </div>

  <script>
    function updateSelectedCards() {
      const selected = document.querySelector('input[name="requestType"]:checked');
      document.querySelectorAll('.choice-card').forEach(function(card) {
        card.classList.remove('selected');
      });
      if (selected) {
        const parent = selected.closest('.choice-card');
        if (parent) parent.classList.add('selected');
      }
    }

    // Attach native change listener
    document.querySelectorAll('input[name="requestType"]').forEach(function(radio) {
      radio.addEventListener('change', updateSelectedCards);
    });

    // Also support clicking anywhere on the card
    document.querySelectorAll('.choice-card').forEach(function(card) {
      card.addEventListener('click', function() {
        const radio = this.querySelector('input[name="requestType"]');
        if (radio) {
          radio.checked = true;
          updateSelectedCards();
        }
      });
    });

    // Intercept form submission with AJAX for seamless modern experience
    document.getElementById('deletionForm').addEventListener('submit', async function(e) {
      e.preventDefault();

      const errorBanner = document.getElementById('errorBanner');
      const errorMessage = document.getElementById('errorMessage');
      errorBanner.style.display = 'none';

      const selectedRadio = document.querySelector('input[name="requestType"]:checked');
      const requestType = selectedRadio ? selectedRadio.value : 'both';

      const name = document.getElementById('userName').value.trim();
      const email = document.getElementById('userEmail').value.trim();
      const phone = document.getElementById('userPhone').value.trim();
      const reason = document.getElementById('userReason').value.trim();

      if (!name || name.length < 2) {
        errorMessage.innerText = 'Please enter your full name (minimum 2 characters).';
        errorBanner.style.display = 'flex';
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errorMessage.innerText = 'Please enter a valid Gmail / Email address.';
        errorBanner.style.display = 'flex';
        return;
      }

      if (!phone || phone.replace(/[^0-9]/g, '').length < 8) {
        errorMessage.innerText = 'Please enter a valid mobile number (at least 8-10 digits).';
        errorBanner.style.display = 'flex';
        return;
      }

      const submitBtn = document.getElementById('submitBtn');
      const btnSpinner = document.getElementById('btnSpinner');
      const btnText = document.getElementById('btnText');

      submitBtn.disabled = true;
      btnSpinner.style.display = 'inline-block';
      btnText.innerText = 'Recording Request...';

      try {
        const response = await fetch('/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name,
            email,
            phone,
            requestType,
            reason
          })
        });

        const result = await response.json();

        if (response.ok && result.success) {
          // Display success receipt card
          document.getElementById('formContainer').style.display = 'none';
          document.getElementById('receiptTicketRef').innerText = 'Ticket #' + (result.data.ticketRef || 'DEL-VERIFIED');
          
          let scopeLabel = 'Account & Data Deletion (Complete Erasure)';
          if (result.data.requestType === 'account_deletion') {
            scopeLabel = 'Account Deletion Only';
          } else if (result.data.requestType === 'data_deletion') {
            scopeLabel = 'Expense & Transaction Data Deletion Only';
          }
          document.getElementById('receiptScope').innerText = scopeLabel;
          document.getElementById('receiptName').innerText = result.data.name;
          document.getElementById('receiptEmail').innerText = result.data.email;
          document.getElementById('receiptPhone').innerText = result.data.phone;

          document.getElementById('successContainer').style.display = 'block';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          errorMessage.innerText = result.error?.message || result.message || 'Failed to submit request. Please try again.';
          errorBanner.style.display = 'flex';
        }
      } catch (err) {
        errorMessage.innerText = 'Network connection error. Please try again.';
        errorBanner.style.display = 'flex';
      } finally {
        submitBtn.disabled = false;
        btnSpinner.style.display = 'none';
        btnText.innerText = 'Submit Deletion Request';
      }
    });

    // Initialize state on page load
    updateSelectedCards();
  </script>
</body>
</html>`;
}

module.exports = { renderContactPage };
