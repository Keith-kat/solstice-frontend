import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  MapPin,
  ShieldCheck,
  MessageCircle,
  X,
  ChevronRight,
  ChevronLeft,
  BedDouble,
  Bath,
  Ruler,
  Star,
  Phone,
  CheckCircle2,
  Upload,
  Sun,
} from "lucide-react";

/* ------------------------------------------------------------------------
   SOLSTICE — real estate marketplace for Nairobi, Kenya & East Africa
   ------------------------------------------------------------------------
   Brand idea: "Solstice" marks the point where the sun turns — the app is
   the turning point where informal, low-trust WhatsApp property listings
   become verified, professional ones. The visual language leans on that:
   a dusk-indigo base, a single warm gold "sunline" as the recurring motif,
   and a red-oxide rust borrowed from Nairobi's roofing tiles. Verified
   listings carry a circular wax-seal badge — a deliberate nod to the
   title-deed/document credibility the business is selling against WhatsApp.

   This file is a self-contained starting point: drop it into a Vite/CRA
   React project with Tailwind configured, install lucide-react, and it
   runs. Swap MOCK_LISTINGS for real API data and wire the two flagged
   integration points (WhatsApp deep link, M-Pesa STK push) to your
   backend — see solstice-backend/ for a matching scaffold.
-------------------------------------------------------------------------*/

const FONT_IMPORT_TAG =
  '<link rel="preconnect" href="https://fonts.googleapis.com">' +
  '<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Work+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">';
// Add the tag above to your index.html <head>. Left as a runtime <style>
// import here too, so the file still looks right if dropped straight in.

export const BRAND = {
  ink: "#1C2B45", // dusk indigo — nav, headings, primary text
  inkSoft: "#4A5568",
  stone: "#EBE6DA", // warm, slightly grey stone — page background
  stoneDeep: "#DED7C4",
  gold: "#C6892E", // the "sunline" — CTAs, prices, active states
  goldSoft: "#E9C68A",
  rust: "#8B4530", // red-oxide roofing — land & lease accents
  sage: "#4B6A4F", // verified / trust
  white: "#FFFEFB",
};

const WHATSAPP_NUMBER = "254700000000"; // replace with the business line

/* ------------------------- Revenue model constants -------------------------
   These four blocks are the direct product expression of the business-model
   decisions: host-only commission (zero guest fees is a customer-facing
   trust signal, not just a pricing choice), Featured Listings as the
   Phase-1 SaaS add-on, Photography & Verification bundled into onboarding,
   and Partner Perks as a Phase-2+ ancillary marketplace.
-----------------------------------------------------------------------------*/
const HOST_COMMISSION_RATE = "12–15%"; // charged to the host only
const AGENT_COMMISSION_NOTE =
  "Solstice charges hosts a 12–15% success commission, taken only when a booking completes. Guests never pay a booking fee — that's the price advantage over Airbnb's service fees.";

const BOOST_TIERS = [
  { id: "3d", label: "3 days", price: 500 },
  { id: "7d", label: "7 days", price: 1200 },
  { id: "14d", label: "14 days", price: 2000 },
];

const PHOTOGRAPHY_FEE = 3500; // one-time, KES — local freelance photographer visit + verification

const PARTNER_ADDONS = [
  { id: "airport", label: "Airport transfer", price: 2500, cut: 0.15 },
  { id: "cleaning", label: "End-of-stay cleaning", price: 1800, cut: 0.15 },
];

// Phase-3 regional expansion stub — Kenya is live, the rest are previewed
// in the UI so the market-switcher isn't a surprise to add later.
const MARKETS = [
  { code: "KE", currency: "KES", label: "Kenya", enabled: true },
  { code: "TZ", currency: "TZS", label: "Tanzania", enabled: false },
  { code: "UG", currency: "UGX", label: "Uganda", enabled: false },
  { code: "RW", currency: "RWF", label: "Rwanda", enabled: false },
];

const CATEGORIES = [
  { id: "nightly", label: "Nightly stays", unit: "/ night" },
  { id: "weekly", label: "Weekly stays", unit: "/ week" },
  { id: "monthly", label: "Monthly stays", unit: "/ month" },
  { id: "lease", label: "Long-term lease", unit: "/ month" },
  { id: "buy", label: "Houses for sale", unit: "" },
  { id: "land", label: "Land for sale", unit: "" },
];

const MOCK_LISTINGS = [
  {
    id: "L-1042",
    title: "Two-bedroom garden apartment",
    area: "Kilimani, Nairobi",
    category: "nightly",
    price: 6500,
    beds: 2,
    baths: 2,
    size: "95 m²",
    verified: true,
    photographed: true,
    featuredUntil: "2026-09-20T00:00:00Z", // still boosted — see BOOST_TIERS
    rating: 4.8,
    reviews: 34,
    agent: "Wanjiru M. — Nyumba Bora Agents",
    photo:
      "linear-gradient(135deg,#8B4530 0%,#C6892E 45%,#EBE6DA 100%)",
    tags: ["Backup power", "Gated compound", "Wi-Fi"],
  },
  {
    id: "L-1058",
    title: "Furnished bedsit near the CBD",
    area: "Upper Hill, Nairobi",
    category: "weekly",
    price: 18000,
    beds: 1,
    baths: 1,
    size: "40 m²",
    verified: true,
    photographed: false,
    featuredUntil: null,
    rating: 4.6,
    reviews: 19,
    agent: "Otieno Realty",
    photo: "linear-gradient(135deg,#1C2B45 0%,#4B6A4F 100%)",
    tags: ["Serviced weekly", "Parking"],
  },
  {
    id: "L-1071",
    title: "Family maisonette, quiet cul-de-sac",
    area: "Ruaka, Kiambu",
    category: "monthly",
    price: 65000,
    beds: 3,
    baths: 3,
    size: "180 m²",
    verified: false,
    photographed: false,
    featuredUntil: null,
    rating: 4.3,
    reviews: 8,
    agent: "Direct owner",
    photo: "linear-gradient(135deg,#C6892E 0%,#8B4530 100%)",
    tags: ["Borehole water", "DSQ"],
  },
  {
    id: "L-1090",
    title: "3-year lease, standalone bungalow",
    area: "Nyali, Mombasa",
    category: "lease",
    price: 85000,
    beds: 4,
    baths: 3,
    size: "220 m²",
    verified: true,
    photographed: true,
    featuredUntil: null,
    rating: 4.9,
    reviews: 12,
    agent: "Pwani Homes & Land",
    photo: "linear-gradient(135deg,#4B6A4F 0%,#1C2B45 100%)",
    tags: ["Sea breeze", "Staff quarters", "Solar"],
  },
  {
    id: "L-1103",
    title: "Off-plan 4-bedroom townhouse",
    area: "Kitengela, Kajiado",
    category: "buy",
    price: 12500000,
    beds: 4,
    baths: 4,
    size: "210 m²",
    verified: true,
    photographed: true,
    featuredUntil: null,
    rating: 4.7,
    reviews: 5,
    agent: "Rift Valley Properties",
    photo: "linear-gradient(135deg,#8B4530 0%,#1C2B45 100%)",
    tags: ["Title deed ready", "Gated estate"],
  },
  {
    id: "L-1118",
    title: "Half-acre plot, tarmac access",
    area: "Kangundo Road, Machakos",
    category: "land",
    price: 3200000,
    beds: null,
    baths: null,
    size: "0.5 acre",
    verified: true,
    photographed: false,
    featuredUntil: null,
    rating: 4.5,
    reviews: 3,
    agent: "Machakos Land Brokers",
    photo: "linear-gradient(135deg,#C6892E 0%,#4B6A4F 100%)",
    tags: ["Ready title", "Electricity nearby"],
  },
  {
    id: "L-1129",
    title: "Studio with rooftop terrace",
    area: "Westlands, Nairobi",
    category: "nightly",
    price: 8200,
    beds: 1,
    baths: 1,
    size: "35 m²",
    verified: true,
    photographed: true,
    featuredUntil: "2026-09-18T00:00:00Z",
    rating: 4.9,
    reviews: 61,
    agent: "Westside Stays",
    photo: "linear-gradient(135deg,#1C2B45 0%,#C6892E 100%)",
    tags: ["City view", "Self check-in"],
  },
  {
    id: "L-1140",
    title: "Eighth-acre residential plot",
    area: "Kiambu Road",
    category: "land",
    price: 4800000,
    beds: null,
    baths: null,
    size: "0.125 acre",
    verified: false,
    photographed: false,
    featuredUntil: null,
    rating: 4.1,
    reviews: 2,
    agent: "Direct owner",
    photo: "linear-gradient(135deg,#4B6A4F 0%,#C6892E 100%)",
    tags: ["Water connection", "Fenced"],
  },
];

function formatKES(n) {
  if (n == null) return "";
  return "KES " + n.toLocaleString("en-KE");
}

function isFeatured(listing) {
  return Boolean(listing.featuredUntil) && new Date(listing.featuredUntil) > new Date();
}

/* -------------------------- Low-data image loading --------------------------
   PWA / low-bandwidth differentiator: real photos should load a small
   blurred placeholder first, then swap to full resolution once it's
   fetched — so a listing is usable on a weak 3G connection in Naivasha or
   Diani instead of showing a blank card. This mock uses CSS gradients as
   stand-ins for photos, so there's nothing to lazy-load yet, but a real
   integration should follow this shape:

     <img
       src={listing.photoLowRes}      // a ~5–10kb blurred/low-res version
       srcSet={`${listing.photoLowRes} 1x`}
       loading="lazy"
       decoding="async"
       onLoad={(e) => { const full = new Image(); full.src = listing.photoFullRes;
         full.onload = () => { e.target.src = listing.photoFullRes; }; }}
     />

   Combined with a service worker that caches listing JSON and low-res
   images (see the PWA manifest/service-worker note in the README), this
   is what "usable on spotty 3G" actually takes — not just a claim.
--------------------------------------------------------------------------*/

/* NEW — network-aware "lightweight mode": this is the one piece of the
   low-data story that's real right now, not just a comment. On a
   detected 2G/3G connection we skip loading the two Google Fonts (the
   biggest single asset on the page) and fall back to the system serif/
   sans already named in every font-family string below, and we show a
   small banner so it reads as a deliberate feature, not a broken page.
   The Network Information API isn't supported in Safari, so this
   degrades silently to "fast" there — never worse than the normal page. */
function useConnectionQuality() {
  const [quality, setQuality] = useState("fast");
  useEffect(() => {
    const conn =
      typeof navigator !== "undefined" &&
      (navigator.connection || navigator.mozConnection || navigator.webkitConnection);
    if (!conn) return;
    const update = () =>
      setQuality(["slow-2g", "2g", "3g"].includes(conn.effectiveType) ? "slow" : "fast");
    update();
    conn.addEventListener("change", update);
    return () => conn.removeEventListener("change", update);
  }, []);
  return quality;
}

function DataSaverBanner() {
  return (
    <div
      className="text-center text-xs py-1.5"
      style={{ background: BRAND.goldSoft, color: BRAND.ink, fontFamily: "Work Sans, sans-serif" }}
    >
      Lightweight mode — using smaller fonts and images for your connection
    </div>
  );
}

/* --------------------------- Wax-seal badge ---------------------------- */
function VerifiedSeal({ size = 22 }) {
  return (
    <span
      title="Verified by Solstice"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: "9999px",
        background: BRAND.sage,
        border: `2px solid ${BRAND.white}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
        flexShrink: 0,
      }}
    >
      <CheckCircle2 size={size * 0.66} color={BRAND.white} strokeWidth={2.5} />
    </span>
  );
}

/* ------------------------------- Header --------------------------------- */
function Header({ onListProperty }) {
  return (
    <header
      className="sticky top-0 z-30 border-b"
      style={{ background: BRAND.stone, borderColor: BRAND.stoneDeep }}
    >
      <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sun size={22} color={BRAND.gold} strokeWidth={2.25} />
          <span
            style={{
              fontFamily: "Fraunces, serif",
              fontWeight: 600,
              fontSize: "1.35rem",
              color: BRAND.ink,
              letterSpacing: "-0.01em",
            }}
          >
            Solstice
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-7 text-sm" style={{ color: BRAND.inkSoft, fontFamily: "Work Sans, sans-serif" }}>
          <a href="#browse" className="hover:opacity-70">Browse homes</a>
          <a href="#land" className="hover:opacity-70">Land</a>
          <a href="#trust" className="hover:opacity-70">How verification works</a>
        </nav>
        <div className="flex items-center gap-3">
          {/* Phase-3 regional expansion preview — a disabled market switcher
              costs nothing to ship now and means the Kampala/Dar/Kigali
              rollout isn't a surprise UI change later. */}
          <div className="hidden lg:flex items-center gap-1 text-xs" style={{ fontFamily: "Work Sans, sans-serif" }}>
            {MARKETS.map((m) => (
              <span
                key={m.code}
                title={m.enabled ? m.label : `${m.label} — coming in regional expansion`}
                className="px-2 py-1 rounded-md"
                style={{
                  color: m.enabled ? BRAND.ink : "#B7BEC9",
                  background: m.enabled ? BRAND.stoneDeep : "transparent",
                  fontWeight: m.enabled ? 600 : 400,
                }}
              >
                {m.code}
              </span>
            ))}
          </div>
          <button
            onClick={onListProperty}
            className="text-sm font-medium px-4 py-2 rounded-full transition-transform hover:scale-[1.03]"
            style={{ background: BRAND.ink, color: BRAND.white, fontFamily: "Work Sans, sans-serif" }}
          >
            List your property
          </button>
        </div>
      </div>
    </header>
  );
}

/* --------------------------------- Hero ---------------------------------- */
function Hero({ query, setQuery, activeCategory, setActiveCategory }) {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: BRAND.ink }}
    >
      {/* the sunline — a single deliberate motif, not decoration scattered everywhere */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1200 260"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full opacity-90"
      >
        <defs>
          <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND.gold} stopOpacity="0.9" />
            <stop offset="100%" stopColor={BRAND.gold} stopOpacity="0" />
          </linearGradient>
        </defs>
        <circle cx="1000" cy="230" r="150" fill="url(#sun)" />
        <line x1="0" y1="230" x2="1200" y2="230" stroke={BRAND.goldSoft} strokeOpacity="0.35" strokeWidth="1" />
      </svg>

      <div className="relative max-w-6xl mx-auto px-5 md:px-8 pt-16 pb-10 md:pt-24 md:pb-14">
        <p
          style={{ color: BRAND.goldSoft, fontFamily: "Work Sans, sans-serif" }}
          className="text-sm mb-3 max-w-md"
        >
          For every listing your agent used to send you on WhatsApp
        </p>
        <h1
          style={{
            fontFamily: "Fraunces, serif",
            color: BRAND.white,
            fontWeight: 500,
            lineHeight: 1.05,
          }}
          className="text-4xl md:text-6xl max-w-2xl"
        >
          A verified place for every stay, lease, and plot in East Africa.
        </h1>
        <p
          style={{ color: "#C9D0DE", fontFamily: "Work Sans, sans-serif" }}
          className="mt-5 max-w-lg text-[15px] leading-relaxed"
        >
          Solstice turns the listings your usual agents already have into
          verified profiles buyers and tenants can trust — one night, one
          season, or one lifetime.
        </p>

        {/* Search card */}
        <div
          className="mt-9 rounded-2xl p-3 md:p-4 flex flex-col md:flex-row gap-3 md:items-center max-w-3xl"
          style={{ background: BRAND.white }}
        >
          <div className="flex items-center gap-2 flex-1 px-2">
            <Search size={18} color={BRAND.inkSoft} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by area — Kilimani, Nyali, Kajiado…"
              className="w-full outline-none text-sm py-2 bg-transparent"
              style={{ color: BRAND.ink, fontFamily: "Work Sans, sans-serif" }}
            />
          </div>
          <button
            className="text-sm font-medium px-6 py-2.5 rounded-xl whitespace-nowrap"
            style={{ background: BRAND.gold, color: BRAND.white, fontFamily: "Work Sans, sans-serif" }}
          >
            Search listings
          </button>
        </div>

        {/* Category tabs — styled like ledger tabs, not pill buttons, to
            echo the "documents & deeds" trust motif */}
        <div className="mt-6 flex flex-wrap gap-2 max-w-3xl">
          {CATEGORIES.map((c) => {
            const active = activeCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className="text-sm px-4 py-2 rounded-t-lg border-b-2 transition-colors"
                style={{
                  fontFamily: "Work Sans, sans-serif",
                  color: active ? BRAND.white : "#AEB6C6",
                  borderColor: active ? BRAND.gold : "transparent",
                  background: active ? "rgba(255,255,255,0.06)" : "transparent",
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Differentiation strip — the three things Airbnb doesn't do well
            in East Africa, stated plainly where a guest is already looking,
            not buried in a footer. */}
        <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 max-w-3xl text-[13px]" style={{ fontFamily: "Work Sans, sans-serif" }}>
          <span className="flex items-center gap-1.5" style={{ color: BRAND.goldSoft }}>
            <ShieldCheck size={14} /> M-Pesa checkout, 0% guest fees
          </span>
          <span className="flex items-center gap-1.5" style={{ color: BRAND.goldSoft }}>
            <CheckCircle2 size={14} /> Verified in person, not just on paper
          </span>
          <span className="flex items-center gap-1.5" style={{ color: BRAND.goldSoft }}>
            <MessageCircle size={14} /> Confirmation & house rules on WhatsApp
          </span>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Property card ----------------------------- */
function PropertyCard({ listing, onOpen, featured }) {
  const cat = CATEGORIES.find((c) => c.id === listing.category);
  return (
    <button
      onClick={() => onOpen(listing)}
      className={`text-left rounded-2xl overflow-hidden border transition-shadow hover:shadow-lg ${
        featured ? "md:col-span-2 md:row-span-2" : ""
      }`}
      style={{ borderColor: BRAND.stoneDeep, background: BRAND.white }}
    >
      <div
        className={`w-full ${featured ? "h-64 md:h-full md:min-h-[260px]" : "h-40"} relative`}
        style={{ background: listing.photo }}
      >
        {listing.verified && (
          <div className="absolute top-3 left-3">
            <VerifiedSeal />
          </div>
        )}
        {isFeatured(listing) && (
          <div
            className="absolute top-3 right-3 text-[11px] font-semibold px-2 py-1 rounded-full flex items-center gap-1"
            style={{ background: BRAND.gold, color: BRAND.white, fontFamily: "Work Sans, sans-serif" }}
          >
            <Star size={10} fill={BRAND.white} /> Featured
          </div>
        )}
        <div
          className="absolute bottom-3 right-3 text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ background: "rgba(28,43,69,0.75)", color: BRAND.white, fontFamily: "Work Sans, sans-serif" }}
        >
          {cat?.label}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3
            style={{ fontFamily: "Fraunces, serif", color: BRAND.ink, fontWeight: 500 }}
            className={featured ? "text-xl" : "text-base"}
          >
            {listing.title}
          </h3>
        </div>
        <p
          className="mt-1 flex items-center gap-1 text-[13px]"
          style={{ color: BRAND.inkSoft, fontFamily: "Work Sans, sans-serif" }}
        >
          <MapPin size={13} /> {listing.area}
        </p>

        <div className="mt-3 flex items-center gap-4 text-[13px]" style={{ color: BRAND.inkSoft, fontFamily: "Work Sans, sans-serif" }}>
          {listing.beds != null && (
            <span className="flex items-center gap-1"><BedDouble size={14} /> {listing.beds}</span>
          )}
          {listing.baths != null && (
            <span className="flex items-center gap-1"><Bath size={14} /> {listing.baths}</span>
          )}
          <span className="flex items-center gap-1"><Ruler size={14} /> {listing.size}</span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span style={{ fontFamily: "Fraunces, serif", color: BRAND.gold, fontWeight: 600 }} className="text-lg">
            {formatKES(listing.price)}
            <span style={{ color: BRAND.inkSoft, fontFamily: "Work Sans, sans-serif", fontWeight: 400 }} className="text-xs ml-1">
              {cat?.unit}
            </span>
          </span>
          <span className="flex items-center gap-1 text-[13px]" style={{ color: BRAND.inkSoft, fontFamily: "Work Sans, sans-serif" }}>
            <Star size={13} fill={BRAND.gold} color={BRAND.gold} /> {listing.rating}
            <span style={{ color: "#9AA1AE" }}>({listing.reviews})</span>
          </span>
        </div>
      </div>
    </button>
  );
}
/* Reviews shown above are only ever the ones both sides submitted — see
   the double-blind logic note in PropertyModal below and reviews.js in
   the backend, which is where that's actually enforced. */

/* -------------------------- Property detail modal -------------------------- */
function PropertyModal({ listing, onClose, onReserve }) {
  if (!listing) return null;
  const cat = CATEGORIES.find((c) => c.id === listing.category);
  const waText = encodeURIComponent(
    `Hi, I'm interested in "${listing.title}" (${listing.id}) in ${listing.area} listed on Solstice.`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 p-0 md:p-6">
      <div
        className="w-full md:max-w-2xl md:rounded-2xl overflow-hidden max-h-[92vh] overflow-y-auto"
        style={{ background: BRAND.white }}
      >
        <div className="h-52 relative" style={{ background: listing.photo }}>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(28,43,69,0.75)" }}
          >
            <X size={16} color={BRAND.white} />
          </button>
          {listing.verified && (
            <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.9)" }}>
              <VerifiedSeal size={16} />
              <span style={{ fontFamily: "Work Sans, sans-serif", fontSize: 12, color: BRAND.ink }}>Verified listing</span>
            </div>
          )}
        </div>

        <div className="p-6">
          <p style={{ color: BRAND.gold, fontFamily: "Work Sans, sans-serif" }} className="text-xs font-medium">
            {cat?.label} · {listing.id}
          </p>
          <h2 style={{ fontFamily: "Fraunces, serif", color: BRAND.ink, fontWeight: 500 }} className="text-2xl mt-1">
            {listing.title}
          </h2>
          <div className="flex items-center justify-between mt-1">
            <p className="flex items-center gap-1 text-sm" style={{ color: BRAND.inkSoft, fontFamily: "Work Sans, sans-serif" }}>
              <MapPin size={14} /> {listing.area}
            </p>
            <p
              title="Guest and host reviews are both hidden until each side has submitted one, or 14 days pass — so no one holds back an honest review out of fear of retaliation."
              className="flex items-center gap-1 text-sm"
              style={{ color: BRAND.inkSoft, fontFamily: "Work Sans, sans-serif" }}
            >
              <Star size={13} fill={BRAND.gold} color={BRAND.gold} /> {listing.rating} ({listing.reviews})
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {listing.photographed && (
              <span
                className="text-xs px-3 py-1 rounded-full flex items-center gap-1"
                style={{ background: `${BRAND.sage}1A`, color: BRAND.sage, fontFamily: "Work Sans, sans-serif" }}
              >
                <CheckCircle2 size={12} /> Professionally photographed by Solstice
              </span>
            )}
            {listing.tags.map((t) => (
              <span
                key={t}
                className="text-xs px-3 py-1 rounded-full"
                style={{ background: BRAND.stone, color: BRAND.inkSoft, fontFamily: "Work Sans, sans-serif" }}
              >
                {t}
              </span>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-6 text-sm" style={{ color: BRAND.ink, fontFamily: "Work Sans, sans-serif" }}>
            {listing.beds != null && <span className="flex items-center gap-1.5"><BedDouble size={16} /> {listing.beds} bed</span>}
            {listing.baths != null && <span className="flex items-center gap-1.5"><Bath size={16} /> {listing.baths} bath</span>}
            <span className="flex items-center gap-1.5"><Ruler size={16} /> {listing.size}</span>
          </div>

          <div className="mt-5 pt-5 border-t flex items-center justify-between" style={{ borderColor: BRAND.stoneDeep }}>
            <div>
              <p className="text-xs" style={{ color: BRAND.inkSoft, fontFamily: "Work Sans, sans-serif" }}>Listed by</p>
              <p style={{ color: BRAND.ink, fontFamily: "Work Sans, sans-serif", fontWeight: 500 }}>{listing.agent}</p>
            </div>
            <div className="text-right">
              <p style={{ fontFamily: "Fraunces, serif", color: BRAND.gold, fontWeight: 600 }} className="text-xl">
                {formatKES(listing.price)}
              </p>
              <p className="text-xs" style={{ color: BRAND.inkSoft, fontFamily: "Work Sans, sans-serif" }}>
                {cat?.unit || "one-time"} · no guest fee added
              </p>
            </div>
          </div>

          <p className="mt-4 text-xs flex items-center gap-1.5" style={{ color: BRAND.inkSoft, fontFamily: "Work Sans, sans-serif" }}>
            <MessageCircle size={13} /> Booking confirmation, house rules, and the host's number are sent straight to your WhatsApp.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 text-sm font-medium py-3 rounded-xl"
              style={{ background: BRAND.sage, color: BRAND.white, fontFamily: "Work Sans, sans-serif" }}
            >
              <MessageCircle size={16} /> Message agent
            </a>
            <button
              onClick={() => onReserve(listing)}
              className="flex items-center justify-center gap-2 text-sm font-medium py-3 rounded-xl"
              style={{ background: BRAND.gold, color: BRAND.white, fontFamily: "Work Sans, sans-serif" }}
            >
              {listing.category === "buy" || listing.category === "land"
                ? "Pay reservation deposit"
                : "Reserve with M-Pesa"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ M-Pesa modal ------------------------------ */
function MpesaModal({ listing, onClose }) {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | failed
  const [addons, setAddons] = useState([]); // Partner Perks opt-in — see PARTNER_ADDONS

  if (!listing) return null;
  const isStay = !["buy", "land"].includes(listing.category);
  const addonsTotal = PARTNER_ADDONS.filter((a) => addons.includes(a.id)).reduce((s, a) => s + a.price, 0);
  const deposit = 5000 + addonsTotal;

  const toggleAddon = (id) =>
    setAddons((cur) => (cur.includes(id) ? cur.filter((a) => a !== id) : [...cur, id]));

  // INTEGRATION POINT: replace this mock with a POST to your backend,
  // which calls Safaricom's Daraja STK Push API (see solstice-backend/).
  // Partner add-ons ride the same STK push as a single combined amount —
  // Solstice takes its cut (PARTNER_ADDONS[].cut) and pays the partner out
  // the same way a host gets paid, via the escrow release in bookings.js.
  const submit = (e) => {
    e.preventDefault();
    if (!/^0[17]\d{8}$/.test(phone)) return;
    setStatus("sending");
    setTimeout(() => setStatus("sent"), 1400); // mock network round-trip
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: BRAND.white }}>
        <div className="flex items-center justify-between">
          <h3 style={{ fontFamily: "Fraunces, serif", color: BRAND.ink }} className="text-lg font-medium">
            {status === "sent" ? "Check your phone" : "M-Pesa reservation"}
          </h3>
          <button onClick={onClose}><X size={18} color={BRAND.inkSoft} /></button>
        </div>

        {status !== "sent" ? (
          <form onSubmit={submit} className="mt-4">
            <p className="text-sm mb-4" style={{ color: BRAND.inkSoft, fontFamily: "Work Sans, sans-serif" }}>
              A refundable deposit of <strong style={{ color: BRAND.ink }}>KES 5,000</strong> holds{" "}
              <em>{listing.title}</em> while paperwork is confirmed. We hold it in escrow and only
              release it to the host 24 hours after check-in.
            </p>

            {isStay && (
              <div className="mb-4">
                <p className="text-xs mb-2" style={{ color: BRAND.inkSoft, fontFamily: "Work Sans, sans-serif" }}>
                  Add a local partner service (optional)
                </p>
                <div className="space-y-1.5">
                  {PARTNER_ADDONS.map((a) => (
                    <label key={a.id} className="flex items-center justify-between text-sm px-3 py-2 rounded-lg border cursor-pointer" style={{ borderColor: BRAND.stoneDeep, fontFamily: "Work Sans, sans-serif" }}>
                      <span className="flex items-center gap-2">
                        <input type="checkbox" checked={addons.includes(a.id)} onChange={() => toggleAddon(a.id)} />
                        {a.label}
                      </span>
                      <span style={{ color: BRAND.inkSoft }}>{formatKES(a.price)}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <label className="text-xs" style={{ color: BRAND.inkSoft, fontFamily: "Work Sans, sans-serif" }}>
              M-Pesa phone number — no card needed
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="07XXXXXXXX"
              className="w-full mt-1 mb-4 px-3 py-2.5 rounded-lg border text-sm outline-none"
              style={{ borderColor: BRAND.stoneDeep, fontFamily: "Work Sans, sans-serif" }}
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full py-3 rounded-xl text-sm font-medium"
              style={{ background: BRAND.gold, color: BRAND.white, fontFamily: "Work Sans, sans-serif", opacity: status === "sending" ? 0.7 : 1 }}
            >
              {status === "sending" ? "Sending prompt…" : `Send STK push — ${formatKES(deposit)}`}
            </button>
          </form>
        ) : (
          <p className="mt-4 text-sm" style={{ color: BRAND.inkSoft, fontFamily: "Work Sans, sans-serif" }}>
            We've sent an M-Pesa prompt to {phone}. Enter your PIN to confirm the deposit
            for <em>{listing.title}</em>. Your confirmation and the host's contact will follow on WhatsApp.
          </p>
        )}
      </div>
    </div>
  );
}

/* --------------------------- List-your-property form --------------------------- */
function ListPropertyModal({ onClose }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: "",
    area: "",
    category: "nightly",
    price: "",
    contact: "",
    wantsPhotography: false,
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggle = (k) => () => setForm((f) => ({ ...f, [k]: !f[k] }));

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 p-0 md:p-6">
      <div className="w-full md:max-w-lg md:rounded-2xl overflow-hidden max-h-[92vh] overflow-y-auto p-6" style={{ background: BRAND.white }}>
        <div className="flex items-center justify-between mb-1">
          <h2 style={{ fontFamily: "Fraunces, serif", color: BRAND.ink }} className="text-xl font-medium">
            List a property
          </h2>
          <button onClick={onClose}><X size={18} color={BRAND.inkSoft} /></button>
        </div>
        <p className="text-sm mb-5" style={{ color: BRAND.inkSoft, fontFamily: "Work Sans, sans-serif" }}>
          {AGENT_COMMISSION_NOTE} Every listing goes through a short verification
          check before it goes live — that's the trust WhatsApp couldn't give your clients.
        </p>

        {step === 1 && (
          <div className="space-y-3">
            <Field label="Property title">
              <input value={form.title} onChange={set("title")} placeholder="e.g. Two-bedroom garden apartment"
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none" style={{ borderColor: BRAND.stoneDeep, fontFamily: "Work Sans, sans-serif" }} />
            </Field>
            <Field label="Area / neighbourhood">
              <input value={form.area} onChange={set("area")} placeholder="e.g. Kilimani, Nairobi"
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none" style={{ borderColor: BRAND.stoneDeep, fontFamily: "Work Sans, sans-serif" }} />
            </Field>
            <Field label="Listing type">
              <select value={form.category} onChange={set("category")}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none bg-white" style={{ borderColor: BRAND.stoneDeep, fontFamily: "Work Sans, sans-serif" }}>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Price (KES)">
              <input value={form.price} onChange={set("price")} placeholder="e.g. 65000" inputMode="numeric"
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none" style={{ borderColor: BRAND.stoneDeep, fontFamily: "Work Sans, sans-serif" }} />
            </Field>
            <button onClick={() => setStep(2)}
              className="w-full mt-2 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
              style={{ background: BRAND.ink, color: BRAND.white, fontFamily: "Work Sans, sans-serif" }}>
              Continue <ChevronRight size={16} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <div
              className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center py-8 text-center"
              style={{ borderColor: BRAND.stoneDeep }}
            >
              <Upload size={22} color={BRAND.inkSoft} />
              <p className="text-sm mt-2" style={{ color: BRAND.inkSoft, fontFamily: "Work Sans, sans-serif" }}>
                Photos and title deed / lease copy for verification
              </p>
              <p className="text-xs mt-1" style={{ color: "#9AA1AE", fontFamily: "Work Sans, sans-serif" }}>
                (upload wired to your storage backend)
              </p>
            </div>

            {/* Localized Value-Added Service #1, sold at the moment it's
                most relevant — right when the host is about to upload
                phone-camera photos themselves. The discounted commission
                is the incentive: it makes "get verified properly" the
                obviously better choice, not just an upsell. */}
            <label
              className="flex items-start gap-3 text-sm px-3 py-3 rounded-xl border cursor-pointer"
              style={{ borderColor: BRAND.stoneDeep, fontFamily: "Work Sans, sans-serif" }}
            >
              <input type="checkbox" className="mt-0.5" checked={form.wantsPhotography} onChange={toggle("wantsPhotography")} />
              <span>
                <span style={{ color: BRAND.ink, fontWeight: 500 }}>
                  Send a local photographer — {formatKES(PHOTOGRAPHY_FEE)} one-time
                </span>
                <br />
                <span style={{ color: BRAND.inkSoft }}>
                  Professional photos plus an in-person verification visit. Photographed
                  listings also get Solstice's lower 12% commission instead of 15%.
                </span>
              </span>
            </label>

            <Field label="Your phone / WhatsApp number">
              <input value={form.contact} onChange={set("contact")} placeholder="07XXXXXXXX"
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none" style={{ borderColor: BRAND.stoneDeep, fontFamily: "Work Sans, sans-serif" }} />
            </Field>
            <div className="flex gap-3 mt-2">
              <button onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 border"
                style={{ borderColor: BRAND.stoneDeep, color: BRAND.ink, fontFamily: "Work Sans, sans-serif" }}>
                <ChevronLeft size={16} /> Back
              </button>
              <button onClick={() => setStep(3)}
                className="flex-1 py-3 rounded-xl text-sm font-medium"
                style={{ background: BRAND.gold, color: BRAND.white, fontFamily: "Work Sans, sans-serif" }}>
                Submit for verification
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="py-6 text-center">
            <div className="mx-auto mb-3"><VerifiedSeal size={40} /></div>
            <h3 style={{ fontFamily: "Fraunces, serif", color: BRAND.ink }} className="text-lg font-medium">
              Submitted for verification
            </h3>
            <p className="text-sm mt-2" style={{ color: BRAND.inkSoft, fontFamily: "Work Sans, sans-serif" }}>
              Our team typically reviews title/lease documents within one business day,
              then your listing goes live with a verified badge
              {form.wantsPhotography ? " and a scheduled photography visit" : ""}.
              You'll be charged Solstice's {form.wantsPhotography ? "12%" : "15%"} commission
              only when a booking or sale actually completes — nothing upfront.
            </p>
            <p className="text-xs mt-3" style={{ color: BRAND.inkSoft, fontFamily: "Work Sans, sans-serif" }}>
              Once live, you can also boost it to the top of search for a week —
              {" "}{BOOST_TIERS.map((t) => `${t.label} ${formatKES(t.price)}`).join(" · ")} — from your dashboard.
            </p>
            <button onClick={onClose} className="mt-5 px-6 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: BRAND.ink, color: BRAND.white, fontFamily: "Work Sans, sans-serif" }}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs block mb-1" style={{ color: BRAND.inkSoft, fontFamily: "Work Sans, sans-serif" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

/* --------------------------------- Trust section --------------------------------- */
function TrustSection() {
  const items = [
    {
      title: "Title & lease checks",
      body: "Every seller-agent and landlord uploads a title deed or lease document before a listing goes live.",
    },
    {
      title: "Verified in person",
      body: "A local Solstice photographer visits, confirms the property matches its listing, and takes the photos themselves — not the host.",
    },
    {
      title: "One phone number per agent",
      body: "Agents are verified against a real phone number and past listing history, not an anonymous WhatsApp broadcast.",
    },
    {
      title: "M-Pesa, not a foreign card",
      body: "Pay the way you already do — no exchange-rate surprises or international card declines that come with Airbnb's checkout.",
    },
    {
      title: "Reviews stay on the listing",
      body: "Past tenants and buyers leave reviews tied to the listing, not lost in a chat thread.",
    },
    {
      title: "Double-blind reviews",
      body: "Guest and host reviews stay hidden until both are in, or 14 days pass — so no one softens an honest review out of fear of payback.",
    },
  ];
  return (
    <section id="trust" className="max-w-6xl mx-auto px-5 md:px-8 py-16">
      <p style={{ color: BRAND.gold, fontFamily: "Work Sans, sans-serif" }} className="text-sm font-medium">
        Why Solstice over a WhatsApp forward — or Airbnb
      </p>
      <h2 style={{ fontFamily: "Fraunces, serif", color: BRAND.ink, fontWeight: 500 }} className="text-3xl mt-2 max-w-xl">
        Verification is the product, not a feature.
      </h2>
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        {items.map((it) => (
          <div key={it.title} className="p-5 rounded-2xl" style={{ background: BRAND.stone }}>
            <VerifiedSeal size={26} />
            <h3 style={{ fontFamily: "Fraunces, serif", color: BRAND.ink }} className="mt-3 font-medium">
              {it.title}
            </h3>
            <p className="text-sm mt-1.5" style={{ color: BRAND.inkSoft, fontFamily: "Work Sans, sans-serif" }}>
              {it.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------- Footer ---------------------------------- */
function Footer() {
  return (
    <footer style={{ background: BRAND.ink }} className="mt-4">
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sun size={18} color={BRAND.gold} />
          <span style={{ fontFamily: "Fraunces, serif", color: BRAND.white }}>Solstice</span>
        </div>
        <p style={{ color: "#8D96A8", fontFamily: "Work Sans, sans-serif" }} className="text-sm">
          {MARKETS.filter((m) => m.enabled).map((m) => m.label).join(" · ")} live ·{" "}
          {MARKETS.filter((m) => !m.enabled).map((m) => m.label).join(", ")} coming in regional expansion
        </p>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          className="flex items-center gap-2 text-sm"
          style={{ color: BRAND.goldSoft, fontFamily: "Work Sans, sans-serif" }}
        >
          <Phone size={14} /> Talk to the team
        </a>
      </div>
    </footer>
  );
}

/* ----------------------------------- App ------------------------------------ */
export default function SolsticeApp() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("nightly");
  const [openListing, setOpenListing] = useState(null);
  const [payingListing, setPayingListing] = useState(null);
  const [showListForm, setShowListForm] = useState(false);

  const connection = useConnectionQuality();

  const filtered = useMemo(() => {
    return MOCK_LISTINGS.filter((l) => l.category === activeCategory)
      .filter((l) =>
        query.trim() === ""
          ? true
          : (l.title + l.area).toLowerCase().includes(query.trim().toLowerCase())
      )
      // Featured Listings monetization made visible: a paid boost actually
      // moves a listing to the front, within its category, for as long as
      // featuredUntil is in the future.
      .sort((a, b) => (isFeatured(b) ? 1 : 0) - (isFeatured(a) ? 1 : 0));
  }, [activeCategory, query]);

  return (
    <div style={{ background: BRAND.stone, minHeight: "100vh" }}>
      {connection === "fast" && (
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Work+Sans:wght@400;500;600;700&display=swap');
        `}</style>
      )}
      {connection === "slow" && <DataSaverBanner />}

      <Header onListProperty={() => setShowListForm(true)} />
      <Hero
        query={query}
        setQuery={setQuery}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      <section id="browse" className="max-w-6xl mx-auto px-5 md:px-8 py-12">
        <div className="flex items-baseline justify-between mb-5">
          <h2 style={{ fontFamily: "Fraunces, serif", color: BRAND.ink, fontWeight: 500 }} className="text-2xl">
            {CATEGORIES.find((c) => c.id === activeCategory)?.label}
          </h2>
          <span style={{ color: BRAND.inkSoft, fontFamily: "Work Sans, sans-serif" }} className="text-sm">
            {filtered.length} listing{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center rounded-2xl" style={{ background: BRAND.white }}>
            <p style={{ fontFamily: "Fraunces, serif", color: BRAND.ink }} className="text-lg">
              Nothing here yet
            </p>
            <p className="text-sm mt-1" style={{ color: BRAND.inkSoft, fontFamily: "Work Sans, sans-serif" }}>
              Try another category, or be the first to list in this one.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-5">
            {filtered.map((l, i) => (
              <PropertyCard key={l.id} listing={l} onOpen={setOpenListing} featured={i === 0} />
            ))}
          </div>
        )}
      </section>

      <TrustSection />
      <Footer />

      <PropertyModal
        listing={openListing}
        onClose={() => setOpenListing(null)}
        onReserve={(l) => {
          setOpenListing(null);
          setPayingListing(l);
        }}
      />
      <MpesaModal listing={payingListing} onClose={() => setPayingListing(null)} />
      {showListForm && <ListPropertyModal onClose={() => setShowListForm(false)} />}
    </div>
  );
}
