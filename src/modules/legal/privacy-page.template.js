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
 * Clean White / Light-Themed Official Privacy Policy Page
 * Fully compliant with Google Play Developer Policies & Indian DPDPA 2023
 */
function renderPrivacyPage({ baseUrl, iconUrl }) {
  const effectiveBaseUrl = baseUrl || 'https://split.udhaar.store';
  const effectiveIconUrl = iconUrl || `${effectiveBaseUrl}/static/ic_launcher-web.png`;
  const displayIcon = cachedIconBase64 || '/static/ic_launcher-web.png';
  const lastUpdated = 'October 24, 2026';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>Privacy Policy - Split Boss</title>
  
  <meta name="description" content="Privacy Policy for Split Boss. Learn how we handle your data, group expense records, and ensure 100% secure peer-to-peer UPI settlements.">
  
  <!-- Favicon & Touch Icons -->
  <link rel="icon" type="image/png" href="${effectiveIconUrl}">
  <link rel="apple-touch-icon" href="${effectiveIconUrl}">
  
  <!-- Open Graph -->
  <meta property="og:title" content="Privacy Policy - Split Boss">
  <meta property="og:description" content="Learn how Split Boss protects your personal data, group balances, and peer-to-peer UPI settlements.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${effectiveBaseUrl}/privacy">
  <meta property="og:image" content="${effectiveIconUrl}">
  <meta property="og:site_name" content="Split Boss">

  <!-- Mobile Styling -->
  <meta name="theme-color" content="#FFFFFF">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

  <style>
    :root {
      --bg-canvas: #F8FAFC;
      --bg-card: #FFFFFF;
      --border-card: #E2E8F0;
      --brand-primary: #059669;
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

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: var(--bg-canvas);
      color: var(--text-main);
      line-height: 1.7;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 16px 64px;
    }

    .wrapper {
      width: 100%;
      max-width: 800px;
    }

    /* Top Brand Navigation */
    .brand-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 28px;
      padding-bottom: 18px;
      border-bottom: 1px solid var(--border-card);
    }

    .brand-logo-link {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: inherit;
    }

    .brand-logo-img {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      object-fit: cover;
      border: 1px solid var(--border-card);
      background-color: var(--brand-mint);
    }

    .brand-name {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.4px;
      color: var(--text-main);
    }

    .brand-badge {
      font-size: 11px;
      font-weight: 700;
      background: var(--brand-mint);
      color: var(--brand-mint-text);
      padding: 2px 8px;
      border-radius: 999px;
      border: 1px solid #A7F3D0;
      margin-left: 6px;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      font-size: 13px;
      font-weight: 600;
      color: var(--brand-mint-text);
      text-decoration: none;
      padding: 6px 14px;
      background: #FFFFFF;
      border: 1px solid var(--border-card);
      border-radius: 999px;
      transition: background 0.15s ease;
    }

    .back-link:hover {
      background: #F1F5F9;
    }

    /* Content Card */
    .policy-card {
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      border-radius: 24px;
      padding: 44px 38px;
      box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.04);
    }

    @media (max-width: 640px) {
      .policy-card {
        padding: 28px 20px;
        border-radius: 20px;
      }
    }

    /* Document Header */
    .doc-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .doc-badge {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: var(--brand-mint-text);
      background: var(--brand-mint);
      border: 1px solid #A7F3D0;
      padding: 3px 9px;
      border-radius: 6px;
    }

    .doc-date {
      font-size: 12px;
      color: var(--text-subtle);
    }

    h1.doc-title {
      font-size: 30px;
      font-weight: 800;
      letter-spacing: -0.6px;
      color: var(--text-main);
      margin-bottom: 12px;
      line-height: 1.25;
    }

    p.doc-subtitle {
      font-size: 15px;
      color: var(--text-muted);
      margin-bottom: 30px;
      padding-bottom: 22px;
      border-bottom: 1px solid var(--border-card);
    }

    /* Callout Box */
    .callout-box {
      background: #F0FDF4;
      border: 1px solid #BBF7D0;
      border-radius: 16px;
      padding: 20px 22px;
      margin-bottom: 34px;
    }

    .callout-title {
      font-size: 15px;
      font-weight: 700;
      color: #166534;
      margin-bottom: 6px;
    }

    .callout-desc {
      font-size: 13.5px;
      color: #15803D;
      line-height: 1.6;
    }

    /* Policy Body Sections */
    .section {
      margin-bottom: 34px;
    }

    .section h2 {
      font-size: 19px;
      font-weight: 700;
      letter-spacing: -0.3px;
      color: var(--text-main);
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .section-num {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 6px;
      background: var(--brand-mint);
      color: var(--brand-mint-text);
      font-size: 12px;
      font-weight: 800;
      border: 1px solid #A7F3D0;
    }

    .section p {
      font-size: 14.5px;
      color: #334155;
      margin-bottom: 12px;
    }

    .section ul {
      margin-left: 20px;
      margin-bottom: 14px;
    }

    .section li {
      font-size: 14px;
      color: #334155;
      margin-bottom: 8px;
      line-height: 1.6;
    }

    .section li strong {
      color: var(--text-main);
    }

    /* Grid */
    .grid-cards {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 18px 0;
    }

    @media (max-width: 600px) {
      .grid-cards {
        grid-template-columns: 1fr;
      }
    }

    .grid-item {
      background: #F8FAFC;
      border: 1px solid var(--border-card);
      border-radius: 12px;
      padding: 16px;
    }

    .grid-item h3 {
      font-size: 13.5px;
      font-weight: 700;
      color: var(--brand-mint-text);
      margin-bottom: 5px;
    }

    .grid-item p {
      font-size: 13px;
      color: var(--text-muted);
      margin-bottom: 0;
      line-height: 1.5;
    }

    /* Deletion Box */
    .deletion-box {
      background: #FEF2F2;
      border: 1px solid #FECACA;
      border-radius: 14px;
      padding: 18px 20px;
      margin: 16px 0;
    }

    .deletion-box h3 {
      font-size: 14.5px;
      font-weight: 700;
      color: #991B1B;
      margin-bottom: 6px;
    }

    .deletion-box p {
      font-size: 13.5px;
      color: #B91C1C;
      margin-bottom: 12px;
    }

    .btn-contact {
      display: inline-flex;
      align-items: center;
      padding: 8px 16px;
      border-radius: 8px;
      background: #DC2626;
      color: #FFFFFF;
      font-size: 13px;
      font-weight: 700;
      text-decoration: none;
      transition: background 0.15s ease;
    }

    .btn-contact:hover {
      background: #B91C1C;
    }

    /* Footer */
    .policy-footer {
      text-align: center;
      margin-top: 36px;
      padding-top: 22px;
      border-top: 1px solid var(--border-card);
      font-size: 12.5px;
      color: var(--text-subtle);
    }

    .policy-footer a {
      color: var(--brand-mint-text);
      text-decoration: none;
      font-weight: 600;
    }

    .policy-footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <!-- Brand Nav -->
    <header class="brand-header">
      <a href="${effectiveBaseUrl}" class="brand-logo-link">
        <img 
          src="${displayIcon}" 
          alt="Split Boss Logo" 
          class="brand-logo-img" 
          onerror="this.src='/static/ic_launcher-web.png'"
        />
        <div>
          <span class="brand-name">Split Boss</span>
          <span class="brand-badge">India</span>
        </div>
      </a>
      <a href="${effectiveBaseUrl}" class="back-link">
        Back to App
      </a>
    </header>

    <!-- Main Policy Card -->
    <main class="policy-card">
      <div class="doc-meta">
        <span class="doc-badge">Official Policy</span>
        <span class="doc-date">Effective: ${lastUpdated}</span>
      </div>

      <h1 class="doc-title">Privacy Policy</h1>
      <p class="doc-subtitle">
        Your privacy, data rights, and financial security are the cornerstone of Split Boss. This policy explains what information we collect, how it is stored, and how your payments are handled.
      </p>

      <!-- Crucial FinTech & UPI Notice -->
      <div class="callout-box">
        <div class="callout-title">Zero-Financial-Storage Architecture</div>
        <p class="callout-desc">
          Split Boss is an expense tracking and balance settlement utility. We are <strong>not</strong> a bank, wallet, or payment aggregator. 
          <strong>We never collect, store, or have access to your bank accounts, debit/credit cards, UPI PINs, CVVs, or OTPs.</strong> 
          All settlements occur peer-to-peer via official, NPCI-regulated UPI applications (such as Google Pay, PhonePe, Paytm, or BHIM) installed directly on your personal device.
        </p>
      </div>

      <!-- Section 1 -->
      <div class="section">
        <h2><span class="section-num">1</span> Information We Collect</h2>
        <p>To provide accurate group debt tracking and collaborative expense calculation, we collect only the minimum required information:</p>
        
        <div class="grid-cards">
          <div class="grid-item">
            <h3>Account Profile</h3>
            <p>Your display name, email address, optional mobile number (E.164 format), and a cryptographically hashed password (via salted Bcrypt). We never store raw passwords.</p>
          </div>
          <div class="grid-item">
            <h3>Group & Expense Records</h3>
            <p>Group titles, expense amounts (in INR), categories, split shares, settlement status, and payer records.</p>
          </div>
          <div class="grid-item">
            <h3>UPI Virtual Payment Address</h3>
            <p>Your public UPI ID (e.g., name@okhdfcbank) if you voluntarily save it to your profile so group members can trigger one-tap UPI payments to you.</p>
          </div>
          <div class="grid-item">
            <h3>Diagnostic & Security Data</h3>
            <p>IP addresses, basic device metadata (OS version, app build), and timestamps strictly for API rate limiting, session authentication, and DDoS prevention.</p>
          </div>
        </div>
      </div>

      <!-- Section 2 -->
      <div class="section">
        <h2><span class="section-num">2</span> Device Permissions & Clipboard Usage</h2>
        <p>Split Boss adheres strictly to the principle of least privilege regarding device access:</p>
        <ul>
          <li><strong>Internet Access:</strong> Required to synchronize expenses, balances, and settlements securely with our cloud servers.</li>
          <li><strong>Clipboard Access for Invitations:</strong> When the app launches, it checks the local clipboard solely to verify if a valid Split Boss invite link (such as https://split.udhaar.store/join/...) is present. No personal, sensitive, or unrelated clipboard text is ever read, recorded, or transmitted to any server.</li>
          <li><strong>No Contacts or SMS Scraping:</strong> We do not scan your address book, read your text messages, or access personal media without explicit, real-time user action.</li>
        </ul>
      </div>

      <!-- Section 3 -->
      <div class="section">
        <h2><span class="section-num">3</span> How We Handle UPI Settlements</h2>
        <p>When you tap "Settle via UPI" in Split Boss, the app formats a standard NPCI UPI Deep Link intent:</p>
        <p style="font-family: 'JetBrains Mono', monospace; font-size: 12px; background: #F1F5F9; padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-card); color: #0F172A; word-break: break-all;">
          upi://pay?pa={UPI_ID}&pn={NAME}&am={AMOUNT}&cu=INR&tn={TRANSACTION_NOTE}
        </p>
        <p>
          This deep link hands off execution directly to your preferred UPI app. The payment transaction, authentication, and UPI PIN entry take place entirely inside your secure banking app. Split Boss receives neither your transaction confirmation nor your bank credentials.
        </p>
      </div>

      <!-- Section 4 -->
      <div class="section">
        <h2><span class="section-num">4</span> Data Sharing & Third-Party Disclosure</h2>
        <p>We respect your privacy and will never monetize your personal or financial data:</p>
        <ul>
          <li><strong>We Do Not Sell Data:</strong> Split Boss never sells, rents, monetizes, or shares user data with third-party advertisers or data brokers.</li>
          <li><strong>Group Member Visibility:</strong> Within a group you join or create, other verified members of that group can view the expenses you logged, balances owed, and settlement receipts.</li>
          <li><strong>Service Providers:</strong> Encrypted data is hosted on secure, certified cloud infrastructure solely for uptime, authentication, and database redundancy.</li>
          <li><strong>Legal Obligations:</strong> We may disclose data only if required by valid law, legal process, or court order under the laws of the Republic of India.</li>
        </ul>
      </div>

      <!-- Section 5 -->
      <div class="section">
        <h2><span class="section-num">5</span> Security & Encryption</h2>
        <p>We deploy bank-grade security protocols to safeguard your account records:</p>
        <ul>
          <li><strong>End-to-End Transport Security:</strong> All data transmitted between the mobile application and backend APIs is encrypted using Transport Layer Security (TLS 1.3 / HTTPS).</li>
          <li><strong>Hardware-Backed Storage:</strong> Authentication tokens (JWT) are stored using encrypted Android Keystore and iOS Keychain secure hardware storage on your mobile device.</li>
          <li><strong>Bcrypt Password Protection:</strong> All user passwords are irreversibly hashed using multiple salt rounds before database persistence.</li>
        </ul>
      </div>

      <!-- Section 6 -->
      <div class="section">
        <h2><span class="section-num">6</span> Account & Data Deletion (User Rights)</h2>
        <p>Under India's Digital Personal Data Protection Act (DPDPA 2023) and Google Play Developer Policies, you retain complete sovereignty over your information:</p>
        
        <div class="deletion-box">
          <h3>Request Full Account & Data Deletion</h3>
          <p>
            You may request complete and permanent deletion of your account, personal details, and associated group memberships at any time. Upon receiving your verified request, all personal identifiers, email associations, and profile records are expunged from our active databases within 14 business days.
          </p>
          <a href="mailto:privacy@splitboss.app?subject=Account%20Deletion%20Request%20-%20Split%20Boss" class="btn-contact">
            Request Data Deletion via Email
          </a>
        </div>
      </div>

      <!-- Section 7 -->
      <div class="section">
        <h2><span class="section-num">7</span> Children's Privacy</h2>
        <p>
          Split Boss is intended for individuals aged 18 and older, or minors who have received consent from a parent or legal guardian to participate in shared family expenses. We do not knowingly collect personal data from children under 13 years of age.
        </p>
      </div>

      <!-- Section 8 -->
      <div class="section">
        <h2><span class="section-num">8</span> Grievance Officer & Contact Information</h2>
        <p>
          In accordance with the Information Technology Act, 2000 and the Rules made thereunder, the Grievance Redressal contact details for Split Boss are provided below:
        </p>
        <ul>
          <li><strong>Application Name:</strong> Split Boss</li>
          <li><strong>Platform Website:</strong> <a href="${effectiveBaseUrl}" style="color: var(--brand-mint-text);">${effectiveBaseUrl}</a></li>
          <li><strong>Grievance & Privacy Inquiries:</strong> <a href="mailto:privacy@splitboss.app" style="color: var(--brand-mint-text);">privacy@splitboss.app</a></li>
          <li><strong>Support Email:</strong> <a href="mailto:support@split.udhaar.store" style="color: var(--brand-mint-text);">support@split.udhaar.store</a></li>
          <li><strong>Jurisdiction:</strong> Republic of India</li>
        </ul>
      </div>

      <footer class="policy-footer">
        <p>© 2026 Split Boss. All rights reserved. • <a href="${effectiveBaseUrl}/privacy">Privacy Policy</a> • <a href="${effectiveBaseUrl}">Home</a></p>
      </footer>
    </main>
  </div>
</body>
</html>`;
}

module.exports = { renderPrivacyPage };
