import { useMemo } from "react"
import {
    MdHome,
    MdShoppingCart,
    MdInventory,
    MdAccountBalanceWallet,
    MdHandshake,
    MdLocalShipping
} from "react-icons/md";
import { useNavigate, useLocation } from 'react-router-dom';
import { useTijara } from '../context/TijaraContext';



function Sidebar() {
    const navigate = useNavigate()
    const location = useLocation()
    
    const { state } = useTijara();
    const { products } = state;

    const lowProducts = useMemo(() => {
        if (!products) return 0;
        return products.filter(p => (p.quantity || 0) < (p.minimumQuantity || 0)).length;
    }, [products]);

    const navItem = (label, path, icon, badge) => (
        <button onClick={() => {
            navigate(path)
        }} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            backgroundColor: location.pathname === path ? "#1f2e1f" : "transparent",
            color: location.pathname === path ? "#22c97a" : "#aaa",
            border: "none", borderRadius: "8px", padding: "8px 12px",
            cursor: "pointer", fontFamily: "cairo, sans-serif", fontSize: "14px",
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
        </button >
    )

    return (
        <div style={{
            width: '240px', height: '100vh', background: '#121212',
            padding: '16px', borderLeft: "1px solid #222",
            display: "flex", flexDirection: "column", gap: "2px",
            boxSizing: "border-box"
        }}>
            {/* Logo */}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                {/* <div>
                    <h2 style={{ color: 'white', margin: 0, fontFamily: "cairo, sans-serif", fontSize: "20px" }}>
                        {userData?.businessName || "تجارة"}
                    </h2>
                    <p style={{ color: "#555", margin: 0, fontSize: "11px", fontFamily: "cairo, sans-serif" }}>
                        {userData?.fullName || "نظام إدارة البيزنس"}
                    </p>
                </div> */}
               <img 
                    src="/Logo.png"
                    alt="Logo" 
                    style={{ 
                        width: "70px", 
                        height: "70px", 
                        objectFit: "contain",
                        borderRadius: "6px" 
                    }} 
                />
            </div>

            <p style={{ color: "#444", fontSize: "11px", fontFamily: "cairo, sans-serif", margin: "12px 4px 4px", textAlign: "right" }}> الرئيسية</p>
            {navItem("الرئيسية", "/dashboard", <MdHome />)}

            <p style={{ color: "#444", fontSize: "11px", fontFamily: "cairo, sans-serif", margin: "12px 4px 4px", textAlign: "right" }}>العمليات اليومية</p>
            {navItem("مبيعات اليوم", "/sales", <MdShoppingCart />)}
            {navItem("المخزن", "/storage", <MdInventory />, lowProducts)}
            {navItem("المصروفات", "/expenses", <MdAccountBalanceWallet />)}
            {navItem("الديون والآجل", "/debts", <MdHandshake />, 0)}

            <p style={{ color: "#444", fontSize: "11px", fontFamily: "cairo, sans-serif", margin: "12px 4px 4px", textAlign: "right" }}> التقارير</p>
            {/* {navItem("الأرباح والخسائر", "/profit-loss", <MdBarChart />)}
            {navItem("تقرير اليوم", "/daily-report", <MdAssignment />)} */}
            {navItem("الموردون", "/suppliers", <MdLocalShipping />)}

        </div>
    )
}
export default Sidebar