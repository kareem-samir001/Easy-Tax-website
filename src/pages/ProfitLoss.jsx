import { useMemo } from "react";
import Header from "../components/Header";
import StatCard from "../components/StatCard";
import { useTijara } from "../context/TijaraContext";
import { thStyles, generalStyles } from "./storageStyles.js";

// Debt collections are tracked locally by Debts.jsx (Xano's `sale` table
// requires a real product_id that a collection doesn't have). This page is
// all-time, so we include every collection ever recorded, using the real
// cost saved at debt-creation time for an accurate profit.
const COLLECTIONS_KEY = "tijara_debt_collections";

const getAllCollections = () => {
  try {
    return JSON.parse(localStorage.getItem(COLLECTIONS_KEY) || "[]");
  } catch {
    return [];
  }
};

function ProfitLoss() {
    const { state } = useTijara();
    const { sales, expenses, isLoading, error } = state;

    // Calculate totals
    const {
        totalRevenue,
        totalCosts,
        totalNetProfit,
        productStats
    } = useMemo(() => {
        let revenue = 0;
        let cogs = 0; // Cost of Goods Sold
        let totalExpenses = 0;
        
        const statsMap = {}; // Group by productId

        if (sales && sales.length > 0) {
            sales.forEach(sale => {
                const qSold = sale.quantitySold || sale.quantity_sold || 0;
                const bPrice = sale.buyingPrice || sale.buying_price || 0;
                const sPrice = sale.sellingPrice || sale.selling_price || 0;
                const pId = sale.productId || sale.product_id || 'unknown';
                const pName = sale.productName || sale.product_name || 'غير معروف';
                
                const saleRevenue = sale.revenue || (qSold * sPrice) || 0;
                const saleCost = (qSold * bPrice) || 0;
                const saleProfit = sale.profit || (saleRevenue - saleCost) || 0;

                revenue += saleRevenue;
                cogs += saleCost;

                if (!statsMap[pId]) {
                    statsMap[pId] = {
                        name: pName,
                        quantity: 0,
                        revenue: 0,
                        profit: 0
                    };
                }
                statsMap[pId].quantity += qSold;
                statsMap[pId].revenue += saleRevenue;
                statsMap[pId].profit += saleProfit;
            });
        }

        // تحصيلات الديون (كل الوقت) — بالتكلفة الحقيقية المحفوظة وقت تسجيل الدين
        const collections = getAllCollections();
        collections.forEach((col, idx) => {
            const colRevenue = col.amount || 0;
            const colCost = col.cost || 0;
            const colProfit = colRevenue - colCost;

            revenue += colRevenue;
            cogs += colCost;

            const key = `debt-collection-${idx}`;
            statsMap[key] = {
                name: col.productName || `تحصيل دين: ${col.debtorName}`,
                quantity: 1,
                revenue: colRevenue,
                profit: colProfit,
            };
        });

        if (expenses && expenses.length > 0) {
            expenses.forEach(exp => {
                totalExpenses += (exp.amount || 0);
            });
        }

        const costs = cogs + totalExpenses;
        const netProfit = revenue - costs;

        // Convert map to array and calculate margins
        const productStatsArray = Object.values(statsMap).map(p => {
            const margin = p.revenue > 0 ? (p.profit / p.revenue) * 100 : 0;
            return {
                ...p,
                margin: Math.round(margin)
            };
        });

        // Sort by revenue descending
        productStatsArray.sort((a, b) => b.revenue - a.revenue);

        return {
            totalRevenue: revenue,
            totalCosts: costs,
            totalNetProfit: netProfit,
            productStats: productStatsArray
        };
    }, [sales, expenses]);

    const totalMargin = totalRevenue > 0 ? (totalNetProfit / totalRevenue) * 100 : 0;

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

    const formatCurrency = (amount) => amount.toLocaleString() + " جنيه";

    return (
        <>
            <Header title="الأرباح والخسائر" extraContent={<span></span>} />

            <div style={{ padding: "0 28px" }}>
                {/* Stat Boxes */}
                <div style={{ display: "flex", gap: "20px", marginTop: "24px", marginBottom: "32px" }}>
                    <StatCard
                        title="إجمالي الإيراد"
                        value={totalRevenue.toLocaleString()}
                        unit="جنيه"
                    />
                    <StatCard
                        title="التكاليف + المصروفات"
                        value={totalCosts.toLocaleString()}
                        unit="جنيه"
                        accent="red"
                    />
                    <StatCard
                        title="الربح الصافي"
                        value={totalNetProfit.toLocaleString()}
                        unit="جنيه"
                        valueColor={totalNetProfit >= 0 ? '#22c97a' : '#f05c5c'}
                        accent={totalNetProfit >= 0 ? 'green' : 'red'}
                        subtitle={`هامش: ${Math.round(totalMargin)}%`}
                    />
                </div>

                {/* Table */}
                <div style={{ backgroundColor: "#0f0f0f", borderRadius: "12px", overflow: "hidden", paddingBottom: "16px", border: "1px solid #1f1f1f" }}>
                    <div style={{ padding: "16px 20px", borderBottom: "1px solid #1f1f1f", display: "flex", justifyContent: "flex-end" }}>
                        <h3 style={{ color: "white", margin: 0, fontFamily: "cairo, sans-serif", fontSize: "16px" }}>تفاصيل الأرباح حسب المنتج</h3>
                    </div>
                    <div style={{ maxHeight: "480px", overflowY: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                {["المنتج", "كمية مباعة", "الإيراد", "الربح", "الهامش"].map(h => (
                                    <th key={h} style={{ ...thStyles, backgroundColor: "transparent", borderBottom: "1px solid #1f1f1f", padding: "16px", position: "sticky", top: 0 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {productStats.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ ...generalStyles, textAlign: "center", padding: "32px", color: "#666" }}>
                                        لا توجد بيانات متاحة
                                    </td>
                                </tr>
                            ) : (
                                productStats.map((p, idx) => (
                                    <tr key={idx} style={{ transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#161616"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                                        <td style={{ ...generalStyles, borderBottom: "1px solid #161616", padding: "16px", color: "white" }}>{p.name}</td>
                                        <td style={{ ...generalStyles, borderBottom: "1px solid #161616", padding: "16px" }}>{p.quantity}</td>
                                        <td style={{ ...generalStyles, borderBottom: "1px solid #161616", padding: "16px" }}>{p.revenue.toLocaleString()} ج</td>
                                        <td style={{ ...generalStyles, borderBottom: "1px solid #161616", padding: "16px", color: p.profit >= 0 ? "#22c97a" : "#e05555" }}>{p.profit.toLocaleString()} ج</td>
                                        <td style={{ ...generalStyles, borderBottom: "1px solid #161616", padding: "16px" }}>
                                            <span style={{
                                                backgroundColor: p.margin >= 20 ? "#143a25" : "#3a1414",
                                                color: p.margin >= 20 ? "#22c97a" : "#e05555",
                                                padding: "4px 8px",
                                                borderRadius: "12px",
                                                fontSize: "12px",
                                                fontWeight: "bold"
                                            }}>
                                                %{p.margin}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ProfitLoss;
