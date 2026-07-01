import { useMemo, useState } from "react";
import {
    MdHome, MdShoppingCart, MdInventory, MdAccountBalanceWallet,
    MdHandshake, MdLocalShipping, MdBarChart, MdSettings, MdCreditCard, MdDownload, MdLogout
} from "react-icons/md";
import { useNavigate, useLocation } from 'react-router-dom';
import { useTijara } from '../context/TijaraContext';
import Export from "../pages/export";
import Plans from "../pages/Plans";
import LogOutModal from "../pages/logOutpage";


function Sidebar({ userData, onLogout }) {
    const [showSettings, setShowSettings] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [showPlans, setShowPlans] = useState(false);
    const [showLogOutModal, setShowLogOutModal] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    
    const { state } = useTijara();
    const { products } = state;

    // حساب المنتجات الناقصة من الـ Context مباشرة بدون مبيعات وبدون تفكير في الـ useEffect
    const lowProducts = useMemo(() => {
        if (!products) return 0;
        return products.filter(p => (p.quantity || 0) < (p.minimumQuantity || 0)).length;
    }, [products]);

    const navItem = (label, path, icon, badge) => (
        <button onClick={() => navigate(path)} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            backgroundColor: (location.pathname === path || (path === '/dashboard' && location.pathname === '/')) ? "#1f2e1f" : "transparent",
            color: (location.pathname === path || (path === '/dashboard' && location.pathname === '/')) ? "#22c97a" : "#aaa",
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
        </button>
    );

    const settingItem = (label, icon, onClick, danger = false) => (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            style={{
                display: "flex", alignItems: "center", justifyContent: "flex-end",
                gap: "8px", padding: "8px 10px", borderRadius: "8px",
                flexDirection: "row-reverse",
                border: "none", background: "transparent", width: "100%",
                fontFamily: "cairo, sans-serif", fontSize: "15px",
                color: danger ? "#e05555" : "#ffffff",
                cursor: "pointer", textAlign: "right",
                transition: "background 0.15s"
            }}
            onMouseEnter={e => e.currentTarget.style.background = danger ? "#2a1515" : "#222"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
            <span>{label}</span>
            <span style={{ fontSize: "15px", opacity: 0.8 }}>{icon}</span>
        </button>
    );

    return (
        <>
            <div style={{
                width: '240px', height: '100vh', background: '#121212',
                padding: '16px', borderLeft: "1px solid #222",
                display: "flex", flexDirection: "column", gap: "2px",
                boxSizing: "border-box", overflowY: "auto"
            }}>
                {/* Logo */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                    <img src="/Logo.png" alt="Logo"
                        style={{ width: "70px", height: "70px", objectFit: "contain", borderRadius: "6px" }}
                    />
                </div>

                {/* Nav الرئيسية */}
                <p style={{ color: "#444", fontSize: "11px", fontFamily: "cairo, sans-serif", margin: "12px 4px 4px", textAlign: "right" }}>الرئيسية</p>
                {navItem("الرئيسية", "/dashboard", <MdHome />)}

                {/* العمليات اليومية */}
                <p style={{ color: "#444", fontSize: "11px", fontFamily: "cairo, sans-serif", margin: "12px 4px 4px", textAlign: "right" }}>العمليات اليومية</p>
                {navItem("مبيعات اليوم", "/sales", <MdShoppingCart />)}
                {navItem("المخزن", "/storage", <MdInventory />, lowProducts)}
                {navItem("المصروفات", "/expenses", <MdAccountBalanceWallet />)}
                {navItem("الديون والآجل", "/debts", <MdHandshake />, 0)}

                {/* التقارير والموردين */}
                <p style={{ color: "#444", fontSize: "11px", fontFamily: "cairo, sans-serif", margin: "12px 4px 4px", textAlign: "right" }}>التقارير</p>
                {navItem("الأرباح والخسائر", "/profit-loss", <MdBarChart />)}
                {navItem("المورّدون", "/suppliers", <MdLocalShipping />)}

                {/* Spacer لتثبيت القائمة بالأسفل */}
                <div style={{ flex: 1 }} />

                {/* Settings Panel */}
                {showSettings && (
                    <div style={{
                        background: "#1a1a1a", borderRadius: "10px",
                        padding: "12px", marginBottom: "8px",
                        border: "1px solid #2a2a2a"
                    }}>
                        {/* Avatar + Name + Plan */}
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                            <div style={{
                                width: "36px", height: "36px", borderRadius: "50%",
                                background: "#22c97a22", border: "1px solid #22c97a44",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "13px", fontWeight: "800", color: "#22c97a", flexShrink: 0
                            }}>
                                {userData?.fullName?.charAt(0) || "؟"}
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: "15px", fontWeight: "700", color: "#f2f2f2" }}>
                                    {userData?.fullName || "المستخدم"}
                                </div>
                                <div style={{ fontSize: "13px", color: "#22c97a", marginTop: "2px" }}>
                                    ✨ باقة Premium
                                </div>
                            </div>
                        </div>

                        {/* Stats داخل القائمة */}
                        <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                            <div style={{
                                flex: 1, background: "#111", borderRadius: "8px",
                                padding: "8px", textAlign: "center", border: "1px solid #222"
                            }}>
                                <div style={{ fontSize: "14px", fontWeight: "800", color: "#f2f2f2" }}>٠ ج</div>
                                <div style={{ fontSize: "10px", color: "#555", marginTop: "2px" }}>ربح اليوم</div>
                            </div>
                            <div style={{
                                flex: 1, background: "#111", borderRadius: "8px",
                                padding: "8px", textAlign: "center", border: "1px solid #222"
                            }}>
                                <div style={{ fontSize: "14px", fontWeight: "800", color: "#22c97a" }}>
                                    {lowProducts > 0 ? lowProducts : "—"}
                                </div>
                                <div style={{ fontSize: "10px", color: "#555", marginTop: "2px" }}>منتج ناقص</div>
                            </div>
                        </div>

                        <div style={{ height: "1px", background: "#2a2a2a", margin: "4px 0 8px" }} />

                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            {settingItem("إعدادات الحساب", <MdSettings />, () => navigate("/settings"))}
                            {settingItem("باقتي وفواتيري", <MdCreditCard />, () => {
                                setShowPlans(true);
                                setShowSettings(false);
                            })}
                            {settingItem("تصدير البيانات", <MdDownload />, () => {
                                setShowExport(true);
                                setShowSettings(false);
                            })}
                            {settingItem("تسجيل الخروج", <MdLogout />, () => {
                                setShowLogOutModal(true);
                                setShowSettings(false);
                            }, true)}
                        </div>
                    </div>
                )}

                {/* Bottom user strip */}
                <div
                    onClick={() => setShowSettings(prev => !prev)}
                    style={{
                        display: "flex", alignItems: "center", gap: "10px",
                        padding: "10px 12px", borderRadius: "8px",
                        borderTop: "1px solid #1f1f1f", cursor: "pointer",
                        background: showSettings ? "#1a1a1a" : "transparent",
                        transition: "background 0.15s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#1a1a1a"}
                    onMouseLeave={e => e.currentTarget.style.background = showSettings ? "#1a1a1a" : "transparent"}
                >
                    <div style={{
                        width: "32px", height: "32px", borderRadius: "50%",
                        background: "#22c97a22", border: "1px solid #22c97a44",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "12px", fontWeight: "800", color: "#22c97a", flexShrink: 0
                    }}>
                       {userData?.fullName?.charAt(0) || userData?.name?.charAt(0) || "؟"}
                    </div>
                    <div style={{ flex: 1, textAlign: "right" }}>
                        <div style={{ fontSize: "12px", fontWeight: "700", color: "#f2f2f2" }}>
                         {userData?.fullName || userData?.name || "المستخدم"}
                        </div>
                        <div style={{ fontSize: "10px", color: "#555" }}>صاحب البيزنس</div>
                    </div>
                    <span style={{
                        fontSize: "10px", color: "#555",
                        transform: showSettings ? "rotate(0deg)" : "rotate(180deg)",
                        transition: "transform 0.2s", display: "inline-block"
                    }}>▲</span>
                </div>
            </div>

            {/* مودال تأكيد تسجيل الخروج */}
            {showLogOutModal && (
                <LogOutModal
                    isOpen={showLogOutModal}
                    onClose={() => setShowLogOutModal(false)}
                    onConfirm={() => {
                        setShowLogOutModal(false);
                        onLogout(); 
                    }}
                />
            )}

            {/* مودالات الصفحات الأخرى */}
            {showExport && <Export onClose={() => setShowExport(false)} />}
            {showPlans && <Plans onClose={() => setShowPlans(false)} />}
        </>
    );
}

export default Sidebar;