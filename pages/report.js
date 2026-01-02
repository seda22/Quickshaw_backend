import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import styles from "@/styles/Report.module.css";
import home from "@/styles/Home.module.css"; // ← reuse the real header styles

// Firebase (client-only)
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

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

export default function ReportPage() {
  // form state
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [rideId, setRideId] = useState("");
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // ui state
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [showIntro, setShowIntro] = useState(true);

  const phoneOk = !phone || /^\+?[0-9]{7,15}$/.test(phone);
  const emailOk = !email || /.+@.+\..+/.test(email);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(id);
  }, [toast]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!category || !description) {
      setToast({
        type: "error",
        msg: "Category and description are required.",
      });
      return;
    }
    if (!phoneOk || !emailOk) {
      setToast({ type: "error", msg: "Please check phone/email format." });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        category,
        description,
        rideId: rideId || null,
        pickup: pickup || null,
        drop: drop || null,
        reporter: {
          name: name || null,
          phone: phone || null,
          email: email || null,
        },
        imageUrl: imageUrl || null,
        status: "open",
        createdAt: serverTimestamp(),
        client: {
          ua: typeof navigator !== "undefined" ? navigator.userAgent : null,
          tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      };
      await addDoc(collection(db, "problem_reports"), payload);
      setToast({
        type: "success",
        msg: "Report submitted. We’ll get back soon.",
      });
      setDescription("");
      setRideId("");
      setPickup("");
      setDrop("");
      setImageUrl("");
    } catch (err) {
      console.error(err);
      setToast({
        type: "error",
        msg: "Couldn’t submit. Try again in a moment.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function handleRaise() {
    setShowIntro(false);
    const el = document.getElementById("reportForm");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <Head>
        <title>Report a Problem • QuickShaw</title>
        <meta
          name="description"
          content="Tell us what went wrong so we can fix it fast."
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </Head>

      {/* Topbar — use Home styles to keep it identical */}
      <div className={home.topbar}>
        <div className={home.topbarInner}>
          <Link href="/" className={home.brand}>
            <Image
              src="/quickshaw-logo.png"
              alt="QuickShaw"
              height={36}
              width={160}
              priority
            />
          </Link>

          <nav className={home.menu}>
            <Link href="/" className={home.link}>
              Home
            </Link>
            <Link href="/offerings" className={home.link}>
              Offerings
            </Link>
            <Link href="/#social" className={home.link}>
              Social
            </Link>
            <Link href="/report" className={home.link}>
              Report a problem
            </Link>
          </nav>
          <div aria-hidden />
        </div>
      </div>

      {/* Intro Hero Block */}
      {showIntro && (
        <section className={styles.introWrap}>
          <div className={styles.introInner}>
            <h1 className={styles.introH1}>A safe mobility platform is here</h1>
            <button className={styles.introBtn} onClick={handleRaise}>
              Raise a complaint
            </button>
          </div>
          <div className={styles.pitchInner}>
            <h2 className={styles.pitchH1}>YOUR SAFETY IS OUR PRIORITY</h2>
            <p className={styles.pitchSub}>
              One-tap alert to trusted contacts & QuickShaw team. verified
              drivers for every ride. live trip tracking from start to finish.
              instant support, always on standby.
            </p>
            <div className={styles.pitchRow}>
              <span className={styles.pitchLead}>Ensuring Safety,</span>
              <span className={styles.pitchHow}> HOW IT WORKS</span>
            </div>
            <svg
              className={styles.pitchChevron}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M6 9l6 6 6-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </section>
      )} 
        {/* safety section  */}
          
          <section className={styles.safetyWrap}>
  <div className={styles.safetyBlock}>
    <div className={styles.safetyText}>
      <h2 className={styles.safetyH2}>
        <span className={styles.block}>Top safe</span>
        <span className={styles.block}>now</span>
        </h2>
      <div className={styles.safetyTextDiv}>
      <p className={styles.safetyP}>
        Your ride comes with more than just wheels. It comes with trust in
        verified drivers,care built into every details,care built into every detail, &
        a constant watch over your journey to ensure your safety.
      </p>
</div>
    </div>
    <div className={styles.safetyImg}>
      <Image
        src="/safety-app.png"
        alt="QuickShaw app safety screen"
        width={300}
        height={100}
      />
    </div>
  </div>
  {/* <div className={styles.safetyBg}>
    <Image 
    src="/safetybg.png"
    alt="Quickshaw app safety screen"
    fill
    style={{objectFit:"cover"}}
    />
  </div> */}
</section>

  <section className={styles.safetyWrap}>
  <div className={styles.safetyBlock}>
    <div className={styles.safetyText}>
      <h2 className={styles.safetyH2}>
       <span className={styles.block}>share</span>
       <span className={styles.block}>your ride</span>
        </h2>
      <div className={styles.safetyTextDiv}>
      <p className={styles.safetyP}>
        Before your ride begins, your peace of mind is set, share your trip
        instantly, let loved ones track your journey, and travel knowing someone
        always has an eye out for you.
      </p>
      </div>
    </div>
    <div className={styles.safetyImg}>
      <Image
        src="/share-ride.png"
        alt="QuickShaw trusted driver"
        width={460}
        height={360}
      />
    </div>
  </div>

</section>

      <section className={styles.safetyWrap}>
  <div className={styles.safetyBlock}>
    <div className={styles.safetyText}>
      <h2 className={styles.safetyH2}>
       <span className={styles.block}>trusted</span>
       <span className={styles.block}>drivers</span>
        </h2>
      <div className={styles.safetyTextDiv}>
      <p className={styles.safetyP}>
        Before your ride arrives, your safety is already taken care of,
        with verified profiles, live monitoring, & safeguards built to keep
        every journey worry free.
      </p>
      </div>
    </div>
    <div className={styles.safetyImg}>
      <Image
        src="/trusted-driver.png"
        alt="QuickShaw trusted driver"
        width={460}
        height={360}
      />
    </div>
  </div>
</section>



      {toast && (
        <div
          className={`${styles.toast} ${
            toast.type === "error" ? styles.toastErr : styles.toastOk
          }`}
        >
          {toast.msg}
        </div>
      )}
           
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
          </div>
        </footer> */}
    </>
  );
}
