import React, { useState } from "react";
import {
  LayoutGrid,
  ListChecks,
  Inbox,
  BarChart3,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Plus,
  MessageCircle,
  Wallet,
  Star,
  Camera,
  Car,
  Sparkles,
  Handshake,
} from "lucide-react";

/* ------------------------------------------------------------------------
   SOLSTICE — agent / admin extensions
   ------------------------------------------------------------------------
   A dashboard for the two internal audiences of the marketplace:

   1. Agents & middlemen (the WhatsApp brokers) — manage their own
      listings, see verification status, and view leads that came in via
      WhatsApp or an M-Pesa deposit.
   2. Solstice staff (admin view, gated separately in your auth layer) —
      run the verification queue that is the whole trust proposition.

   Shares BRAND tokens conceptually with solstice-app.jsx; redefined here
   so this file can be dropped in on its own.
-------------------------------------------------------------------------*/

const BRAND = {
  ink: "#1C2B45",
  inkSoft: "#4A5568",
  stone: "#EBE6DA",
  stoneDeep: "#DED7C4",
  gold: "#C6892E",
  rust: "#8B4530",
  sage: "#4B6A4F",
  danger: "#A6403A",
  white: "#FFFEFB",
};

const MOCK_AGENT_LISTINGS = [
  { id: "L-1042", title: "Two-bedroom garden apartment, Kilimani", category: "Nightly", status: "verified", leads: 12, views: 340, photographed: true, featuredUntil: "2026-09-25" },
  { id: "L-1071", title: "Family maisonette, Ruaka", category: "Monthly", status: "pending", leads: 3, views: 88, photographed: false, featuredUntil: null },
  { id: "L-1140", title: "Eighth-acre plot, Kiambu Road", category: "Land", status: "changes_requested", leads: 1, views: 40, photographed: false, featuredUntil: null },
  { id: "L-1207", title: "Bedsitter, South B", category: "Weekly", status: "rejected", leads: 0, views: 12, photographed: false, featuredUntil: null },
];

// Revenue-model constants — kept in sync with solstice-app.jsx by hand for
// now; in a real build, pull both from one shared constants module (or an
// admin-configurable settings table) instead of duplicating them.
const COMMISSION = { base: 15, photographed: 12 }; // % — Host-Only Commission model
const BOOST_TIERS = [
  { id: "3d", label: "3 days to the top", price: 500 },
  { id: "7d", label: "7 days to the top", price: 1200 },
  { id: "14d", label: "14 days to the top", price: 2000 },
];
const PHOTOGRAPHY_FEE = 3500; // KES, one-time — Photography & Verification add-on

const MOCK_PARTNERS = [
  { id: "P-01", name: "Diani Airport Transfers", type: "Airport transfer", area: "Diani, Kwale", commission: 15, bookingsThisMonth: 9, payout: 8100, Icon: Car },
  { id: "P-02", name: "SparkleKe Cleaning Co.", type: "Turnover cleaning", area: "Nairobi (all areas)", commission: 20, bookingsThisMonth: 22, payout: 17600, Icon: Sparkles },
  { id: "P-03", name: "Naivasha Rides", type: "Airport / SGR transfer", area: "Naivasha", commission: 15, bookingsThisMonth: 4, payout: 2700, Icon: Car },
];

const MOCK_REVIEW_PAIRS = [
  { id: "R-501", listing: "Two-bedroom garden apartment, Kilimani", guestSubmitted: true, hostSubmitted: true, revealed: true, guestRating: 5, hostRating: 5 },
  { id: "R-502", listing: "Studio with rooftop terrace, Westlands", guestSubmitted: true, hostSubmitted: false, revealed: false, daysWaiting: 3 },
  { id: "R-503", listing: "Family maisonette, Ruaka", guestSubmitted: false, hostSubmitted: true, revealed: false, daysWaiting: 11 },
];

const MOCK_LEADS = [
  { id: "K-901", listing: "Two-bedroom garden apartment, Kilimani", name: "Achieng O.", channel: "whatsapp", note: "Asked about nightly rate for a 3-night stay.", time: "10 min ago" },
  { id: "K-902", listing: "Family maisonette, Ruaka", name: "Kiptoo J.", channel: "mpesa", note: "Paid KES 5,000 reservation deposit.", time: "1 hr ago" },
  { id: "K-903", listing: "Two-bedroom garden apartment, Kilimani", name: "Mwangi S.", channel: "whatsapp", note: "Wants to view this weekend.", time: "3 hr ago" },
];

const STATUS_META = {
  verified: { label: "Verified", color: BRAND.sage, Icon: CheckCircle2 },
  pending: { label: "In review", color: BRAND.gold, Icon: Clock },
  changes_requested: { label: "Changes requested", color: BRAND.rust, Icon: Clock },
  rejected: { label: "Rejected", color: BRAND.danger, Icon: XCircle },
};

function StatusPill({ status }) {
  const meta = STATUS_META[status];
  const { Icon } = meta;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
      style={{ background: `${meta.color}1A`, color: meta.color, fontFamily: "Work Sans, sans-serif" }}
    >
      <Icon size={13} /> {meta.label}
    </span>
  );
}

/* --------------------------------- Sidebar --------------------------------- */
function Sidebar({ tab, setTab }) {
  const items = [
    { id: "listings", label: "My listings", Icon: LayoutGrid },
    { id: "leads", label: "Leads", Icon: Inbox },
    { id: "verification", label: "Verification queue", Icon: ListChecks },
    { id: "partners", label: "Partners", Icon: Handshake },
    { id: "reviews", label: "Reviews", Icon: Star },
    { id: "analytics", label: "Performance", Icon: BarChart3 },
  ];
  return (
    <div className="w-56 shrink-0 hidden md:block">
      <nav className="space-y-1">
        {items.map((it) => {
          const active = tab === it.id;
          const Icon = it.Icon;
          return (
            <button
              key={it.id}
              onClick={() => setTab(it.id)}
              className="w-full flex items-center gap-2.5 text-sm px-3 py-2.5 rounded-xl transition-colors"
              style={{
                fontFamily: "Work Sans, sans-serif",
                background: active ? BRAND.ink : "transparent",
                color: active ? BRAND.white : BRAND.inkSoft,
              }}
            >
              <Icon size={16} /> {it.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/* ------------------------------ Boost modal ------------------------------ */
function BoostModal({ listing, onClose }) {
  const [tier, setTier] = useState(BOOST_TIERS[0].id);
  const [status, setStatus] = useState("idle");
  const chosen = BOOST_TIERS.find((t) => t.id === tier);

  const submit = () => {
    setStatus("sending");
    // INTEGRATION POINT: POST /api/properties/:id/feature — see
    // solstice-backend/routes/properties.js. A real STK push happens
    // there; this just mocks the round trip for the demo.
    setTimeout(() => setStatus("sent"), 1200);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: BRAND.white }}>
        <div className="flex items-center justify-between mb-1">
          <h3 style={{ fontFamily: "Fraunces, serif", color: BRAND.ink }} className="text-lg font-medium">
            Boost "{listing.title}"
          </h3>
          <button onClick={onClose} style={{ color: BRAND.inkSoft }}>✕</button>
        </div>
        {status !== "sent" ? (
          <>
            <p className="text-sm mt-2 mb-4" style={{ color: BRAND.inkSoft, fontFamily: "Work Sans, sans-serif" }}>
              Pin this listing to the top of its category in search — Featured Listings, paid by you, not the guest.
            </p>
            <div className="space-y-2 mb-4">
              {BOOST_TIERS.map((t) => (
                <label key={t.id} className="flex items-center justify-between text-sm px-3 py-2.5 rounded-lg border cursor-pointer" style={{ borderColor: tier === t.id ? BRAND.gold : BRAND.stoneDeep, fontFamily: "Work Sans, sans-serif" }}>
                  <span className="flex items-center gap-2">
                    <input type="radio" name="boost-tier" checked={tier === t.id} onChange={() => setTier(t.id)} /> {t.label}
                  </span>
                  <span style={{ color: BRAND.ink, fontWeight: 500 }}>KES {t.price.toLocaleString()}</span>
                </label>
              ))}
            </div>
            <button
              onClick={submit}
              disabled={status === "sending"}
              className="w-full py-3 rounded-xl text-sm font-medium"
              style={{ background: BRAND.gold, color: BRAND.white, fontFamily: "Work Sans, sans-serif", opacity: status === "sending" ? 0.7 : 1 }}
            >
              {status === "sending" ? "Sending STK push…" : `Pay KES ${chosen.price.toLocaleString()} via M-Pesa`}
            </button>
          </>
        ) : (
          <p className="text-sm mt-2" style={{ color: BRAND.inkSoft, fontFamily: "Work Sans, sans-serif" }}>
            M-Pesa prompt sent. Once confirmed, this listing jumps to the top of its category for {chosen.label.toLowerCase()}.
          </p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------ Listings panel ------------------------------ */
function ListingsPanel() {
  const [q, setQ] = useState("");
  const [boosting, setBoosting] = useState(null);
  const rows = MOCK_AGENT_LISTINGS.filter((r) =>
    r.title.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 max-w-xs" style={{ borderColor: BRAND.stoneDeep }}>
          <Search size={14} color={BRAND.inkSoft} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search your listings"
            className="text-sm outline-none w-full bg-transparent"
            style={{ fontFamily: "Work Sans, sans-serif" }}
          />
        </div>
        <button
          className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl"
          style={{ background: BRAND.gold, color: BRAND.white, fontFamily: "Work Sans, sans-serif" }}
        >
          <Plus size={15} /> New listing
        </button>
      </div>

      <div className="rounded-2xl border overflow-x-auto" style={{ borderColor: BRAND.stoneDeep }}>
        <table className="w-full text-sm" style={{ fontFamily: "Work Sans, sans-serif", minWidth: 640 }}>
          <thead>
            <tr style={{ background: BRAND.stone, color: BRAND.inkSoft }}>
              <th className="text-left font-medium px-4 py-3">Listing</th>
              <th className="text-left font-medium px-4 py-3">Type</th>
              <th className="text-left font-medium px-4 py-3">Status</th>
              <th className="text-left font-medium px-4 py-3">Commission</th>
              <th className="text-left font-medium px-4 py-3">Views</th>
              <th className="text-left font-medium px-4 py-3">Leads</th>
              <th className="text-left font-medium px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const isBoosted = r.featuredUntil && new Date(r.featuredUntil) > new Date();
              const rate = r.photographed ? COMMISSION.photographed : COMMISSION.base;
              return (
                <tr key={r.id} className="border-t" style={{ borderColor: BRAND.stoneDeep }}>
                  <td className="px-4 py-3">
                    <p style={{ color: BRAND.ink, fontWeight: 500 }} className="flex items-center gap-1.5">
                      {r.title}
                      {isBoosted && <Star size={13} fill={BRAND.gold} color={BRAND.gold} />}
                    </p>
                    <p className="text-xs" style={{ color: "#9AA1AE" }}>{r.id}{isBoosted ? " · Featured" : ""}</p>
                  </td>
                  <td className="px-4 py-3" style={{ color: BRAND.inkSoft }}>{r.category}</td>
                  <td className="px-4 py-3"><StatusPill status={r.status} /></td>
                  <td className="px-4 py-3">
                    <span
                      title={r.photographed ? "Discounted rate for photographed/verified listings" : "Get the 12% rate by adding professional photography & verification"}
                      style={{ color: r.photographed ? BRAND.sage : BRAND.inkSoft }}
                    >
                      {rate}% {r.photographed && <Camera size={12} className="inline ml-1" />}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: BRAND.inkSoft }}>{r.views}</td>
                  <td className="px-4 py-3" style={{ color: BRAND.inkSoft }}>{r.leads}</td>
                  <td className="px-4 py-3">
                    {r.status === "verified" && (
                      <button
                        onClick={() => setBoosting(r)}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg"
                        style={{ background: `${BRAND.gold}1A`, color: BRAND.gold, fontFamily: "Work Sans, sans-serif" }}
                      >
                        {isBoosted ? "Extend boost" : "Boost"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {boosting && <BoostModal listing={boosting} onClose={() => setBoosting(null)} />}
    </div>
  );
}

/* -------------------------------- Leads panel -------------------------------- */
function LeadsPanel() {
  return (
    <div className="space-y-3">
      {MOCK_LEADS.map((l) => (
        <div key={l.id} className="p-4 rounded-2xl border flex items-start gap-3" style={{ borderColor: BRAND.stoneDeep, background: BRAND.white }}>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: l.channel === "mpesa" ? `${BRAND.sage}1A` : `${BRAND.gold}1A` }}
          >
            {l.channel === "mpesa" ? <Wallet size={16} color={BRAND.sage} /> : <MessageCircle size={16} color={BRAND.gold} />}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p style={{ color: BRAND.ink, fontWeight: 500, fontFamily: "Work Sans, sans-serif" }}>{l.name}</p>
              <span className="text-xs" style={{ color: "#9AA1AE", fontFamily: "Work Sans, sans-serif" }}>{l.time}</span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: BRAND.inkSoft, fontFamily: "Work Sans, sans-serif" }}>{l.listing}</p>
            <p className="text-sm mt-1.5" style={{ color: BRAND.ink, fontFamily: "Work Sans, sans-serif" }}>{l.note}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* --------------------------- Verification queue panel --------------------------- */
function VerificationPanel() {
  const pending = MOCK_AGENT_LISTINGS.filter((r) => r.status === "pending" || r.status === "changes_requested");
  return (
    <div className="space-y-3">
      <p className="text-sm mb-2" style={{ color: BRAND.inkSoft, fontFamily: "Work Sans, sans-serif" }}>
        Staff-only view — approve or return listings with a reason before they go live.
        Approving a listing that opted into photography also schedules the visit below.
      </p>
      {pending.map((r) => (
        <div key={r.id} className="p-4 rounded-2xl border flex items-center justify-between" style={{ borderColor: BRAND.stoneDeep, background: BRAND.white }}>
          <div>
            <p style={{ color: BRAND.ink, fontWeight: 500, fontFamily: "Work Sans, sans-serif" }}>{r.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <StatusPill status={r.status} />
              <span
                className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                style={{ background: r.photographed ? `${BRAND.sage}1A` : BRAND.stone, color: r.photographed ? BRAND.sage : BRAND.inkSoft, fontFamily: "Work Sans, sans-serif" }}
              >
                <Camera size={11} /> {r.photographed ? "Visit scheduled" : `Not requested — offer KES ${PHOTOGRAPHY_FEE.toLocaleString()}`}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="text-xs font-medium px-3 py-2 rounded-lg" style={{ background: `${BRAND.sage}1A`, color: BRAND.sage, fontFamily: "Work Sans, sans-serif" }}>
              Approve
            </button>
            <button className="text-xs font-medium px-3 py-2 rounded-lg" style={{ background: `${BRAND.danger}1A`, color: BRAND.danger, fontFamily: "Work Sans, sans-serif" }}>
              Request changes
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------- Partners panel (Phase 2) -------------------------------- */
function PartnersPanel() {
  const totalPayout = MOCK_PARTNERS.reduce((s, p) => s + p.payout, 0);
  return (
    <div>
      <div className="mb-4 p-3 rounded-xl flex items-center gap-2 text-sm" style={{ background: `${BRAND.gold}1A`, color: BRAND.ink, fontFamily: "Work Sans, sans-serif" }}>
        <Handshake size={15} color={BRAND.gold} />
        Phase 2 feature — Partner Perks. Live once booking volume in an area is dense enough to support standing arrangements.
      </div>
      <div className="space-y-3">
        {MOCK_PARTNERS.map((p) => {
          const Icon = p.Icon;
          return (
            <div key={p.id} className="p-4 rounded-2xl border flex items-center justify-between" style={{ borderColor: BRAND.stoneDeep, background: BRAND.white }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: `${BRAND.rust}1A` }}>
                  <Icon size={16} color={BRAND.rust} />
                </div>
                <div>
                  <p style={{ color: BRAND.ink, fontWeight: 500, fontFamily: "Work Sans, sans-serif" }}>{p.name}</p>
                  <p className="text-xs" style={{ color: BRAND.inkSoft, fontFamily: "Work Sans, sans-serif" }}>{p.type} · {p.area}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm" style={{ color: BRAND.ink, fontFamily: "Work Sans, sans-serif" }}>{p.bookingsThisMonth} bookings this month</p>
                <p className="text-xs" style={{ color: BRAND.inkSoft, fontFamily: "Work Sans, sans-serif" }}>
                  Solstice cut {p.commission}% · KES {p.payout.toLocaleString()} to partner
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs mt-4" style={{ color: BRAND.inkSoft, fontFamily: "Work Sans, sans-serif" }}>
        Solstice's take across active partners this month: roughly KES {Math.round(totalPayout * 0.18).toLocaleString()} (blended ~18% cut).
      </p>
    </div>
  );
}

/* -------------------------------- Reviews panel (double-blind) -------------------------------- */
function ReviewsPanel() {
  return (
    <div className="space-y-3">
      <p className="text-sm mb-2" style={{ color: BRAND.inkSoft, fontFamily: "Work Sans, sans-serif" }}>
        Guest and host reviews are held back until both sides respond, or 14 days pass —
        whichever comes first — so an honest review never risks retaliation.
      </p>
      {MOCK_REVIEW_PAIRS.map((r) => (
        <div key={r.id} className="p-4 rounded-2xl border flex items-center justify-between" style={{ borderColor: BRAND.stoneDeep, background: BRAND.white }}>
          <div>
            <p style={{ color: BRAND.ink, fontWeight: 500, fontFamily: "Work Sans, sans-serif" }}>{r.listing}</p>
            <p className="text-xs mt-1" style={{ color: BRAND.inkSoft, fontFamily: "Work Sans, sans-serif" }}>
              Guest {r.guestSubmitted ? "✓ submitted" : "— waiting"} · Host {r.hostSubmitted ? "✓ submitted" : "— waiting"}
            </p>
          </div>
          {r.revealed ? (
            <span className="text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1" style={{ background: `${BRAND.sage}1A`, color: BRAND.sage, fontFamily: "Work Sans, sans-serif" }}>
              <CheckCircle2 size={13} /> Revealed — {r.guestRating}★ / {r.hostRating}★
            </span>
          ) : (
            <span className="text-xs font-medium px-3 py-1.5 rounded-lg" style={{ background: BRAND.stone, color: BRAND.inkSoft, fontFamily: "Work Sans, sans-serif" }}>
              Held — {r.daysWaiting}/14 days
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ----------------------------- Analytics panel ----------------------------- */
function AnalyticsPanel() {
  const stats = [
    { label: "Total views (30d)", value: "1,480" },
    { label: "WhatsApp leads (30d)", value: "22" },
    { label: "M-Pesa deposits (30d)", value: "6" },
    { label: "Avg. time to verify", value: "18 hrs" },
    { label: "Listings on 12% rate", value: `${MOCK_AGENT_LISTINGS.filter((l) => l.photographed).length}/${MOCK_AGENT_LISTINGS.length}` },
    { label: "Featured Listings revenue (30d)", value: "KES 8,400" },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="p-4 rounded-2xl border" style={{ borderColor: BRAND.stoneDeep, background: BRAND.white }}>
          <p className="text-xs" style={{ color: BRAND.inkSoft, fontFamily: "Work Sans, sans-serif" }}>{s.label}</p>
          <p style={{ fontFamily: "Fraunces, serif", color: BRAND.ink, fontWeight: 600 }} className="text-2xl mt-1">{s.value}</p>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------- Dashboard ---------------------------------- */
export default function SolsticeAgentDashboard() {
  const [tab, setTab] = useState("listings");

  const panels = {
    listings: <ListingsPanel />,
    leads: <LeadsPanel />,
    verification: <VerificationPanel />,
    partners: <PartnersPanel />,
    reviews: <ReviewsPanel />,
    analytics: <AnalyticsPanel />,
  };

  const titles = {
    listings: "My listings",
    leads: "Leads",
    verification: "Verification queue",
    partners: "Partner network",
    reviews: "Reviews",
    analytics: "Performance",
  };

  return (
    <div style={{ background: BRAND.stone, minHeight: "100vh" }}>
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-8 flex gap-8">
        <Sidebar tab={tab} setTab={setTab} />
        <div className="flex-1 min-w-0">
          <h1 style={{ fontFamily: "Fraunces, serif", color: BRAND.ink, fontWeight: 500 }} className="text-2xl mb-5">
            {titles[tab]}
          </h1>
          {panels[tab]}
        </div>
      </div>
    </div>
  );
}
