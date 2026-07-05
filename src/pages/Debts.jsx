import { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import toast from "react-hot-toast";
import "./Debts.css";

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const fmt = (n) => Math.round(n).toLocaleString("ar-EG");

const isOverdue = (d) => {
  if (d.amount <= d.paid) return false;
  return new Date(d.due) < new Date();
};

const getInitials = (name) =>
  (name || "")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .substring(0, 2);

const getDaysLeft = (due) =>
  Math.ceil((new Date(due) - new Date()) / (1000 * 60 * 60 * 24));

const normalizeDebt = (d) => ({
  id: d.id ?? Date.now(),
  name: d.name ?? "",
  amount: d.amount ?? 0,
  paid: d.paid ?? d.paidAmount ?? 0,
  due: d.due ?? d.dueDate ?? "",
  note: d.note ?? d.notes ?? "",
  date: d.date ?? new Date().toLocaleDateString("ar-EG"),
});

const SAMPLE_DEBTS = [
  {
    id: 1,
    name: "محمد علي",
    amount: 850,
    paid: 0,
    due: "2026-06-18",
    note: "3 كيلو أرز + 2 كيلو سكر",
    date: "10 يونيو",
  },
  {
    id: 2,
    name: "أم أحمد",
    amount: 450,
    paid: 0,
    due: "2026-06-25",
    note: "زيت وزبدة",
    date: "15 يونيو",
  },
  {
    id: 3,
    name: "عم حسن",
    amount: 1200,
    paid: 600,
    due: "2026-06-30",
    note: "بضاعة متنوعة",
    date: "12 يونيو",
  },
];

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
export default function Debts() {
  const [debts, setDebts] = useState([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [due, setDue] = useState("");
  const [note, setNote] = useState("");

  /* collect modal */
  const [collectOpen, setCollectOpen] = useState(false);
  const [collectingId, setCollectingId] = useState(null);
  const [collectAmount, setCollectAmount] = useState("");
  const [collectMethod, setCollectMethod] = useState("كاش");

  const nextId = useRef(100);

  /* ── load ── */
  useEffect(() => {
    try {
      const raw = localStorage.getItem("tijara_debts");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const normalized = parsed.map(normalizeDebt);
          setDebts(normalized);
          nextId.current = Math.max(...normalized.map((d) => d.id), 99) + 1;
        } else {
          loadSample();
        }
      } else {
        loadSample();
      }
    } catch {
      loadSample();
    }
    /* set default due date = today + 7 */
    const nd = new Date();
    nd.setDate(nd.getDate() + 7);
    setDue(nd.toISOString().split("T")[0]);
  }, []);

  const loadSample = () => {
    localStorage.setItem("tijara_debts", JSON.stringify(SAMPLE_DEBTS));
    setDebts(SAMPLE_DEBTS);
    window.dispatchEvent(new Event("storage"));
  };

  const save = (updated) => {
    localStorage.setItem("tijara_debts", JSON.stringify(updated));
    setDebts(updated);
    window.dispatchEvent(new Event("storage"));
  };

  /* ── add debt ── */
  const handleAdd = (e) => {
    e.preventDefault();
    const amt = parseFloat(amount) || 0;
    if (!name.trim() || !amt) {
      toast.error("اكتب اسم العميل والمبلغ");
      return;
    }
    const d = new Date();
    const months = [
      "يناير",
      "فبراير",
      "مارس",
      "أبريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ];
    const dateStr = `${d.getDate()} ${months[d.getMonth()]}`;
    const newDebt = {
      id: nextId.current++,
      name: name.trim(),
      amount: amt,
      paid: 0,
      due,
      note: note.trim(),
      date: dateStr,
    };
    save([newDebt, ...debts]);
    setName("");
    setAmount("");
    setNote("");
    toast.success("✅ تم تسجيل الدين");
  };

  /* ── collect ── */
  const openCollect = (id) => {
    const d = debts.find((x) => x.id === id);
    if (!d) return;
    setCollectingId(id);
    setCollectAmount(String(d.amount - d.paid));
    setCollectMethod("كاش");
    setCollectOpen(true);
  };

  const confirmCollect = () => {
    const amt = parseFloat(collectAmount) || 0;
    if (!amt) {
      toast.error("أدخل المبلغ");
      return;
    }
    const d = debts.find((x) => x.id === collectingId);
    if (!d) return;
    const updated = debts.map((x) =>
      x.id === collectingId
        ? { ...x, paid: Math.min(x.paid + amt, x.amount) }
        : x,
    );
    save(updated);
    setCollectOpen(false);
    if (d.paid + amt >= d.amount) {
      toast.success(`✅ تم تحصيل دين ${d.name} بالكامل!`);
    } else {
      toast.success(`✅ تم تسجيل دفعة ${fmt(amt)} ج من ${d.name}`);
    }
  };

  /* ── delete ── */
  const handleDelete = (id) => {
    if (!window.confirm("هتمسح الدين ده؟")) return;
    save(debts.filter((x) => x.id !== id));
    toast.success("🗑️ تم مسح الدين");
  };

  /* ── derived values ── */
  const remaining = debts
    .map((d) => ({ ...d, rem: d.amount - d.paid }))
    .filter((d) => d.rem > 0);
  const totalRem = remaining.reduce((s, d) => s + d.rem, 0);
  const overdue = remaining.filter((d) => isOverdue(d));
  const activeDebts = debts.filter((d) => d.amount > d.paid);
  const collectingDebt = debts.find((x) => x.id === collectingId);

  return (
    <div className="debts-page">
      <Header title="الديون والآجل" />

      {/* ── metrics ── */}
      <div className="debts-metrics">
        <div className="debts-metric">
          <div className="debts-metric-accent debts-metric-accent--red" />
          <div className="debts-metric-label">إجمالي المطلوب</div>
          <div className="debts-metric-val debts-metric-val--red">
            {fmt(totalRem)} <span className="debts-metric-unit">جنيه</span>
          </div>
        </div>
        <div className="debts-metric">
          <div className="debts-metric-accent debts-metric-accent--amber" />
          <div className="debts-metric-label">عدد العملاء بالآجل</div>
          <div className="debts-metric-val">{remaining.length}</div>
        </div>
        <div className="debts-metric">
          <div className="debts-metric-accent debts-metric-accent--red" />
          <div className="debts-metric-label">ديون متأخرة</div>
          <div
            className={`debts-metric-val ${overdue.length ? "debts-metric-val--red" : ""}`}
          >
            {overdue.length}
          </div>
        </div>
      </div>

      {/* ── top grid: form + summary ── */}
      <div className="debts-grid2">
        {/* form card */}
        <div className="debts-card">
          <div className="debts-card-hd">
            <div className="debts-card-title">📝 تسجيل دين جديد</div>
          </div>
          <form onSubmit={handleAdd}>
            <div className="debts-form-group">
              <div className="debts-form-label">اسم العميل</div>
              <input
                className="debts-input"
                placeholder="اسم العميل"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="debts-form-row">
              <div className="debts-form-group">
                <div className="debts-form-label">المبلغ (جنيه)</div>
                <input
                  className="debts-input"
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="debts-form-group">
                <div className="debts-form-label">تاريخ الاستحقاق</div>
                <input
                  className="debts-input"
                  type="date"
                  value={due}
                  onChange={(e) => setDue(e.target.value)}
                />
              </div>
            </div>
            <div className="debts-form-group">
              <div className="debts-form-label">البضاعة / الملاحظة</div>
              <input
                className="debts-input"
                placeholder="مثال: 5 كيلو أرز + كيلو سكر"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="debts-btn-green debts-btn-green--full"
            >
              + تسجيل الدين
            </button>
          </form>
        </div>

        {/* summary card */}
        <div className="debts-card">
          <div className="debts-card-hd">
            <div className="debts-card-title">ملخص الديون</div>
          </div>
          {remaining.length === 0 ? (
            <div className="debts-empty">
              <div className="debts-empty-icon">✅</div>
              <div className="debts-empty-text">مفيش ديون — تمام!</div>
            </div>
          ) : (
            <>
              <div className="debts-stat-row">
                <span className="debts-stat-label">إجمالي مطلوب</span>
                <span className="debts-stat-val debts-stat-val--red">
                  {fmt(totalRem)} ج
                </span>
              </div>
              <div className="debts-stat-row">
                <span className="debts-stat-label">عدد العملاء</span>
                <span className="debts-stat-val">{remaining.length} عميل</span>
              </div>
              <div className="debts-stat-row">
                <span className="debts-stat-label">ديون متأخرة</span>
                <span
                  className={`debts-stat-val ${overdue.length ? "debts-stat-val--red" : "debts-stat-val--green"}`}
                >
                  {overdue.length} دين
                </span>
              </div>
              {remaining.length > 0 && (
                <div className="debts-stat-row debts-stat-row--last">
                  <span className="debts-stat-label">أكبر دين</span>
                  <span className="debts-stat-val">
                    {fmt(Math.max(...remaining.map((d) => d.rem)))} ج
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── debts list card ── */}
      <div className="debts-card debts-card--list">
        <div className="debts-card-hd">
          <div className="debts-card-title">قائمة الديون</div>
        </div>

        {activeDebts.length === 0 ? (
          <div className="debts-empty">
            <div className="debts-empty-icon">🤝</div>
            <div className="debts-empty-text">مفيش ديون مسجلة دلوقتي</div>
          </div>
        ) : (
          activeDebts.map((d) => {
            const rem = d.amount - d.paid;
            const od = isOverdue(d);
            const daysLeft = getDaysLeft(d.due);
            let statusTxt, statusType;
            if (od) {
              statusTxt = "متأخر";
              statusType = "red";
            } else if (daysLeft <= 3) {
              statusTxt = `باقي ${daysLeft} يوم`;
              statusType = "amber";
            } else {
              statusTxt = new Date(d.due).toLocaleDateString("ar-EG");
              statusType = "green";
            }

            return (
              <div
                key={d.id}
                className={`debts-debt-card ${od ? "debts-debt-card--overdue" : ""}`}
              >
                {/* avatar */}
                <div
                  className={`debts-debt-avatar ${od ? "debts-debt-avatar--overdue" : ""}`}
                >
                  {getInitials(d.name)}
                </div>

                {/* info */}
                <div className="debts-debt-info">
                  <div className="debts-debt-name">{d.name}</div>
                  <div className="debts-debt-meta">
                    {d.note || "بدون ملاحظة"} · {d.date}
                  </div>
                  {d.paid > 0 && (
                    <div className="debts-debt-paid-note">
                      ✓ دفع {fmt(d.paid)} ج جزئياً
                    </div>
                  )}
                </div>

                {/* amount + badge */}
                <div className="debts-debt-amount">
                  <div className="debts-debt-amount-val">{fmt(rem)} ج</div>
                  <div style={{ marginTop: 4 }}>
                    <span className={`debts-badge debts-badge--${statusType}`}>
                      {statusTxt}
                    </span>
                  </div>
                </div>

                {/* actions */}
                <div className="debts-debt-actions">
                  <button
                    className="debts-btn-green-xs"
                    onClick={() => openCollect(d.id)}
                  >
                    تحصيل
                  </button>
                  <button
                    className="debts-btn-xs-danger"
                    onClick={() => handleDelete(d.id)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── collect modal ── */}
      <div
        className={`debts-overlay ${collectOpen ? "debts-overlay--open" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setCollectOpen(false);
        }}
      >
        <div className="debts-modal">
          <div className="debts-modal-title">💵 تحصيل دين</div>
          {collectingDebt && (
            <div className="debts-modal-summary">
              <strong>{collectingDebt.name}</strong>
              <br />
              المطلوب: {fmt(collectingDebt.amount - collectingDebt.paid)} جنيه
              <br />
              <span className="debts-modal-summary-note">
                {collectingDebt.note || ""}
              </span>
            </div>
          )}
          <div className="debts-form-row">
            <div className="debts-form-group">
              <div className="debts-form-label">المبلغ المحصّل (جنيه)</div>
              <input
                className="debts-input"
                type="number"
                placeholder="0"
                value={collectAmount}
                onChange={(e) => setCollectAmount(e.target.value)}
              />
            </div>
            <div className="debts-form-group">
              <div className="debts-form-label">طريقة الدفع</div>
              <select
                className="debts-input"
                value={collectMethod}
                onChange={(e) => setCollectMethod(e.target.value)}
              >
                <option>كاش</option>
                <option>فودافون كاش</option>
                <option>إنستاباي</option>
              </select>
            </div>
          </div>
          <div className="debts-modal-footer">
            <button className="debts-btn" onClick={() => setCollectOpen(false)}>
              إلغاء
            </button>
            <button className="debts-btn-green" onClick={confirmCollect}>
              ✅ تأكيد التحصيل
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
