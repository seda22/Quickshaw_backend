import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

// Topbar styles (unchanged)
import topbar from "@/styles/Home.module.css";
// Page-specific styles
import styles from "@/styles/Login.module.css";

// ---------- Firebase ----------
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  fetchSignInMethodsForEmail,
  signOut, // <-- ADDED
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBJhxil7RsyubTwCBIctYsoLDgpMXikTM8",
  authDomain: "quickshaw-e3d95.firebaseapp.com",
  projectId: "quickshaw-e3d95",
  storageBucket: "quickshaw-e3d95.firebasestorage.app",
  messagingSenderId: "1042700258885",
  appId: "1:1042700258885:web:6b88a78aead1a567039d2c",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// ---------- Helpers ----------
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const onlyDigits = (s = "") => s.replace(/\D+/g, "");
const normalizePhone = (raw) => {
  const d = onlyDigits(raw);
  if (d.length === 10) return `+91${d}`;
  if (d.startsWith("91") && d.length === 12) return `+${d}`;
  if (raw.trim().startsWith("+")) return `+${onlyDigits(raw)}`;
  return null;
};

// NEW: IIT-BHU branch/year inference (ported from your Flutter code)
function inferIITBHUFromEmail(email = "") {
  const out = { iitbhu_student: false, branch: undefined, year: undefined };
  if (!email) return out;

  const [, domainRaw = ""] = email.split("@");
  const domain = domainRaw.toLowerCase();
  if (domain !== "iitbhu.ac.in" && domain !== "itbhu.ac.in") return out;

  const local = email.split("@")[0] || "";
  const suffix = (local.split(".").pop() || "").toLowerCase(); // e.g., mec22
  const branchCode = suffix.replace(/\d+/g, "");               // mec
  const yy = parseInt(suffix.replace(/\D+/g, ""), 10) || 0;    // 22

  const branchMap = {
    cse: "Computer Science Engineering Department",
    mst: "Material Sciences Department",
    cer: "Ceramic Engineering Department",
    chy: "Chemistry Department",
    civ: "Civil Engineering Department",
    che: "Chemical Engineering Department",
    eee: "Electrical Engineering Department",
    ece: "Electronics Engineering Department",
    app: "Physics Department",
    mat: "Mathematical Sciences Department",
    mec: "Mechanical Engineering Department",
    met: "Metallurgical Engineering Department",
    bce: "School of Biochemical Engineering",
    min: "Mining Engineering Department",
    phe: "Pharmaceutical Engineering Department",
    apd: "Architecture, Planning and Design",
    bme: "School of Biomedical Engineering",
  };

  const branchFull = branchMap[branchCode] || branchCode || undefined;
  const admitYear = yy ? 2000 + yy : undefined;
  const now = new Date();
  const studyYear =
    admitYear && now.getFullYear() >= admitYear
      ? now.getFullYear() - admitYear + 1
      : undefined;

  return {
    iitbhu_student: true,
    branch: branchFull,
    year: studyYear,
  };
}

async function signInOrCreateWithEmail(auth, email, password) {
  const methods = await fetchSignInMethodsForEmail(auth, email);

  if (methods.includes("password")) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  if (methods.length === 0) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  const err = new Error("This email is registered with a different sign-in method.");
  err.code = "auth/account-exists-with-different-credential";
  err.methods = methods;
  throw err;
}

export default function Login() {
  const router = useRouter();

  // form state (step 1)
  const [identifier, setIdentifier] = useState("");
  const [flow, setFlow] = useState(null); // "email" | "phone"
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // onboarding steps (2 & 3)
  const [step, setStep] = useState(1); // 1=login, 2=confirm details, 3=accept terms
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [mobile, setMobile] = useState("");
  const [agree, setAgree] = useState(false);

  // Recaptcha ref
  const recaptchaRef = useRef(null);
  const confirmationRef = useRef(null);

  // === Helper: logout and return to login page (Step 1) ===
  const logoutToLogin = async () => {
    try {
      setLoading(true);
      await signOut(auth);
    } catch {}
    // reset all local state
    try {
      recaptchaRef.current?.clear?.();
    } catch {}
    recaptchaRef.current = null;
    confirmationRef.current = null;

    setIdentifier("");
    setPassword("");
    setOtp("");
    setOtpSent(false);
    setFlow(null);
    setErr("");
    setFirst("");
    setLast("");
    setMobile("");
    setAgree(false);
    setStep(1);

    // stay on this page but ensure URL is /login (or current), without adding a new history entry
    try {
      router.replace("/login");
    } catch {}
    setLoading(false);
  };

  // If already logged in -> start onboarding (no redirect)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u && step === 1) {
        const display = u.displayName || "";
        const parts = display.split(" ");
        setFirst((prev) => prev || parts[0] || "");
        setLast((prev) => prev || parts.slice(1).join(" ") || "");
        setMobile((prev) => prev || u.phoneNumber || "");
        setStep(2);
      }
    });
    return unsub;
  }, [step]);

  // Identify flow by input
  useEffect(() => {
    setErr("");
    setFlow(
      identifier && emailRegex.test(identifier.trim())
        ? "email"
        : normalizePhone(identifier)
        ? "phone"
        : null
    );
  }, [identifier]);

  const ensureRecaptcha = async () => {
    if (recaptchaRef.current) return recaptchaRef.current;
    return new Promise((resolve) => {
      recaptchaRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {},
      });
      resolve(recaptchaRef.current);
    });
  };

  // === Handle browser Back while on step 2 or 3: logout & go to login ===
  useEffect(() => {
    if (step === 2 || step === 3) {
      // push a state so that the next Back triggers a popstate here
      try {
        window.history.pushState({ qs: "onboard" }, "", window.location.href);
      } catch {}
      const onPop = async () => {
        await logoutToLogin();
      };
      window.addEventListener("popstate", onPop);
      return () => window.removeEventListener("popstate", onPop);
    }
  }, [step]); // re-run when entering/leaving step 2/3

  // Step 1: continue
  const onContinue = async (e) => {
    e.preventDefault();
    setErr("");
    if (loading) return;

    try {
      if (flow === "email") {
        if (!password) {
          setErr("Please enter your password.");
          return;
        }
        setLoading(true);
        const email = identifier.trim().toLowerCase();

        try {
          // 1) Try SIGN IN first
          await signInWithEmailAndPassword(auth, email, password);
          setStep(2);
        } catch (e1) {
          const code1 = (e1 && e1.code) || "";

          if (code1 === "auth/too-many-requests") {
            setErr("Too many attempts. Please wait a minute and try again.");
          } else {
            // 2) On any other failure (including invalid-credential under enumeration protection),
            //    attempt CREATE. If it already exists, we'll get email-already-in-use and inform user.
            try {
              await createUserWithEmailAndPassword(auth, email, password);
              setStep(2);
            } catch (e2) {
              const code2 = (e2 && e2.code) || "";
              if (code2 === "auth/email-already-in-use") {
                setErr(
                  "This email is already registered. If you created the account with Google, use 'Continue with Google'. Otherwise check your password and try again."
                );
              } else {
                setErr((e2 && e2.message) || "Could not create account. Please try again.");
              }
            }
          }
        } finally {
          setLoading(false);
        }
      } else if (flow === "phone") {
        const phone = normalizePhone(identifier);
        if (!phone) {
          setErr("Please enter a valid mobile number.");
          return;
        }
        setLoading(true);
        const verifier = await ensureRecaptcha();
        const confirmation = await signInWithPhoneNumber(auth, phone, verifier);
        confirmationRef.current = confirmation;
        setOtpSent(true);
      } else {
        setErr("Enter a valid email or mobile to continue.");
      }
    } catch (error) {
      setErr(error?.message || "Something went wrong. Try again.");
      try {
        recaptchaRef.current?.clear();
        recaptchaRef.current = null;
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  // Step 1: verify OTP
  const onVerifyOtp = async (e) => {
    e.preventDefault();
    setErr("");
    if (loading) return;
    if (!otp || otp.trim().length < 4) {
      setErr("Enter the 6-digit OTP.");
      return;
    }
    try {
      setLoading(true);
      await confirmationRef.current.confirm(otp.trim());
      setStep(2);
    } catch (error) {
      setErr(error?.message || "Invalid OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Google
  const onGoogle = async () => {
    setErr("");
    if (loading) return;
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      setStep(2);
    } catch (error) {
      setErr(error?.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2 -> 3
  const onDetailsNext = () => {
    const user = auth.currentUser;
    const usingPhone = !!user?.phoneNumber || flow === "phone";
    const usingEmail = !!user?.email || flow === "email";

    if (usingPhone && (!first.trim() || !last.trim())) {
      setErr("Please enter your first and last name.");
      return;
    }

    if (usingEmail) {
      const norm = normalizePhone(mobile);
      if (!norm) {
        setErr("Please enter a valid mobile number.");
        return;
      }
      setMobile(norm);
    }

    setErr("");
    setStep(3);
  };

  // Step 3: write Firestore with IIT-BHU meta
  const onAcceptNext = async () => {
    if (!agree) return;
    const user = auth.currentUser;
    if (!user) return;

    const name = `${first} ${last}`.trim() || user.displayName || "";
    const email = user.email || "";
    const phone = mobile || user.phoneNumber || "";

    // infer IIT-BHU meta from email
    const { iitbhu_student, branch, year } = inferIITBHUFromEmail(email);

    const payload = {
      userId: user.uid,
      name,
      email,
      phone,
      totalRides: 0,
      accountCreatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      iitbhu_student,
      ...(iitbhu_student ? { branch, year } : {}),
    };

    await setDoc(doc(db, "customers", user.uid), payload, { merge: true });
    router.replace("/");
  };

  return (
    <>
      <Head>
        <title>Login • QuickShaw</title>
        <meta name="description" content="Login to QuickShaw" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover, shrink-to-fit=no"
        />
      </Head>

      {/* ---- Topbar (exactly same as home) ---- */}
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
            <Link href="/" className={topbar.link}>
              Home
            </Link>
            <Link href="/offerings" className={topbar.link}>
              Offerings
            </Link>
            {/* FIX: internal page link uses <Link> */}
            <Link href="/#social" className={topbar.link}>
              Social
            </Link>
            {/* <Link href="/report" className={topbar.link}>
              Report a problem
            </Link> */}
          </nav>

          <div aria-hidden />
        </div>
      </div>

      {/* ---- Page body with bg1.png ---- */}
      <main className={styles.bg}>
        <section className={styles.shell}>
          {step === 1 && (
            <>
              <h1 className={styles.title}>
                May we know more
                <br />
                about you?
              </h1>

              <form className={styles.stack} onSubmit={onContinue}>
                <input
                  className={`${styles.input} ${styles.identifierInput}`}
                  type="email"
                  placeholder="Enter your email"
                  aria-label="Email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={loading}
                />

                <input
                  className={styles.input}
                  type="password"
                  placeholder="Enter your password"
                  aria-label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />

                <button
                  className={styles.primary}
                  type="submit"
                  disabled={loading}
                >
                  Continue
                </button>

                <div className={styles.or}>
                  <span>or</span>
                </div>

                <button
                  className={styles.google}
                  type="button"
                  onClick={onGoogle}
                  disabled={loading}
                >
                  <span className={styles.gicon} aria-hidden="true">
                    <Image src="/google.png" alt="" width={24} height={24} />
                  </span>
                  Continue with Google
                </button>

                {err && <p className={styles.err}>{err}</p>}

                <p className={styles.consent}>
                  <span className={styles.consIcon} aria-hidden="true">i</span>
                  By continuing you agree for calls, IVR, Whatsapp, texts from Quickshaw.
                </p>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className={styles.title}>Confirm your details</h2>
              <div className={styles.step}>
                {/* <h2 className={styles.subtitle}>Confirm your details</h2> */}

                <div className={styles.row}>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="First name"
                    value={first}
                    onChange={(e) => setFirst(e.target.value)}
                  />
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="Last name"
                    value={last}
                    onChange={(e) => setLast(e.target.value)}
                  />
                </div>

                <div className={styles.row}>
                  <select className={styles.ccode}>
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                  </select>
                  <input
                    className={styles.input}
                    type="tel"
                    placeholder="Enter your mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                  />
                </div>

                <div className={styles.actions}>
                  <button
                    className={styles.back}
                    type="button"
                    onClick={logoutToLogin} // <-- CHANGED: Back now logs out and returns to login
                  >
                    ← Back
                  </button>
                  <button
                    className={styles.primary}
                    type="button"
                    onClick={onDetailsNext}
                  >
                    Next →
                  </button>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <div className={styles.step3}>
              <h2 className={styles.step3Title}>
                Accept QuickShaw’s Terms
                <br />& review Privacy conditions
              </h2>

              <p className={styles.step3Desc}>
                By selecting ‘I Agree’ below, I agree that I have reviewed & agreed to the
                Terms & Conditions and acknowledged the Privacy Notice. I am at least 18
                years of age.
              </p>

              <div className={styles.step3Divider} aria-hidden="true" />

              <div className={styles.agreeRow}>
                <span>I agree</span>
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  aria-label="I agree to the Terms & Privacy"
                />
              </div>

              <div className={styles.actionsRow}>
                <button
                  type="button"
                  className={styles.backIcon}
                  onClick={() => setStep(2)}
                  aria-label="Back"
                >
                  ←
                </button>

                <button
                  type="button"
                  className={`${styles.primary} ${styles.nextWide}`}
                  disabled={!agree}
                  onClick={async () => {
                    await onAcceptNext();      // run Firestore write
                    router.replace("/flight"); // then redirect to /flight
                  }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Invisible reCAPTCHA root (required for phone OTP) */}
        <div id="recaptcha-container" />
      </main>
    </>
  );
}
