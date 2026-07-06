import { useState, useMemo } from "react";
import Header from "../components/Header";
import toast from "react-hot-toast";
import { useTijara } from "../context/TijaraContext";
import StatCard from "../components/StatCard";
import "./Debts.css";

/* ─────────────────────────────────────────────
   HELPERS
 ───────────────────────────────────────────── */
const fmt = (n) => Math.round(n || 0).toLocaleString("ar-EG");

const isOverdue = (d) => {
  if (d.isPaid) return false;
  return d.dueDate && new Date(d.dueDate) < new Date();
};

const getInitials = (name) => {
  if (!name) return "دين";
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .substring(0, 2);
};

const getDaysLeft = (dueDate) => {
  if (!dueDate) return 0;
  return Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
};

const defaultDueDate = () => {
  const nd = new Date();
  nd.setDate(nd.getDate() + 7);
  return nd.toISOString().split("T")[0];
};

/* ─────────────────────────────────────────────
   EXTRA DEBT DATA (local-only, NOT synced with Xano)
   Xano's `debt` table only has debtorName/amount/isPaid/dueDate —
   no product/quantity/cost columns. We keep the real product link,
   quantity, and true cost here so profit is calculated correctly
   when the debt is collected, instead of treating 100% of the
   amount as profit.
 ───────────────────────────────────────────── */
const EXTRA_KEY = "tijara_debt_extra";

const getAllExtra = () => {
  try {
    return JSON.parse(localStorage.getItem(EXTRA_KEY) || "{}");
  } catch {
    return {};
  }
};

const getExtra = (id) => getAllExtra()[id] || null;

const saveExtra = (id, data) => {
  const all = getAllExtra();
  all[id] = data;
  localStorage.setItem(EXTRA_KEY, JSON.stringify(all));
};

const removeExtra = (id) => {
  const all = getAllExtra();
  delete all[id];
  localStorage.setItem(EXTRA_KEY, JSON.stringify(all));
};

/* ─────────────────────────────────────────────
   DEBT COLLECTIONS (local-only, read by Report.jsx)
   Xano's `sale` table requires a real product_id, which a
   debt collection doesn't have — so we track collected amounts
   here instead, and Report.jsx adds them to today's revenue,
   using the REAL cost saved in EXTRA_KEY for an accurate profit.
 ───────────────────────────────────────────── */
const COLLECTIONS_KEY = "tijara_debt_collections";

const addCollectionRecord = (debtorName, amount, productName, cost) => {
  let all = [];
  try {
    all = JSON.parse(localStorage.getItem(COLLECTIONS_KEY) || "[]");
  } catch {
    all = [];
  }
  all.push({
    debtorName,
    amount,
    productName: productName || `تحصيل دين: ${debtorName}`,
    cost: cost || 0,
    date: new Date().toISOString().split("T")[0],
    ts: Date.now(),
  });
  localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(all));
};

/* ─────────────────────────────────────────────
   COMPONENT
 ───────────────────────────────────────────── */
export default function Debts() {
  const {
    state,
    addDebt: contextAddDebt,
    updateDebt: contextUpdateDebt,
    updateProduct: contextUpdateProduct,
    deleteDebt: contextDeleteDebt,
  } = useTijara();
  const { debts, products, isLoading, error } = state;

  // Form States
  const [debtorName, setDebtorName] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [dueDate, setDueDate] = useState(defaultDueDate());
  const [submitting, setSubmitting] = useState(false);

  // Collect Modal States
  const [collectOpen, setCollectOpen] = useState(false);
  const [collectingDebt, setCollectingDebt] = useState(null);
  const [collectMethod, setCollectMethod] = useState("كاش");
  const [collectingId, setCollectingId] = useState(null);

  const safeProducts = products || [];
  const selectedProduct = safeProducts.find(
    (p) => String(p.id) === String(selectedProductId),
  );

  const computedAmount = useMemo(() => {
    const qty = parseFloat(quantity) || 0;
    if (!selectedProduct || !qty) return 0;
    return qty * (selectedProduct.sellingPrice || 0);
  }, [selectedProduct, quantity]);

  /* ── add debt (tied to a real product, deducts stock now) ── */
  const handleAdd = async (e) => {
    e.preventDefault();
    const qty = parseFloat(quantity) || 0;

    if (!debtorName.trim()) {
      toast.error("اكتب اسم العميل");
      return;
    }
    if (!selectedProduct) {
      toast.error("اختار المنتج اللي بيعته بالآجل");
      return;
    }
    if (!qty || qty <= 0) {
      toast.error("اكتب كمية صحيحة");
      return;
    }
    if (qty > (selectedProduct.quantity || 0)) {
      toast.error("الكمية أكبر من المتاح في المخزن");
      return;
    }

    const amt = qty * (selectedProduct.sellingPrice || 0);
    const cost = qty * (selectedProduct.buyingPrice || 0);

    // Matches Xano's `debt` table columns exactly: debtorName, amount, isPaid, dueDate
    const debtData = {
      debtorName: debtorName.trim(),
      amount: amt,
      isPaid: false,
      dueDate: dueDate,
    };

    setSubmitting(true);
    const newDebt = await contextAddDebt(debtData);

    if (newDebt && newDebt.id) {
      // Save the real product link/qty/cost locally (Xano has no columns for it)
      saveExtra(newDebt.id, {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        qty,
        cost,
      });

      // Deduct stock now — the goods already left the store on credit,
      // exactly like a cash sale would. Send the FULL product record on
      // update (Xano's PATCH needs every column, not just quantity).
      const newQuantity = (selectedProduct.quantity || 0) - qty;
      await contextUpdateProduct(selectedProduct.id, {
        name: selectedProduct.name,
        quantity: newQuantity,
        buyingPrice: selectedProduct.buyingPrice,
        sellingPrice: selectedProduct.sellingPrice,
        unit: selectedProduct.unit,
        minimumQuantity: selectedProduct.minimumQuantity,
        status:
          newQuantity < (selectedProduct.minimumQuantity || 0)
            ? "ناقص"
            : "متاح",
      });
    }

    setSubmitting(false);
    setDebtorName("");
    setSelectedProductId("");
    setQuantity("");
    setDueDate(defaultDueDate());
  };

  /* ── open collect modal ── */
  const openCollect = (d) => {
    setCollectingDebt(d);
    setCollectOpen(true);
  };

  /* ── confirm collect payment (full amount only, matches Xano's isPaid flag) ── */
  const confirmCollect = async () => {
    if (!collectingDebt) return;

    setCollectingId(collectingDebt.id);
    try {
      // Xano's PATCH endpoint requires all fields in the body, not just the
      // one changing — so we send the full record with isPaid flipped.
      await contextUpdateDebt(collectingDebt.id, {
        debtorName: collectingDebt.debtorName,
        amount: collectingDebt.amount,
        dueDate: collectingDebt.dueDate,
        isPaid: true,
      });

      // Log the collected amount locally so Report.jsx can add it to
      // today's revenue/profit using the REAL cost of the product that
      // was sold on credit — not treating the whole amount as profit.
      const extra = getExtra(collectingDebt.id);
      addCollectionRecord(
        collectingDebt.debtorName,
        collectingDebt.amount,
        extra?.productName,
        extra?.cost,
      );

      setCollectOpen(false);
      toast.success(
        `✅ تم تحصيل دين ${collectingDebt.debtorName} بالكامل (${collectMethod})`,
      );
    } catch {
      // context already shows an error toast
    } finally {
      setCollectingId(null);
    }
  };

  /* ── delete (restores stock if the debt was never collected) ── */
  const handleDelete = async (id) => {
    if (!window.confirm("هتمسح الدين ده؟")) return;

    const debt = (debts || []).find((d) => d.id === id);
    const extra = getExtra(id);

    // If it was never paid, the goods are effectively "returned" — put the
    // quantity back in stock.
    if (debt && !debt.isPaid && extra) {
      const product = safeProducts.find((p) => p.id === extra.productId);
      if (product) {
        const restoredQuantity = (product.quantity || 0) + (extra.qty || 0);
        await contextUpdateProduct(product.id, {
          name: product.name,
          quantity: restoredQuantity,
          buyingPrice: product.buyingPrice,
          sellingPrice: product.sellingPrice,
          unit: product.unit,
          minimumQuantity: product.minimumQuantity,
          status:
            restoredQuantity < (product.minimumQuantity || 0)
              ? "ناقص"
              : "متاح",
        });
      }
    }

    await contextDeleteDebt(id);
    removeExtra(id);
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", width: "100%" }}>
        <div style={{ color: "#22c97a", fontSize: "24px", fontFamily: "cairo, sans-serif" }}>جاري التحميل...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", width: "100%" }}>
        <div style={{ color: "#ef4444", fontSize: "20px", fontFamily: "cairo, sans-serif" }}>حدث خطأ: {error}</div>
      </div>
    );
  }

  /* ── derived values ── */
  const safeDebts = debts || [];
  const unpaid = safeDebts.filter((d) => !d.isPaid);
  const totalRem = unpaid.reduce((s, d) => s + (d.amount || 0), 0);
  const overdue = unpaid.filter((d) => isOverdue(d));

  return (
    <div className="debts-page">
      <Header title="الديون والآجل" />

      {/* ── metrics ── */}
      <div style={{ display: "flex", gap: "16px", margin: "20px 0" }}>
        <StatCard
          title="إجمالي المطلوب"
          value={fmt(totalRem)}
          unit="جنيه"
          valueColor="#f05c5c"
          accent="red"
        />
        <StatCard
          title="عدد العملاء بالآجل"
          value={unpaid.length}
        />
        <StatCard
          title="ديون متأخرة"
          value={overdue.length}
          valueColor={overdue.length ? '#f05c5c' : '#fff'}
          accent={overdue.length ? 'red' : 'green'}
        />
      </div>

      {/* ── top grid: form + summary ── */}
      <div className="debts-grid2">
        {/* form card */}
        <div className="debts-card">
          <div className="debts-card-hd">
            <div className="debts-card-title">📝 تسجيل دين جديد (بيع بالآجل)</div>
          </div>
          {safeProducts.length === 0 ? (
            <div className="debts-empty">
              <div className="debts-empty-icon">📦</div>
              <div className="debts-empty-text">
                أضف منتجات في صفحة المخزن الأول عشان تقدر تسجّل بيع بالآجل
              </div>
            </div>
          ) : (
            <form onSubmit={handleAdd}>
              <div className="debts-form-group">
                <div className="debts-form-label">اسم العميل</div>
                <input
                  className="debts-input"
                  placeholder="اسم العميل"
                  value={debtorName}
                  onChange={(e) => setDebtorName(e.target.value)}
                />
              </div>
              <div className="debts-form-group">
                <div className="debts-form-label">المنتج</div>
                <select
                  className="debts-input"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                >
                  <option value="">اختر المنتج</option>
                  {safeProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (متاح: {p.quantity || 0} {p.unit})
                    </option>
                  ))}
                </select>
              </div>
              <div className="debts-form-row">
                <div className="debts-form-group">
                  <div className="debts-form-label">
                    الكمية {selectedProduct ? `(${selectedProduct.unit})` : ""}
                  </div>
                  <input
                    className="debts-input"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
                <div className="debts-form-group">
                  <div className="debts-form-label">تاريخ الاستحقاق</div>
                  <input
                    className="debts-input"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>
              {selectedProduct && (
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text2, #909090)",
                    marginBottom: 12,
                  }}
                >
                  المبلغ المستحق: <strong>{fmt(computedAmount)} ج</strong> (
                  {quantity || 0} × {fmt(selectedProduct.sellingPrice)} ج)
                </div>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="debts-btn-green debts-btn-green--full"
              >
                {submitting ? "جاري الحفظ..." : "+ تسجيل الدين"}
              </button>
            </form>
          )}
        </div>

        {/* summary card */}
        <div className="debts-card">
          <div className="debts-card-hd">
            <div className="debts-card-title">ملخص الديون</div>
          </div>
          {unpaid.length === 0 ? (
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
                <span className="debts-stat-val">{unpaid.length} عميل</span>
              </div>
              <div className="debts-stat-row">
                <span className="debts-stat-label">ديون متأخرة</span>
                <span
                  className={`debts-stat-val ${overdue.length ? "debts-stat-val--red" : "debts-stat-val--green"}`}
                >
                  {overdue.length} دين
                </span>
              </div>
              <div className="debts-stat-row debts-stat-row--last">
                <span className="debts-stat-label">أكبر دين</span>
                <span className="debts-stat-val">
                  {fmt(Math.max(...unpaid.map((d) => d.amount || 0)))} ج
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── debts list card ── */}
      <div className="debts-card debts-card--list">
        <div className="debts-card-hd">
          <div className="debts-card-title">قائمة الديون</div>
        </div>

        {unpaid.length === 0 ? (
          <div className="debts-empty">
            <div className="debts-empty-icon">🤝</div>
            <div className="debts-empty-text">مفيش ديون مسجلة دلوقتي</div>
          </div>
        ) : (
          unpaid.map((d) => {
            const rem = d.amount || 0;
            const od = isOverdue(d);
            const daysLeft = getDaysLeft(d.dueDate);
            const extra = getExtra(d.id);
            let statusTxt, statusType;
            if (od) {
              statusTxt = "متأخر";
              statusType = "red";
            } else if (daysLeft <= 3 && daysLeft >= 0) {
              statusTxt = `باقي ${daysLeft} يوم`;
              statusType = "amber";
            } else {
              statusTxt = d.dueDate
                ? new Date(d.dueDate).toLocaleDateString("ar-EG")
                : "—";
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
                  style={od ? { background: "var(--red-bg)", color: "var(--red)" } : {}}
                >
                  {getInitials(d.debtorName)}
                </div>

                {/* info */}
                <div className="debts-debt-info">
                  <div className="debts-debt-name">{d.debtorName}</div>
                  <div className="debts-debt-meta">
                    {extra
                      ? `${extra.productName} × ${extra.qty}`
                      : "بدون منتج مرتبط"}
                    {d.created_at
                      ? ` · ${new Date(d.created_at).toLocaleDateString("ar-EG")}`
                      : ""}
                  </div>
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
                    onClick={() => openCollect(d)}
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
              <strong>{collectingDebt.debtorName}</strong>
              <br />
              المطلوب: {fmt(collectingDebt.amount || 0)} جنيه
              <br />
              <span className="debts-modal-summary-note">
                {(() => {
                  const extra = getExtra(collectingDebt.id);
                  return extra ? `${extra.productName} × ${extra.qty}` : "";
                })()}
              </span>
            </div>
          )}
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
          <div className="debts-modal-footer">
            <button className="debts-btn" onClick={() => setCollectOpen(false)}>
              إلغاء
            </button>
            <button className="debts-btn-green" onClick={confirmCollect} disabled={collectingId !== null}>
              {collectingId !== null ? "..." : "✅ تأكيد التحصيل الكامل"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
