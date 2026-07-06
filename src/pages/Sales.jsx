import Header from "../components/Header";
import { useState, useMemo } from "react";
import { useTijara } from "../context/TijaraContext";
import toast from "react-hot-toast";

function Sales() {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const currentDate = new Date().toLocaleDateString('ar-EG', options);

  const { state, addSale: contextAddSale } = useTijara();
  const { products, sales, isLoading, error } = state;

  const [quantities, setQuantities] = useState({});
  const [saved, setSaved] = useState(false);

  // Compute today's totals
  const { todayRevenue, todayCost, todayProfit } = useMemo(() => {
    let rev = 0, cost = 0, profit = 0;
    if (!sales) return { todayRevenue: rev, todayCost: cost, todayProfit: profit };

    const today = new Date().toISOString().split('T')[0];
    sales.forEach(sale => {
      if (sale.date === today || (sale.created_at && new Date(sale.created_at).toISOString().split('T')[0] === today)) {
        rev += sale.revenue || 0;
        const qSold = sale.quantitySold || sale.quantity_sold || 0;
        const bPrice = sale.buyingPrice || sale.buying_price || 0;
        cost += (qSold * bPrice) || 0;
        profit += sale.profit || 0;
      }
    });
    return { todayRevenue: rev, todayCost: cost, todayProfit: profit };
  }, [sales]);

  const handleSaveSales = async () => {
    const soldEntries = products
      .map(p => ({ product: p, soldQuantity: quantities[p.id] || 0 }))
      .filter(entry => entry.soldQuantity > 0);

    if (soldEntries.length === 0) {
      alert('من فضلك أدخل كمية مباعة لمنتج واحد على الأقل');
      return;
    }

    try {
      await Promise.all(soldEntries.map(async ({ product: p, soldQuantity }) => {
        const saleData = {
          productId: p.id,
          product_id: p.id,
          productName: p.name,
          product_name: p.name,
          quantitySold: soldQuantity,
          quantity_sold: soldQuantity,
          sellingPrice: p.sellingPrice,
          selling_price: p.sellingPrice,
          buyingPrice: p.buyingPrice,
          buying_price: p.buyingPrice,
          revenue: soldQuantity * p.sellingPrice,
          profit: soldQuantity * (p.sellingPrice - p.buyingPrice),
          date: new Date().toISOString().split('T')[0]
        };

        // Send the product's FULL record on update, not just the new
        // quantity — Xano's PATCH endpoint needs every column present.
        const newQuantity = p.quantity - soldQuantity;
        const productUpdates = {
          name: p.name,
          quantity: newQuantity,
          buyingPrice: p.buyingPrice,
          sellingPrice: p.sellingPrice,
          unit: p.unit,
          minimumQuantity: p.minimumQuantity,
          status: newQuantity < (p.minimumQuantity || 0) ? 'ناقص' : 'متاح',
        };

        await contextAddSale(saleData, p.id, productUpdates);
      }));

      setSaved(true);
      // Reset input quantities
      setQuantities({});
      toast.success('تم حفظ المبيعات بنجاح');
    } catch (err) {
      console.error("Error saving sales:", err);
      toast.error('حدث خطأ أثناء حفظ المبيعات');
    }
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%' }}>
        <div style={{ color: '#22c97a', fontSize: '24px', fontFamily: 'cairo, sans-serif' }}>جاري التحميل...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%' }}>
        <div style={{ color: '#ef4444', fontSize: '20px', fontFamily: 'cairo, sans-serif' }}>حدث خطأ: {error}</div>
      </div>
    );
  }

  return (
    <>
      <Header title="مبيعات اليوم" extraContent={<span></span>} />

      {/* Sales Hero Box */}
      <div style={{
        background: "linear-gradient(135deg, #1e1e1e 0%, #161616 100%)",
        border: "1px solid #22c97a30", borderRadius: "16px",
        padding: "20px", margin: "16px 28px 20px"
      }}>

        {/* Date + Status */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexDirection: "row-reverse" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#a0a0a0", fontSize: "13px", fontFamily: "cairo, sans-serif" }}>حالة الإدخال</span>
            {saved ? (
              <span style={{
                backgroundColor: "#22c97a14", color: "#22c97a",
                padding: "2px 8px", borderRadius: "20px",
                fontSize: "11px", fontWeight: "600", fontFamily: "cairo, sans-serif"
              }}>تم الحفظ ✓</span>
            ) : (
              <span style={{
                backgroundColor: "#f5a62314", color: "#f5a623",
                padding: "2px 8px", borderRadius: "20px",
                fontSize: "11px", fontWeight: "600", fontFamily: "cairo, sans-serif"
              }}>لم يُحفظ</span>
            )}

          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "11px", color: "#585858", fontFamily: "cairo, sans-serif" }}>إدخال مبيعات</div>
            <div style={{ fontSize: "18px", fontWeight: "700", color: "#f2f2f2", fontFamily: "cairo, sans-serif" }}>{currentDate}</div>
          </div>
        </div>

        {/* Totals */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1px", background: "#ffffff14",
          borderRadius: "8px", overflow: "hidden", marginBottom: "16px"
        }}>
          <div style={{ background: "#1e1e1e", padding: "12px", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: "#585858", marginBottom: "3px", fontFamily: "cairo, sans-serif" }}>الإيراد الكلي</div>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "#f2f2f2", fontFamily: "cairo, sans-serif" }}>{todayRevenue} جنيه</div>
          </div>
          <div style={{ background: "#1e1e1e", padding: "12px", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: "#585858", marginBottom: "3px", fontFamily: "cairo, sans-serif" }}>التكلفة الكلية</div>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "#f05c5c", fontFamily: "cairo, sans-serif" }}>{todayCost} جنيه</div>
          </div>
          <div style={{ background: "#1e1e1e", padding: "12px", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: "#585858", marginBottom: "3px", fontFamily: "cairo, sans-serif" }}>الربح الصافي</div>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "#22c97a", fontFamily: "cairo, sans-serif" }}>{todayProfit} جنيه</div>
          </div>
        </div>
      </div>
      {/* products */}
      <div>
        <div style={{ display: "flex", gap: "12px", padding: "0 28px", marginBottom: "8px", fontFamily: "cairo, sans-serif", fontSize: "14px", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ margin: 0, color: "#f2f2f2", fontFamily: "cairo, sans-serif", fontSize: "18px", fontWeight: "800" }}>كم منتج تم بيعه اليوم</p>
          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={handleSaveSales} style={{
              backgroundColor: "#22c97a", color: "#000",
              border: "none", borderRadius: "8px",
              padding: "8px 16px", cursor: "pointer",
              fontFamily: "cairo, sans-serif", fontSize: "13px", fontWeight: "600"
            }}>💾 حفظ مبيعات اليوم</button>
          </div>
        </div>
      </div>
      {/* Products Table */}
      <div style={{ padding: "0 28px", marginTop: "20px" }}>
        {products.length === 0 ? (
          <p style={{ color: "#585858", textAlign: "center", padding: "40px", fontFamily: "cairo, sans-serif" }}>
            لا يوجد منتجات في المخزن - اضف بعض المنتجات من صفحة المخزن لبدء تسجيل المبيعات
          </p>
        ) :
          products.map((p) => (
            <div key={p.id} style={{
              background: "#1e1e1e", border: "1px solid #ffffff14",
              borderRadius: "12px", padding: "12px 14px",
              marginBottom: "8px", display: "grid",
              gridTemplateColumns: "1fr auto auto auto",
              gap: "24px", alignItems: "center"
            }}>
              {/* اسم المنتج - اليمين */}
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "#f2f2f2", fontWeight: "600", fontSize: "14px", fontFamily: "cairo, sans-serif" }}>{p.name}</div>
                <div style={{ color: "#585858", fontSize: "11px", fontFamily: "cairo, sans-serif" }}>بيع: {p.sellingPrice} ج/كيلو | شراء: {p.buyingPrice} ج/كيلو</div>
              </div>

              {/* input */}
              <div style={{ textAlign: "center" }}>
                <input
                  type="number" min="0"
                  value={quantities[p.id] || 0}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    setQuantities({ ...quantities, [p.id]: val > (p.quantity || 0) ? (p.quantity || 0) : val });
                    setSaved(false);
                  }}
                  style={{
                    width: "80px", padding: "8px", textAlign: "center",
                    backgroundColor: "#262626", border: "1px solid #22c97a",
                    borderRadius: "8px", color: "#f2f2f2",
                    fontFamily: "cairo, sans-serif", fontSize: "14px"
                  }}
                />
                <div style={{ color: "#585858", fontSize: "11px", fontFamily: "cairo, sans-serif", marginTop: "4px" }}>{p.unit} (متاح: {p.quantity || 0})</div>
              </div>

              {/* إيراد */}
              <div style={{ textAlign: "center", minWidth: "60px" }}>
                <p style={{ color: "#585858", fontSize: "11px", fontFamily: "cairo, sans-serif", margin: "0 0 3px" }}>الإيراد</p>
                {(quantities[p.id] || 0) === 0 ?
                  <p style={{ color: "#585858", fontSize: "14px", margin: 0 }}>—</p> :
                  <p style={{ color: "#f2f2f2", fontSize: "14px", fontWeight: "700", margin: 0, fontFamily: "cairo, sans-serif" }}>{(quantities[p.id] || 0) * p.sellingPrice} ج</p>
                }
              </div>

              {/* ربح */}
              <div style={{ textAlign: "center", minWidth: "60px" }}>
                <p style={{ color: "#585858", fontSize: "11px", fontFamily: "cairo, sans-serif", margin: "0 0 3px" }}>الربح</p>
                {(quantities[p.id] || 0) === 0 ?
                  <p style={{ color: "#585858", fontSize: "14px", margin: 0 }}>—</p> :
                  <p style={{ color: "#22c97a", fontSize: "14px", fontWeight: "700", margin: 0, fontFamily: "cairo, sans-serif" }}>{(quantities[p.id] || 0) * (p.sellingPrice - p.buyingPrice)} ج</p>
                }
              </div>
            </div>
          ))}
      </div>
    </>
  );
}

export default Sales;