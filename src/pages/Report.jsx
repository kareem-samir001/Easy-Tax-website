import { useMemo } from "react";
import Header from "../components/Header";
import { useTijara } from "../context/TijaraContext";
import "./Report.css";

const fmt = (n) => Math.round(n || 0).toLocaleString("ar-EG");

// Debt collections are tracked locally by Debts.jsx (Xano's `sale` table
// requires a real product_id that a collection doesn't have), so we read
// them here and fold them into today's revenue/profit.
const COLLECTIONS_KEY = "tijara_debt_collections";

const getTodaysCollections = () => {
  let all = [];
  try {
    all = JSON.parse(localStorage.getItem(COLLECTIONS_KEY) || "[]");
  } catch {
    all = [];
  }
  const todayStr = new Date().toISOString().split("T")[0];
  return all.filter((c) => c.date === todayStr);
};

function Report() {
  const { state } = useTijara();
  const { products, sales, expenses, isLoading, error } = state;

  const todayLabel = new Date().toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const {
    revenue,
    cost,
    profit,
    margin,
    totalExpenses,
    netAfterExpenses,
    soldProducts,
    lowStockProducts,
    debtCollectionsTotal,
  } = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];

    const todaySales = (sales || []).filter((s) => {
      if (!s) return false;
      const d =
        s.date ||
        (s.created_at ? new Date(s.created_at).toISOString().split("T")[0] : "");
      return d === todayStr;
    });

    // إجمالي الإيراد والتكلفة والربح التجاري لليوم
    let rev = 0;
    let cst = 0;
    const byProduct = {};

    todaySales.forEach((sale) => {
      const qty = sale.quantitySold || sale.quantity_sold || 0;
      const bPrice = sale.buyingPrice || sale.buying_price || 0;
      const sPrice = sale.sellingPrice || sale.selling_price || 0;
      const pId = sale.productId || sale.product_id || "unknown";
      const pName = sale.productName || sale.product_name || "منتج";

      const saleRevenue = sale.revenue || qty * sPrice || 0;
      const saleCost = qty * bPrice || 0;
      const saleProfit = sale.profit || saleRevenue - saleCost || 0;

      rev += saleRevenue;
      cst += saleCost;

      if (!byProduct[pId]) {
        byProduct[pId] = { name: pName, qty: 0, revenue: 0, profit: 0 };
      }
      byProduct[pId].qty += qty;
      byProduct[pId].revenue += saleRevenue;
      byProduct[pId].profit += saleProfit;
    });

    const prft = rev - cst;

    // تحصيلات الديون اليوم (مسجلة محليًا من صفحة الديون) — الربح الحقيقي هو
    // المبلغ ناقص تكلفة المنتج الفعلية (المحفوظة وقت تسجيل الدين)، مش المبلغ
    // كامل كإيراد بهامش 100%
    const todaysCollections = getTodaysCollections();
    const debtCollectionsTotal = todaysCollections.reduce(
      (s, c) => s + (c.amount || 0),
      0,
    );
    const debtCollectionsCost = todaysCollections.reduce(
      (s, c) => s + (c.cost || 0),
      0,
    );

    todaysCollections.forEach((col, idx) => {
      const key = `debt-collection-${idx}`;
      byProduct[key] = {
        name: col.productName || `تحصيل دين: ${col.debtorName}`,
        qty: 1,
        revenue: col.amount || 0,
        profit: (col.amount || 0) - (col.cost || 0),
      };
    });

    const finalRevenue = rev + debtCollectionsTotal;
    const finalCost = cst + debtCollectionsCost;
    const finalProfit = prft + (debtCollectionsTotal - debtCollectionsCost);
    const mrg = finalRevenue > 0 ? Math.round((finalProfit / finalRevenue) * 100) : 0;

    // المصروفات (كل المصروفات المسجلة، زي الأصل بالظبط)
    const totalExp = (expenses || []).reduce((s, e) => s + (e.amount || 0), 0);
    const netFinal = finalProfit - totalExp;

    const soldProductsArr = Object.values(byProduct).sort(
      (a, b) => b.revenue - a.revenue,
    );

    // تنبيهات المخزن
    const lowProds = (products || []).filter(
      (p) => (p.quantity || 0) <= (p.minimumQuantity || 0),
    );

    return {
      revenue: finalRevenue,
      cost: finalCost,
      profit: finalProfit,
      margin: mrg,
      totalExpenses: totalExp,
      netAfterExpenses: netFinal,
      soldProducts: soldProductsArr,
      lowStockProducts: lowProds,
      debtCollectionsTotal,
    };
  }, [sales, expenses, products]);

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

  const marginBadgeClass =
    margin >= 30 ? "report-badge--green" : margin >= 15 ? "report-badge--amber" : "report-badge--red";

  return (
    <>
      <Header title="تقرير اليوم" extraContent={<span></span>} />

      <div className="report-page">
        {/* topbar */}
        <div className="report-topbar no-print">
          <div className="report-date-note">
            تقرير شامل ليوم <strong>{todayLabel}</strong>
          </div>
          <button className="report-print-btn" onClick={() => window.print()}>
            🖨️ طباعة / PDF
          </button>
        </div>

        {/* summary hero */}
        <div className="report-summary-box">
          <div className="report-summary-main">{fmt(profit)} جنيه</div>
          <div className="report-summary-label">الربح الصافي اليوم</div>
          <div className="report-summary-sub">
            <div className="report-summary-item">
              <div className="report-summary-item-val">{fmt(revenue)}</div>
              <div className="report-summary-item-label">إيراد</div>
            </div>
            <div className="report-summary-item">
              <div className="report-summary-item-val report-summary-item-val--red">{fmt(cost)}</div>
              <div className="report-summary-item-label">تكلفة</div>
            </div>
            <div className="report-summary-item">
              <div className="report-summary-item-val report-summary-item-val--amber">{margin}٪</div>
              <div className="report-summary-item-label">هامش الربح</div>
            </div>
          </div>
        </div>

        {/* grid: products sold + summary */}
        <div className="report-grid2">
          <div className="report-card">
            <div className="report-card-hd">
              <div className="report-card-title">📦 المنتجات المباعة</div>
            </div>
            <div style={{ maxHeight: "360px", overflowY: "auto" }}>
            {soldProducts.length === 0 ? (
              <div className="report-empty">
                <div className="report-empty-icon">📦</div>
                <div className="report-empty-text">لا توجد مبيعات اليوم</div>
              </div>
            ) : (
              soldProducts.map((p, idx) => {
                const pm = p.revenue > 0 ? Math.round((p.profit / p.revenue) * 100) : 0;
                return (
                  <div className="report-prod-row" key={idx}>
                    <span className="report-prod-label">
                      {p.name} ({p.qty})
                    </span>
                    <div>
                      <div className="report-prod-rev">{fmt(p.revenue)} ج</div>
                      <div className="report-prod-profit">+{fmt(p.profit)} ربح ({pm}٪)</div>
                    </div>
                  </div>
                );
              })
            )}
            </div>
          </div>

          <div className="report-card">
            <div className="report-card-hd">
              <div className="report-card-title">📋 ملخص اليوم</div>
            </div>
            <div className="report-stat-row">
              <span className="report-stat-label">إجمالي الإيراد</span>
              <span className="report-stat-val">{fmt(revenue)} ج</span>
            </div>
            <div className="report-stat-row">
              <span className="report-stat-label">تكلفة البضاعة</span>
              <span className="report-stat-val report-stat-val--red">{fmt(cost)} ج</span>
            </div>
            {debtCollectionsTotal > 0 && (
              <div className="report-stat-row">
                <span className="report-stat-label">تحصيل ديون اليوم</span>
                <span className="report-stat-val report-stat-val--green">
                  {fmt(debtCollectionsTotal)} ج
                </span>
              </div>
            )}
            <div className="report-stat-row">
              <span className="report-stat-label">الربح التجاري</span>
              <span className="report-stat-val report-stat-val--green">{fmt(profit)} ج</span>
            </div>
            <div className="report-stat-row">
              <span className="report-stat-label">المصروفات التشغيلية</span>
              <span className="report-stat-val report-stat-val--amber">{fmt(totalExpenses)} ج</span>
            </div>
            <div className="report-stat-row report-stat-row--final">
              <span className="report-stat-label report-stat-label--bold">الربح الصافي النهائي</span>
              <span className="report-stat-val report-stat-val--big report-stat-val--green">
                {fmt(netAfterExpenses)} ج
              </span>
            </div>
            <div className="report-stat-row">
              <span className="report-stat-label">هامش الربح</span>
              <span className="report-stat-val">
                <span className={`report-badge ${marginBadgeClass}`}>{margin}٪</span>
              </span>
            </div>
            <div className="report-stat-row">
              <span className="report-stat-label">عدد المنتجات المباعة</span>
              <span className="report-stat-val">{soldProducts.length} منتج</span>
            </div>
          </div>
        </div>

        {/* stock alerts */}
        <div className="report-card report-card--full">
          <div className="report-card-hd">
            <div className="report-card-title">⚠️ تنبيهات المخزن</div>
          </div>
          {lowStockProducts.length === 0 ? (
            <div className="report-empty">
              <div className="report-empty-icon">✅</div>
              <div className="report-empty-text">المخزن تمام — مفيش تنبيهات</div>
            </div>
          ) : (
            lowStockProducts.map((p) => {
              const critical = (p.quantity || 0) <= (p.minimumQuantity || 0) * 0.5;
              return (
                <div key={p.id} className={`report-alert ${critical ? "report-alert--red" : "report-alert--amber"}`}>
                  <strong>{p.name}</strong> — متبقي {p.quantity || 0} {p.unit} (الحد الأدنى: {p.minimumQuantity || 0} {p.unit})
                  {critical ? " — حرج جداً" : ""}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

export default Report;
