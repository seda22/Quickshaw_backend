import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "@/styles/Home.module.css";
import Link from "next/link";
// 🔗 Firebase (normal search: load once, filter on client)
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBJhxil7RsyubTwCBIctYsoLDgpMXikTM8",
  authDomain: "quickshaw-e3d95.firebaseapp.com",
  databaseURL: "https://quickshaw-e3d95-default-rtdb.firebaseio.com",
  projectId: "quickshaw-e3d95",
  storageBucket: "quickshaw-e3d95.firebasestorage.app",
  messagingSenderId: "1042700258885",
  appId: "1:1042700258885:web:6b88a78aead1a567039d2c",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function Home() {
  // simple, normal search state
  const [allPlaces, setAllPlaces] = useState([]);
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [pickupHits, setPickupHits] = useState([]);
  const [dropHits, setDropHits] = useState([]);
  const [showPickupDD, setShowPickupDD] = useState(false);
  const [showDropDD, setShowDropDD] = useState(false);

  // ------- highlights slider (s1..s5) -------
  const slides = [
    "/s1.png",
    "/s2.png",
    "/s3.png",
    "/s4.png",
    "/s5.png",
    "/s6.png",
  ];
  const [slide, setSlide] = useState(0);

  // autoplay every 4.5s
  useEffect(() => {
    const id = setInterval(() => {
      setSlide((i) => (i + 1) % slides.length);
    }, 4500);
    return () => clearInterval(id);
  }, [slides.length]);

  useEffect(() => {
    // load once (runs on client due to useEffect)
    (async () => {
      const snap = await getDocs(collection(db, "iitbhu_geospatial_data"));
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAllPlaces(rows);
    })();
  }, []);

  const filterPlaces = (text) => {
    const t = (text || "").trim().toLowerCase();
    if (!t) return [];
    return allPlaces
      .filter((p) => (p.name || "").toLowerCase().includes(t))
      .slice(0, 8);
  };

  // inline styles kept, but with explicit text color to avoid white-on-white
  const ddStyle = {
    position: "absolute",
    top: "calc(100% + 8px)",
    left: 0,
    right: 0,
    background: "#fff",
    border: "1px solid rgba(0,0,0,.08)",
    borderRadius: 12,
    boxShadow: "0 16px 32px rgba(0,0,0,.12)",
    overflow: "hidden",
    zIndex: 999, // keep on top
    color: "#111", // ensure visible text
    maxHeight: 280,
    overflowY: "auto",
  };
  const rowStyle = {
    width: "100%",
    textAlign: "left",
    padding: "12px 14px",
    borderBottom: "1px solid rgba(0,0,0,.04)",
    background: "#fff",
    display: "flex",
    alignItems: "center",
    gap: 12,
    cursor: "pointer",
    color: "#111", // ensure visible text
  };

  return (
    <>
      <Head>
        <title>QuickShaw</title>
        <meta name="description" content="EV-first rides for campus & city." />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover, shrink-to-fit=no"
        />
      </Head>

      <div className={styles.topbar}>
        <div className={styles.topbarInner}>
          <a className={styles.brand} href="">
            <Image
              src="/quickshaw-logo.png"
              alt="QuickShaw"
              height={36}
              width={160}
              priority
            />
          </a>

          <nav className={styles.menu}>
            <Link href="/" className={styles.link}>
              Home
            </Link>
            <Link href="/offerings" className={styles.link}>
              Offerings
            </Link>

            <a href="#social" className={styles.link}>
              Social
            </a>
            {/* <a href="#report" className={styles.link}> */}
            {/* Report a problem */}
            {/* <Link href="/report" className={styles.link}>
              Report a problem
            </Link> */}
            {/* </a> */}
          </nav>

          {/* ⬇️ replaces the old empty placeholder; only shows on mobile */}
          <div className={styles.burger} aria-hidden="true">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>

      <main className={styles.pageBody}>
        {/* HERO */}
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <h1 className={styles.heroTitle}>From IIT BHU to Bharat</h1>
            <p className={styles.heroSub}>
              Choose the most convenient and safe mode of commute
            </p>

           

            {/* <button className={styles.cta}>Ride now</button> */}
          </div>
        </section>

        {/* ========= Available modes ========= */}
        <section className={styles.modes}>
          <div className={styles.modesInner}>
            <h2 className={styles.modesTitle}>Available modes</h2>
            <hr className={styles.modesRule} />

            <div className={styles.modesGrid}>
              {/* Airport cabs — clickable */}
              <article className={styles.modeCard}>
                <div className={styles.modeCopy}>
                  <h3 className={styles.modeHead}>Airport Cabs</h3>
                  <p className={styles.modeText}>
                    Share your return journey with your college mates.
                  </p>

                  {/* Update href to your page/form */}
                  <Link href="/login" className={styles.modeBtn}>
                    Pre-book now
                  </Link>
                </div>

                <div className={styles.modeArt}>
                  <Image src="/taxi.png" alt="" fill sizes="220px" priority />
                </div>
              </article>

              {/* E-Auto — coming soon (not clickable) */}
              <article className={styles.modeCard}>
                <div className={styles.modeCopy}>
                  <h3 className={styles.modeHead}>E-Auto</h3>
                  <p className={styles.modeText}>
                    Travel in campus & key hotspots in VNS at your convenience.
                  </p>

                  <button className={`${styles.modeBtn} ${styles.modeSoon}`} disabled aria-disabled="true">
                    Coming soon
                  </button>
                </div>

                <div className={styles.modeArt}>
                  <Image src="/eauto.png" alt="" fill sizes="220px" />
                </div>
              </article>

              {/* Rickshaw — coming soon (not clickable) */}
              <article className={styles.modeCard}>
                <div className={styles.modeCopy}>
                  <h3 className={styles.modeHead}>Rickshaw</h3>
                  <p className={styles.modeText}>
                    Choose comfort & space. Suits best for reserved trips.
                  </p>

                <button className={`${styles.modeBtn} ${styles.modeSoon}`} disabled aria-disabled="true">
                    Coming soon
                  </button>
                </div>

                <div className={styles.modeArt}>
                  <Image src="/rickshaw.png" alt="" fill sizes="220px" />
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Section title */}
        <section className={styles.comfort}>
          <div className={styles.comfortInner}>
            <h2 className={styles.comfortTitle}>Making journeys comfortable</h2>
            <hr className={styles.comfortRule} />
          </div>
        </section>

        {/* ---- Highlights slider (s1 → s6) ---- */}
        {/* ---- Highlights slider (s1 → s6) ---- */}
        <section className={styles.highlights} aria-label="Highlights">
          <div className={styles.highlightsInner}>
            <div className={styles.highlightsTrack}>
              {slides.map((src, i) => (
                <div className={styles.highlight} key={i}>
                  <Image
                    src={src}
                    alt={`highlight ${i + 1}`}
                    fill
                    priority={i === 0}
                    sizes="(max-width: 768px) 80vw, 320px"
                  />
                  {/* <Link href={`/offerings#offering-${i + 1}`}> */}
                    <button>Know More →</button>
                  {/* </Link> */}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========= Scan & Onboard ========= */}
        <section className={styles.scan}>
          <div className={styles.scanInner}>
            <h2 className={styles.scanTitle}>Scan & Onboard</h2>
            <hr className={styles.scanRule} />

            <div className={styles.scanGrid}>
              <div className={styles.scanText}>
                <p className={styles.scanLead}>
                  Seeing an auto idle on the road, then no need to book online,
                  just <span className={styles.scanEm}>Scan QR</span> placed in
                  it and enjoy all benefits of QuickShaw!
                </p>

                <button className={styles.scanCta} disabled>
                  Coming soon
                </button>
              </div>

              <div className={styles.scanGallery}>
                <div className={styles.scanPic}>
                  <Image
                    src="/scan-1.png"
                    alt="Auto spotted on road"
                    fill
                    sizes="(max-width: 900px) 50vw, 25vw"
                  />
                </div>
                <div className={styles.scanPic}>
                  <Image
                    src="/scan-2.png"
                    alt="Scan QR inside the auto"
                    fill
                    sizes="(max-width: 900px) 50vw, 25vw"
                  />
                </div>
                <div className={styles.scanPic}>
                  <Image
                    src="/scan-3.png"
                    alt="QuickShaw app booking"
                    fill
                    sizes="(max-width: 900px) 50vw, 25vw"
                  />
                </div>
                <div className={styles.scanPic}>
                  <Image
                    src="/scan-4.png"
                    alt="Happy rider onboarding"
                    fill
                    sizes="(max-width: 900px) 50vw, 25vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========= Ensuring Safety ========= */}
{/* ========= Ensuring Safety (same layout as Scan & Onboard) ========= */}
<section className={styles.scan}>
  <div className={styles.scanInner}>
    <h2 className={styles.scanTitle}>Ensuring Safety</h2>
    <hr className={styles.scanRule} />

    <div className={styles.scanGrid}>
      <div className={styles.scanText}>
        <p className={styles.scanLead}>
          Full-time access to nearest emergency contact facilities like Police stations,
          proctor office, ambulance, &amp; post-ride feedback for every driver.
        </p>

        <button className={styles.scanCta}>Know more</button>
      </div>

      <div className={styles.scanGallery}>
        <div className={styles.scanPic}>
          <Image
            src="/safety-1.png"
            alt="Emergency info signage"
            fill
            sizes="(max-width: 900px) 50vw, 25vw"
          />
        </div>
        <div className={styles.scanPic}>
          <Image
            src="/safety-2.png"
            alt="Driver list & hotline on phone"
            fill
            sizes="(max-width: 900px) 50vw, 25vw"
          />
        </div>
        <div className={styles.scanPic}>
          <Image
            src="/safety-3.png"
            alt="Report/feedback flow"
            fill
            sizes="(max-width: 900px) 50vw, 25vw"
          />
        </div>
        <div className={styles.scanPic}>
          <Image
            src="/safety-4.png"
            alt="Proctor/Police contact shortcuts"
            fill
            sizes="(max-width: 900px) 50vw, 25vw"
          />
        </div>
      </div>
    </div>
  </div>
</section>


        {/* ========= Driver Reliability ========= */}
        <section className={styles.reliability}>
          <div className={styles.reliabilityInner}>
            <h2 className={styles.reliabilityTitle}>Driver Reliability</h2>
            <hr className={styles.reliabilityRule} />

            <div className={styles.reliabilityGrid}>
              <div className={styles.reliabilityText}>
                <p className={styles.reliabilityLead}>
                  Ensuring responsible driver behavior and a smoother ride
                  experience by a solid driver feedback system for quality
                  checks and improvements.
                </p>
                <button className={styles.scanCta}>Know more</button>
              </div>

              <div
                className={`${styles.scanGallery} ${styles.reliabilityGallery}`}
              >
                <div className={styles.scanPic}>
                  <Image
                    src="/reliability-1.png"
                    alt="Happy driver thumbs up"
                    fill
                    sizes="(max-width: 900px) 50vw, 25vw"
                  />
                </div>
                <div className={styles.scanPic}>
                  <Image
                    src="/reliability-2.png"
                    alt="Low rating / issue flagged"
                    fill
                    sizes="(max-width: 900px) 50vw, 25vw"
                  />
                </div>
                <div className={styles.scanPic}>
                  <Image
                    src="/reliability-3.png"
                    alt="Reliability score screen"
                    fill
                    sizes="(max-width: 900px) 50vw, 25vw"
                  />
                </div>
                <div className={styles.scanPic}>
                  <Image
                    src="/reliability-4.png"
                    alt="Driver with passenger"
                    fill
                    sizes="(max-width: 900px) 50vw, 25vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        ===== Download the mobile-app =====
        {/* <section id="download" className={styles.download}> */}
          {/* <div className={styles.downloadInner}> */}
            {/* <h2 className={styles.downloadTitle}>Download the mobile-app</h2> */}
            {/* <hr className={styles.downloadRule} /> */}

            {/* <div className={styles.downloadGrid}> */}
              {/* Rider app */}
              {/* <a */}
                {/* className={styles.app} */}
                {/* href="#"
                aria-label="QuickShaw rider app"
              >
                <div className={styles.appIcon}>
                  <Image src="/download-rider.png" alt="" fill sizes="164px" />
                </div>
                <div className={styles.appLabel}>
                  <span>QuickShaw: 3-wheeler</span>
                  <span>ride booking</span>
                </div>
              </a> */}

              {/* <div className={styles.vRule} aria-hidden />

              {/* Driver app */}
              {/* <a
                className={styles.app}
                href="#"
                aria-label="QuickShaw driver app"
              >
                <div className={styles.appIcon}>
                  <Image src="/download-driver.png" alt="" fill sizes="164px" />
                </div>
                <div className={styles.appLabel}>
                  <span>QuickShaw: Driver</span>
                </div>  */}
              {/* </a>
            </div>
          </div>
        </section> */}

        <section className={styles.partOfUs} id="social">
          <div className={styles.partInner}>
            <h2 className={styles.partTitle}>Be a part of us!</h2>
            <hr className={styles.partRule} />

            <div className={styles.partContainer}>
              <article className={styles.partCard}>
                <h3 className={styles.cardTitle}>Whatsapp community</h3>
                <img
                  className={styles.cardIcon}
                  src="/wa-icon.png"
                  alt="WhatsApp logo"
                />
                <a
                  className={styles.cardButton}
                  href="https://chat.whatsapp.com/LZASDXueL0b0L7plUBIz3k"
                  target="_blank"
                  rel="noopener"
                >
                  Join group
                </a>
                <p className={styles.cardDescription}>
                  Have any product idea in your mind or want to be a part of the
                  product-building discussions.
                </p>
              </article>

              <article className={styles.partCard}>
                <h3 className={styles.cardTitle}>Instagram page</h3>
                <img
                  className={styles.cardIcon}
                  src="/ig-icon.png"
                  alt="Instagram logo"
                />
                <a
                  className={styles.cardButton}
                  href="https://www.instagram.com/quickshaw.co.in/"
                  target="_blank"
                  rel="noopener"
                >
                  Visit page
                </a>
                <p className={styles.cardDescription}>
                  Watch out the new feature releases and some of the cool reels
                  and content of QuickShaw.
                </p>
              </article>

              <article className={styles.partCard}>
                <h3 className={styles.cardTitle}>LinkedIn page</h3>
                <img
                  className={styles.cardIcon}
                  src="/li-icon.png"
                  alt="LinkedIn logo"
                />
                <a
                  className={styles.cardButton}
                  href="https://www.linkedin.com/company/quickshaw/"
                  target="_blank"
                  rel="noopener"
                >
                  Visit page
                </a>
                <p className={styles.cardDescription}>
                  Stay updated with the latest releases, offers and how others
                  review and use QuickShaw.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Got a query or complaint?
        <section className={styles.query} id="contact">
          <div className={styles.queryInner}>
            <h2 className={styles.queryTitle}>Got a query or complaint?</h2>

            <div className={styles.queryForm}>
              <textarea
                className={styles.queryBox}
                placeholder="Happy to listen to you..."
              />

              {/* Submit button first */}
              {/* <button type="submit" className={styles.queryBtn}>
                Submit
              </button> */}

              {/* Divider */}
              {/* <div className={styles.queryOr}>
                <span>or</span>
              </div> */}

              {/* Contact us button */}
              {/* <button type="button" className={styles.queryBtn}>
                Contact us
              </button>
            </div>
          </div> */}
        {/* </section> */} 

        {/* ========= Footer ========= */}
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
                <a href="#about" className={styles.footLink}>
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
                <Link href="/customer_terms" className={styles.footLink}>
                  Terms &amp; Conditions
                </Link>
                <Link href="/privacy-policy" className={styles.footLink}>
                  Privacy Policy
                </Link>
            </div>
          </div>
        </footer> */}
      </main>
    </>
  );
}
