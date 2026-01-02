// pages/customer_terms.js
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import styles from "@/styles/terms.module.css";
import stylesHome from "@/styles/Home.module.css";

export default function CustomerAutosTerms() {
  return (
    <>
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

      {/* Topbar (same as homepage) */}
      <div className={stylesHome.topbar}>
        <div className={stylesHome.topbarInner}>
          <a className={stylesHome.brand} href="/">
            <Image
              src="/quickshaw-logo.png"
              alt="QuickShaw"
              height={36}
              width={160}
              priority
            />
          </a>

          <nav className={stylesHome.menu}>
            <Link href="/" className={stylesHome.link}>
              Home
            </Link>
            <Link href="/offerings" className={stylesHome.link}>
              Offerings
            </Link>
            <Link href="/#social" className={stylesHome.link}>
              Social
            </Link>
            <Link href="/report" className={stylesHome.link}>
              Report a problem
            </Link>
          </nav>

          <div aria-hidden />
        </div>
      </div>

      {/* Banner right under the topbar. Put /public/terms-hero.png */}
      {/* <section className={styles.termsHero} aria-label="QuickShaw banner">
        <Image
          src="/terms-hero.png"
          alt="QuickShaw patterned banner"
          fill
          priority
          sizes="100vw"
        />
      </section> */}

      {/* ======= BODY ======= */}
      <main className={styles.pageBody}>
        <div className={styles.legalWrap}>
          <p className={styles.updated}>
            Last updated: <span>19th August 2025</span>
          </p>
          <h1 className={styles.kicker}>For drivers</h1>

          {/* Intro blocks (bold then regular), like your Figma */}
          <p className={styles.introStrong}>
            This document is an electronic record under the Information
            Technology Act, 2000 and applicable rules. By registering as a
            driver on the QuickShaw platform, you agree to be bound by these
            Terms and Conditions (“T&Cs”).
          </p>

          <p className={styles.intro}>
            QuickShaw (“Company”, “we”, “our”, “us”) provides technology-based
            services through its mobile application to connect passengers
            (“Users”) with independent auto-rickshaw drivers (“you”) for
            on-demand transportation services (“Services”).
          </p>

          <div className={styles.caret} aria-hidden>
            ▾
          </div>

          <p className={styles.intro}>
            By registering on QuickShaw, you acknowledge that you have read,
            understood, and accepted these T&Cs, along with the Privacy Policy
            and any other policies updated by the Company from time to time.
          </p>

          {/* 1 */}
          <section className={styles.section}>
            <h2 className={styles.h2}>1. Eligibility and Registration</h2>
            <ul className={styles.list}>
              <li>You must be at least 18 years of age.</li>
              <li>
                You must hold a valid driving license for auto-rickshaw and all
                required government permits (insurance, vehicle registration,
                pollution).
              </li>
              <li>
                You must have a registered and roadworthy auto-rickshaw that
                complies with local transport authority rules.
              </li>
              <li>
                You must provide accurate, complete, and up-to-date personal and
                vehicle information at the time of registration.
              </li>
              <li>
                QuickShaw may verify your documents, background, and driving
                history before activation on the Platform.
              </li>
            </ul>
          </section>

          {/* 2 */}
          <section className={styles.section}>
            <h2 className={styles.h2}>2. Use of Platform</h2>
            <ul className={styles.list}>
              <li>
                You agree to use the Platform only to provide Services lawfully
                and in compliance with local traffic, transport, and safety
                laws.
              </li>
              <li>
                You shall not misuse the Platform, attempt to manipulate fares,
                or engage in fraudulent or illegal activities.
              </li>
              <li>
                Your account is personal and non-transferable; you may not allow
                anyone else to drive using your QuickShaw account.
              </li>
              <li>
                QuickShaw reserves the right to suspend or terminate your access
                if you violate these T&Cs or applicable laws.
              </li>
            </ul>
          </section>

          {/* 3 */}
          <section className={styles.section}>
            <h2 className={styles.h2}>3. Driver Obligations</h2>
            <ul className={styles.list}>
              <li>
                Ensure your auto-rickshaw is clean, well-maintained, and safe
                for passengers.
              </li>
              <li>
                Behave courteously, professionally, and respectfully with Users.
              </li>
              <li>
                Accept rides fairly and do not discriminate against Users based
                on gender, religion, caste, disability, etc.
              </li>
              <li>
                Complete accepted rides to the agreed destination unless
                unavoidable circumstances arise.
              </li>
              <li>
                Follow all traffic rules, safety measures, and health-related
                regulations notified by the government.
              </li>
              <li>
                Do not carry unauthorized goods, illegal substances, or engage
                in activities that may harm the User or QuickShaw’s reputation.
              </li>
            </ul>
          </section>

          {/* 4 */}
          <section className={styles.section}>
            <h2 className={styles.h2}>4. Service Fees and Payments</h2>
            <ul className={styles.list}>
              <li>
                Fares will be calculated based on distance, time, demand, or as
                otherwise determined by QuickShaw’s dynamic pricing algorithm.
              </li>
              <li>
                QuickShaw will collect fares from Users (through digital
                payments) and settle drivers’ earnings when they claim from the
                wallet.
              </li>
            </ul>
          </section>

          {/* 5 */}
          <section className={styles.section}>
            <h2 className={styles.h2}>5. Insurance and Liability</h2>
            <ul className={styles.list}>
              <li>
                You are responsible for maintaining valid insurance coverage
                (vehicle insurance) as required by law.
              </li>
              <li>QuickShaw does not provide insurance for your vehicle.</li>
              <li>
                You are solely responsible for any accidents, traffic
                violations, or penalties incurred while providing Services.
              </li>
              <li>
                QuickShaw acts only as a technology intermediary and is not
                liable for loss, damage, injury, or disputes between you and the
                User.
              </li>
            </ul>
          </section>

          {/* 6 */}
          <section className={styles.section}>
            <h2 className={styles.h2}>6. Ratings and Feedback</h2>
            <ul className={styles.list}>
              <li>Users may rate and review your service on the Platform.</li>
              <li>
                Consistently poor ratings or misconduct may lead to warnings,
                temporary suspension, or permanent deactivation.
              </li>
              <li>
                You may also rate Users; however, feedback must be respectful
                and professional.
              </li>
            </ul>
          </section>

          {/* 7 */}
          <section className={styles.section}>
            <h2 className={styles.h2}>7. Confidentiality and Data</h2>
            <ul className={styles.list}>
              <li>
                You consent to QuickShaw collecting and processing your personal
                and vehicle information for verification, payments, and
                operational purposes.
              </li>
              <li>
                You must not misuse or share Users’ personal information (phone
                number, location, etc.) obtained during rides.
              </li>
              <li>Data handling will follow QuickShaw’s Privacy Policy.</li>
            </ul>
          </section>

          {/* 8 */}
          <section className={styles.section}>
            <h2 className={styles.h2}>8. Termination and Suspension</h2>
            <ul className={styles.list}>
              <li>
                QuickShaw may suspend or terminate your account immediately in
                case of:
                <ul className={styles.sublist}>
                  <li>Violation of these T&Cs or applicable laws.</li>
                  <li>Safety concerns, fraud, or misbehavior with Users.</li>
                  <li>
                    Repeated ride cancellations or refusal of trips without
                    valid reasons.
                  </li>
                  <li>Misuse of promotional offers or system manipulation.</li>
                </ul>
              </li>
            </ul>
            <p className={styles.intro}>
              You may choose to deactivate your account anytime by notifying
              QuickShaw, subject to clearance of all dues.
            </p>
          </section>

          {/* 9 */}
          <section className={styles.section}>
            <h2 className={styles.h2}>9. Modification</h2>
            <p className={styles.intro}>
              QuickShaw reserves the right to modify these T&Cs at any time.
              Updated versions will be posted on the Platform, and your
              continued use will be deemed acceptance of changes.
            </p>
          </section>

          {/* 10 */}
          <section className={styles.section}>
            <h2 className={styles.h2}>
              10. Governing Law and Dispute Resolution
            </h2>
            <ul className={styles.list}>
              <li>
                These T&Cs shall be governed by and interpreted under the laws
                of India.
              </li>
              <li>
                Any disputes will be subject to the exclusive jurisdiction of
                the courts in the city where QuickShaw is registered.
              </li>
            </ul>
          </section>
        </div>
      </main>

      {/* Footer (same as homepage) */}
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
              <a href="/about" className={styles.footLink}>
                About us
              </a>
              <div className={styles.footSocial}>
                <a
                  aria-label="WhatsApp"
                  href="https://chat.whatsapp.com/LZASDXueL0b0L7plUBIz3k"
                >
                  <img src="/whatsapp.png" alt="" />
                </a>
                <a
                  aria-label="Instagram"
                  href="https://www.instagram.com/quickshaw.co.in/"
                >
                  <img src="/insta.png" alt="" />
                </a>
                <a
                  aria-label="LinkedIn"
                  href="https://www.linkedin.com/company/quickshaw/"
                >
                  <img src="/linkedin.png" alt="" />
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
              <Link href="/customer_terms">
                <span className={styles.footLink}>Terms &amp; Conditions</span>
              </Link>
              <Link href="/privacy-policy" className={styles.footLink}>
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer> */}
    </>
  );
}
