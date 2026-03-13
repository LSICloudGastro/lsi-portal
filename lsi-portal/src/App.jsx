import { useState, useEffect, useRef } from "react";

// ─── SUPABASE CONFIG ──────────────────────────────────────────────────────────
const SUPABASE_URL = "https://rrybeanhgjqwikckcveg.supabase.co";
const SUPABASE_KEY = "sb_publishable_EAaVbrU-zOfx8mEAJ-cgiQ_iBaHW5jT";
const SB = {
  headers: {
    "apikey": SUPABASE_KEY,
    "Authorization": "Bearer " + SUPABASE_KEY,
    "Content-Type": "application/json",
    "Prefer": "return=representation",
  },
  async get(table, query = "") {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, { headers: this.headers });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async post(table, body) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST", headers: this.headers, body: JSON.stringify(body)
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async patch(table, id, body) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "PATCH", headers: { ...this.headers, "Prefer": "return=representation" }, body: JSON.stringify(body)
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async delete(table, id) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "DELETE", headers: this.headers
    });
    if (!r.ok) throw new Error(await r.text());
    return true;
  }
};


// ─── HELPERS ─────────────────────────────────────────────────────────────────
function generateRefNumber(existingRefs) {
  const now = new Date();
  const ym = now.getFullYear().toString() + String(now.getMonth() + 1).padStart(2, "0");
  const seq = (existingRefs.length + 1).toString().padStart(4, "0");
  return `LSI-${ym}-${seq}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pl-PL");
}

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
  { id: 1, company: "Pizzeria Napoli", contact: "Adam Wiśniewski", product: "Gastro", status: "active", date: "2026-02-10", commission: 480, recurring: 92, months: 7, email: "adam@napoli.pl", phone: "+48 600 111 222", notes: [{date: "2026-02-10", text: "Klient zainteresowany modułem KDS i QR Menu."}] },
  { id: 2, company: "Hotel Bursztyn", contact: "Kasia Nowak", product: "Hotel", status: "active", date: "2026-01-22", commission: 700, recurring: 138, months: 5, email: "kasia@bursztyn.pl", phone: "+48 601 222 333", notes: [{date: "2026-01-22", text: "Obiekt 45 pokoi, potrzebuje booking engine i automatyzacji check-in."}] },
  { id: 3, company: "Kawiarnia Złota", contact: "Piotr Zając", product: "Gastro", status: "pending", date: "2026-03-01", commission: 300, recurring: 0, months: 0, email: "", phone: "", notes: [] },
  { id: 4, company: "Pensjonat Morski", contact: "Zofia Kwiatkowska", product: "Hotel", status: "active", date: "2025-11-18", commission: 650, recurring: 125, months: 10, email: "", phone: "", notes: [] },
  { id: 5, company: "Food Truck Mama", contact: "Leszek Górski", product: "Gastro", status: "active", date: "2025-10-05", commission: 200, recurring: 54, months: 12, email: "", phone: "", notes: [] },
  { id: 6, company: "Bistro Uroczysko", contact: "Marta Dąbrowska", product: "Gastro", status: "rejected", date: "2026-02-28", commission: 0, recurring: 0, months: 0, email: "", phone: "", notes: [] },
  { id: 7, company: "Aparthotel Sunrise", contact: "Tomasz Lewandowski", product: "Hotel", status: "pending", date: "2026-03-08", commission: 700, recurring: 0, months: 0, email: "", phone: "", notes: [] },
  { id: 8, company: "Jadłodajnia u Basi", contact: "Barbara Kowal", product: "Gastro", status: "active", date: "2025-09-12", commission: 200, recurring: 48, months: 12, email: "", phone: "", notes: [] },
  { id: 9, company: "Willa Karpacka", contact: "Henryk Mazur", product: "Hotel", status: "active", date: "2026-01-03", commission: 650, recurring: 118, months: 6, email: "", phone: "", notes: [] },
];

const MOCK_PAYOUTS = [
  { id: 1, date: "2026-03-15", amount: 920, type: "Prowizja cykliczna", status: "paid" },
  { id: 2, date: "2026-02-15", amount: 810, type: "Prowizja cykliczna", status: "paid" },
  { id: 3, date: "2026-01-15", amount: 700, type: "Premia za polecenie", status: "paid" },
  { id: 4, date: "2025-12-15", amount: 650, type: "Prowizja cykliczna", status: "paid" },
  { id: 5, date: "2025-11-15", amount: 480, type: "Premia za polecenie + prowizja", status: "paid" },
  { id: 6, date: "2026-04-15", amount: 1140, type: "Prowizja cykliczna", status: "upcoming" },
];

// ─── EMAILJS CONFIG ───────────────────────────const payout───────────────────────────────
const EMAILJS_SERVICE_ID = "service_qmx8ujf";
const EMAILJS_TEMPLATE_ID = "template_6gwabn5";
const EMAILJS_PUBLIC_KEY = "svEUxwTzP4gUCkSwo";
const NOTIFY_EMAIL = "mlichota@gastro.pl";
// NOTE: Payout emails use same template with extra vars:
// {{payout_amount}}, {{payout_date}}, {{payout_note}}, {{refs_list}}, {{to_email}}
// Make sure EmailJS template sends TO {{to_email}} for payout notifications
const PAYOUT_TEMPLATE_ID = "template_zc65yzo"; // ← zmień po utworzeniu szablonu w EmailJS

async function sendReferralEmail(partner, ref) {
  try {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email: NOTIFY_EMAIL,
          partner_name: partner.name,
          partner_company: partner.company,
          partner_email: partner.email,
          partner_code: partner.refCode,
          ref_company: ref.company,
          ref_contact: ref.contact,
          ref_email: ref.email || "—",
          ref_phone: ref.phone || "—",
          ref_product: ref.product,
          ref_date: ref.date,
          ref_note: ref.notes && ref.notes[0] ? ref.notes[0].text : (ref.note || "—"),
        }
      })
    });
    return res.ok;
  } catch(e) {
    console.error("EmailJS error:", e);
    return false;
  }
}

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

  const handleEnterPanel = async () => {
    const initials = form.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    const partnerData = {
      name: form.name,
      email: form.email,
      company: form.company,
      avatar: initials || "??",
      refCode: code,
      refLink: "https://lsi-cloud.pl/?ref=" + code,
      level: "Ambasador",
      levelNum: 1,
      joinDate: new Date().toISOString().slice(0, 10),
      totalEarned: 0,
      pendingPayout: 0,
      nextPayout: "—",
      annualReferrals: 0,
      annualTarget: 5,
    };

    // Save to Supabase
    try {
      await SB.post("partners", {
        name: form.name,
        email: form.email,
        password: form.password || "lsicloud",
        company: form.company,
        phone: form.phone,
        nip: form.nip,
        ref_code: code,
        ref_link: "https://lsi-cloud.pl/?ref=" + code,
        level: "Ambasador",
        level_num: 1,
        join_date: new Date().toISOString().slice(0, 10),
        total_earned: 0,
        pending_payout: 0,
        annual_referrals: 0,
        annual_target: 5,
        avatar: initials || "??",
      });
    } catch(e) {
      console.error("Supabase register error:", e);
      // Fallback to localStorage
      const accounts = JSON.parse(localStorage.getItem("lsi_accounts") || "[]");
      const existing = accounts.findIndex(a => a.email.toLowerCase() === form.email.toLowerCase());
      const accountEntry = { ...partnerData, password: form.password || "lsicloud" };
      if (existing >= 0) { accounts[existing] = accountEntry; } else { accounts.push(accountEntry); }
      localStorage.setItem("lsi_accounts", JSON.stringify(accounts));
    }

    onRegister(partnerData);
    onClose();
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
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: "#8aaecb", fontSize: 12, fontWeight: 600, marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>Hasło do konta *</label>
              <input type="password" placeholder="Min. 6 znaków" value={form.password || ""} onChange={e => handle("password", e.target.value)}
                style={{ width: "100%", background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 8, padding: "10px 14px", color: "#e8f0fe", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              <div style={{ color: "#3a5070", fontSize: 11, marginTop: 5 }}>Minimum 6 znaków — użyjesz go przy kolejnych logowaniach</div>
            </div>
            <button onClick={() => setStep(2)} disabled={!form.name || !form.email || !form.company || !form.password || form.password.length < 6}
              style={{ width: "100%", padding: "13px", background: (form.name && form.email && form.company && form.password && form.password.length >= 6) ? "linear-gradient(135deg,#1e6fb5,#3b9de8)" : "#1e3a5f", border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", marginTop: 8 }}>
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
            <button onClick={handleEnterPanel}
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
    pending:   { bg: "#1c1a08", border: "#ca8a04", color: "#eab308", label: "Nowe" },
    contacted: { bg: "#1a1f35", border: "#6366f1", color: "#818cf8", label: "Kontakt nawiązany" },
    demo:      { bg: "#1a2535", border: "#3b9de8", color: "#60a5fa", label: "Demo umówione" },
    signed:    { bg: "#0f2818", border: "#10b981", color: "#34d399", label: "Umowa podpisana" },
    active:    { bg: "#0d2e1a", border: "#16a34a", color: "#22c55e", label: "Aktywny" },
    rejected:  { bg: "#1e0f0f", border: "#dc2626", color: "#ef4444", label: "Odrzucony" },
    paid:      { bg: "#0d2e1a", border: "#16a34a", color: "#22c55e", label: "Wypłacono" },
    upcoming:  { bg: "#0f1e35", border: "#3b9de8", color: "#60a5fa", label: "Nadchodzi" },
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
function LoginModal({ onClose, onLogin, onShowRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = () => {
    if (!email || !password) { setError("Wypełnij oba pola."); return; }
    setLoading(true);
    setError("");
    // Admin check immediately
    if (email.toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setLoading(false);
      onLogin("admin");
      onClose();
      return;
    }
    // Check Supabase
    SB.get("partners", `?email=eq.${encodeURIComponent(email.toLowerCase())}&password=eq.${encodeURIComponent(password)}&limit=1`)
      .then(rows => {
        setLoading(false);
        if (rows && rows.length > 0) {
          const row = rows[0];
          onLogin({
            name: row.name,
            email: row.email,
            company: row.company,
            phone: row.phone || "",
            avatar: row.avatar || "??",
            refCode: row.ref_code,
            refLink: row.ref_link,
            level: row.level,
            levelNum: row.level_num,
            joinDate: row.join_date,
            totalEarned: parseFloat(row.total_earned) || 0,
            pendingPayout: parseFloat(row.pending_payout) || 0,
            nextPayout: "do 15. dnia miesiąca",
            annualReferrals: row.annual_referrals || 0,
            annualTarget: row.annual_target || 5,
            lastPayoutDate: row.last_payout_date || null,
            lastPayoutAmount: row.last_payout_amount || 0,
            dbId: row.id,
          });
          onClose();
        } else {
          // Fallback: check localStorage
          const accounts = JSON.parse(localStorage.getItem("lsi_accounts") || "[]");
          const found = accounts.find(a => a.email.toLowerCase() === email.toLowerCase() && a.password === password);
          if (found) {
            const { password: _pw, ...partnerData } = found;
            onLogin(partnerData);
            onClose();
          } else {
            setError("Nieprawidłowy e-mail lub hasło. Sprawdź dane lub zarejestruj się.");
          }
        }
      })
      .catch(() => {
        setLoading(false);
        // Fallback to localStorage on network error
        const accounts = JSON.parse(localStorage.getItem("lsi_accounts") || "[]");
        const found = accounts.find(a => a.email.toLowerCase() === email.toLowerCase() && a.password === password);
        if (found) {
          const { password: _pw, ...partnerData } = found;
          onLogin(partnerData);
          onClose();
        } else {
          setError("Nieprawidłowy e-mail lub hasło. Sprawdź dane lub zarejestruj się.");
        }
      });
  };

  const loginDemo = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin(null); // null = load demo account
      onClose();
    }, 600);
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

        {error && (
          <div style={{ background: "#1e0f0f", border: "1px solid #dc2626", borderRadius: 8, padding: "10px 14px", color: "#ef4444", fontSize: 13, marginBottom: 16 }}>{error}</div>
        )}

        <button onClick={submit} disabled={loading}
          style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg,#1e6fb5,#3b9de8)", border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", opacity: loading ? 0.7 : 1, marginBottom: 12 }}>
          {loading ? "Logowanie…" : "Zaloguj się →"}
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1, height: 1, background: "#1e3a5f" }} />
          <span style={{ color: "#3a4f6a", fontSize: 12 }}>lub</span>
          <div style={{ flex: 1, height: 1, background: "#1e3a5f" }} />
        </div>

        {/* Demo login */}
        <button onClick={loginDemo}
          style={{ width: "100%", padding: "11px", background: "none", border: "1px solid #1e3a5f", borderRadius: 10, color: "#6b8cad", fontWeight: 600, fontSize: 14, cursor: "pointer", marginBottom: 20 }}>
          🧪 Zaloguj się jako konto demo
        </button>

        <div style={{ textAlign: "center", color: "#5b7fa6", fontSize: 13 }}>
          Nie masz konta?{" "}
          <span style={{ color: "#3b9de8", cursor: "pointer", fontWeight: 600 }}
            onClick={() => { onClose(); onShowRegister(); }}>
            Zarejestruj się
          </span>
        </div>
      </div>
    </div>
  );
}




// ─── HANDLOWCY TAB ────────────────────────────────────────────────────────────
function SalespersonsTab({ allSalespersons, setAllSalespersons, allReferrals, onGoToRef }) {
  const [form, setForm] = useState({ name: "", surname: "", phone: "" });
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const STATUS_COLOR = {
    pending: "#eab308", contacted: "#818cf8", demo: "#60a5fa",
    signed: "#34d399", active: "#22c55e", rejected: "#ef4444",
  };
  const STATUS_LABEL = {
    pending: "Nowe", contacted: "Kontakt nawiązany", demo: "Demo umówione",
    signed: "Umowa podpisana", active: "Aktywny", rejected: "Odrzucony",
  };
  const STATUS_BG = {
    pending: "#1c1a08", contacted: "#1a1f35", demo: "#1a2535",
    signed: "#0f2818", active: "#0d2e1a", rejected: "#1e0f0f",
  };
  const STATUS_BORDER = {
    pending: "#ca8a04", contacted: "#6366f1", demo: "#3b9de8",
    signed: "#10b981", active: "#16a34a", rejected: "#dc2626",
  };

  const saveSalesperson = () => {
    const fullName = `${form.name.trim()} ${form.surname.trim()}`.trim();
    if (!fullName) return;
    const newSp = {
      id: Date.now(),
      name: fullName,
      phone: form.phone.trim(),
    };
    const updated = [...allSalespersons, newSp];
    setAllSalespersons(updated);
    localStorage.setItem("lsi_salespersons", JSON.stringify(updated));
    setForm({ name: "", surname: "", phone: "" });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const deleteSalesperson = (id) => {
    const updated = allSalespersons.filter(s => s.id !== id);
    setAllSalespersons(updated);
    localStorage.setItem("lsi_salespersons", JSON.stringify(updated));
    if (expanded === id) setExpanded(null);
  };

  const S = {
    input: { background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 8, padding: "10px 14px", color: "#e8f0fe", fontSize: 14, width: "100%", boxSizing: "border-box" },
  };

  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 800, margin: "0 0 6px", color: "#e8f0fe" }}>Handlowcy</h1>
        <p style={{ color: "#6b8cad", margin: 0, fontSize: 14 }}>Zarządzaj handlowcami i ich przypisanymi poleceniami</p>
      </div>

      {/* Add form */}
      <div style={{ background: "#0e1e3a", border: "1px solid #1e3a5f", borderRadius: 14, padding: "24px 28px", marginBottom: 28 }}>
        <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 17, fontWeight: 800, margin: "0 0 18px", color: "#e8f0fe" }}>Dodaj handlowca</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12, alignItems: "end" }}>
          <div>
            <label style={{ display: "block", color: "#5b7fa6", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Imię</label>
            <input placeholder="Jan" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && saveSalesperson()}
              style={S.input} />
          </div>
          <div>
            <label style={{ display: "block", color: "#5b7fa6", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Nazwisko</label>
            <input placeholder="Kowalski" value={form.surname} onChange={e => setForm(p => ({ ...p, surname: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && saveSalesperson()}
              style={S.input} />
          </div>
          <div>
            <label style={{ display: "block", color: "#5b7fa6", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Telefon</label>
            <input placeholder="+48 600 000 000" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && saveSalesperson()}
              style={S.input} />
          </div>
          <button onClick={saveSalesperson}
            style={{ padding: "10px 22px", background: "linear-gradient(135deg,#1e6fb5,#3b9de8)", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap" }}>
            + Dodaj
          </button>
        </div>
        {saved && (
          <div style={{ marginTop: 12, color: "#22c55e", fontSize: 13, fontWeight: 600 }}>✓ Handlowiec dodany</div>
        )}
      </div>

      {/* Salespersons list */}
      {allSalespersons.length === 0 ? (
        <div style={{ background: "#0e1e3a", border: "1px solid #1e3a5f", borderRadius: 14, padding: "48px", textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>👤</div>
          <div style={{ fontWeight: 700, color: "#5b7fa6", fontSize: 15 }}>Brak handlowców</div>
          <div style={{ color: "#3a4f6a", fontSize: 13, marginTop: 4 }}>Dodaj pierwszego handlowca powyżej</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {allSalespersons.map(sp => {
            const spRefs = allReferrals.filter(r => r.salesperson === sp.name);
            const counts = spRefs.reduce((acc, r) => {
              acc[r.status] = (acc[r.status] || 0) + 1;
              return acc;
            }, {});
            const isOpen = expanded === sp.id;

            return (
              <div key={sp.id} style={{ background: "#0e1e3a", border: "1px solid #1e3a5f", borderRadius: 14, overflow: "hidden" }}>
                {/* Header row */}
                <div
                  onClick={() => setExpanded(isOpen ? null : sp.id)}
                  style={{ display: "flex", alignItems: "center", padding: "18px 24px", cursor: "pointer", gap: 16, flexWrap: "wrap" }}>
                  {/* Avatar */}
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#1e6fb5,#3b9de8)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: "#fff", flexShrink: 0 }}>
                    {sp.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  {/* Name + phone */}
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: "#e8f0fe" }}>{sp.name}</div>
                    {sp.phone && <div style={{ color: "#5b7fa6", fontSize: 13, marginTop: 2 }}>📞 {sp.phone}</div>}
                  </div>
                  {/* Status pills */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    {spRefs.length === 0 ? (
                      <span style={{ color: "#3a4f6a", fontSize: 13 }}>Brak poleceń</span>
                    ) : (
                      Object.entries(counts).map(([status, cnt]) => (
                        <span key={status} style={{
                          padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                          background: STATUS_BG[status] || "#0a1628",
                          border: `1px solid ${STATUS_BORDER[status] || "#1e3a5f"}`,
                          color: STATUS_COLOR[status] || "#e8f0fe",
                        }}>
                          {STATUS_LABEL[status] || status}: {cnt}
                        </span>
                      ))
                    )}
                    <span style={{ color: "#3b9de8", fontWeight: 700, fontSize: 13, marginLeft: 4 }}>
                      {spRefs.length} pol. łącznie
                    </span>
                  </div>
                  {/* Expand / delete */}
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: "auto" }}>
                    {spRefs.length > 0 && (
                      <span style={{ color: "#5b7fa6", fontSize: 13, transition: "transform 0.2s", display: "inline-block", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); deleteSalesperson(sp.id); }}
                      title="Usuń handlowca"
                      style={{ padding: "4px 10px", background: "none", border: "1px solid #7f1d1d", borderRadius: 6, color: "#ef4444", fontSize: 12, cursor: "pointer" }}>
                      Usuń
                    </button>
                  </div>
                </div>

                {/* Expanded referrals list */}
                {isOpen && spRefs.length > 0 && (
                  <div style={{ borderTop: "1px solid #1e3a5f" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "130px 1fr 140px 160px", padding: "8px 24px", background: "#091220" }}>
                      {["Nr polecenia", "Klient", "Produkt", "Status"].map(h => (
                        <div key={h} style={{ color: "#5b7fa6", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</div>
                      ))}
                    </div>
                    {spRefs.map((r, i) => (
                      <div key={r.id}
                        style={{ display: "grid", gridTemplateColumns: "130px 1fr 140px 160px", padding: "12px 24px", borderTop: "1px solid #0e1e3a", alignItems: "center", background: i % 2 ? "#080f1e" : "#0b1628" }}>
                        {/* Ref number — clickable, jumps to referrals tab */}
                        <button
                          onClick={() => onGoToRef(r.id)}
                          title="Przejdź do polecenia"
                          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}>
                          <span style={{ fontFamily: "monospace", color: "#3b9de8", fontWeight: 700, fontSize: 12, background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 5, padding: "3px 8px", textDecoration: "underline", textDecorationColor: "#3b9de844" }}>
                            {r.refNumber || "—"}
                          </span>
                        </button>
                        <div>
                          <div style={{ fontWeight: 600, color: "#e8f0fe", fontSize: 13 }}>{r.company}</div>
                          <div style={{ color: "#5b7fa6", fontSize: 11 }}>{r.date}</div>
                        </div>
                        <div>
                          <span style={{ padding: "2px 8px", background: r.product === "Hotel" ? "#1a2f4e" : "#1a2e1a", borderRadius: 5, color: r.product === "Hotel" ? "#60a5fa" : "#4ade80", fontSize: 11, fontWeight: 700 }}>
                            {r.product}
                          </span>
                        </div>
                        <div>
                          <span style={{
                            padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                            background: STATUS_BG[r.status] || "#0a1628",
                            border: `1px solid ${STATUS_BORDER[r.status] || "#1e3a5f"}`,
                            color: STATUS_COLOR[r.status] || "#e8f0fe",
                          }}>
                            {STATUS_LABEL[r.status] || r.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

// ─── RAPORT POLECEŃ ───────────────────────────────────────────────────────────
function ReportReferrals({ allReferrals, allPartners, onJumpToRef }) {
  const [search, setSearch]         = useState("");
  const [fPartner, setFPartner]     = useState("all");
  const [fStatus, setFStatus]       = useState("all");
  const [fDateFrom, setFDateFrom]   = useState("");
  const [fDateTo, setFDateTo]       = useState("");
  const [highlighted, setHighlighted] = useState(null);

  const filtered = allReferrals.filter(r => {
    if (fPartner !== "all" && r.partnerId !== fPartner) return false;
    if (fStatus  !== "all" && r.status    !== fStatus)  return false;
    if (fDateFrom && r.date < fDateFrom) return false;
    if (fDateTo   && r.date > fDateTo)   return false;
    if (search) {
      const q = search.toLowerCase();
      return (r.refNumber||"").toLowerCase().includes(q)
          || (r.company||"").toLowerCase().includes(q)
          || (r.contact||"").toLowerCase().includes(q)
          || (r.partnerName||"").toLowerCase().includes(q);
    }
    return true;
  });

  const STATUS_LABEL  = { pending:"Nowe", contacted:"Kontakt nawiązany", demo:"Demo umówione", signed:"Umowa podpisana", active:"Aktywny", rejected:"Odrzucony" };
  const STATUS_COLOR  = { pending:"#eab308", contacted:"#818cf8", demo:"#60a5fa", signed:"#34d399", active:"#22c55e", rejected:"#ef4444" };
  const STATUS_BG     = { pending:"#1c1a08", contacted:"#1a1f35", demo:"#1a2535", signed:"#0f2818", active:"#0d2e1a", rejected:"#1e0f0f" };
  const STATUS_BORDER = { pending:"#ca8a04", contacted:"#6366f1", demo:"#3b9de8", signed:"#10b981", active:"#16a34a", rejected:"#dc2626" };

  const S = {
    th: { color: "#5b7fa6", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", padding: "10px 14px", background: "#091220", whiteSpace: "nowrap" },
    td: (i) => ({ padding: "11px 14px", borderBottom: "1px solid #0e1e3a", background: i%2 ? "#080f1e" : "#0b1628", fontSize: 13, color: "#c8d8e8", verticalAlign: "middle" }),
    input: { background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 7, padding: "8px 12px", color: "#e8f0fe", fontSize: 13 },
    select: { background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 7, padding: "8px 12px", color: "#e8f0fe", fontSize: 13 },
  };

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 800, margin: "0 0 6px", color: "#e8f0fe" }}>Raport poleceń</h1>
        <p style={{ color: "#6b8cad", margin: 0, fontSize: 14 }}>{filtered.length} poleceń spełnia kryteria</p>
      </div>

      {/* Filters */}
      <div style={{ background: "#0e1e3a", border: "1px solid #1e3a5f", borderRadius: 14, padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          {/* Search by number or name */}
          <div style={{ flex: "2 1 200px" }}>
            <label style={{ display: "block", color: "#5b7fa6", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Szukaj (nr / firma / partner)</label>
            <input placeholder="np. LSI-202603-0001 lub Pizza..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ ...S.input, width: "100%", boxSizing: "border-box" }} />
          </div>
          {/* Partner */}
          <div style={{ flex: "1 1 160px" }}>
            <label style={{ display: "block", color: "#5b7fa6", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Partner</label>
            <select value={fPartner} onChange={e => setFPartner(e.target.value)} style={{ ...S.select, width: "100%" }}>
              <option value="all">Wszyscy</option>
              {allPartners.map((p,i) => <option key={i} value={p.email}>{p.name}</option>)}
            </select>
          </div>
          {/* Status */}
          <div style={{ flex: "1 1 130px" }}>
            <label style={{ display: "block", color: "#5b7fa6", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Status</label>
            <select value={fStatus} onChange={e => setFStatus(e.target.value)} style={{ ...S.select, width: "100%" }}>
              <option value="all">Wszystkie</option>
              <option value="pending">Nowe</option>
              <option value="contacted">Kontakt nawiązany</option>
              <option value="demo">Demo umówione</option>
              <option value="signed">Umowa podpisana</option>
              <option value="active">Aktywne</option>
              <option value="rejected">Odrzucone</option>
            </select>
          </div>
          {/* Date from */}
          <div style={{ flex: "1 1 140px" }}>
            <label style={{ display: "block", color: "#5b7fa6", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Data od</label>
            <input type="date" value={fDateFrom} onChange={e => setFDateFrom(e.target.value)}
              style={{ ...S.input, width: "100%", boxSizing: "border-box", colorScheme: "dark" }} />
          </div>
          {/* Date to */}
          <div style={{ flex: "1 1 140px" }}>
            <label style={{ display: "block", color: "#5b7fa6", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Data do</label>
            <input type="date" value={fDateTo} onChange={e => setFDateTo(e.target.value)}
              style={{ ...S.input, width: "100%", boxSizing: "border-box", colorScheme: "dark" }} />
          </div>
          {/* Reset */}
          <button onClick={() => { setSearch(""); setFPartner("all"); setFStatus("all"); setFDateFrom(""); setFDateTo(""); }}
            style={{ padding: "8px 16px", background: "none", border: "1px solid #1e3a5f", borderRadius: 7, color: "#5b7fa6", fontSize: 13, cursor: "pointer", alignSelf: "flex-end" }}>
            Wyczyść
          </button>
        </div>
      </div>

      {/* Summary pills */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Łącznie", val: filtered.length, color: "#3b9de8" },
          { label: "W toku",  val: filtered.filter(r=>r.status==="pending").length,  color: "#eab308" },
          { label: "Aktywne", val: filtered.filter(r=>r.status==="active").length,   color: "#22c55e" },
          { label: "Odrzucone", val: filtered.filter(r=>r.status==="rejected").length, color: "#ef4444" },
        ].map(c => (
          <div key={c.label} style={{ background: "#0e1e3a", border: `1px solid ${c.color}33`, borderRadius: 10, padding: "10px 18px", display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ color: "#5b7fa6", fontSize: 12 }}>{c.label}:</span>
            <span style={{ color: c.color, fontWeight: 800, fontSize: 18, fontFamily: "'Sora',sans-serif" }}>{c.val}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#0e1e3a", border: "1px solid #1e3a5f", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
            <thead>
              <tr>
                {["Nr polecenia","Data","Klient","Kontakt","Partner","Produkt","Status"].map(h =>
                  <th key={h} style={{ ...S.th, textAlign: "left" }}>{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "#3a4f6a" }}>Brak poleceń spełniających kryteria</td></tr>
              )}
              {filtered.map((r, i) => (
                <tr key={r.id}
                  style={{ cursor: "pointer", outline: highlighted === r.id ? "2px solid #3b9de8" : "none" }}
                  onClick={() => setHighlighted(highlighted === r.id ? null : r.id)}>
                  <td style={S.td(i)}>
                    <span style={{ fontFamily: "monospace", color: "#3b9de8", fontWeight: 700, fontSize: 12,
                      background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 5, padding: "3px 8px" }}>
                      {r.refNumber || "—"}
                    </span>
                  </td>
                  <td style={S.td(i)}>{formatDate(r.date)}</td>
                  <td style={{ ...S.td(i), fontWeight: 700, color: "#e8f0fe" }}>{r.company}</td>
                  <td style={{ ...S.td(i), color: "#8aaecb" }}>{r.contact || "—"}</td>
                  <td style={S.td(i)}>{r.partnerName}</td>
                  <td style={S.td(i)}>
                    <span style={{ padding: "2px 8px", background: r.product==="Hotel" ? "#1a2f4e" : "#1a2e1a",
                      borderRadius: 5, color: r.product==="Hotel" ? "#60a5fa" : "#4ade80", fontSize: 11, fontWeight: 700 }}>
                      {r.product}
                    </span>
                  </td>
                  <td style={S.td(i)}>
                    <span style={{ padding: "3px 9px", background: STATUS_BG[r.status]||"#0a1628",
                      border: `1px solid ${STATUS_BORDER[r.status]||"#1e3a5f"}`,
                      borderRadius: 20, color: STATUS_COLOR[r.status]||"#e8f0fe", fontSize: 11, fontWeight: 700 }}>
                      {STATUS_LABEL[r.status]||r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div style={{ padding: "12px 20px", borderTop: "1px solid #1e3a5f", color: "#5b7fa6", fontSize: 12 }}>
            Kliknij wiersz aby wyróżnić · Wyniki: {filtered.length} poleceń
          </div>
        )}
      </div>
    </>
  );
}

// ─── RAPORT WYNAGRODZEŃ ───────────────────────────────────────────────────────
function ReportSalary({ allReferrals, allPartners }) {
  const [fPartner,  setFPartner]  = useState("all");
  const [fDateFrom, setFDateFrom] = useState("");
  const [fDateTo,   setFDateTo]   = useState("");
  const [fStatus,   setFStatus]   = useState("all");
  const [highlighted, setHighlighted] = useState(null);

  const filtered = allReferrals.filter(r => {
    if (fPartner !== "all" && r.partnerId !== fPartner) return false;
    if (fDateFrom && r.date < fDateFrom) return false;
    if (fDateTo   && r.date > fDateTo)   return false;
    if (fStatus === "paid"    && r.commission <= 0) return false;
    if (fStatus === "pending_pay" && (r.status !== "pending")) return false;
    if (fStatus === "rejected" && r.status !== "rejected") return false;
    return true;
  });

  const totalBonus     = filtered.reduce((s, r) => s + (r.commission || 0), 0);
  const totalRecurring = filtered.filter(r=>r.status==="active").reduce((s,r) => s + (r.recurring||0), 0);
  const totalPending   = filtered.filter(r=>r.status==="pending").length;
  const totalRejected  = filtered.filter(r=>r.status==="rejected").length;

  const S = {
    th: { color: "#5b7fa6", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", padding: "10px 14px", background: "#091220", whiteSpace: "nowrap" },
    td: (i) => ({ padding: "11px 14px", borderBottom: "1px solid #0e1e3a", background: i%2 ? "#080f1e" : "#0b1628", fontSize: 13, color: "#c8d8e8", verticalAlign: "middle" }),
    input: { background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 7, padding: "8px 12px", color: "#e8f0fe", fontSize: 13 },
    select: { background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 7, padding: "8px 12px", color: "#e8f0fe", fontSize: 13 },
  };

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 800, margin: "0 0 6px", color: "#e8f0fe" }}>Raport wynagrodzeń</h1>
        <p style={{ color: "#6b8cad", margin: 0, fontSize: 14 }}>Zestawienie prowizji i premii dla partnerów</p>
      </div>

      {/* Filters */}
      <div style={{ background: "#0e1e3a", border: "1px solid #1e3a5f", borderRadius: 14, padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 160px" }}>
            <label style={{ display: "block", color: "#5b7fa6", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Partner</label>
            <select value={fPartner} onChange={e => setFPartner(e.target.value)} style={{ ...S.select, width: "100%" }}>
              <option value="all">Wszyscy</option>
              {allPartners.map((p,i) => <option key={i} value={p.email}>{p.name}</option>)}
            </select>
          </div>
          <div style={{ flex: "1 1 140px" }}>
            <label style={{ display: "block", color: "#5b7fa6", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Data od</label>
            <input type="date" value={fDateFrom} onChange={e => setFDateFrom(e.target.value)}
              style={{ ...S.input, width: "100%", boxSizing: "border-box", colorScheme: "dark" }} />
          </div>
          <div style={{ flex: "1 1 140px" }}>
            <label style={{ display: "block", color: "#5b7fa6", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Data do</label>
            <input type="date" value={fDateTo} onChange={e => setFDateTo(e.target.value)}
              style={{ ...S.input, width: "100%", boxSizing: "border-box", colorScheme: "dark" }} />
          </div>
          <div style={{ flex: "1 1 160px" }}>
            <label style={{ display: "block", color: "#5b7fa6", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Typ</label>
            <select value={fStatus} onChange={e => setFStatus(e.target.value)} style={{ ...S.select, width: "100%" }}>
              <option value="all">Wszystkie</option>
              <option value="paid">Wypłacone (aktywne)</option>
              <option value="pending_pay">W toku</option>
              <option value="rejected">Odrzucone</option>
            </select>
          </div>
          <button onClick={() => { setFPartner("all"); setFDateFrom(""); setFDateTo(""); setFStatus("all"); }}
            style={{ padding: "8px 16px", background: "none", border: "1px solid #1e3a5f", borderRadius: 7, color: "#5b7fa6", fontSize: 13, cursor: "pointer", alignSelf: "flex-end" }}>
            Wyczyść
          </button>
        </div>
      </div>

      {/* KPI summary */}
      <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Premia jednorazowa",   val: `${totalBonus.toLocaleString("pl")} zł`,     color: "#3b9de8",  icon: "🎯" },
          { label: "Prowizja miesięczna",  val: `${totalRecurring.toLocaleString("pl")} zł`, color: "#22c55e",  icon: "🔄" },
          { label: "Polecenia w toku",     val: totalPending,                                 color: "#eab308",  icon: "⏳" },
          { label: "Polecenia odrzucone",  val: totalRejected,                                color: "#ef4444",  icon: "✗"  },
        ].map(c => (
          <div key={c.label} style={{ background: "#0e1e3a", border: `1px solid ${c.color}33`, borderRadius: 12, padding: "16px 20px", flex: "1 1 160px", minWidth: 150 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: "#5b7fa6", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>{c.label}</span>
              <span>{c.icon}</span>
            </div>
            <div style={{ color: c.color, fontWeight: 800, fontSize: 22, fontFamily: "'Sora',sans-serif" }}>{c.val}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#0e1e3a", border: "1px solid #1e3a5f", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
            <thead>
              <tr>
                {["Nr polecenia","Data","Klient (firma)","Partner","Produkt","Status","Premia","Prowizja/mies.","Maks. łącznie"].map(h =>
                  <th key={h} style={{ ...S.th, textAlign: "left" }}>{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={9} style={{ padding: "40px", textAlign: "center", color: "#3a4f6a" }}>Brak danych spełniających kryteria</td></tr>
              )}
              {filtered.map((r, i) => {
                const maxTotal = (r.commission||0) + (r.recurring||0) * (r.months||0);
                return (
                  <tr key={r.id} style={{ cursor: "pointer" }} onClick={() => setHighlighted(highlighted===r.id ? null : r.id)}>
                    <td style={{ ...S.td(i), outline: highlighted===r.id ? "2px solid #3b9de8" : "none" }}>
                      <span style={{ fontFamily: "monospace", color: "#3b9de8", fontWeight: 700, fontSize: 12,
                        background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 5, padding: "3px 8px" }}>
                        {r.refNumber || "—"}
                      </span>
                    </td>
                    <td style={S.td(i)}>{formatDate(r.date)}</td>
                    <td style={{ ...S.td(i), fontWeight: 700, color: "#e8f0fe" }}>{r.company}</td>
                    <td style={S.td(i)}>{r.partnerName}</td>
                    <td style={S.td(i)}>
                      <span style={{ padding: "2px 8px", background: r.product==="Hotel" ? "#1a2f4e" : "#1a2e1a",
                        borderRadius: 5, color: r.product==="Hotel" ? "#60a5fa" : "#4ade80", fontSize: 11, fontWeight: 700 }}>
                        {r.product}
                      </span>
                    </td>
                    <td style={S.td(i)}><Badge status={r.status} /></td>
                    <td style={{ ...S.td(i), color: r.commission > 0 ? "#e8f0fe" : "#3a4f6a", fontWeight: 700 }}>
                      {r.commission > 0 ? `${r.commission.toLocaleString("pl")} zł` : "—"}
                    </td>
                    <td style={{ ...S.td(i), color: r.recurring > 0 ? "#22c55e" : "#3a4f6a", fontWeight: 700 }}>
                      {r.recurring > 0 ? `+${r.recurring} zł` : "—"}
                    </td>
                    <td style={{ ...S.td(i), color: maxTotal > 0 ? "#f59e0b" : "#3a4f6a", fontWeight: 800 }}>
                      {maxTotal > 0 ? `${maxTotal.toLocaleString("pl")} zł` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={6} style={{ padding: "12px 14px", background: "#091220", color: "#5b7fa6", fontSize: 12, fontWeight: 700 }}>
                    SUMA ({filtered.length} poleceń)
                  </td>
                  <td style={{ padding: "12px 14px", background: "#091220", color: "#3b9de8", fontWeight: 800, fontSize: 14 }}>
                    {filtered.reduce((s,r)=>s+(r.commission||0),0).toLocaleString("pl")} zł
                  </td>
                  <td style={{ padding: "12px 14px", background: "#091220", color: "#22c55e", fontWeight: 800, fontSize: 14 }}>
                    +{filtered.filter(r=>r.status==="active").reduce((s,r)=>s+(r.recurring||0),0).toLocaleString("pl")} zł
                  </td>
                  <td style={{ padding: "12px 14px", background: "#091220", color: "#f59e0b", fontWeight: 800, fontSize: 14 }}>
                    {filtered.reduce((s,r)=>s+(r.commission||0)+(r.recurring||0)*(r.months||0),0).toLocaleString("pl")} zł
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </>
  );
}

// ─── ADMIN CREDENTIALS ───────────────────────────────────────────────────────
const ADMIN_EMAIL = "admin@lsi-cloud.pl";
const ADMIN_PASSWORD = "LSIadmin2026!";

// ─── DEFAULT COMMISSION RATES ────────────────────────────────────────────────
const DEFAULT_RATES = {
  ambasador:  { bonus_gastro: 200, bonus_hotel: 300, recurring_pct: 0,  recurring_months: 0,  annual_bonus: 0    },
  partner:    { bonus_gastro: 400, bonus_hotel: 600, recurring_pct: 6,  recurring_months: 12, annual_bonus: 0    },
  premium:    { bonus_gastro: 700, bonus_hotel: 900, recurring_pct: 10, recurring_months: 24, annual_bonus: 3000 },
  // Level thresholds (min referrals/year to reach level)
  thresholds: { ambasador: 1, partner: 5, premium: 15 },
};

// ─── MOCK ALL-PARTNERS DATA (for admin view) ─────────────────────────────────
const allPartners = [
  { id: 1, name: "Marek Kowalski",    email: "marek.kowalski@restauracja.pl", company: "Restauracja Pod Lipą", level: "Partner",         referrals: 9,  earned: 4820, pending: 1140 },
  { id: 2, name: "Anna Wiśniewska",   email: "anna@hotelik.pl",               company: "Hotelik u Anny",       level: "Ambasador",       referrals: 3,  earned: 900,  pending: 300  },
  { id: 3, name: "Piotr Kowalczyk",   email: "piotr@gastronet.pl",            company: "GastroNet Sp. z o.o.", level: "Partner Premium", referrals: 18, earned: 12400, pending: 2800 },
  { id: 4, name: "Zofia Maj",         email: "zofia@hotelezłote.pl",          company: "Hotele Złote S.A.",    level: "Partner",         referrals: 7,  earned: 3200, pending: 0    },
  { id: 5, name: "Tomasz Lewicki",    email: "t.lewicki@gastro.pl",           company: "Lewicki Gastro",       level: "Ambasador",       referrals: 2,  earned: 400,  pending: 0    },
];

const MOCK_ALL_REFERRALS = [
  { id: 1,  partnerId: 1, partnerName: "Marek Kowalski",  company: "Pizzeria Napoli",     product: "Gastro", status: "active",    date: "2026-02-10", commission: 480, subscriptionValue: 299, recurring: 92,  months: 7  },
  { id: 2,  partnerId: 1, partnerName: "Marek Kowalski",  company: "Hotel Bursztyn",      product: "Hotel",  status: "active",    date: "2026-01-22", commission: 700, subscriptionValue: 499, recurring: 138, months: 5  },
  { id: 3,  partnerId: 1, partnerName: "Marek Kowalski",  company: "Kawiarnia Złota",     product: "Gastro", status: "pending",   date: "2026-03-01", commission: 0,   subscriptionValue: 0,   recurring: 0,   months: 0  },
  { id: 4,  partnerId: 2, partnerName: "Anna Wiśniewska", company: "Pensjonat Morski",    product: "Hotel",  status: "active",    date: "2025-11-18", commission: 600, subscriptionValue: 499, recurring: 125, months: 10 },
  { id: 5,  partnerId: 2, partnerName: "Anna Wiśniewska", company: "Food Truck Mama",     product: "Gastro", status: "pending",   date: "2026-03-08", commission: 0,   subscriptionValue: 0,   recurring: 0,   months: 0  },
  { id: 6,  partnerId: 3, partnerName: "Piotr Kowalczyk", company: "Sieć Bistro 5x",      product: "Gastro", status: "active",    date: "2026-01-05", commission: 700, subscriptionValue: 299, recurring: 54,  months: 4  },
  { id: 7,  partnerId: 3, partnerName: "Piotr Kowalczyk", company: "Aparthotel Sunrise",  product: "Hotel",  status: "active",    date: "2025-12-01", commission: 900, subscriptionValue: 699, recurring: 180, months: 6  },
  { id: 8,  partnerId: 4, partnerName: "Zofia Maj",       company: "Restauracja Arkadia", product: "Gastro", status: "active",    date: "2026-02-20", commission: 400, subscriptionValue: 299, recurring: 88,  months: 3  },
  { id: 9,  partnerId: 4, partnerName: "Zofia Maj",       company: "Hotel Paryski",       product: "Hotel",  status: "rejected",  date: "2026-01-10", commission: 0,   subscriptionValue: 0,   recurring: 0,   months: 0  },
  { id: 10, partnerId: 5, partnerName: "Tomasz Lewicki",  company: "Jadłodajnia Domowa",  product: "Gastro", status: "pending",   date: "2026-03-10", commission: 0,   subscriptionValue: 0,   recurring: 0,   months: 0  },
];

function AdminPanel({ onLogout }) {
  const [tab, setTab] = useState("overview"); // overview | referrals | partners | rates | payouts
  const [rates, setRates] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("lsi_rates") || "null");
      if (!saved) return DEFAULT_RATES;
      // Merge: ensure thresholds always present (backward compat)
      return { ...DEFAULT_RATES, ...saved, thresholds: { ...DEFAULT_RATES.thresholds, ...(saved.thresholds || {}) } };
    } catch { return DEFAULT_RATES; }
  });
  const [ratesDraft, setRatesDraft] = useState(rates);
  const [ratesSaved, setRatesSaved] = useState(false);
  const [allReferrals, setAllReferrals] = useState([]);
  const [allPartners, setAllPartners] = useState([]);
  const [filterPartner, setFilterPartner] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [markModal, setMarkModal] = useState(null);
  const [payoutModal, setPayoutModal] = useState(null);
  const [payoutForm, setPayoutForm]   = useState({ amount: "", date: "", note: "", sendEmail: true });
  const [payoutSending, setPayoutSending] = useState(false);
  const [payoutDone, setPayoutDone]   = useState(null); // partner name after success
  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [allSalespersons, setAllSalespersons] = useState(() => {
    try { return JSON.parse(localStorage.getItem("lsi_salespersons") || "[]"); } catch { return []; }
  });

  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        const [partners, referrals] = await Promise.all([
          SB.get("partners", "?order=created_at.desc"),
          SB.get("referrals", "?order=created_at.desc"),
        ]);
        setAllPartners(partners.map(p => ({
          id: p.id,
          email: p.email,
          name: p.name,
          company: p.company,
          level: p.level,
          referrals: referrals.filter(r => r.partner_email === p.email).length,
          earned: p.total_earned || 0,
          pending: p.pending_payout || 0,
        })));
        setAllReferrals(referrals.map((r, i) => ({
          id: r.id,
          dbId: r.id,
          refNumber: r.ref_number || `LSI-${String(i+1).padStart(4,"0")}`,
          partnerId: r.partner_email,
          partnerName: r.partner_name,
          partnerCompany: r.partner_company,
          company: r.company,
          contact: r.contact,
          email: r.email,
          phone: r.phone,
          product: r.product,
          status: r.status,
          date: r.date,
          commission: r.commission || 0,
          recurring: r.recurring || 0,
          months: r.months || 0,
          subscriptionValue: r.subscription_value || 0,
          notes: r.notes || [],
          salesperson: r.salesperson || null,
        })));
      } catch(e) {
        console.error("Supabase load error:", e);
        // Fallback to localStorage
        try {
          setAllPartners(JSON.parse(localStorage.getItem("lsi_all_partners") || "[]"));
          setAllReferrals(JSON.parse(localStorage.getItem("lsi_all_referrals") || "[]"));
        } catch {}
      }
      setLoadingData(false);
    };
    loadData();
  }, []);

  const reloadAdmin = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const sendPayoutEmail = async (partner, amount, date, note) => {
    try {
      // Build referral list for this partner
      const partnerRefs = allReferrals.filter(r =>
        (r.partnerId === partner.email || r.partnerId === partner.id) && r.status === "active"
      );
      const refsList = partnerRefs.map(r =>
        `• ${r.refNumber || r.id} — ${r.company} (${r.product}) — prowizja: ${r.commission} zł + ${r.recurring} zł/mies.`
      ).join("\n");

      await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id:  EMAILJS_SERVICE_ID,
          template_id: PAYOUT_TEMPLATE_ID,
          user_id:     EMAILJS_PUBLIC_KEY,
          template_params: {
            to_email:       partner.email,
            partner_name:   partner.name,
            partner_company: partner.company || "",
            partner_email:  partner.email,
            partner_code:   partner.code || "",
            payout_amount:  `${parseFloat(amount).toLocaleString("pl")} zł`,
            payout_date:    date,
            payout_note:    note || "Brak dodatkowych uwag.",
            refs_list:      refsList || "Brak aktywnych poleceń.",
            ref_company:    "—", ref_contact: "—", ref_email: "—",
            ref_phone: "—", ref_product: "—", ref_date: "—", ref_note: "—",
          },
        }),
      });
      return true;
    } catch (err) {
      console.error("Email send failed:", err);
      return false;
    }
  };

  const confirmPayout = async () => {
    if (!payoutModal) return;
    const amount = parseFloat(payoutForm.amount) || payoutModal.pending;
    const date   = payoutForm.date || new Date().toISOString().slice(0, 10);
    const note   = payoutForm.note.trim();

    setPayoutSending(true);
    try {
      // Mark payout in Supabase
      if (payoutModal.id) {
        await SB.patch("partners", payoutModal.id, {
          pending_payout: 0,
          last_payout_date:   date,
          last_payout_amount: amount,
        }).catch(console.error);
      }
      // Update local state
      setAllPartners(prev => prev.map(p => p.id === payoutModal.id
        ? { ...p, pending: 0, lastPayoutDate: date, lastPayoutAmount: amount }
        : p
      ));

      // Send email
      let emailOk = true;
      if (payoutForm.sendEmail) {
        emailOk = await sendPayoutEmail(payoutModal, amount, date, note);
      }

      setPayoutDone({ name: payoutModal.name, emailOk, sendEmail: payoutForm.sendEmail });
      setPayoutModal(null);
      setPayoutForm({ amount: "", date: "", note: "", sendEmail: true });
    } finally {
      setPayoutSending(false);
    }
  };

  const saveRates = () => {
    setRates(ratesDraft);
    localStorage.setItem("lsi_rates", JSON.stringify(ratesDraft));
    setRatesSaved(true);
    setTimeout(() => setRatesSaved(false), 2500);

    // Re-evaluate all partner levels based on new thresholds
    const thr = ratesDraft.thresholds || DEFAULT_RATES.thresholds;
    allPartners.forEach(partner => {
      const count = allReferrals.filter(r =>
        r.partnerId === partner.email && r.status !== "rejected"
      ).length;
      const newLevel = count >= thr.premium ? "Partner Premium"
        : count >= thr.partner ? "Partner" : "Ambasador";
      const newLevelNum = count >= thr.premium ? 3 : count >= thr.partner ? 2 : 1;
      if (partner.id && newLevel !== partner.level) {
        SB.patch("partners", partner.id, { level: newLevel, level_num: newLevelNum })
          .catch(console.error);
        setAllPartners(prev => prev.map(p => p.id === partner.id
          ? { ...p, level: newLevel, levelNum: newLevelNum }
          : p
        ));
      }
    });
  };

  const markRealized = (ref) => {
    const partner = allPartners.find(p => p.email === ref.partnerId || p.id === ref.partnerId);
    const level = (partner?.level || "ambasador").toLowerCase();
    const levelKey = level.includes("premium") ? "premium" : level.includes("partner") ? "partner" : "ambasador";
    const r = rates[levelKey];
    const bonus = ref.product === "Hotel" ? r.bonus_hotel : r.bonus_gastro;
    const recurringMonthly = ref.subscriptionValue > 0 ? Math.round(ref.subscriptionValue * r.recurring_pct / 100) : 0;

    const updatedRef = { status: "active", commission: bonus, recurring: recurringMonthly, months: r.recurring_months, subscription_value: ref.subscriptionValue || 299 };

    // Update referral in Supabase
    if (ref.dbId) {
      SB.patch("referrals", ref.dbId, updatedRef).catch(e => console.error("Supabase patch referral error:", e));
    }

    // Update partner pending_payout and total_earned in Supabase
    if (partner && partner.id) {
      // Recalculate from all active referrals for this partner (accurate total)
      const partnerActiveRefs = allReferrals.filter(r =>
        (r.partnerId === ref.partnerId) && (r.status === "active" || r.id === ref.id)
      );
      const newEarned  = partnerActiveRefs.reduce((s, r) =>
        s + (r.id === ref.id ? bonus : (r.commission || 0)), 0);
      const newPending = newEarned; // all earned goes to pending until payout

      SB.patch("partners", partner.id, {
        pending_payout:   newPending,
        total_earned:     newEarned,
        annual_referrals: (partner.referrals || 0) + 1,
      }).catch(e => console.error("Supabase patch partner error:", e));

      // Update local allPartners state
      setAllPartners(prev => prev.map(p => p.id === partner.id
        ? { ...p, pending: newPending, earned: newEarned, referrals: (p.referrals || 0) + 1 }
        : p
      ));
    }

    setAllReferrals(prev => prev.map(item => item.id === ref.id
      ? { ...item, status: "active", commission: bonus, recurring: recurringMonthly, months: r.recurring_months, subscriptionValue: ref.subscriptionValue || 299 }
      : item
    ));
    setMarkModal(null);
  };

  const totalPending = allReferrals.filter(r => !["active","rejected"].includes(r.status)).length;
  const totalActive = allReferrals.filter(r => r.status === "active").length;
  const totalCommissions = allReferrals.reduce((s, r) => s + r.commission, 0);
  const totalRecurring = allReferrals.filter(r => r.status === "active").reduce((s, r) => s + r.recurring, 0);

  const filteredRefs = allReferrals
    .filter(r => filterPartner === "all" || r.partnerId === filterPartner)
    .filter(r => filterStatus === "all" || r.status === filterStatus);

  const LEVEL_COLOR = { "Ambasador": "#c084fc", "Partner": "#3b9de8", "Partner Premium": "#f59e0b" };
  const S = { // styles shorthand
    card: { background: "#0e1e3a", border: "1px solid #1e3a5f", borderRadius: 14, padding: "20px 24px" },
    th: { color: "#5b7fa6", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", padding: "10px 14px", background: "#091220" },
    td: (shade) => ({ padding: "12px 14px", borderBottom: "1px solid #0e1e3a", background: shade ? "#080f1e" : "#0b1628", fontSize: 13, color: "#c8d8e8" }),
    input: { background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 7, padding: "8px 12px", color: "#e8f0fe", fontSize: 14, width: 90, textAlign: "right" },
    tabBtn: (active) => ({ padding: "9px 18px", background: active ? "#1e3a5f" : "none", border: `1px solid ${active ? "#3b9de8" : "#1e3a5f"}`, borderRadius: 8, color: active ? "#e8f0fe" : "#5b7fa6", fontWeight: active ? 700 : 500, fontSize: 13, cursor: "pointer" }),
  };

  return (
    <div style={{ minHeight: "100vh", background: "#060f1e", color: "#e8f0fe", fontFamily: "'DM Sans', sans-serif", display: "flex" }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <style>{"@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap')"}</style>

      {/* Sidebar */}
      <div style={{ width: 230, background: "#080f20", borderRight: "1px solid #1e3a5f", display: "flex", flexDirection: "column", padding: "28px 0", flexShrink: 0, position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ padding: "0 22px", marginBottom: 32 }}>
          <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 17, color: "#e8f0fe" }}>LSI Cloud</div>
          <div style={{ color: "#ef4444", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>Panel Administratora</div>
        </div>
        <div style={{ padding: "0 22px", marginBottom: 24 }}>
          <div style={{ background: "#1a0a0a", border: "1px solid #7f1d1d", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#fca5a5" }}>
            🔒 Tryb administracyjny
          </div>
        </div>
        <nav style={{ flex: 1, padding: "0 14px" }}>
          {[
            { id: "overview",      icon: "◉", label: "Przegląd" },
            { id: "referrals",     icon: "◈", label: "Wszystkie polecenia", badge: totalPending },
            { id: "partners",      icon: "◎", label: "Partnerzy" },
            { id: "rates",         icon: "⬡", label: "Stawki prowizji" },
            { id: "payouts",       icon: "◐", label: "Rozliczenia" },
            { id: "handlowcy",     icon: "◑", label: "Handlowcy" },
            { id: "report_ref",    icon: "▦", label: "Raport poleceń" },
            { id: "report_salary", icon: "▤", label: "Raport wynagrodzeń" },
          ].map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", background: tab === item.id ? "#1e3a5f" : "none", border: "none", borderRadius: 9, color: tab === item.id ? "#e8f0fe" : "#5b7fa6", fontWeight: tab === item.id ? 700 : 500, fontSize: 14, cursor: "pointer", marginBottom: 3, textAlign: "left" }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
              {item.badge > 0 && <span style={{ marginLeft: "auto", background: "#ef4444", borderRadius: 10, padding: "2px 7px", fontSize: 11, fontWeight: 800, color: "#fff" }}>{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div style={{ padding: "0 14px", display: "flex", flexDirection: "column", gap: 6 }}>
          <button onClick={reloadAdmin} disabled={refreshing}
            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", background: refreshing ? "#0a1628" : "#0e1e3a", border: "1px solid #1e3a5f", borderRadius: 9, color: refreshing ? "#3a4f6a" : "#3b9de8", fontSize: 14, cursor: refreshing ? "not-allowed" : "pointer", fontWeight: 600, transition: "all 0.2s" }}>
            <span className={refreshing ? "spin" : ""} style={{ fontSize: 16, display: "inline-block" }}>↻</span>
            {refreshing ? "Odświeżanie…" : "Odśwież dane"}
          </button>
          <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", background: "none", border: "none", borderRadius: 9, color: "#5b7fa6", fontSize: 14, cursor: "pointer" }}>← Wyloguj</button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: "auto", padding: "36px 40px" }}>

        {/* ── MARK AS REALIZED MODAL ── */}
        {markModal && (() => {
          const partner = allPartners.find(p => p.email === markModal.partnerId || p.id === markModal.partnerId);
          const levelKey = (partner?.level || "").includes("Premium") ? "premium" : (partner?.level || "").includes("Partner") ? "partner" : "ambasador";
          const r = rates[levelKey];
          const bonus = markModal.product === "Hotel" ? r.bonus_hotel : r.bonus_gastro;
          const subVal = markModal.subscriptionValue || 299;
          const recurring = r.recurring_pct > 0 ? Math.round(subVal * r.recurring_pct / 100) : 0;
          return (
            <div style={{ position: "fixed", inset: 0, background: "rgba(6,15,30,0.92)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
              <div style={{ background: "#0e1e3a", border: "1px solid #1e3a5f", borderRadius: 16, width: "100%", maxWidth: 480, padding: "36px 40px" }}>
                <h3 style={{ color: "#e8f0fe", fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 700, margin: "0 0 6px" }}>Oznacz jako zrealizowane</h3>
                <p style={{ color: "#6b8cad", fontSize: 13, margin: "0 0 24px" }}>Potwierdź realizację polecenia i nalicz wynagrodzenie</p>

                <div style={{ background: "#091220", border: "1px solid #1e3a5f", borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 0" }}>
                    {[["Firma", markModal.company], ["Produkt", markModal.product], ["Partner", partner?.name], ["Poziom", partner?.level]].map(([k,v]) => (
                      <div key={k}><span style={{ color: "#5b7fa6", fontSize: 12 }}>{k}: </span><span style={{ color: "#e8f0fe", fontSize: 13, fontWeight: 600 }}>{v}</span></div>
                    ))}
                  </div>
                </div>

                <div style={{ background: "#091220", border: "1px solid #22c55e33", borderRadius: 10, padding: "16px", marginBottom: 20 }}>
                  <div style={{ color: "#22c55e", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>Naliczone wynagrodzenie</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#8aaecb", fontSize: 13 }}>Premia jednorazowa ({markModal.product}):</span>
                      <span style={{ color: "#e8f0fe", fontWeight: 700, fontSize: 15 }}>{bonus} zł</span>
                    </div>
                    {recurring > 0 && <>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#8aaecb", fontSize: 13 }}>Prowizja miesięczna ({r.recurring_pct}% z {subVal} zł):</span>
                        <span style={{ color: "#22c55e", fontWeight: 700, fontSize: 15 }}>+{recurring} zł/mies.</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#8aaecb", fontSize: 13 }}>Przez:</span>
                        <span style={{ color: "#e8f0fe", fontSize: 13 }}>{r.recurring_months} miesięcy</span>
                      </div>
                      <div style={{ borderTop: "1px solid #1e3a5f", paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#8aaecb", fontSize: 13 }}>Łącznie (max):</span>
                        <span style={{ color: "#f59e0b", fontWeight: 800, fontSize: 16 }}>{bonus + recurring * r.recurring_months} zł</span>
                      </div>
                    </>}
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ color: "#8aaecb", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 8 }}>Wartość abonamentu klienta (zł/mies.)</label>
                  <input type="number" defaultValue={subVal}
                    onChange={e => setMarkModal(prev => ({ ...prev, subscriptionValue: parseInt(e.target.value) || 299 }))}
                    style={{ ...S.input, width: "100%", textAlign: "left" }} />
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setMarkModal(null)} style={{ flex: 1, padding: "11px", background: "none", border: "1px solid #1e3a5f", borderRadius: 9, color: "#6b8cad", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Anuluj</button>
                  <button onClick={() => markRealized(markModal)} style={{ flex: 2, padding: "11px", background: "linear-gradient(135deg,#166534,#22c55e)", border: "none", borderRadius: 9, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>✓ Zatwierdź realizację</button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── LOADING ── */}
        {loadingData && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, flexDirection: "column", gap: 16 }}>
            <div style={{ width: 40, height: 40, border: "3px solid #1e3a5f", borderTopColor: "#3b9de8", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <div style={{ color: "#5b7fa6", fontSize: 14 }}>Ładowanie danych z bazy…</div>
            <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
          </div>
        )}

        {/* ── OVERVIEW TAB ── */}
        {!loadingData && tab === "overview" && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 14 }}>
              <div>
                <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 800, margin: "0 0 6px" }}>Panel administratora</h1>
                <p style={{ color: "#6b8cad", margin: 0, fontSize: 14 }}>Zarządzaj programem poleceń LSI Cloud</p>
              </div>
              <button onClick={reloadAdmin} disabled={refreshing}
                title="Odśwież wszystkie dane"
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", background: "#0e1e3a", border: "1px solid #1e3a5f", borderRadius: 9, color: refreshing ? "#3a4f6a" : "#3b9de8", fontWeight: 700, fontSize: 14, cursor: refreshing ? "not-allowed" : "pointer", transition: "all 0.2s" }}>
                <span className={refreshing ? "spin" : ""} style={{ display: "inline-block", fontSize: 16 }}>↻</span>
                {refreshing ? "Odświeżanie…" : "Odśwież dane"}
              </button>
            </div>
            <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
              {[
                { label: "Aktywni partnerzy",    value: allPartners.length, sub: "zarejestrowanych",        color: "#3b9de8",  icon: "👥" },
                { label: "Polecenia do weryfik.", value: totalPending,             sub: "oczekują na decyzję",     color: "#ef4444",  icon: "⏳" },
                { label: "Aktywne kontrakty",     value: totalActive,             sub: "przynosi prowizję",       color: "#22c55e",  icon: "✅" },
                { label: "Prowizje miesięczne",   value: `${totalRecurring} zł`,  sub: "łącznie do wypłaty/mies.", color: "#f59e0b",  icon: "💰" },
              ].map(c => (
                <div key={c.label} style={{ ...S.card, flex: 1, minWidth: 160 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ color: "#5b7fa6", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>{c.label}</span>
                    <span style={{ fontSize: 18 }}>{c.icon}</span>
                  </div>
                  <div style={{ color: c.color, fontSize: 28, fontWeight: 800, fontFamily: "'Sora',sans-serif" }}>{c.value}</div>
                  <div style={{ color: "#5b7fa6", fontSize: 12, marginTop: 6 }}>{c.sub}</div>
                </div>
              ))}
            </div>

            {/* Pending referrals quick action */}
            {allPartners.length === 0 && (
              <div style={{ background: "#0e1e3a", border: "1px solid #1e3a5f", borderRadius: 14, padding: "40px 24px", marginBottom: 24, textAlign: "center" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>👥</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#5b7fa6", marginBottom: 8 }}>Brak zarejestrowanych partnerów</div>
                <div style={{ color: "#3a4f6a", fontSize: 13 }}>Partnerzy pojawią się tutaj po rejestracji w portalu</div>
              </div>
            )}
            {totalPending > 0 && (
              <div style={{ ...S.card, marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: "#e8f0fe" }}>⚡ Polecenia wymagające decyzji ({totalPending})</span>
                  <button onClick={() => setTab("referrals")} style={{ background: "none", border: "none", color: "#3b9de8", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Zobacz wszystkie →</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {allReferrals.filter(r => r.status === "pending").slice(0, 4).map(r => (
                    <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 14px", background: "#091220", borderRadius: 10, flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 120 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#e8f0fe" }}>{r.company}</div>
                        <div style={{ fontSize: 11, color: "#5b7fa6" }}>{r.partnerName} · {r.date}</div>
                      </div>
                      <span style={{ padding: "3px 9px", background: "#1c1a08", border: "1px solid #ca8a04", borderRadius: 20, color: "#eab308", fontSize: 11, fontWeight: 700 }}>W toku</span>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => setMarkModal(r)}
                          style={{ padding: "6px 14px", background: "linear-gradient(135deg,#166534,#22c55e)", border: "none", borderRadius: 7, color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                          ✓ Realizuj
                        </button>
                        <select onChange={e => {
                            const s = e.target.value; if (!s) return;
                            if (r.dbId) SB.patch("referrals", r.dbId, { status: s }).catch(console.error);
                            setAllReferrals(prev => prev.map(x => x.id === r.id ? { ...x, status: s } : x));
                          }}
                          defaultValue=""
                          style={{ background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 7, padding: "5px 8px", color: "#e8f0fe", fontSize: 12, cursor: "pointer" }}>
                          <option value="" disabled>Zmień status…</option>
                          <option value="contacted">Kontakt nawiązany</option>
                          <option value="demo">Demo umówione</option>
                          <option value="signed">Umowa podpisana</option>
                          <option value="rejected">✗ Odrzuć</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Partners summary */}
            <div style={{ ...S.card }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#e8f0fe", marginBottom: 16 }}>Top partnerzy</div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>{["Partner", "Firma", "Poziom", "Polecenia", "Zarobki"].map(h => <th key={h} style={{ ...S.th, textAlign: "left" }}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {allPartners.sort((a,b) => b.earned - a.earned).map((p, i) => (
                    <tr key={p.id}>
                      <td style={S.td(i%2)}><span style={{ fontWeight: 700, color: "#e8f0fe" }}>{p.name}</span></td>
                      <td style={S.td(i%2)}>{p.company}</td>
                      <td style={S.td(i%2)}><span style={{ padding: "3px 9px", background: "#0a1628", border: `1px solid ${LEVEL_COLOR[p.level] || "#3b9de8"}`, borderRadius: 20, color: LEVEL_COLOR[p.level] || "#3b9de8", fontSize: 11, fontWeight: 700 }}>{p.level}</span></td>
                      <td style={S.td(i%2)}>{p.referrals}</td>
                      <td style={{ ...S.td(i%2), color: "#22c55e", fontWeight: 700 }}>{p.earned.toLocaleString("pl")} zł</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── REFERRALS TAB ── */}
        {!loadingData && tab === "referrals" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 14 }}>
              <div>
                <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 800, margin: "0 0 6px" }}>Wszystkie polecenia</h1>
                <p style={{ color: "#6b8cad", margin: 0, fontSize: 14 }}>{allReferrals.length} poleceń łącznie</p>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <select value={filterPartner} onChange={e => setFilterPartner(e.target.value)}
                  style={{ ...S.input, width: "auto", textAlign: "left", padding: "8px 14px" }}>
                  <option value="all">Wszyscy partnerzy</option>
                  {allPartners.map((p, i) => <option key={i} value={p.email}>{p.name}</option>)}
                </select>
                {[
                  ["all", "Wszystkie"],
                  ["pending", `Nowe (${allReferrals.filter(r=>r.status==="pending").length})`],
                  ["contacted", "Kontakt"],
                  ["demo", "Demo"],
                  ["signed", "Podpisane"],
                  ["active", "Aktywne"],
                  ["rejected", "Odrzucone"],
                ].map(([s, label]) => (
                  <button key={s} onClick={() => setFilterStatus(s)} style={S.tabBtn(filterStatus === s)}>{label}</button>
                ))}
                <button onClick={reloadAdmin} disabled={refreshing}
                  title="Odśwież dane"
                  style={{ padding: "7px 12px", background: "#0e1e3a", border: "1px solid #1e3a5f", borderRadius: 8, color: refreshing ? "#3a4f6a" : "#3b9de8", fontWeight: 700, fontSize: 16, cursor: refreshing ? "not-allowed" : "pointer" }}>
                  <span className={refreshing ? "spin" : ""} style={{ display: "inline-block" }}>↻</span>
                </button>
              </div>
            </div>
            <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>{["Firma", "Partner", "Produkt", "Data", "Status", "Premia", "Prowizja/mies.", "Handlowiec / Akcja"].map(h => <th key={h} style={{ ...S.th, textAlign: "left" }}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {filteredRefs.map((r, i) => (
                    <tr key={r.id}>
                      <td style={S.td(i%2)}><span style={{ fontWeight: 700, color: "#e8f0fe" }}>{r.company}</span></td>
                      <td style={S.td(i%2)}><span style={{ fontSize: 12, color: "#8aaecb" }}>{r.partnerName}</span></td>
                      <td style={S.td(i%2)}><span style={{ fontSize: 12, padding: "2px 8px", background: r.product === "Hotel" ? "#1a2f4e" : "#1a2e1a", borderRadius: 5, color: r.product === "Hotel" ? "#60a5fa" : "#4ade80", fontWeight: 600 }}>{r.product}</span></td>
                      <td style={S.td(i%2)}>{r.date}</td>
                      <td style={S.td(i%2)}>
                        <Badge status={r.status} />
                      </td>
                      <td style={{ ...S.td(i%2), color: r.commission > 0 ? "#e8f0fe" : "#3a4f6a", fontWeight: 700 }}>{r.commission > 0 ? `${r.commission} zł` : "—"}</td>
                      <td style={{ ...S.td(i%2), color: r.recurring > 0 ? "#22c55e" : "#3a4f6a", fontWeight: 700 }}>{r.recurring > 0 ? `+${r.recurring} zł` : "—"}</td>
                      <td style={S.td(i%2)}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          <select value={r.status}
                            onChange={e => {
                              const newStatus = e.target.value;
                              if (newStatus === "active") { setMarkModal(r); return; }
                              if (r.dbId) SB.patch("referrals", r.dbId, { status: newStatus }).catch(console.error);
                              setAllReferrals(prev => prev.map(x => x.id === r.id ? { ...x, status: newStatus } : x));
                            }}
                            style={{ background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 6, padding: "5px 8px", color: "#e8f0fe", fontSize: 12, cursor: "pointer", width: "100%" }}>
                            <option value="pending">Nowe</option>
                            <option value="contacted">Kontakt nawiązany</option>
                            <option value="demo">Demo umówione</option>
                            <option value="signed">Umowa podpisana</option>
                            <option value="active">✓ Realizuj (aktywny)</option>
                            <option value="rejected">✗ Odrzuć</option>
                          </select>
                          <select value={r.salesperson || ""}
                            onChange={e => {
                              const sp = e.target.value || null;
                              if (r.dbId) SB.patch("referrals", r.dbId, { salesperson: sp }).catch(console.error);
                              setAllReferrals(prev => prev.map(x => x.id === r.id ? { ...x, salesperson: sp } : x));
                            }}
                            style={{ background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 6, padding: "5px 8px", color: r.salesperson ? "#e8f0fe" : "#5b7fa6", fontSize: 12, cursor: "pointer", width: "100%" }}>
                            <option value="">— brak handlowca —</option>
                            {allSalespersons.map((sp, si) => (
                              <option key={si} value={sp.name}>{sp.name}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredRefs.length === 0 && <tr><td colSpan={8} style={{ padding: "32px", textAlign: "center", color: "#5b7fa6" }}>Brak poleceń</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── PARTNERS TAB ── */}
        {!loadingData && tab === "partners" && (
          <>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 800, margin: "0 0 6px" }}>Partnerzy</h1>
              <p style={{ color: "#6b8cad", margin: 0, fontSize: 14 }}>{allPartners.length} zarejestrowanych partnerów</p>
            </div>
            <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>{["Partner", "E-mail", "Firma", "Poziom", "Polecenia", "Zarobki", "Do wypłaty"].map(h => <th key={h} style={{ ...S.th, textAlign: "left" }}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {allPartners.map((p, i) => (
                    <tr key={p.id}>
                      <td style={S.td(i%2)}><span style={{ fontWeight: 700, color: "#e8f0fe" }}>{p.name}</span></td>
                      <td style={S.td(i%2)}><span style={{ fontSize: 12, color: "#6b8cad" }}>{p.email}</span></td>
                      <td style={S.td(i%2)}>{p.company}</td>
                      <td style={S.td(i%2)}><span style={{ padding: "3px 9px", background: "#0a1628", border: `1px solid ${LEVEL_COLOR[p.level] || "#3b9de8"}`, borderRadius: 20, color: LEVEL_COLOR[p.level] || "#3b9de8", fontSize: 11, fontWeight: 700 }}>{p.level}</span></td>
                      <td style={S.td(i%2)}>{p.referrals}</td>
                      <td style={{ ...S.td(i%2), color: "#22c55e", fontWeight: 700 }}>{p.earned.toLocaleString("pl")} zł</td>
                      <td style={{ ...S.td(i%2), color: p.pending > 0 ? "#f59e0b" : "#3a4f6a", fontWeight: 700 }}>{p.pending > 0 ? `${p.pending.toLocaleString("pl")} zł` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── RATES TAB ── */}
        {!loadingData && tab === "rates" && (
          <>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 800, margin: "0 0 6px" }}>Stawki prowizji</h1>
              <p style={{ color: "#6b8cad", margin: 0, fontSize: 14 }}>Konfiguracja wynagrodzeń per poziom partnerski</p>
            </div>

            {ratesSaved && (
              <div style={{ background: "#0d2e1a", border: "1px solid #16a34a", borderRadius: 10, padding: "12px 18px", marginBottom: 20, color: "#22c55e", fontSize: 14, fontWeight: 600 }}>
                ✓ Stawki zostały zapisane i będą obowiązywać dla nowych realizacji
              </div>
            )}

            {[
              { key: "ambasador", label: "Ambasador", color: "#c084fc", desc: `${(ratesDraft.thresholds||DEFAULT_RATES.thresholds).ambasador}–${(ratesDraft.thresholds||DEFAULT_RATES.thresholds).partner - 1} poleceń / rok` },
              { key: "partner",   label: "Partner",   color: "#3b9de8", desc: `${(ratesDraft.thresholds||DEFAULT_RATES.thresholds).partner}–${(ratesDraft.thresholds||DEFAULT_RATES.thresholds).premium - 1} poleceń / rok` },
              { key: "premium",   label: "Partner Premium", color: "#f59e0b", desc: `${(ratesDraft.thresholds||DEFAULT_RATES.thresholds).premium}+ poleceń / rok` },
            ].map(level => {
              const d = ratesDraft[level.key];
              const set = (field, val) => setRatesDraft(prev => ({ ...prev, [level.key]: { ...prev[level.key], [field]: val } }));
              return (
                <div key={level.key} style={{ ...S.card, marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <span style={{ padding: "5px 14px", background: "#0a1628", border: `1px solid ${level.color}`, borderRadius: 20, color: level.color, fontSize: 13, fontWeight: 700 }}>{level.label}</span>
                    <span style={{ color: "#5b7fa6", fontSize: 13 }}>{level.desc}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
                    {[
                      { field: "bonus_gastro",      label: "Premia jednorazowa — Gastro", unit: "zł" },
                      { field: "bonus_hotel",        label: "Premia jednorazowa — Hotel",  unit: "zł" },
                      { field: "recurring_pct",      label: "Prowizja cykliczna",           unit: "% abonamentu / mies." },
                      { field: "recurring_months",   label: "Czas trwania prowizji",        unit: "miesięcy" },
                      { field: "annual_bonus",       label: "Bonus roczny",                 unit: "zł" },
                    ].map(f => (
                      <div key={f.field}>
                        <label style={{ display: "block", color: "#8aaecb", fontSize: 11, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>{f.label}</label>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <input type="number" value={d[f.field]} onChange={e => set(f.field, parseFloat(e.target.value) || 0)}
                            style={{ ...S.input, width: 90 }} />
                          <span style={{ color: "#5b7fa6", fontSize: 13 }}>{f.unit}</span>
                        </div>
                        {f.field === "recurring_pct" && d[f.field] > 0 && (
                          <div style={{ color: "#6b8cad", fontSize: 11, marginTop: 4 }}>
                            np. abonament 299 zł → {Math.round(299 * d[f.field] / 100)} zł/mies.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

                        {/* ── THRESHOLDS EDITOR ── */}
            <div style={{ background: "#0e1e3a", border: "1px solid #1e3a5f", borderRadius: 14, padding: "24px 28px", marginBottom: 28 }}>
              <div style={{ marginBottom: 18 }}>
                <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 17, fontWeight: 800, margin: "0 0 4px", color: "#e8f0fe" }}>Progi awansu poziomów</h2>
                <p style={{ color: "#5b7fa6", fontSize: 13, margin: 0 }}>Minimalna liczba poleceń w roku kalendarzowym potrzebna do osiągnięcia danego poziomu</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                {[
                  { key: "ambasador", label: "Ambasador",      color: "#c084fc", icon: "🌱", desc: "Poziom startowy" },
                  { key: "partner",   label: "Partner",        color: "#3b9de8", icon: "⭐", desc: "Poziom pośredni" },
                  { key: "premium",   label: "Partner Premium", color: "#f59e0b", icon: "🏆", desc: "Poziom najwyższy" },
                ].map(({ key, label, color, icon, desc }) => (
                  <div key={key} style={{ background: "#0a1628", border: `1px solid ${color}44`, borderRadius: 12, padding: "18px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <span style={{ fontSize: 18 }}>{icon}</span>
                      <div>
                        <div style={{ color, fontWeight: 700, fontSize: 14 }}>{label}</div>
                        <div style={{ color: "#5b7fa6", fontSize: 11 }}>{desc}</div>
                      </div>
                    </div>
                    <label style={{ color: "#5b7fa6", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6 }}>
                      Min. poleceń / rok
                    </label>
                    <input
                      type="number" min={0} max={999}
                      value={(ratesDraft.thresholds || DEFAULT_RATES.thresholds)[key]}
                      onChange={e => setRatesDraft(prev => ({
                        ...prev,
                        thresholds: {
                          ...(prev.thresholds || DEFAULT_RATES.thresholds),
                          [key]: Math.max(0, parseInt(e.target.value) || 0),
                        }
                      }))}
                      style={{ width: "100%", background: "#060f1e", border: `1px solid ${color}55`, borderRadius: 8, padding: "10px 14px", color: "#e8f0fe", fontSize: 18, fontWeight: 800, textAlign: "center", boxSizing: "border-box" }}
                    />
                    <div style={{ color: "#3a4f6a", fontSize: 11, marginTop: 8, textAlign: "center" }}>
                      {key === "ambasador" ? "od 0 poleceń" : `od ${(ratesDraft.thresholds || DEFAULT_RATES.thresholds)[key]} poleceń`}
                    </div>
                  </div>
                ))}
              </div>
              {/* Visual threshold preview */}
              <div style={{ marginTop: 20, padding: "14px 18px", background: "#060f1e", borderRadius: 10, display: "flex", alignItems: "center", gap: 0, overflow: "hidden", position: "relative" }}>
                {[
                  { key: "ambasador", label: "Ambasador",      color: "#c084fc", from: 0,                                                          to: (ratesDraft.thresholds||DEFAULT_RATES.thresholds).partner },
                  { key: "partner",   label: "Partner",        color: "#3b9de8", from: (ratesDraft.thresholds||DEFAULT_RATES.thresholds).partner,   to: (ratesDraft.thresholds||DEFAULT_RATES.thresholds).premium },
                  { key: "premium",   label: "Partner Premium", color: "#f59e0b", from: (ratesDraft.thresholds||DEFAULT_RATES.thresholds).premium,   to: null },
                ].map(({ key, label, color, from, to }) => (
                  <div key={key} style={{ flex: to ? to - from : 1, minWidth: 60, padding: "8px 10px", background: `${color}15`, borderRight: to ? `1px solid #1e3a5f` : "none", textAlign: "center" }}>
                    <div style={{ color, fontWeight: 700, fontSize: 11 }}>{label}</div>
                    <div style={{ color: "#5b7fa6", fontSize: 10, marginTop: 2 }}>{from}–{to ? to-1 : "∞"} pol.</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setRatesDraft(DEFAULT_RATES)} style={{ padding: "12px 24px", background: "none", border: "1px solid #1e3a5f", borderRadius: 10, color: "#6b8cad", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                Przywróć domyślne
              </button>
              <button onClick={saveRates} style={{ padding: "12px 28px", background: "linear-gradient(135deg,#1e6fb5,#3b9de8)", border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                Zapisz stawki →
              </button>
            </div>

            {/* Preview table */}
            <div style={{ ...S.card, marginTop: 28 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#e8f0fe", marginBottom: 16 }}>Podgląd — przykładowe wynagrodzenia</div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>{["Poziom", "Gastro — premia", "Hotel — premia", "Prowizja mies.", "Maks. łącznie (Gastro 12 mies.)", "Bonus roczny"].map(h => <th key={h} style={{ ...S.th, textAlign: "left" }}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {[
                    { key: "ambasador", label: "Ambasador", color: "#c084fc" },
                    { key: "partner",   label: "Partner",   color: "#3b9de8" },
                    { key: "premium",   label: "Partner Premium", color: "#f59e0b" },
                  ].map((level, i) => {
                    const r = ratesDraft[level.key];
                    const monthly = Math.round(299 * r.recurring_pct / 100);
                    const maxTotal = r.bonus_gastro + monthly * r.recurring_months;
                    return (
                      <tr key={level.key}>
                        <td style={S.td(i%2)}><span style={{ padding: "3px 9px", background: "#0a1628", border: `1px solid ${level.color}`, borderRadius: 20, color: level.color, fontSize: 11, fontWeight: 700 }}>{level.label}</span></td>
                        <td style={{ ...S.td(i%2), fontWeight: 700 }}>{r.bonus_gastro} zł</td>
                        <td style={{ ...S.td(i%2), fontWeight: 700 }}>{r.bonus_hotel} zł</td>
                        <td style={{ ...S.td(i%2), color: monthly > 0 ? "#22c55e" : "#3a4f6a", fontWeight: 700 }}>{monthly > 0 ? `+${monthly} zł` : "—"}</td>
                        <td style={{ ...S.td(i%2), color: "#f59e0b", fontWeight: 700 }}>{maxTotal > 0 ? `${maxTotal.toLocaleString("pl")} zł` : "—"}</td>
                        <td style={{ ...S.td(i%2), color: r.annual_bonus > 0 ? "#f59e0b" : "#3a4f6a", fontWeight: 700 }}>{r.annual_bonus > 0 ? `${r.annual_bonus.toLocaleString("pl")} zł` : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── PAYOUTS TAB ── */}
        {!loadingData && tab === "payouts" && (
          <>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 800, margin: "0 0 6px" }}>Rozliczenia</h1>
              <p style={{ color: "#6b8cad", margin: 0, fontSize: 14 }}>Zestawienie prowizji do wypłaty per partner</p>
            </div>
            <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
              {[
                { label: "Łącznie do wypłaty", value: `${allPartners.reduce((s, p) => s + p.pending, 0).toLocaleString("pl")} zł`, color: "#f59e0b" },
                { label: "Prowizje cykliczne (mies.)", value: `${totalRecurring.toLocaleString("pl")} zł`, color: "#22c55e" },
                { label: "Wypłacono łącznie (YTD)", value: `${allPartners.reduce((s, p) => s + p.earned - p.pending, 0).toLocaleString("pl")} zł`, color: "#3b9de8" },
              ].map(c => (
                <div key={c.label} style={{ ...S.card, flex: 1, minWidth: 180 }}>
                  <div style={{ color: "#5b7fa6", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>{c.label}</div>
                  <div style={{ color: c.color, fontSize: 26, fontWeight: 800, fontFamily: "'Sora',sans-serif" }}>{c.value}</div>
                </div>
              ))}
            </div>
            <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>{["Partner", "Poziom", "Prowizje cykliczne", "Premia do wypłaty", "Łącznie do wypłaty", "Akcja"].map(h => <th key={h} style={{ ...S.th, textAlign: "left" }}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {allPartners.map((p, i) => {
                    const partnerRefs = allReferrals.filter(r => (r.partnerId === p.email || r.partnerId === p.id) && r.status === "active");
                    const monthlySum = partnerRefs.reduce((s, r) => s + r.recurring, 0);
                    return (
                      <tr key={p.id}>
                        <td style={S.td(i%2)}>
                          <div style={{ fontWeight: 700, color: "#e8f0fe", fontSize: 13 }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: "#5b7fa6" }}>{p.email}</div>
                        </td>
                        <td style={S.td(i%2)}><span style={{ padding: "3px 9px", background: "#0a1628", border: `1px solid ${LEVEL_COLOR[p.level] || "#3b9de8"}`, borderRadius: 20, color: LEVEL_COLOR[p.level] || "#3b9de8", fontSize: 11, fontWeight: 700 }}>{p.level}</span></td>
                        <td style={{ ...S.td(i%2), color: "#22c55e", fontWeight: 700 }}>{monthlySum > 0 ? `+${monthlySum} zł/mies.` : "—"}</td>
                        <td style={{ ...S.td(i%2), color: p.pending > 0 ? "#f59e0b" : "#3a4f6a", fontWeight: 700 }}>{p.pending > 0 ? `${p.pending.toLocaleString("pl")} zł` : "—"}</td>
                        <td style={{ ...S.td(i%2), color: p.pending + monthlySum > 0 ? "#e8f0fe" : "#3a4f6a", fontWeight: 800, fontSize: 15 }}>{p.pending + monthlySum > 0 ? `${(p.pending + monthlySum).toLocaleString("pl")} zł` : "—"}</td>
                        <td style={S.td(i%2)}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <button onClick={() => { setPayoutForm({ amount: String(p.pending), date: new Date().toISOString().slice(0,10), note: "", sendEmail: true }); setPayoutModal(p); }}
                              disabled={p.pending <= 0}
                              style={{ padding: "7px 14px", background: p.pending > 0 ? "linear-gradient(135deg,#1e6fb5,#3b9de8)" : "#0a1628", border: p.pending > 0 ? "none" : "1px solid #1e3a5f", borderRadius: 7, color: p.pending > 0 ? "#fff" : "#3a4f6a", fontWeight: 700, fontSize: 12, cursor: p.pending > 0 ? "pointer" : "not-allowed", whiteSpace: "nowrap" }}>
                              💳 {p.pending > 0 ? "Wypłać" : "Brak do wypłaty"}
                            </button>
                            {p.lastPayoutDate && (
                              <div style={{ fontSize: 11, color: "#3a4f6a" }}>
                                Ostatnia: {p.lastPayoutDate}<br />
                                <span style={{ color: "#22c55e" }}>{(p.lastPayoutAmount || 0).toLocaleString("pl")} zł</span>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── HANDLOWCY ── */}
        {!loadingData && tab === "handlowcy" && (
          <SalespersonsTab
            allSalespersons={allSalespersons}
            setAllSalespersons={setAllSalespersons}
            allReferrals={allReferrals}
            onGoToRef={(refId) => setTab("referrals")}
          />
        )}

        {/* ── RAPORT POLECEŃ ── */}
        {!loadingData && tab === "report_ref" && (
          <ReportReferrals
            allReferrals={allReferrals}
            allPartners={allPartners}
            onJumpToRef={(id) => { setTab("referrals"); }}
          />
        )}

        {/* ── RAPORT WYNAGRODZEŃ ── */}
        {!loadingData && tab === "report_salary" && (
          <ReportSalary
            allReferrals={allReferrals}
            allPartners={allPartners}
          />
        )}
      </div>

      {/* Payout confirm modal */}
      {/* ── SUCCESS TOAST ── */}
      {payoutDone && (
        <div style={{ position: "fixed", bottom: 32, right: 32, zIndex: 2000, background: "#0d2e1a", border: "1px solid #16a34a", borderRadius: 14, padding: "18px 24px", maxWidth: 360, boxShadow: "0 8px 40px #00000066" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 22 }}>✅</span>
            <span style={{ color: "#22c55e", fontWeight: 700, fontSize: 15 }}>Wypłata zarejestrowana</span>
          </div>
          <div style={{ color: "#8aaecb", fontSize: 13 }}>
            {payoutDone.sendEmail
              ? payoutDone.emailOk
                ? <>E-mail z potwierdzeniem wysłany do <strong style={{ color: "#e8f0fe" }}>{payoutDone.name}</strong>.</>
                : <>Wypłata zapisana, ale wysyłka e-maila <span style={{ color: "#ef4444" }}>nie powiodła się</span>.</>
              : <>Wypłata zapisana dla <strong style={{ color: "#e8f0fe" }}>{payoutDone.name}</strong> (bez e-maila).</>
            }
          </div>
          <button onClick={() => setPayoutDone(null)}
            style={{ marginTop: 12, padding: "6px 16px", background: "none", border: "1px solid #16a34a", borderRadius: 7, color: "#22c55e", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            Zamknij
          </button>
        </div>
      )}

      {/* ── PAYOUT MODAL ── */}
      {payoutModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(6,15,30,0.94)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#0e1e3a", border: "1px solid #1e3a5f", borderRadius: 18, width: "100%", maxWidth: 500, padding: "36px 40px", position: "relative", maxHeight: "92vh", overflowY: "auto" }}>
            <button onClick={() => { setPayoutModal(null); setPayoutForm({ amount: "", date: "", note: "", sendEmail: true }); }}
              style={{ position: "absolute", top: 16, right: 18, background: "none", border: "none", color: "#5b7fa6", fontSize: 22, cursor: "pointer" }}>×</button>

            <h3 style={{ color: "#e8f0fe", fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>💳 Zarejestruj wypłatę</h3>
            <p style={{ color: "#6b8cad", fontSize: 13, margin: "0 0 24px" }}>Oznacz wypłatę i opcjonalnie wyślij powiadomienie e-mail do partnera</p>

            {/* Partner info card */}
            <div style={{ background: "#091220", borderRadius: 12, border: "1px solid #1e3a5f", padding: "16px 18px", marginBottom: 24, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#1e6fb5,#3b9de8)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18, color: "#fff", flexShrink: 0 }}>
                {payoutModal.name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: "#e8f0fe", fontSize: 15 }}>{payoutModal.name}</div>
                <div style={{ color: "#5b7fa6", fontSize: 12, marginTop: 2 }}>{payoutModal.email}</div>
                {payoutModal.company && <div style={{ color: "#5b7fa6", fontSize: 12 }}>{payoutModal.company}</div>}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "#5b7fa6", fontSize: 11, marginBottom: 2 }}>Do wypłaty</div>
                <div style={{ color: "#f59e0b", fontWeight: 800, fontSize: 22, fontFamily: "'Sora',sans-serif" }}>{payoutModal.pending.toLocaleString("pl")} zł</div>
              </div>
            </div>

            {/* Active referrals summary */}
            {(() => {
              const pRefs = allReferrals.filter(r =>
                (r.partnerId === payoutModal.email || r.partnerId === payoutModal.id) && r.status === "active"
              );
              if (pRefs.length === 0) return null;
              return (
                <div style={{ background: "#091220", borderRadius: 10, border: "1px solid #1e3a5f", padding: "12px 16px", marginBottom: 24 }}>
                  <div style={{ color: "#5b7fa6", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
                    Aktywne polecenia ({pRefs.length})
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {pRefs.map(r => (
                      <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                        <span>
                          <span style={{ fontFamily: "monospace", color: "#3b9de8", background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 4, padding: "1px 6px", marginRight: 8 }}>{r.refNumber || "—"}</span>
                          <span style={{ color: "#c8d8e8" }}>{r.company}</span>
                        </span>
                        <span style={{ color: "#22c55e", fontWeight: 700 }}>
                          {r.commission > 0 ? `${r.commission} zł` : ""}
                          {r.recurring > 0 ? ` +${r.recurring} zł/mies.` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Form fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", color: "#5b7fa6", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Kwota wypłaty (zł)</label>
                  <input
                    type="number" min={0}
                    placeholder={payoutModal.pending}
                    value={payoutForm.amount}
                    onChange={e => setPayoutForm(p => ({ ...p, amount: e.target.value }))}
                    style={{ width: "100%", background: "#060f1e", border: "1px solid #1e3a5f", borderRadius: 8, padding: "10px 14px", color: "#e8f0fe", fontSize: 15, fontWeight: 700, boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", color: "#5b7fa6", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Data wypłaty</label>
                  <input
                    type="date"
                    value={payoutForm.date || new Date().toISOString().slice(0,10)}
                    onChange={e => setPayoutForm(p => ({ ...p, date: e.target.value }))}
                    style={{ width: "100%", background: "#060f1e", border: "1px solid #1e3a5f", borderRadius: 8, padding: "10px 14px", color: "#e8f0fe", fontSize: 14, boxSizing: "border-box", colorScheme: "dark" }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: "block", color: "#5b7fa6", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Notatka / komentarz (opcjonalnie)</label>
                <textarea
                  rows={3}
                  placeholder="np. Przelew na rachunek bankowy nr XXXX, dziękujemy za współpracę!"
                  value={payoutForm.note}
                  onChange={e => setPayoutForm(p => ({ ...p, note: e.target.value }))}
                  style={{ width: "100%", background: "#060f1e", border: "1px solid #1e3a5f", borderRadius: 8, padding: "10px 14px", color: "#e8f0fe", fontSize: 13, resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }}
                />
              </div>

              {/* Send email toggle */}
              <div
                onClick={() => setPayoutForm(p => ({ ...p, sendEmail: !p.sendEmail }))}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", background: payoutForm.sendEmail ? "#0a1f3a" : "#091220", border: `1px solid ${payoutForm.sendEmail ? "#3b9de8" : "#1e3a5f"}`, borderRadius: 10, cursor: "pointer", transition: "all 0.2s" }}>
                <div style={{ width: 44, height: 24, borderRadius: 12, background: payoutForm.sendEmail ? "#3b9de8" : "#1e3a5f", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                  <div style={{ position: "absolute", top: 3, left: payoutForm.sendEmail ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: payoutForm.sendEmail ? "#e8f0fe" : "#6b8cad" }}>
                    📧 Wyślij e-mail do partnera
                  </div>
                  <div style={{ fontSize: 12, color: "#5b7fa6", marginTop: 2 }}>
                    {payoutForm.sendEmail
                      ? `Powiadomienie trafi na: ${payoutModal.email}`
                      : "Partner nie zostanie powiadomiony e-mailem"}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => { setPayoutModal(null); setPayoutForm({ amount: "", date: "", note: "", sendEmail: true }); }}
                disabled={payoutSending}
                style={{ flex: 1, padding: "12px", background: "none", border: "1px solid #1e3a5f", borderRadius: 10, color: "#6b8cad", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                Anuluj
              </button>
              <button
                onClick={confirmPayout}
                disabled={payoutSending}
                style={{ flex: 2, padding: "12px", background: payoutSending ? "#1e3a5f" : "linear-gradient(135deg,#1e6fb5,#3b9de8)", border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 15, cursor: payoutSending ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {payoutSending
                  ? <><span className="spin" style={{ display: "inline-block" }}>↻</span> Wysyłanie…</>
                  : <>✓ {payoutForm.sendEmail ? "Zapisz i wyślij e-mail" : "Zapisz wypłatę"}</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("dashboard"); // dashboard | referrals | payouts | link
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [partner, setPartner] = useState(MOCK_PARTNER);

  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ company: "", contact: "", email: "", phone: "", product: "Gastro", note: "" });
  const [referrals, setReferrals] = useState(MOCK_REFERRALS);
  const [payouts, setPayouts] = useState(MOCK_PAYOUTS);

  const handleLogin = (partnerData) => {
    if (partnerData === "admin") {
      setIsAdmin(true);
      setIsLoggedIn(true);
      return;
    }
    if (partnerData === null) {
      // Demo account — show mock data
      setPartner(MOCK_PARTNER);
      setReferrals(MOCK_REFERRALS);
      setPayouts(MOCK_PAYOUTS);
    } else {
      // Real account — load from Supabase
      setPartner(prev => ({ ...prev, ...partnerData }));
      setPayouts([]);
      // Load this partner's referrals from Supabase
      SB.get("referrals", `?partner_email=eq.${encodeURIComponent(partnerData.email)}&order=created_at.desc`)
        .then(rows => {
          setReferrals(rows.map((r, i) => ({
            id: r.id || i + 1,
            dbId: r.id,
            refNumber: r.ref_number || `LSI-${String(i+1).padStart(4,"0")}`,
            company: r.company,
            contact: r.contact,
            email: r.email || "",
            phone: r.phone || "",
            product: r.product,
            status: r.status,
            date: r.date,
            commission: r.commission || 0,
            recurring: r.recurring || 0,
            months: r.months || 0,
            notes: r.notes || [],
          })));
        })
        .catch(e => {
          console.error("Supabase load referrals error:", e);
          setReferrals([]);
        });
    }
    setIsAdmin(false);
    setIsLoggedIn(true);
  };

  // ── Refresh partner data without logout ──────────────────────────────────
  const [refreshing, setRefreshing] = useState(false);

  // ── Read thresholds from localStorage (set by admin in rates tab) ─────────
  const getThresholds = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("lsi_rates") || "null");
      return { ...{ ambasador: 1, partner: 5, premium: 15 }, ...(saved?.thresholds || {}) };
    } catch { return { ambasador: 1, partner: 5, premium: 15 }; }
  };
  const [thresholds, setThresholds] = useState(getThresholds);
  const reloadPartnerData = async () => {
    if (!partner || !partner.email || partner.email === "demo@lsi-cloud.pl") return;
    setRefreshing(true);
    try {
      const rows = await SB.get("referrals", `?partner_email=eq.${encodeURIComponent(partner.email)}&order=created_at.desc`);
      setReferrals(rows.map((r, i) => ({
        id: r.id || i + 1,
        dbId: r.id,
        refNumber: r.ref_number || `LSI-${String(i+1).padStart(4,"0")}`,
        company: r.company,
        contact: r.contact,
        email: r.email || "",
        phone: r.phone || "",
        product: r.product,
        status: r.status,
        date: r.date,
        commission: r.commission || 0,
        recurring: r.recurring || 0,
        months: r.months || 0,
        notes: r.notes || [],
      })));
      // Also refresh partner row (earned/pending)
      const pRows = await SB.get("partners", `?email=eq.${encodeURIComponent(partner.email)}`);
      if (pRows && pRows[0]) {
        setPartner(prev => ({
          ...prev,
          totalEarned:  parseFloat(pRows[0].total_earned)  || 0,
          pendingPayout: parseFloat(pRows[0].pending_payout) || 0,
        }));
      }
      // Refresh thresholds from localStorage in case admin updated them
      setThresholds(getThresholds());
    } catch(e) {
      console.error("Reload error:", e);
    } finally {
      setRefreshing(false);
    }
  };

  const [addSuccess, setAddSuccess] = useState(false);
  const p = partner;

  const filtered = filterStatus === "all" ? referrals : referrals.filter(r => r.status === filterStatus);
  const activeCount = referrals.filter(r => r.status === "active").length;
  const pendingCount = referrals.filter(r => !["active","rejected"].includes(r.status)).length;
  const totalRecurring = referrals.filter(r => r.status === "active").reduce((s, r) => s + (r.recurring||0), 0);
  const liveEarned  = referrals.filter(r => r.status === "active").reduce((s, r) => s + (r.commission||0), 0);
  const livePending = liveEarned;
  // Count all non-rejected referrals as annual progress
  const liveAnnualReferrals = referrals.filter(r => r.status !== "rejected").length;

  const [emailStatus, setEmailStatus] = useState(null); // null | 'sending' | 'sent' | 'error'
  const [editModal, setEditModal] = useState(null); // referral id or null
  const [newNote, setNewNote] = useState("");

  const submitReferral = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const refNumber = generateRefNumber(referrals);
    const newRef = {
      id: referrals.length + 1,
      refNumber,
      company: addForm.company,
      contact: addForm.contact,
      email: addForm.email,
      phone: addForm.phone,
      product: addForm.product,
      status: "pending",
      date: today,
      commission: 0,
      recurring: 0,
      months: 0,
      notes: addForm.note ? [{ date: today, text: addForm.note }] : [],
    };
    setReferrals(prev => [newRef, ...prev]);

    // Save to Supabase
    SB.post("referrals", {
      partner_id: p.dbId || null,
      partner_email: p.email,
      partner_name: p.name,
      partner_company: p.company,
      partner_code: p.refCode,
      ref_number: refNumber,
      company: newRef.company,
      contact: newRef.contact,
      email: newRef.email,
      phone: newRef.phone,
      product: newRef.product,
      status: "pending",
      date: today,
      commission: 0,
      recurring: 0,
      months: 0,
      subscription_value: 0,
      notes: newRef.notes,
    }).then(rows => {
      // Store Supabase id locally for future updates
      if (rows && rows[0]) {
        setReferrals(prev => prev.map(r =>
          r.id === newRef.id ? { ...r, dbId: rows[0].id } : r
        ));
      }
    }).catch(e => {
      console.error("Supabase referral save error:", e);
      // Fallback localStorage
      const allRefs = JSON.parse(localStorage.getItem("lsi_all_referrals") || "[]");
      allRefs.push({ ...newRef, partnerId: p.email, partnerName: p.name, partnerCompany: p.company, partnerCode: p.refCode });
      localStorage.setItem("lsi_all_referrals", JSON.stringify(allRefs));
    });

    setAddSuccess(true);
    setEmailStatus("sending");

    const ok = await sendReferralEmail(p, { ...newRef, note: addForm.note });
    setEmailStatus(ok ? "sent" : "error");

    setTimeout(() => {
      setAddSuccess(false);
      setShowAddModal(false);
      setAddForm({ company: "", contact: "", email: "", phone: "", product: "Gastro", note: "" });
      setEmailStatus(null);
    }, 2500);
  };

  const addNoteToReferral = (id) => {
    if (!newNote.trim()) return;
    const today = new Date().toISOString().slice(0, 10);
    setReferrals(prev => prev.map(r => r.id === id
      ? { ...r, notes: [...(r.notes || []), { date: today, text: newNote.trim() }] }
      : r
    ));
    setNewNote("");
  };

  if (isAdmin) {
    return <AdminPanel onLogout={() => { setIsAdmin(false); setIsLoggedIn(false); }} />;
  }

  if (!isLoggedIn) {
    return (
      <>
        {showRegister && <RegisterModal onClose={() => setShowRegister(false)} onRegister={(data) => { setPartner(prev => ({ ...prev, ...data })); setReferrals([]); setPayouts([]); setIsLoggedIn(true); }} />}
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={handleLogin} onShowRegister={() => setShowRegister(true)} />}
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
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
      `}</style>

      {/* Edit referral modal */}
      {editModal !== null && (() => {
        const ref = referrals.find(r => r.id === editModal);
        if (!ref) return null;
        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(6,15,30,0.92)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ background: "#0e1e3a", border: "1px solid #1e3a5f", borderRadius: 16, width: "100%", maxWidth: 520, padding: "36px 40px", position: "relative", maxHeight: "90vh", overflowY: "auto" }}>
              <button onClick={() => setEditModal(null)} style={{ position: "absolute", top: 16, right: 18, background: "none", border: "none", color: "#5b7fa6", fontSize: 22, cursor: "pointer" }}>×</button>
              <h3 style={{ color: "#e8f0fe", fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>{ref.company}</h3>
              <div style={{ color: "#5b7fa6", fontSize: 13, marginBottom: 24 }}>{ref.contact} · {ref.product} · {ref.date}</div>

              {/* Dane kontaktowe */}
              <div style={{ background: "#091220", border: "1px solid #1e3a5f", borderRadius: 10, padding: "14px 16px", marginBottom: 24 }}>
                <div style={{ color: "#8aaecb", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Dane kontaktowe</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px" }}>
                  {[["E-mail", ref.email || "—"], ["Telefon", ref.phone || "—"], ["Status", ref.status], ["Produkt", ref.product]].map(([k,v]) => (
                    <div key={k}>
                      <span style={{ color: "#5b7fa6", fontSize: 12 }}>{k}: </span>
                      <span style={{ color: "#e8f0fe", fontSize: 13, fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Historia notatek */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ color: "#8aaecb", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>
                  Historia notatek ({(ref.notes || []).length})
                </div>
                {(ref.notes || []).length === 0 && (
                  <div style={{ color: "#3a4f6a", fontSize: 13, fontStyle: "italic", padding: "12px 0" }}>Brak notatek</div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {(ref.notes || []).map((note, i) => (
                    <div key={i} style={{ background: "#091220", border: "1px solid #1e3a5f", borderRadius: 10, padding: "12px 14px" }}>
                      <div style={{ color: "#3b9de8", fontSize: 11, fontWeight: 700, marginBottom: 6 }}>{note.date}</div>
                      <div style={{ color: "#c8d8e8", fontSize: 14, lineHeight: 1.6 }}>{note.text}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dodaj nową notatkę */}
              <div style={{ borderTop: "1px solid #1e3a5f", paddingTop: 20 }}>
                <div style={{ color: "#8aaecb", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Dodaj notatkę</div>
                <textarea
                  placeholder="Wpisz notatkę — np. wynik rozmowy, ustalenia, kolejny krok…"
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  rows={3}
                  style={{ width: "100%", background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 8, padding: "10px 14px", color: "#e8f0fe", fontSize: 14, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
                />
                <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                  <button onClick={() => setEditModal(null)}
                    style={{ flex: 1, padding: "11px", background: "none", border: "1px solid #1e3a5f", borderRadius: 9, color: "#6b8cad", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                    Zamknij
                  </button>
                  <button onClick={() => { addNoteToReferral(ref.id); }}
                    disabled={!newNote.trim()}
                    style={{ flex: 2, padding: "11px", background: newNote.trim() ? "linear-gradient(135deg,#1e6fb5,#3b9de8)" : "#1e3a5f", border: "none", borderRadius: 9, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                    + Zapisz notatkę
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Add referral modal */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(6,15,30,0.9)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#0e1e3a", border: "1px solid #1e3a5f", borderRadius: 16, width: "100%", maxWidth: 480, padding: "36px 40px", position: "relative" }}>
            <button onClick={() => setShowAddModal(false)} style={{ position: "absolute", top: 16, right: 18, background: "none", border: "none", color: "#5b7fa6", fontSize: 22, cursor: "pointer" }}>×</button>
            {addSuccess ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                <h3 style={{ color: "#22c55e", fontFamily: "'Sora',sans-serif", fontSize: 20, margin: "0 0 10px" }}>Polecenie dodane!</h3>
                <p style={{ color: "#6b8cad", fontSize: 14, marginBottom: 16 }}>Nasz dział handlowy skontaktuje się z firmą w ciągu 48 godzin.</p>
                {emailStatus === "sending" && <div style={{ color: "#3b9de8", fontSize: 13 }}>📧 Wysyłam powiadomienie e-mail…</div>}
                {emailStatus === "sent" && <div style={{ color: "#22c55e", fontSize: 13 }}>✓ Powiadomienie wysłane na mlichota@gastro.pl</div>}
                {emailStatus === "error" && <div style={{ color: "#f59e0b", fontSize: 13 }}>⚠ Nie udało się wysłać e-maila — skonfiguruj EmailJS</div>}
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
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={reloadPartnerData} disabled={refreshing}
                    title="Odśwież dane"
                    style={{ padding: "11px 14px", background: "#0e1e3a", border: "1px solid #1e3a5f", borderRadius: 10, color: refreshing ? "#3a4f6a" : "#5b9de8", fontWeight: 700, fontSize: 16, cursor: refreshing ? "not-allowed" : "pointer", transition: "all 0.2s", lineHeight: 1 }}>
                    <span className={refreshing ? "spin" : ""} style={{ display: "inline-block" }}>↻</span>
                  </button>
                  <button onClick={() => setShowAddModal(true)}
                    style={{ padding: "11px 22px", background: "linear-gradient(135deg,#1e6fb5,#3b9de8)", border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 4px 20px #3b9de830" }}>
                    + Dodaj polecenie
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
                <StatCard label="Łączne zarobki" value={`${liveEarned.toLocaleString("pl")} zł`} sub="od początku współpracy" accent="#3b9de8" icon="💰" />
                <StatCard label="Oczekuje wypłaty" value={`${livePending.toLocaleString("pl")} zł`} sub={`Wypłata: ${p.nextPayout || "do 15. dnia miesiąca"}`} accent="#f59e0b" icon="⏳" />
                <StatCard label="Aktywne polecenia" value={activeCount} sub={`${pendingCount} w trakcie weryfikacji`} accent="#22c55e" icon="✅" />
                <StatCard label="Prowizja miesięczna" value={`${totalRecurring} zł`} sub="z aktywnych kontraktów" accent="#c084fc" icon="📈" />
              </div>

              {/* Progress to next level */}
              {(() => {
                const thr = thresholds;
                const cur = liveAnnualReferrals;
                // Determine current and next level
                const currentLevel = cur >= thr.premium ? "premium"
                  : cur >= thr.partner ? "partner" : "ambasador";
                const levelLabels = { ambasador: "Ambasador", partner: "Partner", premium: "Partner Premium" };
                const levelColors = { ambasador: "#c084fc", partner: "#3b9de8", premium: "#f59e0b" };
                const isMax = currentLevel === "premium";
                const nextLevel = currentLevel === "ambasador" ? "partner"
                  : currentLevel === "partner" ? "premium" : "premium";
                const nextThreshold = currentLevel === "ambasador" ? thr.partner
                  : thr.premium;
                const prevThreshold = currentLevel === "ambasador" ? 0
                  : currentLevel === "partner" ? thr.partner : thr.partner;
                const rangeSize = nextThreshold - (currentLevel === "ambasador" ? 0 : currentLevel === "partner" ? thr.partner : thr.partner);
                const progress = isMax ? 100
                  : Math.min(100, Math.round(((cur - (currentLevel === "ambasador" ? 0 : currentLevel === "partner" ? thr.partner : thr.partner)) / (nextThreshold - (currentLevel === "ambasador" ? 0 : currentLevel === "partner" ? thr.partner : thr.partner))) * 100));
                const remaining = isMax ? 0 : nextThreshold - cur;
                // Read rates from localStorage (set by admin) for display info
                const ratesLS = (() => { try { return JSON.parse(localStorage.getItem("lsi_rates") || "null") || {}; } catch { return {}; } })();
                const nextR = ratesLS[nextLevel] || {};
                return (
                  <div style={{ background: "#0e1e3a", border: `1px solid ${levelColors[currentLevel]}33`, borderRadius: 14, padding: "24px 28px", marginBottom: 28 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <span style={{ color: "#e8f0fe", fontWeight: 700, fontSize: 15 }}>
                          {isMax ? "Osiągnięto najwyższy poziom!" : `Postęp do poziomu ${levelLabels[nextLevel]}`}
                        </span>
                        <span style={{ color: "#6b8cad", fontSize: 13, marginLeft: 12 }}>
                          {cur} / {isMax ? cur : nextThreshold} poleceń w tym roku
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <LevelBadge level={levelLabels[currentLevel]} />
                        {!isMax && <><span style={{ color: "#5b7fa6" }}>→</span><LevelBadge level={levelLabels[nextLevel]} /></>}
                      </div>
                    </div>
                    {/* Progress bar with milestones */}
                    <div style={{ position: "relative", marginBottom: 8 }}>
                      <div style={{ background: "#0a1628", borderRadius: 8, height: 12, overflow: "hidden" }}>
                        <div style={{ width: `${progress}%`, height: "100%", background: `linear-gradient(90deg,${levelColors[currentLevel]}88,${levelColors[currentLevel]})`, borderRadius: 8, transition: "width 0.8s ease" }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                        <span style={{ color: "#5b7fa6", fontSize: 11 }}>{currentLevel === "ambasador" ? 0 : currentLevel === "partner" ? thr.partner : thr.partner} pol.</span>
                        <span style={{ color: levelColors[currentLevel], fontSize: 11, fontWeight: 700 }}>{progress}%</span>
                        <span style={{ color: "#5b7fa6", fontSize: 11 }}>{isMax ? cur : nextThreshold} pol.</span>
                      </div>
                    </div>
                    <div style={{ color: "#6b8cad", fontSize: 12, marginTop: 6 }}>
                      {isMax
                        ? <span style={{ color: "#f59e0b", fontWeight: 700 }}>🏆 Poziom Partner Premium osiągnięty!</span>
                        : <>Jeszcze <strong style={{ color: levelColors[nextLevel] }}>{remaining} {remaining === 1 ? "polecenie" : remaining < 5 ? "polecenia" : "poleceń"}</strong> do poziomu {levelLabels[nextLevel]}
                          {nextR.recurring_pct > 0 && ` — odblokujesz prowizję ${nextR.recurring_pct}% przez ${nextR.recurring_months} mies.`}
                          {nextR.annual_bonus > 0 && ` i bonus roczny ${nextR.annual_bonus.toLocaleString("pl")} zł`}
                        </>
                      }
                    </div>
                  </div>
                );
              })()}

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
                  <button onClick={reloadPartnerData} disabled={refreshing}
                    title="Odśwież dane"
                    style={{ padding: "7px 12px", background: "#0e1e3a", border: "1px solid #1e3a5f", borderRadius: 8, color: refreshing ? "#3a4f6a" : "#5b9de8", fontWeight: 700, fontSize: 16, cursor: refreshing ? "not-allowed" : "pointer" }}>
                    <span className={refreshing ? "spin" : ""} style={{ display: "inline-block" }}>↻</span>
                  </button>
                  <button onClick={() => setShowAddModal(true)}
                    style={{ padding: "7px 18px", background: "linear-gradient(135deg,#1e6fb5,#3b9de8)", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    + Dodaj
                  </button>
                </div>
              </div>

              <div style={{ background: "#0e1e3a", border: "1px solid #1e3a5f", borderRadius: 14, overflow: "hidden" }}>
                {/* Table header */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 90px 100px 110px 110px 90px", gap: 0, padding: "12px 20px", background: "#091220", borderBottom: "1px solid #1e3a5f" }}>
                  {["Nr", "Firma", "Kontakt", "Produkt", "Status", "Premia", "Prowizja/mies.", ""].map(h => (
                    <div key={h} style={{ color: "#5b7fa6", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</div>
                  ))}
                </div>
                {filtered.map((r, i) => (
                  <div key={r.id} style={{ display: "grid", gridTemplateColumns: "110px 1fr 1fr 90px 100px 110px 110px 90px", gap: 0, padding: "14px 20px", borderBottom: i < filtered.length - 1 ? "1px solid #1e3a5f" : "none", alignItems: "center" }}>
                    <div style={{ fontFamily: "monospace", fontSize: 11, color: "#3b9de8", fontWeight: 700 }}>{r.refNumber || "—"}</div>
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
                    <button onClick={() => { setEditModal(r.id); setNewNote(""); }}
                      style={{ padding: "5px 12px", background: "none", border: "1px solid #1e3a5f", borderRadius: 7, color: "#5b7fa6", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                      ✏️ Edytuj
                    </button>
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
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 14 }}>
                <div>
                  <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 800, margin: "0 0 6px" }}>Wypłaty</h1>
                  <p style={{ color: "#6b8cad", margin: 0, fontSize: 14 }}>Historia i planowane wypłaty prowizji</p>
                </div>
                <button onClick={reloadPartnerData} disabled={refreshing}
                  title="Odśwież dane"
                  style={{ padding: "9px 14px", background: "#0e1e3a", border: "1px solid #1e3a5f", borderRadius: 9, color: refreshing ? "#3a4f6a" : "#5b9de8", fontWeight: 700, fontSize: 16, cursor: refreshing ? "not-allowed" : "pointer" }}>
                  <span className={refreshing ? "spin" : ""} style={{ display: "inline-block" }}>↻</span>
                </button>
              </div>

              <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
                <StatCard label="Do wypłaty" value={`${livePending.toLocaleString("pl")} zł`} sub="naliczone premie jednorazowe" accent="#f59e0b" icon="⏳" />
                <StatCard label="Łącznie zarobione" value={`${liveEarned.toLocaleString("pl")} zł`} sub="suma naliczonych premii" accent="#3b9de8" icon="💳" />
                <StatCard label="Prowizja cykliczna" value={`${totalRecurring} zł/mies.`} sub="z aktywnych kontraktów" accent="#22c55e" icon="🔄" />
              </div>

              <div style={{ background: "#0e1e3a", border: "1px solid #1e3a5f", borderRadius: 14, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 1fr 140px", gap: 0, padding: "12px 20px", background: "#091220", borderBottom: "1px solid #1e3a5f" }}>
                  {["Data", "Rodzaj", "Kwota", "Status"].map(h => (
                    <div key={h} style={{ color: "#5b7fa6", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</div>
                  ))}
                </div>
                {payouts.length === 0 && (
                  <div style={{ padding: "40px 20px", textAlign: "center", color: "#3a4f6a" }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>💳</div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#5b7fa6", marginBottom: 6 }}>Brak historii wypłat</div>
                    <div style={{ fontSize: 13 }}>Wypłaty pojawią się tutaj po realizacji pierwszego polecenia</div>
                  </div>
                )}
                {payouts.map((pay, i) => (
                  <div key={pay.id} style={{ display: "grid", gridTemplateColumns: "120px 1fr 1fr 140px", gap: 0, padding: "16px 20px", borderBottom: i < payouts.length - 1 ? "1px solid #1e3a5f" : "none", alignItems: "center" }}>
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
