import { useEffect, useState, useMemo } from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "@/styles/Offerings.module.css";
import Link from "next/link";

/** Coded slide (#2): “Go Everywhere” (o2) */
function GoEverywhereSlide() {
  const [active, setActive] = useState(1);

  const chipSet1 = [
    { key: 1, icon: "/icon1.png", label: "Departments" },
    { key: 2, icon: "/icon2.png", label: "Lecture Theatre" },
    { key: 3, icon: "/icon3.png", label: "Labs" },
    { key: 4, icon: "/icon4.png", label: "Hostels" },
    { key: 5, icon: "/icon5.png", label: "Public locations" },
    { key: 6, icon: "/icon6.png", label: "Workshops" },
  ];

  const chipSet2 = [
    { icon: "/icon7.png", label: "Lanka" },
    { icon: "/icon8.png", label: "Railway station" },
    { icon: "/icon9.png", label: "KVT" },
  ];

  return (
    <div className={styles.o2Stage}>
      <div className={styles.o2MapWrap} aria-hidden="true">
        <Image
          src={`/map-${active}.png`}
          alt=""
          fill
          priority
          sizes="(max-width: 960px) 90vw, 960px"
          className={styles.o2Map}
        />
        <div className={styles.o2Fade} />
      </div>

      <div className={styles.o2Content}>
        <h2 className={styles.o2H}>Go Everywhere</h2>
        <p className={styles.o2Sub}>
          Travel across 350+ locations in IIT BHU and some of the key hotspots
          in Varanasi.
        </p>

        <h3 className={styles.o2GroupTitle}>IIT BHU searches include:</h3>
        <div className={styles.o2Chips}>
          {chipSet1.map((c) => (
            <button
              key={c.key}
              type="button"
              className={`${styles.o2Chip} ${
                active === c.key ? styles.o2ChipActive : ""
              }`}
              onClick={() => setActive(c.key)}
              aria-pressed={active === c.key}
            >
              <Image
                src={c.icon}
                alt=""
                width={22}
                height={22}
                className={styles.o2ChipIcon}
              />
              <span>{c.label}</span>
            </button>
          ))}
        </div>

        <h3 className={styles.o2GroupTitle}>Varanasi searches include:</h3>
        <div className={styles.o2Chips}>
          {chipSet2.map((c, i) => (
            <button key={i} type="button" className={styles.o2Chip}>
              <Image
                src={c.icon}
                alt=""
                width={22}
                height={22}
                className={styles.o2ChipIcon}
              />
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Coded slide (#5): “Travel with people” */
// RideShareSlide.jsx (inside your Offerings page file)
function RideShareSlide({ pax, setPax, mode, setMode, min = 1, max = 5 }) {
  const saved = Math.max(0, pax - 1) * 65;
  const msg =
    pax <= 1
      ? "Add 1 more passenger to save 65 gm carbon emissions"
      : `You just saved ${saved} gm carbon emissions`;

  const dec = () => setPax((p) => Math.max(min, p - 1));
  const inc = () => setPax((p) => Math.min(max, p + 1));

  return (
    <div className={styles.o5Card}>
      <div className={styles.o5Grid}>
        {/* Art panel with real image */}
        <div className={styles.o5Art} aria-hidden="true">
          <Image
            src="/o5photo.png"
            alt=""
            fill
            sizes="(max-width: 980px) 90vw, 560px"
            className={styles.o5ArtImg}
            draggable={false}
            priority={false}
          />
        </div>

        {/* Right content */}
        <div className={styles.o5Right}>
          <h2 className={styles.o5Title}>Travel with people</h2>

          <div className={styles.o5Modes} role="tablist" aria-label="Vehicle type">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "e-auto"}
              className={`${styles.o5Pill} ${mode === "e-auto" ? styles.o5PillActive : ""}`}
              onClick={() => setMode("e-auto")}
            >
              <span className={styles.o5Emoji} aria-hidden>🛺</span> E-Auto
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "rickshaw"}
              className={`${styles.o5Pill} ${mode === "rickshaw" ? styles.o5PillActive : ""}`}
              onClick={() => setMode("rickshaw")}
            >
              <span className={styles.o5Emoji} aria-hidden>🛺</span> Rickshaw
            </button>
          </div>

          <div className={styles.o5Counter} role="group" aria-label="Passengers">
            <button
              type="button"
              className={styles.o5Btn}
              aria-label="Decrease passengers"
              onClick={dec}
              disabled={pax <= min}
            >
              –
            </button>

            <div className={styles.o5PersonWrap} aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.761 0 5-2.462 5-5.5S14.761 1 12 1 7 3.462 7 6.5 9.239 12 12 12zm0 2c-4.418 0-8 2.91-8 6.5V23h16v-2.5c0-3.59-3.582-6.5-8-6.5z" />
              </svg>
              <div className={styles.o5Count} aria-live="polite">{pax}</div>
            </div>

            <button
              type="button"
              className={styles.o5Btn}
              aria-label="Increase passengers"
              onClick={inc}
              disabled={pax >= max}
            >
              +
            </button>
          </div>

          <p className={styles.o5Msg}>{msg}</p>
          <p className={styles.o5Copy}>
            Travelling together with people helps save money as well as earth. You help
            reduce 65 grams carbon emissions by sharing your ride with someone.
          </p>
        </div>
      </div>
    </div>
  );
}


export default function Offerings() {
  const handleBookRide = () => {
    window.location.href = "/";
  };

  // ⬇️ Memoized so effects that depend on `slides` don't see a new ref each render
  const slides = useMemo(
    () => [
      { type: "image", src: "/o1.png" },
      { type: "component", key: "o2" },
      { type: "image", src: "/o3.png" },
      // { type: "image", src: "/o4.png" },
      { type: "image", src: "/o5.png" },
      { type: "image", src: "/o6.png" },
      { type: "component", key: "" },
    ],
    []
  );

  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [pax, setPax] = useState(1);
  const [mode, setMode] = useState("e-auto");
  const [dims, setDims] = useState({});

  useEffect(() => {
    let alive = true;
    const tasks = slides.map((s, i) => {
      if (s.type !== "image") return Promise.resolve();
      return new Promise((res) => {
        const img = new window.Image();
        img.onload = () =>
          res({ i, w: img.naturalWidth || 1920, h: img.naturalHeight || 1080 });
        img.onerror = () => res({ i, w: 1920, h: 1080 });
        img.src = s.src;
      });
    });
    Promise.all(tasks).then((arr) => {
      if (!alive) return;
      const map = {};
      arr.forEach((r) => {
        if (r) map[r.i] = { w: r.w, h: r.h };
      });
      setDims(map);
    });
    return () => {
      alive = false;
    };
  }, [slides]);

  // Auto-jump if hash is present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash.startsWith("#offering-")) {
        const num = parseInt(hash.replace("#offering-", ""), 10) - 1;
        if (!isNaN(num)) setSlide(num);
      }
    }
  }, []);

  useEffect(() => {
    const prefersReduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (paused || prefersReduced) return;
    const id = setInterval(
      () => setSlide((s) => (s + 1) % slides.length),
      4500
    );
    return () => clearInterval(id);
  }, [paused, slides.length]);

  return (
    <>
      <Head>
        <title>QuickShaw — Offerings</title>
        <meta name="description" content="What we offer at QuickShaw." />
      </Head>

      {/* Topbar */}
      <div className={styles.topbar}>
        <div className={styles.topbarInner}>
          <a className={styles.brand} href="/">
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
            <Link
              href="/offerings"
              className={`${styles.link} ${styles.linkActive}`}
            >
              Offerings
            </Link>
            <Link href="/#social" className={styles.link}>
              Social
            </Link>
            {/* <Link href="/report" className={styles.link}>
              Report a problem
            </Link> */}
          </nav>
        </div>
      </div>

      {/* Slider */}
      <section className={styles.sliderWrap} aria-label="Offerings gallery">
        <div
          className={styles.sliderViewport}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label="Offerings images"
        >
          <div
            className={styles.sliderStrip}
            style={{ transform: `translateX(-${slide * 100}%)` }}
            aria-live="polite"
          >
            {slides.map((s, i) => (
              <div
                id={`offering-${i + 1}`} // 🔗 anchor target
                className={styles.slide}
                key={i}
                aria-hidden={i !== slide}
              >
                {s.type === "image" ? (
                  <Image
                    src={s.src}
                    alt={`Offering ${i + 1}`}
                    width={dims[i]?.w || 1920}
                    height={dims[i]?.h || 1080}
                    sizes="(max-width: 960px) 90vw, 960px"
                    priority={i === 0}
                    draggable={false}
                    className={styles.slideImg}
                  />
                ) : s.key === "o2" ? (
                  <GoEverywhereSlide />
                ) : (
                  <RideShareSlide
                    pax={pax}
                    setPax={setPax}
                    mode={mode}
                    setMode={setMode}
                  />
                )}
              </div>
            ))}
          </div>

          <button
            className={`${styles.arrow} ${styles.arrowLeft}`}
            onClick={() =>
              setSlide((s) => (s - 1 + slides.length) % slides.length)
            }
            aria-label="Previous slide"
            type="button"
          >
            ‹
          </button>
          <button
            className={`${styles.arrow} ${styles.arrowRight}`}
            onClick={() => setSlide((s) => (s + 1) % slides.length)}
            aria-label="Next slide"
            type="button"
          >
            ›
          </button>
        </div>

        <div className={styles.dots} role="tablist" aria-label="Choose slide">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === slide ? styles.dotActive : ""}`}
              onClick={() => setSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-selected={i === slide}
              role="tab"
              type="button"
            />
          ))}
        </div>

        <div className={styles.globalCtaWrap}>
          <button onClick={handleBookRide} className={styles.globalCtaBtn}>
            Book ride now
          </button>
        </div>
      </section>
    </>
  );
}
