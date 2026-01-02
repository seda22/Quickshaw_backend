// pages/admin/index.js
import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import styles from "../../styles/Admin.module.css";

/* ---------- Firebase (client) ---------- */
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch,
  getDocs,
  where,
} from "firebase/firestore";

// ***** Your Firebase config *****
const firebaseConfig = {
  apiKey: "AIzaSyBJhxil7RsyubTwCBIctYsoLDgpMXikTM8",
  authDomain: "quickshaw-e3d95.firebaseapp.com",
  projectId: "quickshaw-e3d95",
  storageBucket: "quickshaw-e3d95.firebasestorage.app",
  messagingSenderId: "1042700258885",
  appId: "1:1042700258885:web:6b88a78aead1a567039d2c",
};

if (!getApps().length) initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

/* ***** Allowlist + domain ***** */
const ALLOWED_EMAILS = new Set([
  "pandya.kedarr.che23@itbhu.ac.in",
  "deepannita.mukherjee.mec23@itbhu.ac.in",
  "soumya.kumari.met23@itbhu.ac.in",
  "soumadip.majumder.cse23@itbhu.ac.in",
  "patel.dhruvin.mec22@itbhu.ac.in",
  "prakritish.das.apd23@itbhu.ac.in",
]);
const ALLOWED_DOMAIN = "@quickshaw.co.in";

function isAllowed(email = "") {
  const e = email.toLowerCase();
  return e.endsWith(ALLOWED_DOMAIN) || ALLOWED_EMAILS.has(e);
}

/* ---------- Utils ---------- */
function combineKey(arrivalDate, arrivalTime) {
  const d = arrivalDate || "";
  const t = arrivalTime || "";
  return `${d} ${t}`;
}
function descByDateTime(a, b) {
  const ka = combineKey(a.arrivalDate, a.arrivalTime);
  const kb = combineKey(b.arrivalDate, b.arrivalTime);
  return kb.localeCompare(ka);
}
function fmtFriends(row) {
  if (!row.friends) return "—";
  const f1 = row.friend1?.name ? `${row.friend1.name}` : "";
  const f2 = row.friend2?.name ? `${row.friend2.name}` : "";
  const parts = [f1, f2].filter(Boolean);
  return parts.length ? parts.join(" · ") : "Yes";
}

/* --- helpers for older data shapes --- */
function isBoolFalse(v) {
  return v === false || v === "false" || v === 0 || v === null || v === undefined;
}
function noPool(v) {
  return v === null || v === undefined || v === "";
}

/* Helper: earliest arrival (date, time) from a list */
function minArrival(items) {
  if (!items?.length) return { date: "—", time: "" };
  const sorted = [...items].sort((a, b) =>
    combineKey(a.arrivalDate, a.arrivalTime).localeCompare(
      combineKey(b.arrivalDate, b.arrivalTime)
    )
  );
  const m = sorted[0] || {};
  return { date: m.arrivalDate || "—", time: m.arrivalTime || "" };
}

/* -----------------------
   Extra helpers (drop/pickup + detailed friends)
------------------------*/
function getDropPickupPlace(row) {
  const p =
    row?.destination?.place ??
    row?.destination?.address ??
    "";
  return p && String(p).trim() ? String(p).trim() : "—";
}

function friendLine(f) {
  if (!f) return null;
  const addr =
    f.place ??
    (typeof f.address === "string"
      ? f.address
      : (f.address?.place ??
         (Number.isFinite(f.address?.lat) && Number.isFinite(f.address?.lng)
           ? `${Number(f.address.lat).toFixed(5)}, ${Number(f.address.lng).toFixed(5)}`
           : "")));
  const name = f.name || "";
  const phone = f.phone ? ` (${f.phone})` : "";
  const address = addr ? ` (${addr})` : "";
  const line = `${name}${phone}${address}`.trim();
  return line || null;
}

function fmtFriendsDetailed(row) {
  if (!row.friends) return "—";
  const parts = [friendLine(row.friend1), friendLine(row.friend2)].filter(Boolean);
  return parts.length ? parts.join(" · ") : "Yes";
}

/* Single place to compute how Friends should display in Valid/Cabs/Completed */
function friendsDisplay(row) {
  if (row.reserve === true) return "RESERVED";
  return fmtFriendsDetailed(row);
}

/* ---------- View buttons ---------- */
const VIEWS = {
  FAKE: "FAKE",
  FAKE_BOOKINGS: "FAKE_BOOKINGS",
  VALID: "VALID",
  CANCELLED: "CANCELLED",
  CABS: "CABS",
  COMPLETED: "COMPLETED",
};

/* ---------- Shared editable cells ---------- */
function BoolSelect({ id, field, value }) {
  const [val, setVal] = useState(Boolean(value));
  useEffect(() => setVal(Boolean(value)), [value]);
  return (
    <select
      className={styles.inputSmall}
      value={val ? "true" : "false"}
      onChange={async (e) => {
        const v = e.target.value === "true";
        setVal(v);
        try {
          await updateDoc(doc(db, "flight_bookings", id), { [field]: v });
        } catch (err) {
          console.error(err);
          alert("Update failed");
        }
      }}
    >
      <option value="true">true</option>
      <option value="false">false</option>
    </select>
  );
}

function RideStatusSelect({ id, cancel }) {
  const current = cancel ? "cancelled" : "confirm";
  const [val, setVal] = useState(current);
  useEffect(() => setVal(cancel ? "cancelled" : "confirm"), [cancel]);
  return (
    <select
      className={styles.inputSmall}
      value={val}
      onChange={async (e) => {
        const v = e.target.value;
        setVal(v);
        try {
          await updateDoc(doc(db, "flight_bookings", id), { cancel: v === "cancelled" });
        } catch (err) {
          console.error(err);
          alert("Update failed");
        }
      }}
    >
      <option value="confirm">Confirm</option>
      <option value="cancelled">Cancelled</option>
    </select>
  );
}

function TextEdit({ id, field, value, type = "text", placeholder = "—" }) {
  const [val, setVal] = useState(value ?? "");
  useEffect(() => setVal(value ?? ""), [value]);
  const save = async () => {
    try {
      await updateDoc(doc(db, "flight_bookings", id), { [field]: val?.trim() ? val : null });
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };
  return (
    <input
      className={styles.inputSmall}
      type={type}
      value={val ?? ""}
      placeholder={placeholder}
      onChange={(e) => setVal(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
    />
  );
}

/* ---------- Core UI atoms ---------- */
function DateFilter({ value, onChange, extra }) {
  return (
    <div className={styles.toolbar}>
      <input
        className={styles.input}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button className={styles.btnGhost} onClick={() => onChange("")}>
          Clear
        </button>
      )}
      {extra}
    </div>
  );
}
function Empty({ text }) {
  return (
    <div className={styles.empty}>
      <p className={styles.muted}>{text}</p>
    </div>
  );
}

/* -----------------------
   View 1: Fake Checking
------------------------*/
function ViewFakeChecking({ rows }) {
  const [date, setDate] = useState("");
  const list = useMemo(() => {
    let L = [...rows].sort(descByDateTime);
    if (date) L = L.filter((r) => r.arrivalDate === date);
    return L;
  }, [rows, date]);

  return (
    <div>
      <DateFilter value={date} onChange={setDate} />
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Arrival Date</th>
              <th className={styles.th}>Time</th>
              <th className={styles.th}>Flight</th>
              <th className={styles.th}>From → To</th>
              <th className={styles.th}>Name</th>
              <th className={styles.th}>Fake?</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id} className={styles.tr}>
                <td className={styles.td}>{r.arrivalDate || "—"}</td>
                <td className={styles.td}>{r.arrivalTime || "—"}</td>
                <td className={styles.td}><b>{r.flightNumber || "—"}</b></td>
                <td className={styles.td}>
                  {r.departure || "—"} <span className={styles.arrow}>→</span>{" "}
                  {r.arrival || "—"}
                </td>
                <td className={styles.td}>{r.userName || "—"}</td>
                <td className={styles.td}>
                  <BoolSelect id={r.id} field="fake" value={r.fake} />
                </td>
              </tr>
            ))}
            {!list.length && (
              <tr><td className={styles.td} colSpan={6}><Empty text="No bookings found for this filter." /></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* -----------------------
   View: Fake Bookings (fake === true)
------------------------*/
function ViewFakeBookings({ rows }) {
  const [date, setDate] = useState("");
  const list = useMemo(() => {
    let L = rows.filter((r) => r.fake === true).sort(descByDateTime);
    if (date) L = L.filter((r) => r.arrivalDate === date);
    return L;
  }, [rows, date]);

  return (
    <div>
      <DateFilter value={date} onChange={setDate} />
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Ride Status</th>
              <th className={styles.th}>Arr Date</th>
              <th className={styles.th}>Time</th>
              <th className={styles.th}>Flight</th>
              <th className={styles.th}>From → To</th>
              <th className={styles.th}>Name</th>
              <th className={styles.th}>Phone</th>
              <th className={styles.th}>Friends</th>
              <th className={styles.th}>WhatsApp</th>
              <th className={styles.th}>On Arrival Call</th>
              <th className={styles.th}>Driver Assigned</th>
              <th className={styles.th}>Driver</th>
              <th className={styles.th}>Driver Mobile</th>
              <th className={styles.th}>Current Status</th>
              <th className={styles.th}>Completed</th>
              <th className={styles.th}>Fake?</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id} className={styles.tr}>
                <td className={styles.td}><RideStatusSelect id={r.id} cancel={r.cancel} /></td>
                <td className={styles.td}>{r.arrivalDate || "—"}</td>
                <td className={styles.td}>{r.arrivalTime || "—"}</td>
                <td className={styles.td}><b>{r.flightNumber || "—"}</b></td>
                <td className={styles.td}>
                  {r.departure || "—"} <span className={styles.arrow}>→</span>{" "}
                  {r.arrival || "—"}
                </td>
                <td className={styles.td}>{r.userName || "—"}</td>
                <td className={styles.td}>{r.userPhone || "—"}</td>
                <td className={styles.td}>{fmtFriends(r)}</td>
                <td className={styles.td}><BoolSelect id={r.id} field="whatsapp" value={r.whatsapp} /></td>
                <td className={styles.td}><BoolSelect id={r.id} field="on_arrival_call" value={r.on_arrival_call} /></td>
                <td className={styles.td}><BoolSelect id={r.id} field="driver_assigned" value={r.driver_assigned} /></td>
                <td className={styles.td}><TextEdit id={r.id} field="driver_name" value={r.driver_name} placeholder="Driver name" /></td>
                <td className={styles.td}><TextEdit id={r.id} field="driver_mobile" value={r.driver_mobile} type="tel" placeholder="Mobile" /></td>
                <td className={styles.td}><TextEdit id={r.id} field="current_status" value={r.current_status} placeholder="Status…" /></td>
                <td className={styles.td}><BoolSelect id={r.id} field="ride_completed" value={r.ride_completed} /></td>
                <td className={styles.td}><BoolSelect id={r.id} field="fake" value={r.fake} /></td>
              </tr>
            ))}
            {!list.length && (
              <tr><td className={styles.td} colSpan={16}><Empty text="No fake bookings." /></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* -----------------------
   View: Valid Bookings (excludes cancelled)
   - Adds Drop/PickUp column
   - Friends: RESERVED if reserve===true else Name (mobile) (address)
------------------------*/
function ViewValidBookings({ rows }) {
  const [date, setDate] = useState("");
  const [selected, setSelected] = useState(() => new Set());
  const [poolingBusy, setPoolingBusy] = useState(false);
  const toggle = (id) => {
    setSelected((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else if (s.size < 3) s.add(id);
      return s;
    });
  };

  const list = useMemo(() => {
    let L = rows
      .filter(
        (r) =>
          isBoolFalse(r.fake) &&
          r.cancel !== true &&
          (r.ride_completed !== true) &&
          noPool(r.pooling)
      )
      .sort(descByDateTime);
    if (date) L = L.filter((r) => r.arrivalDate === date);
    return L;
  }, [rows, date]);

  async function createCab() {
    const ids = Array.from(selected);
    if (ids.length < 1 || ids.length > 3) return; // allow 1–3
    try {
      setPoolingBusy(true);
      const snap = await getDocs(collection(db, "flight_bookings"));
      let maxPool = 0;
      snap.forEach((d) => {
        const p = d.data()?.pooling;
        if (typeof p === "number" && p > maxPool) maxPool = p;
      });
      const nextPool = maxPool + 1;

      const batch = writeBatch(db);
      ids.forEach((id) => batch.update(doc(db, "flight_bookings", id), { pooling: nextPool }));
      await batch.commit();
      setSelected(new Set());
    } catch (e) {
      console.error(e);
      alert("Creating cab failed. Please try again.");
    } finally {
      setPoolingBusy(false);
    }
  }

  return (
    <div>
      <DateFilter
        value={date}
        onChange={setDate}
        extra={
          <button
            className={styles.btnPrimary}
            disabled={selected.size < 1 || poolingBusy}
            onClick={createCab}
            title="Select 1–3 bookings then click to create a cab"
          >
            {poolingBusy ? "Creating…" : `Create Cab (${selected.size}/3)`}
          </button>
        }
      />

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Cab</th>
              <th className={styles.th}>Ride Status</th>
              <th className={styles.th}>Arr Date</th>
              <th className={styles.th}>Time</th>
              <th className={styles.th}>Flight</th>
              <th className={styles.th}>From → To</th>
              <th className={styles.th}>Name</th>
              <th className={styles.th}>Phone</th>
              <th className={styles.th}>Drop/PickUp</th>
              <th className={styles.th}>Friends</th>
              <th className={styles.th}>WhatsApp</th>
              <th className={styles.th}>On Arrival Call</th>
              <th className={styles.th}>Driver Assigned</th>
              <th className={styles.th}>Driver</th>
              <th className={styles.th}>Driver Mobile</th>
              <th className={styles.th}>Current Status</th>
              <th className={styles.th}>Completed</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id} className={styles.tr}>
                <td className={styles.td}>
                  <input
                    type="checkbox"
                    checked={selected.has(r.id)}
                    onChange={() => toggle(r.id)}
                    disabled={!selected.has(r.id) && selected.size >= 3}
                  />
                </td>
                <td className={styles.td}>
                  <RideStatusSelect id={r.id} cancel={r.cancel} />
                </td>
                <td className={styles.td}>{r.arrivalDate || "—"}</td>
                <td className={styles.td}>{r.arrivalTime || "—"}</td>
                <td className={styles.td}><b>{r.flightNumber || "—"}</b></td>
                <td className={styles.td}>
                  {r.departure || "—"} <span className={styles.arrow}>→</span>{" "}
                  {r.arrival || "—"}
                </td>
                <td className={styles.td}>{r.userName || "—"}</td>
                <td className={styles.td}>{r.userPhone || "—"}</td>
                <td className={styles.td}>{getDropPickupPlace(r)}</td>
                <td className={styles.td}>{friendsDisplay(r)}</td>
                <td className={styles.td}>
                  <BoolSelect id={r.id} field="whatsapp" value={r.whatsapp} />
                </td>
                <td className={styles.td}>
                  <BoolSelect id={r.id} field="on_arrival_call" value={r.on_arrival_call} />
                </td>
                <td className={styles.td}>
                  <BoolSelect id={r.id} field="driver_assigned" value={r.driver_assigned} />
                </td>
                <td className={styles.td}>
                  <TextEdit id={r.id} field="driver_name" value={r.driver_name} placeholder="Driver name" />
                </td>
                <td className={styles.td}>
                  <TextEdit id={r.id} field="driver_mobile" value={r.driver_mobile} type="tel" placeholder="Mobile" />
                </td>
                <td className={styles.td}>
                  <TextEdit id={r.id} field="current_status" value={r.current_status} placeholder="Status…" />
                </td>
                <td className={styles.td}>
                  <BoolSelect id={r.id} field="ride_completed" value={r.ride_completed} />
                </td>
              </tr>
            ))}

            {!list.length && (
              <tr><td className={styles.td} colSpan={17}><Empty text="No valid bookings to show." /></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* -----------------------
   View: Cancelled Rides (cancel === true)
------------------------*/
function ViewCancelled({ rows }) {
  const [date, setDate] = useState("");
  const list = useMemo(() => {
    let L = rows
      .filter((r) => r.cancel === true && r.ride_completed !== true)
      .sort(descByDateTime);
    if (date) L = L.filter((r) => r.arrivalDate === date);
    return L;
  }, [rows, date]);

  return (
    <div>
      <DateFilter value={date} onChange={setDate} />
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Ride Status</th>
              <th className={styles.th}>Arr Date</th>
              <th className={styles.th}>Time</th>
              <th className={styles.th}>Flight</th>
              <th className={styles.th}>From → To</th>
              <th className={styles.th}>Name</th>
              <th className={styles.th}>Phone</th>
              <th className={styles.th}>Friends</th>
              <th className={styles.th}>WhatsApp</th>
              <th className={styles.th}>On Arrival Call</th>
              <th className={styles.th}>Driver Assigned</th>
              <th className={styles.th}>Driver</th>
              <th className={styles.th}>Driver Mobile</th>
              <th className={styles.th}>Current Status</th>
              <th className={styles.th}>Completed</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id} className={styles.tr}>
                <td className={styles.td}><RideStatusSelect id={r.id} cancel={r.cancel} /></td>
                <td className={styles.td}>{r.arrivalDate || "—"}</td>
                <td className={styles.td}>{r.arrivalTime || "—"}</td>
                <td className={styles.td}><b>{r.flightNumber || "—"}</b></td>
                <td className={styles.td}>
                  {r.departure || "—"} <span className={styles.arrow}>→</span>{" "}
                  {r.arrival || "—"}
                </td>
                <td className={styles.td}>{r.userName || "—"}</td>
                <td className={styles.td}>{r.userPhone || "—"}</td>
                <td className={styles.td}>{fmtFriends(r)}</td>
                <td className={styles.td}><BoolSelect id={r.id} field="whatsapp" value={r.whatsapp} /></td>
                <td className={styles.td}><BoolSelect id={r.id} field="on_arrival_call" value={r.on_arrival_call} /></td>
                <td className={styles.td}><BoolSelect id={r.id} field="driver_assigned" value={r.driver_assigned} /></td>
                <td className={styles.td}><TextEdit id={r.id} field="driver_name" value={r.driver_name} placeholder="Driver name" /></td>
                <td className={styles.td}><TextEdit id={r.id} field="driver_mobile" value={r.driver_mobile} type="tel" placeholder="Mobile" /></td>
                <td className={styles.td}><TextEdit id={r.id} field="current_status" value={r.current_status} placeholder="Status…" /></td>
                <td className={styles.td}><BoolSelect id={r.id} field="ride_completed" value={r.ride_completed} /></td>
              </tr>
            ))}
            {!list.length && (
              <tr><td className={styles.td} colSpan={15}><Empty text="No cancelled rides." /></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* -----------------------
   View: Cabs (formerly Pooling)
   - Friends uses the same logic as Valid Bookings
------------------------*/
function ViewCabs({ rows }) {
  const [date, setDate] = useState("");

  const groups = useMemo(() => {
    let withPool = rows
      .filter((r) => typeof r.pooling === "number" && r.ride_completed !== true);
    if (date) withPool = withPool.filter((r) => r.arrivalDate === date);
    withPool.sort(descByDateTime);
    const map = new Map();
    withPool.forEach((r) => {
      const key = r.pooling;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(r);
    });
    return Array.from(map.entries())
      .map(([pool, items]) => ({ pool, items }))
      .sort((a, b) => descByDateTime(a.items[0], b.items[0]));
  }, [rows, date]);

  const [open, setOpen] = useState(new Set());
  const toggle = (p) => {
    setOpen((prev) => {
      const s = new Set(prev);
      if (s.has(p)) s.delete(p); else s.add(p);
      return s;
    });
  };

  async function setCabCompleted(pool, value) {
    try {
      const qy = query(collection(db, "flight_bookings"), where("pooling", "==", pool));
      const snap = await getDocs(qy);
      const batch = writeBatch(db);
      snap.forEach((d) => {
        batch.update(doc(db, "flight_bookings", d.id), {
          ride_completed: !!value,
          pooling: value ? null : pool,
        });
      });
      await batch.commit();
    } catch (e) {
      console.error(e);
      alert("Failed to update cab completion.");
    }
  }

  async function removeFromCab(id) {
    try {
      await updateDoc(doc(db, "flight_bookings", id), { pooling: null });
    } catch (e) {
      console.error(e);
      alert("Failed to remove from cab.");
    }
  }

  return (
    <div>
      <DateFilter value={date} onChange={setDate} />
      {!groups.length && <Empty text="No cabs yet." />}

      <div className={styles.baskets}>
        {groups.map(({ pool, items }) => {
          const allCompleted = items.every((i) => i.ride_completed === true);
          const { date: minDate, time: minTime } = minArrival(items);
          return (
            <div key={pool} className={styles.basket}>
              <button className={styles.basketHead} onClick={() => toggle(pool)}>
                <span>Cab #{pool} {minDate !== "—" ? `(${minDate} ${minTime})` : ""}</span>
                <span className={styles.badge}>{items.length}</span>
                <span className={styles.chev}>{open.has(pool) ? "▾" : "▸"}</span>
              </button>

              {open.has(pool) && (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th className={styles.th}>Arr Date</th>
                        <th className={styles.th}>Time</th>
                        <th className={styles.th}>Flight</th>
                        <th className={styles.th}>From → To</th>
                        <th className={styles.th}>Phone</th>
                        <th className={styles.th}>Name</th>
                        <th className={styles.th}>Friends</th>
                        <th className={styles.th}>WhatsApp</th>
                        <th className={styles.th}>On Arrival Call</th>
                        <th className={styles.th}>Driver Assigned</th>
                        <th className={styles.th}>Driver</th>
                        <th className={styles.th}>Driver Mobile</th>
                        <th className={styles.th}>Current Status</th>
                        <th className={styles.th}>Completed</th>
                        <th className={styles.th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((r) => (
                        <tr key={r.id} className={styles.tr}>
                          <td className={styles.td}>{r.arrivalDate || "—"}</td>
                          <td className={styles.td}>{r.arrivalTime || "—"}</td>
                          <td className={styles.td}><b>{r.flightNumber || "—"}</b></td>
                          <td className={styles.td}>
                            {r.departure || "—"} <span className={styles.arrow}>→</span>{" "}
                            {r.arrival || "—"}
                          </td>
                          <td className={styles.td}>{r.userPhone || "—"}</td>
                          <td className={styles.td}>{r.userName || "—"}</td>
                          <td className={styles.td}>{friendsDisplay(r)}</td>
                          <td className={styles.td}>
                            <BoolSelect id={r.id} field="whatsapp" value={r.whatsapp} />
                          </td>
                          <td className={styles.td}>
                            <BoolSelect id={r.id} field="on_arrival_call" value={r.on_arrival_call} />
                          </td>
                          <td className={styles.td}>
                            <BoolSelect id={r.id} field="driver_assigned" value={r.driver_assigned} />
                          </td>
                          <td className={styles.td}>
                            <TextEdit id={r.id} field="driver_name" value={r.driver_name} placeholder="Driver name" />
                          </td>
                          <td className={styles.td}>
                            <TextEdit id={r.id} field="driver_mobile" value={r.driver_mobile} type="tel" placeholder="Mobile" />
                          </td>
                          <td className={styles.td}>
                            <TextEdit id={r.id} field="current_status" value={r.current_status} placeholder="Status…" />
                          </td>
                          <td className={styles.td}>
                            <select
                              className={styles.inputSmall}
                              value={r.ride_completed ? "true" : "false"}
                              onChange={(e) => setCabCompleted(pool, e.target.value === "true")}
                            >
                              <option value="true">true</option>
                              <option value="false">false</option>
                            </select>
                          </td>
                          <td className={styles.td}>
                            <button
                              className={styles.btnGhost}
                              onClick={() => removeFromCab(r.id)}
                              title="Remove this booking from the cab"
                            >
                              Remove from cab
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className={styles.toolbar}>
                    <button
                      className={styles.btnPrimary}
                      onClick={() => setCabCompleted(pool, true)}
                      disabled={allCompleted}
                    >
                      Mark entire cab completed
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -----------------------
   View: Completed Bookings
   - Adds Friends column (after Name) using same logic
------------------------*/
function ViewCompleted({ rows }) {
  const [date, setDate] = useState("");

  const completed = useMemo(() => {
    let L = rows.filter((r) => r.ride_completed === true).sort(descByDateTime);
    if (date) L = L.filter((r) => r.arrivalDate === date);
    return L;
  }, [rows, date]);

  const pooledGroups = useMemo(() => {
    const withPool = completed.filter((r) => typeof r.pooling === "number");
    const m = new Map();
    withPool.forEach((r) => {
      const k = r.pooling;
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(r);
    });
    return Array.from(m.entries())
      .map(([pool, items]) => ({ pool, items }))
      .sort((a, b) => descByDateTime(a.items[0], b.items[0]));
  }, [completed]);

  const solo = useMemo(() => completed.filter((r) => noPool(r.pooling)), [completed]);

  const [open, setOpen] = useState(new Set());
  const toggle = (p) => {
    setOpen((prev) => {
      const s = new Set(prev);
      if (s.has(p)) s.delete(p); else s.add(p);
      return s;
    });
  };

  async function setPoolCompleted(pool, value) {
    try {
      const qy = query(collection(db, "flight_bookings"), where("pooling", "==", pool));
      const snap = await getDocs(qy);
      const batch = writeBatch(db);
      snap.forEach((d) => {
        batch.update(doc(db, "flight_bookings", d.id), {
          ride_completed: !!value,
        });
      });
      await batch.commit();
    } catch (e) {
      console.error(e);
      alert("Failed to update pool completion.");
    }
  }

  return (
    <div>
      <DateFilter value={date} onChange={setDate} />

      {/* Solo (non-pooled) completed bookings */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Arr Date</th>
              <th className={styles.th}>Time</th>
              <th className={styles.th}>Flight</th>
              <th className={styles.th}>From → To</th>
              <th className={styles.th}>Phone</th>
              <th className={styles.th}>Name</th>
              <th className={styles.th}>Friends</th>
              <th className={styles.th}>Driver</th>
              <th className={styles.th}>Driver Mobile</th>
              <th className={styles.th}>Current Status</th>
              <th className={styles.th}>Completed</th>
            </tr>
          </thead>
          <tbody>
            {solo.map((r) => (
              <tr key={r.id} className={styles.tr}>
                <td className={styles.td}>{r.arrivalDate || "—"}</td>
                <td className={styles.td}>{r.arrivalTime || "—"}</td>
                <td className={styles.td}><b>{r.flightNumber || "—"}</b></td>
                <td className={styles.td}>
                  {r.departure || "—"} <span className={styles.arrow}>→</span>{" "}
                  {r.arrival || "—"}
                </td>
                <td className={styles.td}>{r.userPhone || "—"}</td>
                <td className={styles.td}>{r.userName || "—"}</td>
                <td className={styles.td}>{friendsDisplay(r)}</td>
                <td className={styles.td}>
                  <TextEdit id={r.id} field="driver_name" value={r.driver_name} placeholder="Driver name" />
                </td>
                <td className={styles.td}>
                  <TextEdit id={r.id} field="driver_mobile" value={r.driver_mobile} type="tel" placeholder="Mobile" />
                </td>
                <td className={styles.td}>
                  <TextEdit id={r.id} field="current_status" value={r.current_status} placeholder="Status…" />
                </td>
                <td className={styles.td}>
                  <BoolSelect id={r.id} field="ride_completed" value={r.ride_completed} />
                </td>
              </tr>
            ))}
            {!solo.length && (
              <tr><td className={styles.td} colSpan={11}><Empty text="No non-pooled completed rides." /></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pooled completed bookings as collapsible baskets */}
      <div className={styles.baskets}>
        {pooledGroups.map(({ pool, items }) => (
          <div key={pool} className={styles.basket}>
            <button className={styles.basketHead} onClick={() => toggle(pool)}>
              <span>Pool #{pool}</span>
              <span className={styles.badge}>{items.length}</span>
              <span className={styles.chev}>{open.has(pool) ? "▾" : "▸"}</span>
            </button>

            {open.has(pool) && (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>Arr Date</th>
                      <th className={styles.th}>Time</th>
                      <th className={styles.th}>Flight</th>
                      <th className={styles.th}>From → To</th>
                      <th className={styles.th}>Phone</th>
                      <th className={styles.th}>Name</th>
                      <th className={styles.th}>Friends</th>
                      <th className={styles.th}>Driver</th>
                      <th className={styles.th}>Driver Mobile</th>
                      <th className={styles.th}>Current Status</th>
                      <th className={styles.th}>Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((r) => (
                      <tr key={r.id} className={styles.tr}>
                        <td className={styles.td}>{r.arrivalDate || "—"}</td>
                        <td className={styles.td}>{r.arrivalTime || "—"}</td>
                        <td className={styles.td}><b>{r.flightNumber || "—"}</b></td>
                        <td className={styles.td}>
                          {r.departure || "—"} <span className={styles.arrow}>→</span>{" "}
                          {r.arrival || "—"}
                        </td>
                        <td className={styles.td}>{r.userPhone || "—"}</td>
                        <td className={styles.td}>{r.userName || "—"}</td>
                        <td className={styles.td}>{friendsDisplay(r)}</td>
                        <td className={styles.td}>
                          <TextEdit id={r.id} field="driver_name" value={r.driver_name} placeholder="Driver name" />
                        </td>
                        <td className={styles.td}>
                          <TextEdit id={r.id} field="driver_mobile" value={r.driver_mobile} type="tel" placeholder="Mobile" />
                        </td>
                        <td className={styles.td}>
                          <TextEdit id={r.id} field="current_status" value={r.current_status} placeholder="Status…" />
                        </td>
                        <td className={styles.td}>
                          <BoolSelect id={r.id} field="ride_completed" value={r.ride_completed} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className={styles.toolbar}>
                  <button
                    className={styles.btnGhost}
                    onClick={() => setPoolCompleted(pool, false)}
                    title="Undo completion for the entire pool"
                  >
                    Undo completion for pool #{pool}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {!pooledGroups.length && !solo.length && <Empty text="No completed rides yet." />}
    </div>
  );
}

/* -----------------------
   Data loader (shared)
------------------------*/
function useBookings() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const qy = query(collection(db, "flight_bookings"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      qy,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setRows(data);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  return { rows, loading };
}

/* -----------------------
   Main Admin
------------------------*/
export default function Admin() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [allowed, setAllowed] = useState(false);
  const [error, setError] = useState("");

  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        setUser(null);
        setAllowed(false);
        setLoading(false);
        return;
      }
      const ok = isAllowed(u.email || "");
      setUser(u);
      setAllowed(ok);
      setLoading(false);
      setError(ok ? "" : "Access denied. This admin panel is restricted to QuickShaw staff.");
    });
    return () => unsub();
  }, []);

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) {
      setError(e?.message || "Google sign-in failed");
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const u = cred.user;
      if (!isAllowed(u.email)) {
        await signOut(auth);
        setError("Access denied. Use your QuickShaw email or an allowlisted one.");
      }
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (!isAllowed(email)) {
        setLoading(false);
        setError("Signup blocked. Only QuickShaw emails or allowlisted addresses may register.");
        return;
      }
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) await updateProfile(cred.user, { displayName });
      try { await sendEmailVerification(cred.user); } catch {}
    } catch (err) {
      setError(err?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setAllowed(false);
    setUser(null);
  };

  const { rows, loading: bookingsLoading } = useBookings();
  const [view, setView] = useState(VIEWS.FAKE);

  return (
    <>
      <Head>
        <title>QuickShaw Admin</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className={`${styles.adminRoot} ${styles.wrap}`}>
        <header className={styles.topbar}>
          <div className={styles.brand}>QuickShaw Admin</div>
          {user ? (
            <div className={styles.userRow}>
              <span className={styles.email}>{user.email}</span>
              <button className={styles.btnGhost} onClick={handleLogout}>Logout</button>
            </div>
          ) : null}
        </header>

        <section className={styles.card}>
          {loading && <p className={styles.muted}>Checking access…</p>}

          {!loading && !user && (
            <>
              <h1 className={styles.h1}>Sign in to continue</h1>
              <p className={styles.muted}>Only approved QuickShaw staff can access this panel.</p>

              <div className={styles.tabs}>
                <button
                  className={`${styles.tab} ${styles.tabActive}`}
                  onClick={() => setAuthMode("login")}
                >
                  Email Login
                </button>
                <button
                  className={`${styles.tab} ${authMode === "signup" ? styles.tabActive : ""}`}
                  onClick={() => setAuthMode("signup")}
                >
                  Email Signup
                </button>
                <div className={styles.tabSpacer} />
                <button className={styles.btnGoogle} onClick={handleGoogle}>Continue with Google</button>
              </div>

              {authMode === "login" ? (
                <form className={styles.form} onSubmit={handleEmailLogin}>
                  <input className={styles.input} type="email" placeholder="you@quickshaw.co.in"
                    value={email} onChange={(e) => setEmail(e.target.value)} required />
                  <input className={styles.input} type="password" placeholder="Password"
                    value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <button className={styles.btnPrimary} disabled={loading}>
                    {loading ? "Please wait…" : "Login"}
                  </button>
                </form>
              ) : (
                <form className={styles.form} onSubmit={handleEmailSignup}>
                  <input className={styles.input} type="text" placeholder="Your name"
                    value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                  <input className={styles.input} type="email" placeholder="you@quickshaw.co.in"
                    value={email} onChange={(e) => setEmail(e.target.value)} required />
                  <input className={styles.input} type="password" placeholder="Create a strong password"
                    value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
                  <button className={styles.btnPrimary} disabled={loading}>
                    {loading ? "Please wait…" : "Create account"}
                  </button>
                  <p className={styles.mutedSmall}>
                    Note: Only `@quickshaw.co.in` or allowlisted emails can sign up.
                  </p>
                </form>
              )}

              {error ? <p className={styles.error}>{error}</p> : null}
            </>
          )}

          {!loading && !!user && !allowed && (
            <>
              <h1 className={styles.h1}>Access denied</h1>
              <p className={styles.error}>{error}</p>
              <p className={styles.muted}>
                Your account <b>{user.email}</b> isn’t on the allowlist. Use a QuickShaw email
                (ends with <code>@quickshaw.co.in</code>) or ask an admin to add you.
              </p>
              <button className={styles.btnGhost} onClick={handleLogout}>Use a different account</button>
            </>
          )}

          {!loading && !!user && allowed && (
            <>
              <div className={styles.viewButtons}>
                <button
                  className={`${styles.viewBtn} ${view === VIEWS.FAKE ? styles.viewBtnActive : ""}`}
                  onClick={() => setView(VIEWS.FAKE)}
                >
                  Fake Checking
                </button>

                <button
                  className={`${styles.viewBtn} ${view === VIEWS.FAKE_BOOKINGS ? styles.viewBtnActive : ""}`}
                  onClick={() => setView(VIEWS.FAKE_BOOKINGS)}
                >
                  Fake Bookings
                </button>

                <button
                  className={`${styles.viewBtn} ${view === VIEWS.VALID ? styles.viewBtnActive : ""}`}
                  onClick={() => setView(VIEWS.VALID)}
                >
                  Valid Bookings
                </button>

                <button
                  className={`${styles.viewBtn} ${view === VIEWS.CANCELLED ? styles.viewBtnActive : ""}`}
                  onClick={() => setView(VIEWS.CANCELLED)}
                >
                  Cancelled Rides
                </button>

                <button
                  className={`${styles.viewBtn} ${view === VIEWS.CABS ? styles.viewBtnActive : ""}`}
                  onClick={() => setView(VIEWS.CABS)}
                >
                  Cabs
                </button>

                <button
                  className={`${styles.viewBtn} ${view === VIEWS.COMPLETED ? styles.viewBtnActive : ""}`}
                  onClick={() => setView(VIEWS.COMPLETED)}
                >
                  Completed Bookings
                </button>
              </div>

              {bookingsLoading ? (
                <p className={styles.muted}>Loading bookings…</p>
              ) : (
                <>
                  {view === VIEWS.FAKE && <ViewFakeChecking rows={rows} />}
                  {view === VIEWS.FAKE_BOOKINGS && <ViewFakeBookings rows={rows} />}
                  {view === VIEWS.VALID && <ViewValidBookings rows={rows} />}
                  {view === VIEWS.CANCELLED && <ViewCancelled rows={rows} />}
                  {view === VIEWS.CABS && <ViewCabs rows={rows} />}
                  {view === VIEWS.COMPLETED && <ViewCompleted rows={rows} />}
                </>
              )}
            </>
          )}
        </section>
      </main>
    </>
  );
}
