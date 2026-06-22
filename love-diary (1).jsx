import { useState, useEffect, useCallback } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const MOODS = [
  { value: "happy",   emoji: "🟢", label: "Vui vẻ / Yêu đời",      color: "#4ade80" },
  { value: "normal",  emoji: "🟡", label: "Bình thường / Ổn",       color: "#facc15" },
  { value: "tired",   emoji: "🔵", label: "Hơi mệt / Cần ôm",      color: "#60a5fa" },
  { value: "angry",   emoji: "🔴", label: "Quạu / Dễ giận",         color: "#f87171" },
  { value: "miss",    emoji: "🟣", label: "Nhớ người yêuuu",        color: "#c084fc" },
];

const PERSONS = {
  anh: {
    key: "anh",
    name: "Anh",
    icon: "💙",
    accent: "#3b82f6",
    soft: "#eff6ff",
    mid: "#bfdbfe",
    dark: "#1d4ed8",
    bg: "linear-gradient(135deg, #e0f2fe 0%, #dbeafe 50%, #ede9fe 100%)",
    cardBg: "rgba(255,255,255,0.82)",
    headerBg: "linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)",
  },
  em: {
    key: "em",
    name: "Em",
    icon: "🌸",
    accent: "#ec4899",
    soft: "#fdf2f8",
    mid: "#fbcfe8",
    dark: "#be185d",
    bg: "linear-gradient(135deg, #fce7f3 0%, #fdf2f8 50%, #fce7f3 100%)",
    cardBg: "rgba(255,255,255,0.82)",
    headerBg: "linear-gradient(90deg, #ec4899 0%, #f43f5e 100%)",
  },
};

const STORAGE_KEY_PREFIX = "loveDiary_";

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const today = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const dateKey = (dateStr) => dateStr.replace(/\//g, "-");

function useEntries(person) {
  const storageKey = STORAGE_KEY_PREFIX + person;
  const [entries, setEntries] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get(storageKey, true);
        if (result?.value) setEntries(JSON.parse(result.value));
      } catch (_) {}
    })();
  }, [storageKey]);

  const save = useCallback(async (dateStr, data) => {
    const updated = { ...entries, [dateKey(dateStr)]: { date: dateStr, ...data, updatedAt: Date.now() } };
    setEntries(updated);
    try {
      await window.storage.set(storageKey, JSON.stringify(updated), true);
    } catch (_) {}
  }, [entries, storageKey]);

  return [entries, save];
};

// ─── MOOD BADGE ───────────────────────────────────────────────────────────────
function MoodBadge({ value, size = "sm" }) {
  if (!value) return null;
  const mood = MOODS.find(m => m.value === value);
  if (!mood) return null;
  const pad = size === "lg" ? "6px 14px" : "3px 10px";
  const fs = size === "lg" ? "13px" : "11px";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: mood.color + "22", border: `1.5px solid ${mood.color}66`,
      borderRadius: 20, padding: pad, fontSize: fs, fontWeight: 600, color: "#374151",
      whiteSpace: "nowrap"
    }}>
      {mood.emoji} {mood.label}
    </span>
  );
}

// ─── ENTRY FORM ───────────────────────────────────────────────────────────────
function EntryForm({ person, entries, onSave }) {
  const cfg = PERSONS[person];
  const todayStr = today();
  const existing = entries[dateKey(todayStr)] || {};

  const [mood, setMood] = useState(existing.mood || "");
  const [activities, setActivities] = useState(existing.activities || "");
  const [feelings, setFeelings] = useState(existing.feelings || "");
  const [message, setMessage] = useState(existing.message || "");
  const [saved, setSaved] = useState(false);

  // sync when entries load
  useEffect(() => {
    const e = entries[dateKey(todayStr)] || {};
    setMood(e.mood || "");
    setActivities(e.activities || "");
    setFeelings(e.feelings || "");
    setMessage(e.message || "");
  }, [entries]);

  const handleSave = async () => {
    await onSave(todayStr, { mood, activities, feelings, message });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputStyle = {
    width: "100%", border: `1.5px solid ${cfg.mid}`, borderRadius: 10,
    padding: "9px 12px", fontSize: 14, background: "rgba(255,255,255,0.9)",
    outline: "none", boxSizing: "border-box", fontFamily: "inherit",
    color: "#1f2937", resize: "vertical", transition: "border 0.2s",
  };
  const labelStyle = { fontSize: 12, fontWeight: 700, color: cfg.dark, marginBottom: 5, display: "block", letterSpacing: 0.5 };

  return (
    <div style={{
      background: cfg.cardBg, borderRadius: 20, padding: "22px 24px",
      boxShadow: `0 4px 24px ${cfg.accent}18`, border: `1px solid ${cfg.mid}`,
      backdropFilter: "blur(8px)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <span style={{ fontSize: 22 }}>{cfg.icon}</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: cfg.dark }}>Nhật ký hôm nay của {cfg.name}</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>📅 {todayStr}</div>
        </div>
      </div>

      {/* MOOD */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>💫 Mood hôm nay</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {MOODS.map(m => (
            <button key={m.value} onClick={() => setMood(m.value)} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 13px", borderRadius: 20, border: `2px solid ${mood === m.value ? m.color : "#e5e7eb"}`,
              background: mood === m.value ? m.color + "22" : "white",
              cursor: "pointer", fontSize: 12, fontWeight: mood === m.value ? 700 : 500,
              color: "#374151", transition: "all 0.18s"
            }}>
              {m.emoji} {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* ACTIVITIES */}
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>🗓 Hoạt động trong ngày</label>
        <textarea rows={2} style={inputStyle} placeholder="Đi học, làm việc, đi gym, deadline sấp mặt..."
          value={activities} onChange={e => setActivities(e.target.value)} />
      </div>

      {/* FEELINGS */}
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>💭 Cảm nhận / Tâm sự</label>
        <textarea rows={3} style={inputStyle} placeholder="Hôm nay cảm thấy thế nào? Có gì muốn kể không..."
          value={feelings} onChange={e => setFeelings(e.target.value)} />
      </div>

      {/* MESSAGE */}
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>💌 Lời nhắn cho {person === "anh" ? "Em" : "Anh"}</label>
        <textarea rows={2} style={inputStyle}
          placeholder={`Nhắn nhủ điều gì đó với ${person === "anh" ? "Em" : "Anh"} nhé...`}
          value={message} onChange={e => setMessage(e.target.value)} />
      </div>

      <button onClick={handleSave} style={{
        width: "100%", padding: "11px 0", borderRadius: 12, border: "none",
        background: cfg.headerBg, color: "white", fontWeight: 800, fontSize: 15,
        cursor: "pointer", letterSpacing: 0.3,
        boxShadow: `0 4px 14px ${cfg.accent}44`, transition: "opacity 0.2s",
        opacity: saved ? 0.75 : 1,
      }}>
        {saved ? "✅ Đã lưu!" : "💾 Lưu nhật ký"}
      </button>
    </div>
  );
}

// ─── ENTRY CARD (read-only) ───────────────────────────────────────────────────
function EntryCard({ entry, cfg, isPartner }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      background: cfg.cardBg, borderRadius: 14, padding: "14px 16px",
      border: `1px solid ${cfg.mid}`, marginBottom: 10,
      boxShadow: `0 2px 10px ${cfg.accent}0d`, cursor: "pointer",
      transition: "box-shadow 0.2s"
    }} onClick={() => setOpen(o => !o)}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontWeight: 700, color: cfg.dark, fontSize: 14 }}>📅 {entry.date}</span>
          {entry.mood && <MoodBadge value={entry.mood} />}
        </div>
        <span style={{ color: "#9ca3af", fontSize: 12 }}>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
          {entry.activities && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: cfg.dark, marginBottom: 3 }}>🗓 Hoạt động</div>
              <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{entry.activities}</div>
            </div>
          )}
          {entry.feelings && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: cfg.dark, marginBottom: 3 }}>💭 Tâm sự</div>
              <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{entry.feelings}</div>
            </div>
          )}
          {entry.message && (
            <div style={{
              background: cfg.soft, borderRadius: 10, padding: "10px 14px",
              border: `1px solid ${cfg.mid}`,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: cfg.dark, marginBottom: 3 }}>
                💌 Lời nhắn{isPartner ? " gửi cho bạn" : ""}
              </div>
              <div style={{ fontSize: 13, color: cfg.dark, lineHeight: 1.6, fontStyle: "italic" }}>
                "{entry.message}"
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── DIARY LIST ───────────────────────────────────────────────────────────────
function DiaryList({ entries, cfg, isPartner }) {
  const sorted = Object.values(entries).sort((a, b) => b.updatedAt - a.updatedAt);
  if (sorted.length === 0) return (
    <div style={{ textAlign: "center", color: "#9ca3af", padding: "32px 0", fontSize: 14 }}>
      Chưa có nhật ký nào... ✨
    </div>
  );
  return (
    <div>
      {sorted.map(e => <EntryCard key={e.date} entry={e} cfg={cfg} isPartner={isPartner} />)}
    </div>
  );
}

// ─── PARTNER STATUS BANNER ────────────────────────────────────────────────────
function PartnerBanner({ partnerEntries, partnerCfg, myCfg }) {
  const todayStr = today();
  const todayEntry = partnerEntries[dateKey(todayStr)];
  return (
    <div style={{
      background: partnerCfg.cardBg, borderRadius: 16, padding: "14px 18px",
      border: `1.5px solid ${partnerCfg.mid}`,
      boxShadow: `0 2px 14px ${partnerCfg.accent}18`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 18 }}>{partnerCfg.icon}</span>
        <span style={{ fontWeight: 700, color: partnerCfg.dark, fontSize: 14 }}>
          {partnerCfg.name} hôm nay
        </span>
        {todayEntry
          ? <span style={{ marginLeft: "auto", fontSize: 11, color: "#6b7280" }}>Đã cập nhật ✓</span>
          : <span style={{ marginLeft: "auto", fontSize: 11, color: "#9ca3af" }}>Chưa cập nhật</span>
        }
      </div>
      {todayEntry ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#6b7280" }}>Mood:</span>
            <MoodBadge value={todayEntry.mood} size="sm" />
          </div>
          {todayEntry.activities && (
            <div style={{ fontSize: 12, color: "#4b5563" }}>
              <span style={{ fontWeight: 600 }}>Đang làm:</span> {todayEntry.activities}
            </div>
          )}
          {todayEntry.message && (
            <div style={{
              background: partnerCfg.soft, borderRadius: 8, padding: "8px 12px",
              fontSize: 12, color: partnerCfg.dark, fontStyle: "italic",
              border: `1px solid ${partnerCfg.mid}`
            }}>
              💌 "{todayEntry.message}"
            </div>
          )}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: "#9ca3af" }}>
          {partnerCfg.name} chưa viết nhật ký hôm nay...
        </div>
      )}
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
function Page({ person, partnerPerson }) {
  const cfg = PERSONS[person];
  const partnerCfg = PERSONS[partnerPerson];
  const [myEntries, saveEntry] = useEntries(person);
  const [partnerEntries] = useEntries(partnerPerson);
  const [tab, setTab] = useState("write"); // write | my | partner

  const tabs = [
    { id: "write", label: "✍️ Viết hôm nay" },
    { id: "my", label: `${cfg.icon} Nhật ký của ${cfg.name}` },
    { id: "partner", label: `${partnerCfg.icon} Nhật ký của ${partnerCfg.name}` },
  ];

  return (
    <div style={{ minHeight: "100vh", background: cfg.bg, padding: "0 0 40px" }}>
      {/* HEADER */}
      <div style={{
        background: cfg.headerBg, padding: "20px 24px 16px", color: "white",
        boxShadow: `0 4px 20px ${cfg.accent}44`,
      }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 0.3 }}>
            {cfg.icon} Nhật ký của {cfg.name}
          </div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 3 }}>📅 {today()}</div>
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "0 16px" }}>
        {/* PARTNER BANNER */}
        <div style={{ marginTop: 16, marginBottom: 16 }}>
          <PartnerBanner partnerEntries={partnerEntries} partnerCfg={partnerCfg} myCfg={cfg} />
        </div>

        {/* TABS */}
        <div style={{
          display: "flex", gap: 6, marginBottom: 16,
          background: "rgba(255,255,255,0.5)", borderRadius: 12, padding: 4,
        }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: "8px 4px", borderRadius: 9, border: "none",
              background: tab === t.id ? cfg.headerBg : "transparent",
              color: tab === t.id ? "white" : "#6b7280",
              fontWeight: tab === t.id ? 700 : 500, fontSize: 11,
              cursor: "pointer", transition: "all 0.18s", lineHeight: 1.3,
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        {tab === "write" && (
          <EntryForm person={person} entries={myEntries} onSave={saveEntry} />
        )}
        {tab === "my" && (
          <div>
            <div style={{ fontWeight: 700, color: cfg.dark, marginBottom: 12, fontSize: 14 }}>
              {cfg.icon} Tất cả nhật ký của {cfg.name}
            </div>
            <DiaryList entries={myEntries} cfg={cfg} isPartner={false} />
          </div>
        )}
        {tab === "partner" && (
          <div>
            <div style={{ fontWeight: 700, color: partnerCfg.dark, marginBottom: 12, fontSize: 14 }}>
              {partnerCfg.icon} Tất cả nhật ký của {partnerCfg.name}
            </div>
            <DiaryList entries={partnerEntries} cfg={partnerCfg} isPartner={true} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activePerson, setActivePerson] = useState(null);

  if (!activePerson) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e0f2fe 0%, #fce7f3 50%, #ede9fe 100%)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>💑</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#1f2937", marginBottom: 6 }}>
            Nhật Ký Tình Yêu
          </div>
          <div style={{ fontSize: 14, color: "#6b7280", maxWidth: 280 }}>
            Không gian riêng tư của hai đứa mình 🌸
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          {/* ANH */}
          <button onClick={() => setActivePerson("anh")} style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            padding: "28px 36px", borderRadius: 24, border: "2px solid #bfdbfe",
            background: "linear-gradient(135deg, #dbeafe, #eff6ff)",
            cursor: "pointer", boxShadow: "0 8px 30px #3b82f618",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 14px 40px #3b82f628"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 8px 30px #3b82f618"; }}
          >
            <span style={{ fontSize: 48, marginBottom: 10 }}>💙</span>
            <span style={{ fontWeight: 800, fontSize: 20, color: "#1d4ed8" }}>Trang Anh</span>
            <span style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Giao diện xanh pastel</span>
          </button>

          {/* EM */}
          <button onClick={() => setActivePerson("em")} style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            padding: "28px 36px", borderRadius: 24, border: "2px solid #fbcfe8",
            background: "linear-gradient(135deg, #fce7f3, #fdf2f8)",
            cursor: "pointer", boxShadow: "0 8px 30px #ec489918",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 14px 40px #ec489928"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 8px 30px #ec489918"; }}
          >
            <span style={{ fontSize: 48, marginBottom: 10 }}>🌸</span>
            <span style={{ fontWeight: 800, fontSize: 20, color: "#be185d" }}>Trang Em</span>
            <span style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Giao diện hồng pastel</span>
          </button>
        </div>

        <div style={{ marginTop: 32, fontSize: 12, color: "#9ca3af", textAlign: "center" }}>
          ☁️ Dữ liệu được lưu trên đám mây — cả hai đều xem được nhật ký của nhau
        </div>
      </div>
    );
  }

  const partner = activePerson === "anh" ? "em" : "anh";
  const cfg = PERSONS[activePerson];

  return (
    <div>
      {/* back button */}
      <div style={{ position: "fixed", top: 12, right: 12, zIndex: 100 }}>
        <button onClick={() => setActivePerson(null)} style={{
          padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${cfg.mid}`,
          background: "rgba(255,255,255,0.9)", fontSize: 12, fontWeight: 600,
          cursor: "pointer", color: cfg.dark, backdropFilter: "blur(6px)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          ← Trang chủ
        </button>
      </div>
      <Page person={activePerson} partnerPerson={partner} />
    </div>
  );
}
