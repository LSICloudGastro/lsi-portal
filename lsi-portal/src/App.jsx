import { useState, useEffect, useRef } from "react";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_PARTNER = {
  name: "Marek Kowalski",
  email: "marek.kowalski@restauracja.pl",
  company: "Restauracja Pod Lipą",
  level: "Partner",
  levelNum: 2,
  refCode: "LSI-MK2847",
  refLink: "https://lsi-cloud.pl/?ref=LSI-MK2847",
  joinDate: "2024-03-15",
  totalEarned: 4820,
  pendingPayout: 1140,
  nextPayout: "2026-04-15",
  annualReferrals: 9,
  annualTarget: 15,
  avatar: "MK",
};

const MOCK_REFERRALS = [
  { id: 1, company: "Pizzeria Napoli", contact: "Adam Wiśniewski", product: "Gastro", status: "active", date: "2026-02-10", commission: 480, recurring: 92, months: 7 },
  { id: 2, company: "Hotel Bursztyn", contact: "Kasia Nowak", product: "Hotel", status: "active", date: "2026-01-22", commission: 700, recurring: 138, months: 5 },
  { id: 3, company: "Kawiarnia Złota", contact: "Piotr Zając", product: "Gastro", status: "pending", date: "2026-03-01", commission: 300, recurring: 0, months: 0 },
  { id: 4, company: "Pensjonat Morski", contact: "Zofia Kwiatkowska", product: "Hotel", status: "active", date: "2025-11-18", commission: 650, recurring: 125, months: 10 },
  { id: 5, company: "Food Truck Mama", contact: "Leszek Górski", product: "Gastro", status: "active", date: "2025-10-05", commission: 200, recurring: 54, months: 12 },
  { id: 6, company: "Bistro Uroczysko", contact: "Marta Dąbrowska", product: "Gastro", status: "rejected", date: "2026-02-28", commission: 0, recurring: 0, months: 0 },
  { id: 7, company: "Aparthotel Sunrise", contact: "Tomasz Lewandowski", product: "Hotel", status: "pending", date: "2026-03-08", commission: 700, recurring: 0, months: 0 },
  { id: 8, company: "Jadłodajnia u Basi", contact: "Barbara Kowal", product: "Gastro", status: "active", date: "2025-09-12", commission: 200, recurring: 48, months: 12 },
  { id: 9, company: "Willa Karpacka", contact: "Henryk Mazur", product: "Hotel", status: "active", date: "2026-01-03", commission: 650, recurring: 118, months: 6 },
];

const MOCK_PAYOUTS = [
  { id: 1, date: "2026-03-15", amount: 920, type: "Prowizja cykliczna", status: "paid" },
  { id: 2, date: "2026-02-15", amount: 810, type: "Prowizja cykliczna", status: "paid" },
  { id: 3, date: "2026-01-15", amount: 700, type: "Premia za polecenie", status: "paid" },
  { id: 4, date: "2025-12-15", amount: 650, type: "Prowizja cykliczna", status: "paid" },
  { id: 5, date: "2025-11-15", amount: 480, type: "Premia za polecenie + prowizja", status: "paid" },
  { id: 6, date: "2026-04-15", amount: 1140, type: "Prowizja cykliczna", status: "upcoming" },
];

// ─── REGISTRATION MODAL ───────────────────────────────────────────────────────
function RegisterModal({ onClose, onRegister }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", company: "", phone: "", nip: "", agree: false });
  const [loading, setLoading] = useState(false);
  const [code] = useState("LSI-" + Math.random().toString(36).substr(2, 6).toUpperCase());

  const handle = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(3); }, 1800);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(8,18,38,0.82)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#0e1e3a", border: "1px solid #1e3a5f", borderRadius: 16, width: "100%", maxWidth: 520, padding: "40px 44px", position: "relative", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 18, right: 20, background: "none", border: "none", color: "#5b7fa6", fontSize: 22, cursor: "pointer", lineHeight: 1 }}>×</button>

        {/* Progress */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
          {[1,2,3].map(s => (
            <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: step >= s ? "#3b9de8" : "#1e3a5f", transition: "background 0.4s" }} />
          ))}
        </div>

        {step === 1 && (
          <>
            <h2 style={{ color: "#e8f0fe", fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>Dołącz do programu</h2>
            <p style={{ color: "#6b8cad", fontSize: 13, margin: "0 0 28px" }}>Wypełnij dane, aby otrzymać swój unikalny link partnerski</p>
            {[
              { label: "Imię i nazwisko", key: "name", type: "text", placeholder: "Jan Kowalski" },
              { label: "Adres e-mail", key: "email", type: "email", placeholder: "jan@firma.pl" },
              { label: "Nazwa firmy", key: "company", type: "text", placeholder: "Restauracja / Hotel / Firma" },
              { label: "Telefon kontaktowy", key: "phone", type: "tel", placeholder: "+48 600 000 000" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 16 }}>
                <label style={{ display: "block", color: "#8aaecb", fontSize: 12, fontWeight: 600, marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={e => handle(f.key, e.target.value)}
                  style={{ width: "100%", background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 8, padding: "10px 14px", color: "#e8f0fe", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}
            <button onClick={() => setStep(2)} disabled={!form.name || !form.email || !form.company}
              style={{ width: "100%", padding: "13px", background: form.name && form.email && form.company ? "linear-gradient(135deg,#1e6fb5,#3b9de8)" : "#1e3a5f", border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", marginTop: 8 }}>
              Dalej →
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={{ color: "#e8f0fe", fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>Dane do rozliczeń</h2>
            <p style={{ color: "#6b8cad", fontSize: 13, margin: "0 0 28px" }}>Potrzebujemy tych danych do wystawiania umów i przelewów prowizji</p>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: "#8aaecb", fontSize: 12, fontWeight: 600, marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>NIP (opcjonalnie)</label>
              <input type="text" placeholder="000-000-00-00" value={form.nip} onChange={e => handle("nip", e.target.value)}
                style={{ width: "100%", background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 8, padding: "10px 14px", color: "#e8f0fe", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ background: "#091220", border: "1px solid #1e3a5f", borderRadius: 10, padding: 16, marginBottom: 20, fontSize: 13, color: "#6b8cad", lineHeight: 1.7 }}>
              Twoje wynagrodzenie będzie wypłacane przelewem do <strong style={{ color: "#3b9de8" }}>15. dnia każdego miesiąca</strong> na podstawie umowy zlecenia lub faktury B2B. Minimalna kwota wypłaty: 200 zł.
            </div>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", marginBottom: 20 }}>
              <input type="checkbox" checked={form.agree} onChange={e => handle("agree", e.target.checked)} style={{ marginTop: 2 }} />
              <span style={{ color: "#8aaecb", fontSize: 12, lineHeight: 1.6 }}>Akceptuję <span style={{ color: "#3b9de8" }}>Regulamin Programu Poleceń LSI Cloud</span> oraz wyrażam zgodę na przetwarzanie danych osobowych w celu realizacji programu.</span>
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: "13px", background: "none", border: "1px solid #1e3a5f", borderRadius: 10, color: "#6b8cad", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>← Wróć</button>
              <button onClick={submit} disabled={!form.agree || loading}
                style={{ flex: 2, padding: "13px", background: form.agree ? "linear-gradient(135deg,#1e6fb5,#3b9de8)" : "#1e3a5f", border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                {loading ? "Tworzę konto…" : "Zarejestruj się"}
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#1e6fb5,#3b9de8)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28 }}>✓</div>
            <h2 style={{ color: "#e8f0fe", fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 700, margin: "0 0 10px" }}>Konto aktywowane!</h2>
            <p style={{ color: "#6b8cad", fontSize: 14, margin: "0 0 24px", lineHeight: 1.7 }}>Twój unikalny kod partnerski jest gotowy. Zacznij polecać LSI Cloud i zarabiaj prowizję od każdego wdrożenia!</p>
            <div style={{ background: "#091220", border: "1px solid #3b9de8", borderRadius: 12, padding: "16px 20px", marginBottom: 24 }}>
              <div style={{ color: "#6b8cad", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Twój kod polecający</div>
              <div style={{ color: "#3b9de8", fontSize: 24, fontWeight: 800, fontFamily: "monospace", letterSpacing: "0.15em" }}>{code}</div>
            </div>
            <button onClick={() => { onRegister(); onClose(); }}
              style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg,#1e6fb5,#3b9de8)", border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
              Przejdź do panelu →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── COPY BUTTON ──────────────────────────────────────────────────────────────
function CopyBtn({ text, label = "Kopiuj" }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} style={{ padding: "7px 14px", background: copied ? "#0d5c2e" : "#0a1628", border: `1px solid ${copied ? "#22c55e" : "#1e3a5f"}`, borderRadius: 7, color: copied ? "#22c55e" : "#6b8cad", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}>
      {copied ? "✓ Skopiowano" : label}
    </button>
  );
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
function Badge({ status }) {
  const map = {
    active: { bg: "#0d2e1a", border: "#16a34a", color: "#22c55e", label: "Aktywny" },
    pending: { bg: "#1c1a08", border: "#ca8a04", color: "#eab308", label: "W toku" },
    rejected: { bg: "#1e0f0f", border: "#dc2626", color: "#ef4444", label: "Odrzucony" },
    paid: { bg: "#0d2e1a", border: "#16a34a", color: "#22c55e", label: "Wypłacono" },
    upcoming: { bg: "#0f1e35", border: "#3b9de8", color: "#60a5fa", label: "Nadchodzi" },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{ padding: "3px 10px", background: s.bg, border: `1px solid ${s.border}`, borderRadius: 20, color: s.color, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em" }}>{s.label}</span>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent = "#3b9de8", icon }) {
  return (
    <div style={{ background: "#0e1e3a", border: "1px solid #1e3a5f", borderRadius: 14, padding: "22px 24px", flex: 1, minWidth: 160 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ color: "#5b7fa6", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</span>
        <span style={{ fontSize: 18 }}>{icon}</span>
      </div>
      <div style={{ color: accent, fontSize: 28, fontWeight: 800, fontFamily: "'Sora', sans-serif", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ color: "#5b7fa6", fontSize: 12, marginTop: 8 }}>{sub}</div>}
    </div>
  );
}

// ─── LEVEL BADGE ─────────────────────────────────────────────────────────────
function LevelBadge({ level }) {
  const map = { "Ambasador": "#c084fc", "Partner": "#3b9de8", "Partner Premium": "#f59e0b" };
  return (
    <span style={{ padding: "4px 12px", background: "#0a1628", border: `1px solid ${map[level]}`, borderRadius: 20, color: map[level], fontSize: 12, fontWeight: 700 }}>{level}</span>
  );
}

// ─── LOGIN MODAL ──────────────────────────────────────────────────────────────
function LoginModal({ onClose, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = () => {
    if (!email || !password) { setError("Wypełnij oba pola."); return; }
    setLoading(true);
    setError("");
    setTimeout(() => {
      setLoading(false);
      // Demo: any email/password works
      onLogin();
      onClose();
    }, 1200);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(8,18,38,0.85)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#0e1e3a", border: "1px solid #1e3a5f", borderRadius: 16, width: "100%", maxWidth: 420, padding: "40px 44px", position: "relative", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 18, right: 20, background: "none", border: "none", color: "#5b7fa6", fontSize: 22, cursor: "pointer" }}>×</button>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: "#e8f0fe", marginBottom: 4 }}>LSI Cloud</div>
          <div style={{ color: "#3b9de8", fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}>Portal Partnerski</div>
        </div>
        <h2 style={{ color: "#e8f0fe", fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 700, margin: "0 0 6px" }}>Zaloguj się</h2>
        <p style={{ color: "#6b8cad", fontSize: 13, margin: "0 0 24px" }}>Wpisz dane swojego konta partnerskiego</p>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", color: "#8aaecb", fontSize: 11, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Adres e-mail</label>
          <input type="email" placeholder="jan@firma.pl" value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            style={{ width: "100%", background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 8, padding: "11px 14px", color: "#e8f0fe", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label style={{ display: "block", color: "#8aaecb", fontSize: 11, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Hasło</label>
          <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            style={{ width: "100%", background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 8, padding: "11px 14px", color: "#e8f0fe", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ textAlign: "right", marginBottom: 20 }}>
          <span style={{ color: "#3b9de8", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Zapomniałem hasła</span>
        </div>

        {error && <div style={{ background: "#1e0f0f", border: "1px solid #dc2626", borderRadius: 8, padding: "10px 14px", color: "#ef4444", fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <button onClick={submit} disabled={loading}
          style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg,#1e6fb5,#3b9de8)", border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
          {loading ? "Logowanie…" : "Zaloguj się →"}
        </button>

        <div style={{ textAlign: "center", marginTop: 20, color: "#5b7fa6", fontSize: 13 }}>
          Nie masz konta? <span style={{ color: "#3b9de8", cursor: "pointer", fontWeight: 600 }} onClick={onClose}>Zarejestruj się</span>
        </div>

        <div style={{ marginTop: 20, padding: "12px 14px", background: "#091220", border: "1px solid #1e3a5f", borderRadius: 8, fontSize: 12, color: "#5b7fa6", textAlign: "center" }}>
          🔑 Demo: wpisz dowolny e-mail i hasło
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("dashboard"); // dashboard | referrals | payouts | link
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ company: "", contact: "", email: "", phone: "", product: "Gastro", note: "" });
  const [referrals, setReferrals] = useState(MOCK_REFERRALS);
  const [addSuccess, setAddSuccess] = useState(false);
  const p = MOCK_PARTNER;

  const filtered = filterStatus === "all" ? referrals : referrals.filter(r => r.status === filterStatus);
  const activeCount = referrals.filter(r => r.status === "active").length;
  const pendingCount = referrals.filter(r => r.status === "pending").length;
  const totalRecurring = referrals.filter(r => r.status === "active").reduce((s, r) => s + r.recurring, 0);

  const submitReferral = () => {
    const newRef = {
      id: referrals.length + 1,
      company: addForm.company,
      contact: addForm.contact,
      product: addForm.product,
      status: "pending",
      date: new Date().toISOString().slice(0, 10),
      commission: addForm.product === "Hotel" ? 700 : 300,
      recurring: 0,
      months: 0,
    };
    setReferrals(prev => [newRef, ...prev]);
    setAddSuccess(true);
    setTimeout(() => { setAddSuccess(false); setShowAddModal(false); setAddForm({ company: "", contact: "", email: "", phone: "", product: "Gastro", note: "" }); }, 2000);
  };

  if (!isLoggedIn) {
    return (
      <>
        {showRegister && <RegisterModal onClose={() => setShowRegister(false)} onRegister={() => setIsLoggedIn(true)} />}
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={() => setIsLoggedIn(true)} />}
        <div style={{ minHeight: "100vh", background: "#060f1e", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          {/* Background grid */}
          <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(#1e3a5f22 1px, transparent 1px), linear-gradient(90deg, #1e3a5f22 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />
          {/* Glow */}
          <div style={{ position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 300, background: "radial-gradient(ellipse, #1e6fb522 0%, transparent 70%)", pointerEvents: "none" }} />

          <div style={{ position: "relative", width: "100%", maxWidth: 940, zIndex: 1 }}>
            {/* Hero */}
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#0e1e3a", border: "1px solid #1e3a5f", borderRadius: 100, padding: "6px 18px", marginBottom: 28, fontSize: 13, color: "#3b9de8" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#3b9de8", display: "inline-block", animation: "pulse 2s infinite" }} />
                Program Partnerski LSI Cloud
              </div>
              <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(36px, 6vw, 62px)", fontWeight: 800, color: "#e8f0fe", margin: "0 0 18px", lineHeight: 1.1 }}>
                Polecaj. Zarabiaj.<br /><span style={{ color: "#3b9de8" }}>Rozwijaj sieć.</span>
              </h1>
              <p style={{ color: "#6b8cad", fontSize: 17, maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.7 }}>
                Dołącz do programu LSI Cloud i zarabiaj prowizję za każdą restaurację, hotel lub obiekt noclegowy, który wdrożył nasze rozwiązania dzięki Tobie.
              </p>
              <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={() => setShowRegister(true)}
                  style={{ padding: "14px 32px", background: "linear-gradient(135deg,#1e6fb5,#3b9de8)", border: "none", borderRadius: 12, color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer", boxShadow: "0 8px 32px #3b9de840" }}>
                  Zarejestruj się bezpłatnie →
                </button>
                <button onClick={() => setShowLogin(true)}
                  style={{ padding: "14px 32px", background: "none", border: "1px solid #1e3a5f", borderRadius: 12, color: "#6b8cad", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>
                  Zaloguj się
                </button>
              </div>
            </div>

            {/* Feature cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
              {[
                { icon: "💰", title: "Do 12% prowizji", desc: "Cykliczne wynagrodzenie przez 12–24 miesiące od każdego aktywnego klienta." },
                { icon: "🔗", title: "Unikalny link", desc: "Twój personalny link i kod polecający. Śledzisz każde kliknięcie i konwersję." },
                { icon: "📊", title: "Panel w czasie rzeczywistym", desc: "Status poleceń, naliczone prowizje i historia wypłat — wszystko w jednym miejscu." },
                { icon: "🏆", title: "3 poziomy partnerstwa", desc: "Ambasador, Partner, Partner Premium — im więcej polecasz, tym więcej zarabiasz." },
              ].map(c => (
                <div key={c.title} style={{ background: "#0e1e3a", border: "1px solid #1e3a5f", borderRadius: 14, padding: "24px 22px" }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>{c.icon}</div>
                  <div style={{ color: "#e8f0fe", fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{c.title}</div>
                  <div style={{ color: "#6b8cad", fontSize: 13, lineHeight: 1.6 }}>{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap'); @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      </>
    );
  }

  // ── LOGGED IN DASHBOARD ───────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; background: #0a1628; }
        ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 4px; }
        input:focus, select:focus, textarea:focus { border-color: #3b9de8 !important; outline: none; }
      `}</style>

      {/* Add referral modal */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(6,15,30,0.9)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#0e1e3a", border: "1px solid #1e3a5f", borderRadius: 16, width: "100%", maxWidth: 480, padding: "36px 40px", position: "relative" }}>
            <button onClick={() => setShowAddModal(false)} style={{ position: "absolute", top: 16, right: 18, background: "none", border: "none", color: "#5b7fa6", fontSize: 22, cursor: "pointer" }}>×</button>
            {addSuccess ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                <h3 style={{ color: "#22c55e", fontFamily: "'Sora',sans-serif", fontSize: 20, margin: "0 0 10px" }}>Polecenie wysłane!</h3>
                <p style={{ color: "#6b8cad", fontSize: 14 }}>Nasz dział handlowy skontaktuje się z firmą w ciągu 48 godzin. Będziesz informowany o postępach e-mailem.</p>
              </div>
            ) : (
              <>
                <h3 style={{ color: "#e8f0fe", fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 700, margin: "0 0 6px" }}>Dodaj nowe polecenie</h3>
                <p style={{ color: "#6b8cad", fontSize: 13, margin: "0 0 24px" }}>Podaj dane firmy, którą chcesz polecić LSI Cloud</p>
                {[
                  { label: "Nazwa firmy *", key: "company", type: "text", placeholder: "Restauracja / Hotel / Pensjonat" },
                  { label: "Osoba kontaktowa *", key: "contact", type: "text", placeholder: "Imię i nazwisko" },
                  { label: "E-mail kontaktowy", key: "email", type: "email", placeholder: "kontakt@firma.pl" },
                  { label: "Telefon", key: "phone", type: "tel", placeholder: "+48 600 000 000" },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", color: "#8aaecb", fontSize: 11, fontWeight: 600, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder} value={addForm[f.key]} onChange={e => setAddForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      style={{ width: "100%", background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 8, padding: "10px 14px", color: "#e8f0fe", fontSize: 14 }} />
                  </div>
                ))}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", color: "#8aaecb", fontSize: 11, fontWeight: 600, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Produkt *</label>
                  <select value={addForm.product} onChange={e => setAddForm(prev => ({ ...prev, product: e.target.value }))}
                    style={{ width: "100%", background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 8, padding: "10px 14px", color: "#e8f0fe", fontSize: 14 }}>
                    <option>Gastro</option>
                    <option>Hotel</option>
                  </select>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", color: "#8aaecb", fontSize: 11, fontWeight: 600, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Notatka (opcjonalnie)</label>
                  <textarea placeholder="Dlaczego ta firma potrzebuje LSI Cloud?" value={addForm.note} onChange={e => setAddForm(prev => ({ ...prev, note: e.target.value }))} rows={3}
                    style={{ width: "100%", background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 8, padding: "10px 14px", color: "#e8f0fe", fontSize: 14, resize: "vertical" }} />
                </div>
                <button onClick={submitReferral} disabled={!addForm.company || !addForm.contact}
                  style={{ width: "100%", padding: "13px", background: addForm.company && addForm.contact ? "linear-gradient(135deg,#1e6fb5,#3b9de8)" : "#1e3a5f", border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                  Wyślij polecenie
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div style={{ minHeight: "100vh", background: "#060f1e", color: "#e8f0fe", fontFamily: "'DM Sans', sans-serif", display: "flex" }}>
        {/* Sidebar */}
        <div style={{ width: 240, background: "#080f20", borderRight: "1px solid #1e3a5f", display: "flex", flexDirection: "column", padding: "28px 0", flexShrink: 0, position: "sticky", top: 0, height: "100vh" }}>
          <div style={{ padding: "0 22px", marginBottom: 32 }}>
            <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18, color: "#e8f0fe" }}>LSI Cloud</div>
            <div style={{ color: "#3b9de8", fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" }}>Portal Partnerski</div>
          </div>

          {/* Partner info */}
          <div style={{ padding: "0 22px", marginBottom: 28 }}>
            <div style={{ background: "#0e1e3a", border: "1px solid #1e3a5f", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#1e6fb5,#3b9de8)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{p.avatar}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#e8f0fe", lineHeight: 1.2 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: "#5b7fa6", lineHeight: 1.3 }}>{p.company}</div>
                </div>
              </div>
              <LevelBadge level={p.level} />
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "0 14px" }}>
            {[
              { id: "dashboard", label: "Przegląd", icon: "◉" },
              { id: "referrals", label: "Moje polecenia", icon: "◈" },
              { id: "payouts", label: "Wypłaty", icon: "◎" },
              { id: "link", label: "Mój link", icon: "⬡" },
            ].map(item => (
              <button key={item.id} onClick={() => setView(item.id)}
                style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", background: view === item.id ? "#1e3a5f" : "none", border: "none", borderRadius: 9, color: view === item.id ? "#e8f0fe" : "#5b7fa6", fontWeight: view === item.id ? 700 : 500, fontSize: 14, cursor: "pointer", marginBottom: 3, textAlign: "left", transition: "all 0.15s" }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
                {item.id === "referrals" && pendingCount > 0 && (
                  <span style={{ marginLeft: "auto", background: "#3b9de8", borderRadius: 10, padding: "2px 7px", fontSize: 11, fontWeight: 800, color: "#fff" }}>{pendingCount}</span>
                )}
              </button>
            ))}
          </nav>

          <div style={{ padding: "0 14px" }}>
            <button onClick={() => setIsLoggedIn(false)}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", background: "none", border: "none", borderRadius: 9, color: "#5b7fa6", fontWeight: 500, fontSize: 14, cursor: "pointer" }}>
              ← Wyloguj
            </button>
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, overflow: "auto", padding: "36px 40px" }}>

          {/* DASHBOARD VIEW */}
          {view === "dashboard" && (
            <>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
                <div>
                  <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 800, margin: "0 0 6px" }}>Dzień dobry, {p.name.split(" ")[0]}! 👋</h1>
                  <p style={{ color: "#6b8cad", margin: 0, fontSize: 14 }}>Oto podsumowanie Twojego programu poleceń</p>
                </div>
                <button onClick={() => setShowAddModal(true)}
                  style={{ padding: "11px 22px", background: "linear-gradient(135deg,#1e6fb5,#3b9de8)", border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 4px 20px #3b9de830" }}>
                  + Dodaj polecenie
                </button>
              </div>

              {/* Stats */}
              <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
                <StatCard label="Łączne zarobki" value={`${p.totalEarned.toLocaleString("pl")} zł`} sub="od początku współpracy" accent="#3b9de8" icon="💰" />
                <StatCard label="Oczekuje wypłaty" value={`${p.pendingPayout.toLocaleString("pl")} zł`} sub={`Wypłata: ${p.nextPayout}`} accent="#f59e0b" icon="⏳" />
                <StatCard label="Aktywne polecenia" value={activeCount} sub={`${pendingCount} w trakcie weryfikacji`} accent="#22c55e" icon="✅" />
                <StatCard label="Prowizja miesięczna" value={`${totalRecurring} zł`} sub="z aktywnych kontraktów" accent="#c084fc" icon="📈" />
              </div>

              {/* Progress to next level */}
              <div style={{ background: "#0e1e3a", border: "1px solid #1e3a5f", borderRadius: 14, padding: "24px 28px", marginBottom: 28 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <span style={{ color: "#e8f0fe", fontWeight: 700, fontSize: 15 }}>Postęp do poziomu Partner Premium</span>
                    <span style={{ color: "#6b8cad", fontSize: 13, marginLeft: 12 }}>{p.annualReferrals} / {p.annualTarget} poleceń w tym roku</span>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <LevelBadge level="Partner" />
                    <span style={{ color: "#5b7fa6" }}>→</span>
                    <LevelBadge level="Partner Premium" />
                  </div>
                </div>
                <div style={{ background: "#0a1628", borderRadius: 8, height: 10, overflow: "hidden" }}>
                  <div style={{ width: `${(p.annualReferrals / p.annualTarget) * 100}%`, height: "100%", background: "linear-gradient(90deg,#1e6fb5,#3b9de8,#c084fc)", borderRadius: 8, transition: "width 0.8s ease" }} />
                </div>
                <div style={{ color: "#6b8cad", fontSize: 12, marginTop: 10 }}>
                  Jeszcze <strong style={{ color: "#3b9de8" }}>{p.annualTarget - p.annualReferrals} poleceń</strong> do poziomu Premium — odblokujesz prowizję cykliczną przez 24 miesiące i bonus roczny od 3 000 zł
                </div>
              </div>

              {/* Recent referrals */}
              <div style={{ background: "#0e1e3a", border: "1px solid #1e3a5f", borderRadius: 14, padding: "24px 28px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: "#e8f0fe" }}>Ostatnie polecenia</span>
                  <button onClick={() => setView("referrals")} style={{ background: "none", border: "none", color: "#3b9de8", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Zobacz wszystkie →</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {referrals.slice(0, 4).map(r => (
                    <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", background: "#091220", borderRadius: 10, flexWrap: "wrap" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: r.product === "Hotel" ? "#1a2f4e" : "#1a2e1a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                        {r.product === "Hotel" ? "🏨" : "🍽️"}
                      </div>
                      <div style={{ flex: 1, minWidth: 120 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#e8f0fe" }}>{r.company}</div>
                        <div style={{ fontSize: 12, color: "#5b7fa6" }}>{r.date} · {r.product}</div>
                      </div>
                      <Badge status={r.status} />
                      {r.status === "active" && <div style={{ color: "#22c55e", fontWeight: 700, fontSize: 14, minWidth: 80, textAlign: "right" }}>+{r.recurring} zł/mies.</div>}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* REFERRALS VIEW */}
          {view === "referrals" && (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 14 }}>
                <div>
                  <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 800, margin: "0 0 6px" }}>Moje polecenia</h1>
                  <p style={{ color: "#6b8cad", margin: 0, fontSize: 14 }}>{referrals.length} poleceń łącznie</p>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {["all", "active", "pending", "rejected"].map(s => (
                    <button key={s} onClick={() => setFilterStatus(s)}
                      style={{ padding: "7px 16px", background: filterStatus === s ? "#1e3a5f" : "none", border: `1px solid ${filterStatus === s ? "#3b9de8" : "#1e3a5f"}`, borderRadius: 8, color: filterStatus === s ? "#e8f0fe" : "#5b7fa6", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                      {{ all: "Wszystkie", active: "Aktywne", pending: "W toku", rejected: "Odrzucone" }[s]}
                    </button>
                  ))}
                  <button onClick={() => setShowAddModal(true)}
                    style={{ padding: "7px 18px", background: "linear-gradient(135deg,#1e6fb5,#3b9de8)", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    + Dodaj
                  </button>
                </div>
              </div>

              <div style={{ background: "#0e1e3a", border: "1px solid #1e3a5f", borderRadius: 14, overflow: "hidden" }}>
                {/* Table header */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 90px 100px 110px 120px", gap: 0, padding: "12px 20px", background: "#091220", borderBottom: "1px solid #1e3a5f" }}>
                  {["Firma", "Kontakt", "Produkt", "Status", "Premia", "Prowizja/mies."].map(h => (
                    <div key={h} style={{ color: "#5b7fa6", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</div>
                  ))}
                </div>
                {filtered.map((r, i) => (
                  <div key={r.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 90px 100px 110px 120px", gap: 0, padding: "14px 20px", borderBottom: i < filtered.length - 1 ? "1px solid #1e3a5f" : "none", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#e8f0fe" }}>{r.company}</div>
                      <div style={{ fontSize: 11, color: "#5b7fa6" }}>{r.date}</div>
                    </div>
                    <div style={{ fontSize: 13, color: "#8aaecb" }}>{r.contact}</div>
                    <div>
                      <span style={{ fontSize: 12, padding: "3px 9px", background: r.product === "Hotel" ? "#1a2f4e" : "#1a2e1a", borderRadius: 6, color: r.product === "Hotel" ? "#60a5fa" : "#4ade80", fontWeight: 600 }}>{r.product}</span>
                    </div>
                    <div><Badge status={r.status} /></div>
                    <div style={{ color: r.commission > 0 ? "#e8f0fe" : "#3a4f6a", fontWeight: 700, fontSize: 14 }}>
                      {r.commission > 0 ? `${r.commission} zł` : "—"}
                    </div>
                    <div style={{ color: r.recurring > 0 ? "#22c55e" : "#3a4f6a", fontWeight: 700, fontSize: 14 }}>
                      {r.recurring > 0 ? `+${r.recurring} zł` : "—"}
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div style={{ padding: "40px 20px", textAlign: "center", color: "#5b7fa6", fontSize: 14 }}>Brak poleceń w tej kategorii</div>
                )}
              </div>
            </>
          )}

          {/* PAYOUTS VIEW */}
          {view === "payouts" && (
            <>
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 800, margin: "0 0 6px" }}>Wypłaty</h1>
                <p style={{ color: "#6b8cad", margin: 0, fontSize: 14 }}>Historia i planowane wypłaty prowizji</p>
              </div>

              <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
                <StatCard label="Do wypłaty" value={`${p.pendingPayout.toLocaleString("pl")} zł`} sub={`Najbliższa: ${p.nextPayout}`} accent="#f59e0b" icon="⏳" />
                <StatCard label="Łącznie wypłacono" value={`${p.totalEarned.toLocaleString("pl")} zł`} sub="całkowita historia wypłat" accent="#3b9de8" icon="💳" />
                <StatCard label="Prowizja cykliczna" value={`${totalRecurring} zł/mies.`} sub="z aktywnych kontraktów" accent="#22c55e" icon="🔄" />
              </div>

              <div style={{ background: "#0e1e3a", border: "1px solid #1e3a5f", borderRadius: 14, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 1fr 140px", gap: 0, padding: "12px 20px", background: "#091220", borderBottom: "1px solid #1e3a5f" }}>
                  {["Data", "Rodzaj", "Kwota", "Status"].map(h => (
                    <div key={h} style={{ color: "#5b7fa6", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</div>
                  ))}
                </div>
                {MOCK_PAYOUTS.map((pay, i) => (
                  <div key={pay.id} style={{ display: "grid", gridTemplateColumns: "120px 1fr 1fr 140px", gap: 0, padding: "16px 20px", borderBottom: i < MOCK_PAYOUTS.length - 1 ? "1px solid #1e3a5f" : "none", alignItems: "center" }}>
                    <div style={{ color: "#8aaecb", fontSize: 14 }}>{pay.date}</div>
                    <div style={{ color: "#e8f0fe", fontSize: 14, fontWeight: 500 }}>{pay.type}</div>
                    <div style={{ color: pay.status === "upcoming" ? "#f59e0b" : "#22c55e", fontSize: 18, fontWeight: 800, fontFamily: "'Sora',sans-serif" }}>
                      {pay.amount.toLocaleString("pl")} zł
                    </div>
                    <div><Badge status={pay.status} /></div>
                  </div>
                ))}
              </div>

              <div style={{ background: "#0e1e3a", border: "1px solid #1e3a5f", borderRadius: 14, padding: "22px 26px", marginTop: 20 }}>
                <div style={{ color: "#6b8cad", fontSize: 13, lineHeight: 1.8 }}>
                  💡 <strong style={{ color: "#e8f0fe" }}>Jak działają wypłaty?</strong> Prowizje są naliczane automatycznie i wypłacane przelewem do <strong style={{ color: "#3b9de8" }}>15. dnia każdego miesiąca</strong>. Minimalna kwota wypłaty to 200 zł. Prowizja jednorazowa jest wypłacana po 30 dniach aktywności klienta. W razie pytań: <span style={{ color: "#3b9de8" }}>partnerzy@lsi-cloud.pl</span>
                </div>
              </div>
            </>
          )}

          {/* LINK VIEW */}
          {view === "link" && (
            <>
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 800, margin: "0 0 6px" }}>Mój link partnerski</h1>
                <p style={{ color: "#6b8cad", margin: 0, fontSize: 14 }}>Udostępnij link lub kod znajomym i zarabiaj prowizję</p>
              </div>

              <div style={{ background: "#0e1e3a", border: "1px solid #3b9de8", borderRadius: 16, padding: "28px 32px", marginBottom: 20 }}>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ color: "#8aaecb", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Twój unikalny kod</div>
                    <div style={{ background: "#091220", border: "1px solid #1e3a5f", borderRadius: 10, padding: "14px 18px", fontFamily: "monospace", fontSize: 22, fontWeight: 800, color: "#3b9de8", letterSpacing: "0.18em", display: "inline-flex", alignItems: "center", gap: 16 }}>
                      {p.refCode}
                      <CopyBtn text={p.refCode} label="Kopiuj kod" />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: "#0e1e3a", border: "1px solid #1e3a5f", borderRadius: 16, padding: "24px 28px", marginBottom: 20 }}>
                <div style={{ color: "#8aaecb", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Link polecający</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#091220", border: "1px solid #1e3a5f", borderRadius: 10, padding: "12px 16px", flexWrap: "wrap" }}>
                  <span style={{ color: "#6b8cad", fontSize: 13, flex: 1, fontFamily: "monospace", wordBreak: "break-all" }}>{p.refLink}</span>
                  <CopyBtn text={p.refLink} label="Kopiuj link" />
                </div>
              </div>

              {/* Share channels */}
              <div style={{ background: "#0e1e3a", border: "1px solid #1e3a5f", borderRadius: 14, padding: "24px 28px", marginBottom: 20 }}>
                <div style={{ color: "#e8f0fe", fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Gdzie najlepiej udostępniać?</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
                  {[
                    { icon: "💬", channel: "Messenger / WhatsApp", tip: "Wyślij link bezpośrednio do restauratorów i hotelarzy ze swojej sieci" },
                    { icon: "💼", channel: "LinkedIn", tip: "Polecaj publicznie w postach branżowych — wiarygodność eksperta" },
                    { icon: "📧", channel: "E-mail", tip: "Gotowy szablon e-maila dostępny poniżej — wyślij jednym kliknięciem" },
                    { icon: "📲", channel: "Wizytówka", tip: "Dodaj kod QR do swoich materiałów marketingowych i wizytówek" },
                  ].map(c => (
                    <div key={c.channel} style={{ background: "#091220", border: "1px solid #1e3a5f", borderRadius: 10, padding: "16px 16px" }}>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>{c.icon}</div>
                      <div style={{ color: "#e8f0fe", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>{c.channel}</div>
                      <div style={{ color: "#6b8cad", fontSize: 12, lineHeight: 1.6 }}>{c.tip}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email template */}
              <div style={{ background: "#0e1e3a", border: "1px solid #1e3a5f", borderRadius: 14, padding: "24px 28px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ color: "#e8f0fe", fontWeight: 700, fontSize: 15 }}>Gotowy szablon wiadomości</div>
                  <CopyBtn text={`Cześć,\n\nChciałem/am polecić Ci system LSI Cloud do zarządzania gastro/hotelem. Korzystam z niego i bardzo ułatwia mi codzienną pracę.\n\nSprawdź bezpłatne demo tutaj: ${p.refLink}\n\nPozdrawiam,\n${p.name}`} label="Kopiuj wiadomość" />
                </div>
                <div style={{ background: "#091220", border: "1px solid #1e3a5f", borderRadius: 10, padding: "16px 18px", fontSize: 13, color: "#8aaecb", lineHeight: 1.9, fontFamily: "monospace" }}>
                  Cześć,<br /><br />
                  Chciałem/am polecić Ci system LSI Cloud do zarządzania gastro/hotelem. Korzystam z niego i bardzo ułatwia mi codzienną pracę.<br /><br />
                  Sprawdź bezpłatne demo tutaj: <span style={{ color: "#3b9de8" }}>{p.refLink}</span><br /><br />
                  Pozdrawiam,<br />
                  {p.name}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
