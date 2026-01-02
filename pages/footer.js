import Image from "next/image";
import Link from "next/link";
import styles from "@/styles/Home.module.css";

export default function Footer() {
return(
        <footer className={styles.footer} id="footer">
          <div className={styles.footerInner}>
            <div className={styles.footBrand}>
              <img
                src="/quickshaw-logo-footer.png"
                alt="QuickShaw logo"
                className={styles.brandLogo}
              />
            </div>

            <div className={styles.footCols}>
              <div className={styles.footCol}>
                <div className="flex">
                  <div className={styles.footCol}>

                <Link href="/" className={styles.footLink}>
                  Home
                </Link>
                <a href="#about" className={styles.footLink}>
                  About us
                </a>

                </div>
                <div className={styles.footDivider} aria-hidden="true" />

              <div className={styles.footCol}>
                {/* <Link href="/customer_terms" className={styles.footLink}>
                  Terms &amp; Conditions
                </Link>
                <Link href="/privacy-policy" className={styles.footLink}>
                  Privacy Policy
                </Link> */}
                </div>
                </div>
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
            </div>
          </div>
        </footer>
        )
}