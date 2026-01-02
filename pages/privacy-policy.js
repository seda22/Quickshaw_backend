import React from "react";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import styles from "@/styles/privacy-policy.module.css";
import offeringsStyles from "@/styles/Offerings.module.css";

export default function PrivacyPolicy() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <style>
          @import
          url(https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,100..900;1,100..900&display=swap);
        </style>

      <Head>
        <title>Customer Terms — Autos | QuickShaw</title>
        <meta
          name="description"
          content="Customer Terms for QuickShaw auto rides."
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover, shrink-to-fit=no"
        />
      </Head>
        {/* Topbar */}
        <div className={offeringsStyles.topbar}>
          <div className={offeringsStyles.topbarInner}>
            <a className={offeringsStyles.brand} href="">
              <Image
                src="/quickshaw-logo.png"
                alt="QuickShaw"
                height={36}
                width={160}
                priority
              />
            </a>

            <nav className={offeringsStyles.menu}>
              <Link href="/" className={offeringsStyles.link}>
                Home
              </Link>
              <Link href="/offerings" className={offeringsStyles.link}>
                Offerings
              </Link>
              <Link href="/#social" className={offeringsStyles.link}>
                Social
              </Link>
              <Link href="/report" className={offeringsStyles.link}>
                Report a problem
              </Link>
            </nav>
          </div>
        </div>

        {/* Inner content */}
        <div className={styles.content}>
          <div className={styles.heading}>
            <h1>Privacy Policy</h1>
            <p>
              <em>Last updated: 17th September 2025</em>
            </p>
          </div>
          <section>
            <p>
              QuickShaw Mobility Private Limited (<strong>QuickShaw</strong>,
              we, us or our) respects your privacy and is committed to
              protecting your personal data. This Privacy Policy explains: (a)
              what information we collect; (b) why and how we use that
              information; (c) when and with whom we share it; (d) how long we
              keep it; and (e) the rights you have and how you can exercise
              them.
            </p>

            <p>
              By using QuickShaw Services (our mobile apps, website, APIs, or
              offline customer support), you accept the practices described in
              this Policy. If you are a driver partner or corporate client, some
              aspects below will be expanded by the onboarding contracts and
              Data Processing Agreements we execute.
            </p>

            <div>
              {" "}
              <h2>1. Scope &amp; Roles</h2>
              <p>
                1.1 This policy applies to personal data of all natural persons
                who interact with QuickShaw: riders, drivers (Driver Partners),
                prospective drivers, customers of corporate offerings, and
                visitors to our websites.
              </p>
            </div>
            <div>
              {" "}
              <strong>1.2 Roles we play :</strong>
              <ul>
                <li>
                  Data fiduciary (controller): For user accounts, ride-matching,
                  billing and marketing.
                </li>
                <li>
                  Data processor: Where we act on the instructions of a
                  corporate client (e.g., employee transport program). In such
                  cases, the client’s agreement and the DPA govern.
                </li>
              </ul>
              <p>
                1.3 Applicability across jurisdictions: QuickShaw operates
                primarily in India; references to “Applicable Law” include the
                Digital Personal Data Protection Act, 2023, IT Act, and other
                relevant regulations. Where processing occurs outside India, we
                ensure adequate safeguards.
              </p>
            </div>
            <div>
              <h2>2. Definitions</h2>
              <ul>
                <li>
                  Personal Data: Any information that identifies you or can be
                  tied back to you - e.g., name, phone, device id, location.
                </li>
                <li>
                  Sensitive Personal Data: Examples: bank account details for
                  payouts, government ID copies, biometric information (if
                  collected).
                </li>
                <li>
                  Processing: Any operation on Personal Data (collect, store,
                  transmit, analyze, delete).
                </li>
                <li>
                  Masking/Proxy communications: Technical flow that lets drivers
                  and riders communicate without exchanging raw phone numbers.
                </li>
              </ul>
            </div>
            <div>
              <h2>3. What Data We Collect</h2>
              <p>
                We collect only what we need to deliver Services safely,
                reliably and legally. Below are the categories plus
                plain-English examples of when we collect them.
              </p>
            </div>
            <div>
              <strong>3.1 Account & Identity</strong>
              <ul>
                <li>
                  Collected: at sign-up/driver onboarding (example: name, mobile
                  number, email, profile photo).
                </li>
                <li>
                  Purpose: account creation, identity verification, legitimate
                  contact.
                </li>
                <li>
                  Example: When you sign up we verify your phone with an OTP and
                  store the phone hash and metadata.
                </li>
              </ul>
            </div>

            <div>
              <strong>3.2 Payment & Financial</strong>
              <ul>
                <li>
                  Collected: tokenized card data, UPI ID, bank account (for
                  driver payouts), transaction IDs.
                </li>
                <li>Purpose: to charge fares, pay drivers, support refunds.</li>
                <li>
                  Handling: raw card PANs are never stored on QuickShaw servers
                  - tokens from PCI-DSS-compliant processors only.
                </li>
              </ul>
            </div>

            <div>
              <strong>3.3 Location & Trip Telemetry</strong>
              <ul>
                <li>
                  Collected: real-time GPS while app is running and during
                  active trips, start/end coordinates, route, timestamps.
                </li>
                <li>
                  Purpose: routing, ETA, pooling optimization, safety
                  investigations.
                </li>
                <li>
                  Example: While a trip is active the app transmits the rider &
                  driver GPS every X seconds (configurable). After trip, precise
                  coordinates are retained per retention rules; aggregated
                  geohashes are used for heat-map analytics.
                </li>
              </ul>
            </div>

            <div>
              <strong>3.4 Device & Usage Data</strong>
              <ul>
                <li>
                  Collected: device model, OS, app version, IP, crash logs,
                  in-app events.
                </li>
                <li>
                  Purpose: debugging, product improvements, fraud detection.
                </li>
              </ul>
            </div>

            <div>
              <strong>3.5 Safety & Communications Data</strong>
              <ul>
                <li>
                  Collected: in-app messages, call metadata (not raw phone
                  unless user opts for it), incident report attachments (photos,
                  uploaded audio with consent).
                </li>
                <li>
                  Purpose: incident resolution, dispute handling, law
                  enforcement responses where required.
                </li>
              </ul>
            </div>

            <div>
              <strong>3.6 Driver Onboarding Data</strong>
              <ul>
                <li>
                  Collected: driving licence, vehicle registration, insurance,
                  background check results, bank account for payouts.
                </li>
                <li>
                  Purpose: compliance, KYC, payout processing. Sensitive driver
                  docs are stored encrypted.
                </li>
              </ul>
            </div>

            <div>
              <h2>4. How We Collect Data</h2>
              <ul>
                <li>Direct input: you type it into the app or upload docs.</li>
                <li>
                  Automated telemetry: the app collects GPS and device
                  diagnostics while in use.
                </li>
                <li>
                  From partners: background-check vendors, payment gateways,
                  mapping providers.
                </li>
                <li>
                  From other users: ratings or incident reports that mention
                  another user or driver.
                </li>
                <li>
                  Public sources: for compliance checks, as permitted by law.
                </li>
              </ul>
              <p>
                We aim to collect the minimum necessary and where possible, use
                privacy-preserving forms (e.g., coarse geohash instead of
                precise coordinates for historical analytics).
              </p>
            </div>

            <div>
              <h2>5. Legal Bases & Purposes</h2>
              <p>
                Below is the mapping we follow so each processing activity has a
                lawful basis and purpose:
              </p>
              <ul>
                <li>
                  Contractual Necessity to execute the Terms of Service: trip
                  matching, payment facilitation, receipts, refunds.
                </li>
                <li>
                  Legal Obligation to comply with tax, regulatory, law
                  enforcement requests, audit retention.
                </li>
                <li>
                  Consent for marketing messages, targeted advertising, optional
                  safety audio uploads, or sensitive data collection beyond what
                  law mandates. Consent is captured explicitly and auditable.
                </li>
                <li>
                  Legitimate Interests for fraud detection, safety monitoring,
                  product improvement. We balance interests with rights via
                  DPIAs and opt-outs where appropriate.
                </li>
              </ul>
              <p>Examples:</p>
              <ul>
                <li>
                  Trip telemetry: Contractual necessity & legitimate interest
                  (safety).
                </li>
                <li>Marketing emails: Consent (opt-in; can withdraw).</li>
                <li>
                  Driver licence copy: Legal obligation + contractual necessity
                  for onboarding.
                </li>
              </ul>
            </div>
            <div>
              <h2>6. Consent - how we obtain & record it</h2>
              <ul>
                <li>
                  Consent is collected in-app via clear, plain-language prompts
                  and checkboxes (no pre-ticked boxes).
                </li>
                <li>
                  Each consent event is logged with timestamp, app version, user
                  id, and the privacy text shown (audit trail).
                </li>
                <li>
                  For sensitive data (e.g., government ID), consent dialogs
                  explain the retention period and purpose and link to this
                  Policy.
                </li>
                <li>
                  Users can review and withdraw consent from the Privacy
                  Dashboard (in-app) and we honor revocations prospectively.
                </li>
              </ul>
            </div>

            <h2>7. Contact</h2>
            <address>
              Data Protection Officer
              <br />
              QuickShaw Mobility Private Limited
              <br />
              <a href="mailto:privacy@quickshaw.example">
                privacy@quickshaw.example
              </a>
            </address>

            <p>
              By using QuickShaw Services (our mobile apps, website, APIs, or
              offline customer support), you accept the practices described in
              this Policy. If you are a driver partner or corporate client, some
              aspects will be expanded by onboarding contracts and Data
              Processing Agreements we execute.
            </p>
          </section>
        </div>

        {/* Footer (reused from Offerings) */}
        {/* <footer className={styles.footer} id="footer">
          <div className={styles.footerInner}>
            <div className={styles.footBrand}>
              <img
                src="/quickshaw-logo1.png"
                alt="QuickShaw logo"
                className={styles.brandLogo}
              />
              <span className={styles.brandWord}>QuickShaw</span>
            </div>

            <div className={styles.footCols}>
              <div className={styles.footCol}>
                <Link href="/" className={styles.footLink}>
                  Home
                </Link>
                <Link href="/" className={styles.footLink}>
                  About us
                </Link>
                <div className={styles.footSocial}>
                  <a
                    aria-label="WhatsApp"
                    href="https://chat.whatsapp.com/LZASDXueL0b0L7plUBIz3k"
                  >
                    <img src="/whatsapp.png" alt="WhatsApp" />
                  </a>
                  <a
                    aria-label="Instagram"
                    href="https://www.instagram.com/quickshaw.co.in/"
                  >
                    <img src="/insta.png" alt="Instagram" />
                  </a>
                  <a
                    aria-label="LinkedIn"
                    href="https://www.linkedin.com/company/quickshaw/"
                  >
                    <img src="/linkedin.png" alt="LinkedIn" />
                  </a>
                </div>

                <div className={styles.footBadges}>
                  <a href="#">
                    <img src="/google-play.png" alt="Get it on Google Play" />
                  </a>
                  <a href="#">
                    <img src="/app-store.png" alt="Download on the App Store" />
                  </a>
                </div>
              </div>

              <div className={styles.footDivider} aria-hidden="true" />

              <div className={styles.footCol}>
                <Link href="/customer_terms" className={styles.footLink}>
                  Terms &amp; Conditions
                </Link>
                <Link href="/privacy-policy" className={styles.footLink}>
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </footer> */}
      </main>
    </div>
  );
}
