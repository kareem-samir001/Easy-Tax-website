import { useState, useEffect } from "react"
import { MdDashboard , MdPointOfSale , MdStorage } from "react-icons/md";
import { CiClock2 } from "react-icons/ci";
function Sidebar({ activePage, setActivePage }) {
    const [lowProducts, setLowProducts] = useState(0)

    useEffect(() => {
        const products = JSON.parse(localStorage.getItem('products') || '[]')
        setLowProducts(products.filter(p => p.status === 'ناقص').length)
    }, [activePage])

    const navItem = (label, page, icon, badge) => (
        <button onClick={() => setActivePage(page)} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            backgroundColor: activePage === page ? "#1f2e1f" : "transparent",
            color: activePage === page ? "#22c97a" : "#aaa",
            border: "none", borderRadius: "8px", padding: "10px 14px",
            cursor: "pointer", fontFamily: "cairo, sans-serif", fontSize: "15px",
            width: "100%", textAlign: "right"
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {badge > 0 && (
                    <span style={{
                        backgroundColor: "#e05555", color: "white", borderRadius: "50%",
                        width: "18px", height: "18px", fontSize: "11px",
                        display: "inline-flex", alignItems: "center", justifyContent: "center"
                    }}>{badge}</span>
                )}
                <span>{label}</span>
            </div>
            <span style={{ fontSize: "16px" }}>{icon}</span>
        </button>
    )

    return (
        <div style={{
            width: '220px', height: '100vh', background: '#161616',
            padding: '20px', borderLeft: "1px solid #222",
            display: "flex", flexDirection: "column", gap: "4px"
        }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", padding: "0 4px" }}>
                <div>
                    <h2 style={{ color: 'white', margin: 0, fontFamily: "cairo, sans-serif", fontSize: "20px" }}>تجارة</h2>
                    <p style={{ color: "#555", margin: 0, fontSize: "11px", fontFamily: "cairo, sans-serif" }}>نظام إدارة البيزنس</p>
                </div>
                <div style={{ width: "40px", height: "40px", backgroundColor: "#22c97a22", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>📦</div>
            </div>

            {/* الرئيسية */}
            <p style={{ color: "#444", fontSize: "11px", fontFamily: "cairo, sans-serif", margin: "8px 4px 4px", textAlign: "right" }}>الرئيسية</p>
            {navItem("الداشبورد", "Dashboard", <MdDashboard />)}

            {/* العمليات اليومية */}
            <p style={{ color: "#444", fontSize: "11px", fontFamily: "cairo, sans-serif", margin: "12px 4px 4px", textAlign: "right" }}>العمليات اليومية</p>
            {navItem("مبيعات اليوم", "Sales", <MdPointOfSale />)}
            {navItem("المخزن", "Storage", <MdStorage />, lowProducts)}
            {navItem("المصروفات", "Expenses", <CiClock2 />)}

            {/* التقارير */}
            {/* <p style={{ color: "#444", fontSize: "11px", fontFamily: "cairo, sans-serif", margin: "12px 4px 4px", textAlign: "right" }}>التقارير</p> */}
        </div>
    )
}
export default Sidebar