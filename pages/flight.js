'use client';
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import LocationSearch from "./loaction-search";
import MapRoute, { useMapRouteLoader } from "./map-route";

import topbar from "@/styles/Home.module.css";
import styles from "@/styles/Flight.module.css";
import form from "@/styles/Login.module.css";

/* ---------- Firebase (client) ---------- */
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  getDoc,
  doc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

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
const auth = getAuth(app);

const FIXED_ORIGIN_A = { lat: 25.45137243749382, lng: 82.85595669655542 };

/* Helper: read a human label from an object */
function extractPlaceName(obj) {
  if (!obj || typeof obj !== "object") return null;
  return (
    obj.place ??
    obj.name ??
    obj.label ??
    obj.description ??
    obj.address ??
    obj.text ??
    obj.formatted ??
    obj.value ??
    null
  );
}

export default function FlightDetails() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({
    uid: "",
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUserInfo({
          uid: u.uid || "",
          name: u.displayName || "",
          email: u.email || "",
          phone: u.phoneNumber || "",
        });
        setAuthLoading(false);
      } else {
        const next = encodeURIComponent(router.asPath || "/flight");
        router.replace(`/login?next=${next}`);
      }
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Head>
        <title>Flight details • QuickShaw</title>
        <meta name="description" content="Tell us your flight details" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>

      <div className={topbar.topbar}>
        <div className={topbar.topbarInner}>
          <Link className={topbar.brand} href="/" aria-label="QuickShaw home">
            <Image src="/quickshaw-logo.png" alt="QuickShaw" height={36} width={160} priority />
          </Link>
          <nav className={topbar.menu}>
            <Link href="/" className={topbar.link}>Home</Link>
            <Link href="/offerings" className={topbar.link}>Offerings</Link>
            <a href="/#social" className={topbar.link}>Social</a>
          </nav>
          <div aria-hidden />
        </div>
      </div>

      {authLoading ? (
        <main className={styles.bg}>
          <section className={styles.shell}><div style={{ height: 120 }} /></section>
        </main>
      ) : (
        <FlightForm userInfo={userInfo} />
      )}
    </>
  );
}

/* =========================
   Child component
   ========================= */
function FlightForm({ userInfo }) {
  const router = useRouter();
  const { isLoaded, loadError } = useMapRouteLoader();

  // Airports
  const [airports, setAirports] = useState([]);
  const [loadingAirports, setLoadingAirports] = useState(true);

  // Map / route state
  const [destination, setDestination] = useState(null); // {lat, lng}
  const [route, setRoute] = useState(null);
  const [summary, setSummary] = useState("");

  // Visible place strings (no geocode)
  const [placeName, setPlaceName] = useState("");
  const [f1Place, setF1Place] = useState("");
  const [f2Place, setF2Place] = useState("");

  // Friends waypoints (coords only)
  const [friend1Coords, setFriend1Coords] = useState(null);
  const [friend2Coords, setFriend2Coords] = useState(null);

  const [f1AddressChoice, setF1AddressChoice] = useState("Same as mine");
  const [f2AddressChoice, setF2AddressChoice] = useState("Same as mine");

  const [screen, setScreen] = useState(true);
  const [journeyType, setJourneyType] = useState(null);

  const allDestinations = useMemo(() => {
    const d = [];
    if (destination) d.push(destination);
    if (f1AddressChoice === "Select other" && friend1Coords) d.push(friend1Coords);
    if (f2AddressChoice === "Select other" && friend2Coords) d.push(friend2Coords);
    return d;
  }, [destination, friend1Coords, friend2Coords, f1AddressChoice, f2AddressChoice]);

  // Route calculation
  useEffect(() => {
    if (!isLoaded || !destination?.lat || !destination?.lng || typeof window.google === "undefined") {
      setRoute(null);
      setSummary("");
      return;
    }
    let origin;
    let finalDestination;
    let stopsForWaypoints = allDestinations;

    if (!journeyType) { // Scenario 1:  Other -> Airport (Varanasi is destination)
      origin = FIXED_ORIGIN_A;
      finalDestination = allDestinations[allDestinations.length - 1];
      stopsForWaypoints = allDestinations.slice(0, -1);
    } else { // Scenario 2: Airport -> Other (Varanasi is origin)
      origin = allDestinations[0];
      finalDestination = FIXED_ORIGIN_A;
      stopsForWaypoints = allDestinations.slice(1);
    }

    if (!origin || !finalDestination) {
      setRoute(null);
      setSummary("Missing start or end point.");
      return;
    }

    let waypoints = !journeyType ? stopsForWaypoints.map(coords => ({ location: coords, stopover: true, })) : stopsForWaypoints.map(coords => ({ location: coords, stopover: true }));

    const svc = new window.google.maps.DirectionsService();
    svc.route(
      { origin, destination: finalDestination, travelMode: window.google.maps.TravelMode.DRIVING, waypoints, provideRouteAlternatives: false },
      (result, status) => {
        if (status === "OK") {
          setRoute(result);
          const leg = !journeyType ? result.routes[0].legs[0] : result.routes[0].legs[result.routes[0].legs.length - 1];
          setSummary(`${leg.distance.text} (${leg.duration.text})`);
        } else {
          setRoute(null);
          setSummary("Error fetching route. Select a nearby destination.");
          console.error("Directions error:", status, result);
        }
      }
    );
  }, [destination, friend1Coords, friend2Coords, f1AddressChoice, f2AddressChoice, isLoaded, allDestinations]);

  // Load airports
  useEffect(() => {
    (async () => {
      try {
        const q = query(collection(db, "airports"), orderBy("__name__"));
        const snap = await getDocs(q);
        const rows = snap.docs.map((d) => {
          const data = d.data();
          const code = (data.code || d.id || "").toUpperCase();
          const name = data.name || code;
          return {
            code,
            name,
            label: name,
            searchable: (name + " " + code).toLowerCase(),
          };
        });
        setAirports(rows);
      } catch (e) {
        console.error("Failed to load airports:", e);
        setAirports([]);
      } finally {
        setLoadingAirports(false);
      }
    })();
  }, []);

  // Form state
  const [depInput, setDepInput] = useState("");
  const [arrInput, setArrInput] = useState("");
  const [departureFixed] = useState("Varanasi (VNS)");
  const [arrivalFixed] = useState("Varanasi (VNS)");
  const [arriveDate, setArriveDate] = useState("");
  const [arriveTime, setArriveTime] = useState("");
  const [flightNo, setFlightNo] = useState("");
  const [formErr, setFormErr] = useState("");

  // date/time guards
  const [minDate, setMinDate] = useState("");
  const [minTime, setMinTime] = useState("");
  function todayYYYYMMDD() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split("T")[0];
  }
  function nowHHMM() {
    const n = new Date();
    const hh = String(n.getHours()).padStart(2, "0");
    const mm = String(n.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }
  useEffect(() => { setMinDate(todayYYYYMMDD()); }, []);
  useEffect(() => { setMinTime(arriveDate === minDate ? nowHHMM() : ""); }, [arriveDate, minDate]);

  const datalistOptions = useMemo(() => airports.map((a) => a.label), [airports]);

  // Receive {lat, lng, place} from LocationSearch
  const handleSelectDestination = (payload) => {
    if (!payload || typeof payload !== "object") return;
    const { lat, lng } = payload;
    if (Number.isFinite(lat) && Number.isFinite(lng)) setDestination({ lat, lng });
    const name = extractPlaceName(payload);
    if (name) setPlaceName(name);
  };

  const handleFriendSelect = (setCoordState, setPlaceState, payload) => {
    if (!payload || typeof payload !== "object") return;
    const { lat, lng } = payload;
    if (Number.isFinite(lat) && Number.isFinite(lng)) setCoordState({ lat, lng });
    const name = extractPlaceName(payload);
    if (name) setPlaceState(name);
  };

  const normalizeDeparture = () => {
    const t = depInput.trim().toLowerCase();
    if (!t) return;
    const match =
      airports.find((a) => a.code.toLowerCase() === t) ||
      airports.find((a) => a.label.toLowerCase() === t) ||
      airports.find((a) => a.searchable.includes(t));
    if (match) setDepInput(match.label);
  };

  const normalizeArrival = () => {
    const t = arrInput.trim().toLowerCase();
    if (!t) return;
    const match =
      airports.find((a) => a.code.toLowerCase() === t) ||
      airports.find((a) => a.label.toLowerCase() === t) ||
      airports.find((a) => a.searchable.includes(t));
    if (match) setArrInput(match.label);
  };

  // ------- NEW: normalize flight number to uppercase & no spaces -------
  function normalizeFlightNo(s) {
    if (!s) return "";
    return s.replace(/\s+/g, "").toUpperCase(); // e.g., "6e 558" -> "6E558"
  }
  // ---------------------------------------------------------------------

  // Step 2
  const [step, setStep] = useState(1);
  const [friendsChoice, setFriendsChoice] = useState("");
  const [f1Name, setF1Name] = useState("");
  const [f1Phone, setF1Phone] = useState("");
  const [f2Name, setF2Name] = useState("");
  const [f2Phone, setF2Phone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmitFriends = async () => {
    setErr("");
    if (friendsChoice === "") {
      setErr("Please choose an option.");
      return;
    }
    if (friendsChoice === "yes") {
      const oneOk =
        (f1Name.trim() && f1Phone.trim() && (f1AddressChoice === "Same as mine" || friend1Coords)) ||
        (f2Name.trim() && f2Phone.trim() && (f2AddressChoice === "Same as mine" || friend2Coords));
      if (!oneOk) {
        setErr("Please fill at least one friend's name and phone.");
        return;
      }
    }

    try {
      setSubmitting(true);

      let finalName = userInfo.name;
      let finalEmail = userInfo.email;
      let finalPhone = userInfo.phone;

      if (userInfo.uid && (!finalEmail || !finalPhone || !finalName)) {
        try {
          const custRef = doc(db, "customers", userInfo.uid);
          const custSnap = await getDoc(custRef);
          if (custSnap.exists()) {
            const cust = custSnap.data();
            if (!finalName && cust.name) finalName = cust.name;
            if (!finalEmail && cust.email) finalEmail = cust.email;
            if (!finalPhone && cust.phone) finalPhone = cust.phone;
          }
        } catch (e) {
          console.warn("Customer lookup failed:", e);
        }
      }

      const ref = await addDoc(collection(db, "flight_bookings"), {
        userUid: userInfo.uid || null,
        userName: finalName || null,
        userEmail: finalEmail || null,
        userPhone: finalPhone || null,

        departure: (journeyType ? departureFixed : depInput) || null,
        arrival: (journeyType ? arrInput : arrivalFixed) || null,
        arrivalDate: arriveDate || null,
        arrivalTime: arriveTime || null,
        flightNumber: normalizeFlightNo(flightNo) || null,

        // store coords + visible name
        destination: destination ? { ...destination, place: (placeName || "").trim() || null } : null,
        journeyType: journeyType ? 'Airport to Other' : 'Other to Airport',

        friends: !!(friendsChoice === "yes"),
        friend1:
          friendsChoice === "yes" && f1Name.trim() && f1Phone.trim()
            ? {
              name: f1Name.trim(),
              phone: f1Phone.trim(),
              address: f1AddressChoice === "Same as mine" ? depInput : friend1Coords,
              place:
                f1AddressChoice === "Same as mine"
                  ? ((placeName || "").trim() || null)
                  : ((f1Place || "").trim() || null),
            }
            : null,
        friend2:
          friendsChoice === "yes" && f2Name.trim() && f2Phone.trim()
            ? {
              name: f2Name.trim(),
              phone: f2Phone.trim(),
              address: f2AddressChoice === "Same as mine" ? depInput : friend2Coords,
              place:
                f2AddressChoice === "Same as mine"
                  ? ((placeName || "").trim() || null)
                  : ((f2Place || "").trim() || null),
            }
            : null,

        // NEW: reserve flag when "Wish to go reserve" is chosen
        reserve: friendsChoice === "reserve",

        fake: false,
        whatsapp: false,
        current_status: "",
        on_arrival_call: false,
        driver_assigned: false,
        driver_name: null,
        driver_mobile: null,
        ride_completed: false,
        cancel: false,
        pooling: null,

        createdAt: serverTimestamp(),
      });

      if (typeof window !== "undefined") {
        sessionStorage.setItem("lastBookingId", ref.id);
      }
      router.push(`/flight_confirm?id=${ref.id}`);
    } catch (e) {
      console.error(e);
      setErr("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className={styles.bg}>
      {screen ?

        (<section className={styles.shell2}>


          <h1 className={form.step2Title}>
            Select your journey type
          </h1>
          <div className={styles.grid1}>
            <button onClick={() => { setJourneyType(true); setScreen(false); }} className={styles.input1}>To &nbsp; Varanasi Airport (VNS) &nbsp;&nbsp;→</button>
            <button onClick={() => { setJourneyType(false); setScreen(false); }} className={styles.input1}>←&nbsp;&nbsp; From &nbsp; Varanasi Airport (VNS)</button>
          </div>
        </section>) : (
          <section className={styles.shell}>
            {step === 1 ? (
              <div className={styles.grid}>
                <form
                  className={styles.form}
                  onSubmit={(e) => {
                    e.preventDefault();
                    setFormErr("");

                    if (!depInput.trim() && !journeyType) { setFormErr("Please enter your Departure airport."); return; }
                    if (!arriveDate && journeyType) { setFormErr("Please select your arrival date."); return; }
                    if (!arriveTime) { setFormErr("Please select your arrival time."); return; }
                    if (!flightNo.trim()) { setFormErr("Please enter your flight number."); return; }

                    const selDate = arriveDate;
                    const selTime = arriveTime || "00:00";
                    if (selDate < minDate) { setFormErr("Arrival date cannot be in the past."); return; }
                    if (selDate === minDate && selTime < nowHHMM()) {
                      setFormErr("Arrival time can’t be earlier than the current time."); return;
                    }

                    { !journeyType ? normalizeDeparture() : normalizeArrival(); }
                    setStep(2);
                  }}
                >
                  <h1 className={styles.title}>
                    Give us your flight
                    <br /> details
                  </h1>

                  <div className={styles.row2}>
                    <label className={styles.label} htmlFor="dep">
                      Departure
                    </label>
                    <label className={styles.label} htmlFor="arr">
                      Arrival
                    </label>


                    <input
                      id="dep"
                      className={styles.input}
                      type="text"
                      aria-label="Departure airport"
                      placeholder={!journeyType ? "Kolkata (CCU)" : undefined}
                      value={!journeyType ? depInput : "Varanasi (VNS)"}
                      list={!journeyType ? "airports-list" : undefined}
                      onChange={!journeyType ? (e) => setDepInput(e.target.value) : undefined}
                      onBlur={!journeyType ? normalizeDeparture : undefined}
                      autoComplete="off"
                      required={!journeyType}
                      disabled={!!journeyType}
                    />


                    <input
                      id="arr"
                      className={styles.input}
                      type="text"
                      aria-label="Arrival airport"
                      placeholder={journeyType ? "Kolkata (CCU)" : undefined}
                      value={journeyType ? arrInput : "Varanasi (VNS)"}
                      list={journeyType ? "airports-list" : undefined}
                      onChange={journeyType ? (e) => setArrInput(e.target.value) : undefined}
                      onBlur={journeyType ? normalizeDeparture : undefined}
                      autoComplete="off"
                      required={!!journeyType}
                      disabled={!journeyType}
                    />


                    <datalist id="airports-list">
                      {!loadingAirports &&
                        datalistOptions.map((opt) => <option key={opt} value={opt} />)}
                    </datalist>
                  </div>


                  <div className={styles.subhead}>Arrival Details</div>
                  <div className={styles.row2}>
                    <input className={styles.input} type="date" aria-label="Arrival date" value={arriveDate} onChange={(e) => setArriveDate(e.target.value)} min={minDate} required />
                    <input className={styles.input} type="time" aria-label="Arrival time" value={arriveTime} onChange={(e) => setArriveTime(e.target.value)} min={minTime || undefined} lang="en-GB" required />
                  </div>

                  <label className={styles.label} htmlFor="fn">
                    Flight number
                  </label>
                  <input
                    id="fn"
                    className={styles.input}
                    type="text"
                    placeholder="6E 6805"
                    aria-label="Flight number"
                    value={flightNo}
                    onChange={(e) => setFlightNo(e.target.value)}
                    required
                  />

                  <label className={styles.label} htmlFor="dropoff">
                    {!journeyType ? "Drop-off Location" : "Pick-up Location"}
                  </label>
                  {isLoaded && !loadError ? (
                    <LocationSearch onSelectDestination={handleSelectDestination} placeholder={!journeyType ? "Search drop-off location..." : "Search pick-up location..."} />
                  ) : (
                    <p>Loading search service...</p>
                  )}

                  {summary && <p className={styles.label} style={{ marginTop: '10px' }}>Route: {summary}</p>}


                  {formErr && <p className={styles.errorMsg}>{formErr}</p>}
                  <button className={styles.nextBtn} type="submit">Next →</button>
                </form>

                <div className={styles.mapWrap}>
                  <MapRoute destination={destination} route={route} journeyType={journeyType} />
                </div>
              </div>
            ) : (
              <div className={styles.friendsWrap}>
                <div className={styles.choiceCol}>
                  <h2 className={styles.friendsTitle}>Do you wish to go<br /> with your friends?</h2>

                  <button
                    type="button"
                    className={`${styles.choiceBtn} ${friendsChoice === 'yes' ? styles.choiceActive : ""}`}
                    onClick={() => setFriendsChoice('yes')}
                  >
                    Yes
                  </button>

                  {friendsChoice === "yes" && (
                    <>
                      <div className={styles.personLabel}>Person 2</div>
                      <div className={styles.pairRow}>
                        <input
                          className={styles.friendInput}
                          type="text"
                          placeholder="Name"
                          value={f1Name}
                          onChange={(e) => setF1Name(e.target.value)}
                        />
                        <input
                          className={styles.friendInput}
                          type="tel"
                          placeholder="Phone No."
                          value={f1Phone}
                          onChange={(e) => setF1Phone(e.target.value)}
                        />
                        <select name="address" id="address" className={styles.friendSelect} onChange={(e) => setF1AddressChoice(e.target.value)} value={f1AddressChoice}>

                          <option value="Same as mine">Same as mine</option>
                          <option value="Select other">Select other</option>
                        </select>


                        {f1AddressChoice === 'Select other' && isLoaded && (<div style={{ paddingBottom: '15px' }}>
                          <LocationSearch setDestCoords={(payload) => handleFriendSelect(setFriend1Coords, setF1Place, payload)} placeholder={!journeyType ? "Search drop-off location..." : "Search pick-up location..."} />
                        </div>)}
                      </div>

                      <div className={styles.personLabel}>Person 3</div>
                      <div className={styles.pairRow}>
                        <input
                          className={styles.friendInput}
                          type="text"
                          placeholder="Name"
                          value={f2Name}
                          onChange={(e) => setF2Name(e.target.value)}
                        />
                        <input
                          className={styles.friendInput}
                          type="tel"
                          placeholder="Phone No."
                          value={f2Phone}
                          onChange={(e) => setF2Phone(e.target.value)}
                        />

                        <select name="address" id="address" className={styles.friendSelect} onChange={(e) => setF2AddressChoice(e.target.value)} value={f2AddressChoice}>

                          <option value="Same as mine">Same as mine</option>
                          <option value="Select other">Select other</option>
                        </select>



                        {f2AddressChoice === 'Select other' && isLoaded && (<div style={{ paddingBottom: '15px' }}>
                          <LocationSearch setDestCoords={(payload) => handleFriendSelect(setFriend2Coords, setF2Place, payload)} placeholder={!journeyType ? "Search drop-off location..." : "Search pick-up location..."} />
                        </div>)}
                      </div>
                    </>
                  )}

                  <button
                    type="button"
                    className={`${styles.choiceBtn} ${friendsChoice === false ? styles.choiceActive : ""
                      }`}
                    onClick={() => { setFriendsChoice("no"), setFriend1Coords(null), setFriend2Coords(null), setF1Place(""), setF2Place(""), setF1Name(""), setF2Name(""), setF1Phone(""), setF2Phone("") }}
                  >
                    No, wish to make new ones
                  </button>

                  <button
                    type="button"
                    className={`${styles.choiceBtn} ${friendsChoice === 'reserve' ? styles.choiceActive : ""}`}
                    onClick={() => { setFriendsChoice('reserve'), setFriend1Coords(null), setFriend2Coords(null), setF1Place(""), setF2Place(""), setF1Name(""), setF2Name(""), setF1Phone(""), setF2Phone("") }}
                  >
                    Wish to go reserve
                  </button>

                  {err && <p className={styles.errorMsg}>{err}</p>}

                  <button type="button" disabled={submitting} className={styles.submitBtn} onClick={handleSubmitFriends}>
                    {submitting ? "Submitting…" : "Submit"}
                  </button>
                </div>

                <div className={styles.mapWrap2}>
                  <MapRoute destination={destination} route={route} allDestinations={allDestinations} journeyType={journeyType} />
                </div>
              </div>
            )}
          </section>)}
    </main>
  );
}

