// pages/flight_confirm.js
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

// Reuse topbar styles from Home
import topbar from "@/styles/Home.module.css";
// Page-specific styles
import styles from "@/styles/FlightConfirm.module.css";

/* ---------- Firebase (client) ---------- */
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBJhxil7RsyubTwCBIctYsoLDgpMXikTM8",
  authDomain: "quickshaw-e3d95.firebaseapp.com",
  projectId: "quickshaw-e3d95",
  storageBucket: "quickshaw-e3d95.firebasestorage.app",
  messagingSenderId: "1042700258885",
  appId: "1:1042700258885:web:6b88a78aead1a567039d2c",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function FlightConfirm() {
  const router = useRouter();
  const { id: queryId } = router.query || {};

  const [state, setState] = useState("loading"); // 'loading' | 'ok' | 'missing-id' | 'not-found'
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    // get id from query first, else from sessionStorage as a fallback
    let id = (typeof queryId === "string" && queryId) || "";
    if (!id && typeof window !== "undefined") {
      id = sessionStorage.getItem("lastBookingId") || "";
    }
    if (!id) {
      setState("missing-id");
      return;
    }

    (async () => {
      try {
        const snap = await getDoc(doc(db, "flight_bookings", id));
        if (!snap.exists()) {
          setState("not-found");
          return;
        }
        setBooking(snap.data());
        setState("ok");
      } catch (e) {
        console.error("Failed to fetch booking:", e);
        setState("not-found");
      }
    })();
  }, [queryId]);

  return (
    <>
      <Head>
        <title>Booking confirmed • QuickShaw</title>
        <meta name="description" content="Your QuickShaw airport cab is booked." />
      </Head>

      {/* Topbar (same as Home) */}
      <div className={topbar.topbar}>
        <div className={topbar.topbarInner}>
          <Link className={topbar.brand} href="/" aria-label="QuickShaw home">
            <Image
              src="/quickshaw-logo.png"
              alt="QuickShaw"
              height={36}
              width={160}
              priority
            />
          </Link>

          <nav className={topbar.menu}>
            <Link href="/" className={topbar.link}>Home</Link>
            <Link href="/offerings" className={topbar.link}>Offerings</Link>
            <a href="/#social" className={topbar.link}>Social</a>
          </nav>

          <div aria-hidden />
        </div>
      </div>

      {/* Hero with bg1.png */}
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>Booking Confirmation</h1>
          <p className={styles.heroSub}>Your airport ride is set. Safe travels!</p>
        </div>
      </header>

      <main className={styles.bg}>
        <section className={styles.shell}>
          {state === "loading" && (
            <div className={styles.loading}>Fetching your booking…</div>
          )}

          {state === "missing-id" && (
            <div className={styles.card}>
              <h2 className={styles.title}>No booking to show</h2>
              <p className={styles.lead}>
                We couldn’t find a booking ID in the link. Please start over.
              </p>
              <div className={styles.actions}>
                <Link href="/" className={styles.primary}>Go to Home</Link>
              </div>
            </div>
          )}

          {state === "not-found" && (
            <div className={styles.card}>
              <h2 className={styles.title}>Booking not found</h2>
              <p className={styles.lead}>
                The booking link seems invalid or has expired.
              </p>
              <div className={styles.actions}>
                <Link href="/" className={styles.primary}>Go to Home</Link>
              </div>
            </div>
          )}

          {state === "ok" && (
            <div className={styles.card}>
              <h2 className={styles.title}>
                Thank you{booking?.userName ? `, ${booking.userName}` : ""}!
              </h2>
              <p className={styles.lead}>
                Your ride from Varanasi Airport has been successfully booked.
              </p>

              <div className={styles.summary}>
                <div className={styles.row}>
                  <span>From</span>
                  <strong>{booking?.departure || "—"}</strong>
                </div>
                <div className={styles.row}>
                  <span>To</span>
                  <strong>{booking?.arrival || "Varanasi (VNS)"}</strong>
                </div>
                <div className={styles.row}>
                  <span>Arrival date</span>
                  <strong>{booking?.arrivalDate || "—"}</strong>
                </div>
                <div className={styles.row}>
                  <span>Arrival time</span>
                  <strong>{booking?.arrivalTime || "—"}</strong>
                </div>
                <div className={styles.row}>
                  <span>Flight</span>
                  <strong>{booking?.flightNumber || "—"}</strong>
                </div>

                {booking?.friends ? (
                  <>
                    <div className={styles.hr} />
                    <div className={styles.row}>
                      <span>Friends</span>
                      <strong>Yes</strong>
                    </div>
                    {booking?.friend1 && (
                      <div className={styles.subrow}>
                        <span>• {booking.friend1.name}</span>
                        <span>{booking.friend1.phone}</span>
                      </div>
                    )}
                    {booking?.friend2 && (
                      <div className={styles.subrow}>
                        <span>• {booking.friend2.name}</span>
                        <span>{booking.friend2.phone}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className={styles.hr} />
                    <div className={styles.row}>
                      <span>Friends</span>
                      <strong>No</strong>
                    </div>
                  </>
                )}
              </div>

              <div className={styles.actions}>
                <Link href="/" className={styles.primary}>Go to Home</Link>
                <a
                  className={styles.ghost}
                  href="https://chat.whatsapp.com/LZASDXueL0b0L7plUBIz3k"
                  target="_blank"
                  rel="noopener"
                >
                  Join WhatsApp
                </a>
              </div>

              <div className={styles.note}>
                You’ll receive a WhatsApp confirmation shortly with all the details.
              </div>
              <div className={styles.note}>
                Your fare, along with co-passenger and driver details, will be shared with you 3 hours before your arrival.
              </div>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
