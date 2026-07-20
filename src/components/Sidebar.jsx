import { useMemo, useState } from "react";
import { authAPI } from "../api";
import { useEffect } from 'react'

import {
    MdHome, MdShoppingCart, MdInventory, MdAccountBalanceWallet,
    MdHandshake, MdLocalShipping, MdBarChart, MdSettings, MdCreditCard, MdDownload, MdLogout
} from "react-icons/md";
import { useNavigate, useLocation } from 'react-router-dom';
import { useTijara } from '../context/TijaraContext';
import Export from "../pages/export";
import Plans from "../pages/Plans";
import LogOutModal from "../pages/logOutpage";
import AccSetting from "../pages/AccSetting";


function Sidebar({ onLogout }) {
    const [showSettings, setShowSettings] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [showPlans, setShowPlans] = useState(false);
    const [showLogOutModal, setShowLogOutModal] = useState(false);
    const [showAccSettings, setShowAccSettings] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await authAPI.me();
                console.log("me() response:", res);
                const userData = res?.user || res;
                setUser(userData);
            } catch (error) {
                console.error("Auth check failed:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, []);

    useEffect 

    // Normalise field names — Xano may return snake_case or camelCase
    const displayUserName = user?.userName || user?.user_name || null;
    const displayBusinessName = user?.businessName || user?.business_name || null;
    const displayPicture = user?.picture || null;
    // avatarLetter: username first → business name → placeholder
    const avatarLetter = (
        displayUserName?.charAt(0) ||
        displayBusinessName?.charAt(0) ||
        "؟"
    ).toUpperCase();


    const navigate = useNavigate();
    const location = useLocation();

    const { state } = useTijara();
    const { products } = state;

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
                {navItem("تقرير اليوم", "/report", <MdBarChart />)}
                {navItem("الأرباح والخسائر", "/profit-loss", <MdBarChart />)}
                {navItem("المورّدون", "/suppliers", <MdLocalShipping />)}

                {/* Spacer لتثبيت القائمة بالأسفل */}
                <div style={{ flex: 1 }} />

                {/* Settings Panel — floating popup above the strip */}
                <div style={{ position: "relative" }}>
                    {showSettings && (
                        <div style={{
                            position: "absolute",
                            bottom: "calc(100% + 8px)",
                            left: 0,
                            right: 0,
                            background: "#141414",
                            borderRadius: "14px",
                            border: "1px solid #2a2a2a",
                            boxShadow: "0 -8px 32px rgba(0,0,0,0.6)",
                            overflow: "hidden",
                            zIndex: 50,
                        }}>
                            {/* Header strip inside popup */}
                            <div style={{
                                padding: "14px 14px 10px",
                                borderBottom: "1px solid #1f1f1f",
                                display: "flex", alignItems: "center", gap: "10px"
                            }}>
                                {displayPicture ? (
                                    <img
                                        src={displayPicture}
                                        alt="avatar"
                                        referrerPolicy="no-referrer"
                                        style={{
                                            width: "38px", height: "38px", borderRadius: "50%",
                                            objectFit: "cover", flexShrink: 0,
                                            border: "1px solid #22c97a55"
                                        }}
                                    />
                                ) : (
                                    <div style={{
                                        width: "38px", height: "38px", borderRadius: "50%",
                                        background: "linear-gradient(135deg, #22c97a22, #22c97a44)",
                                        border: "1px solid #22c97a55",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: "15px", fontWeight: "800", color: "#22c97a", flexShrink: 0
                                    }}>
                                        {avatarLetter}
                                    </div>
                                )}
                                <div style={{ textAlign: "right", overflow: "hidden" }}>
                                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#f2f2f2", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {isLoading ? "جاري التحميل..." : (displayUserName || "المستخدم")}
                                    </div>
                                    {displayBusinessName && (
                                        <div style={{ fontSize: "11px", color: "#888", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {displayBusinessName}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Menu items */}
                            <div style={{ padding: "6px" }}>
                                {[
                                    { label: "إعدادات الحساب", icon: <MdSettings />, onClick: () => { setShowAccSettings(true); setShowSettings(false); }, danger: false },
                                    { label: "باقتي وفواتيري", icon: <MdCreditCard />, onClick: () => { setShowPlans(true); setShowSettings(false); }, danger: false },
                                    { label: "تصدير البيانات", icon: <MdDownload />, onClick: () => { setShowExport(true); setShowSettings(false); }, danger: false },
                                    { label: "تسجيل الخروج", icon: <MdLogout />, onClick: () => { setShowLogOutModal(true); setShowSettings(false); }, danger: true },
                                ].map(({ label, icon, onClick, danger }) => (
                                    <button
                                        key={label}
                                        onClick={(e) => { e.stopPropagation(); onClick(); }}
                                        style={{
                                            display: "flex", alignItems: "center", justifyContent: "flex-end",
                                            gap: "8px", padding: "9px 10px", borderRadius: "8px",
                                            width: "100%", border: "none", background: "transparent",
                                            fontFamily: "cairo, sans-serif", fontSize: "13px",
                                            color: danger ? "#e05555" : "#d0d0d0",
                                            cursor: "pointer", textAlign: "right",
                                            transition: "background 0.15s, color 0.15s"
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = danger ? "#2a1515" : "#1f1f1f"}
                                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                    >
                                        <span>{label}</span>
                                        <span style={{ fontSize: "16px", opacity: 0.7 }}>{icon}</span>
                                    </button>
                                ))}
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
                        {displayPicture ? (
                            <img
                                src={displayPicture}
                                alt="avatar"
                                referrerPolicy="no-referrer"
                                style={{
                                    width: "32px", height: "32px", borderRadius: "50%",
                                    objectFit: "cover", flexShrink: 0,
                                    border: "1px solid #22c97a44"
                                }}
                            />
                        ) : (
                            <div style={{
                                width: "32px", height: "32px", borderRadius: "50%",
                                background: "#22c97a22", border: "1px solid #22c97a44",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "12px", fontWeight: "800", color: "#22c97a", flexShrink: 0
                            }}>
                                {avatarLetter}
                            </div>
                        )}
                        <div style={{ flex: 1, textAlign: "right", overflow: "hidden" }}>
                            <div style={{ fontSize: "14px", fontWeight: "700", color: "#f2f2f2", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {isLoading ? "جاري التحميل..." : (displayUserName || "المستخدم")}
                            </div>
                            {displayBusinessName && (
                                <div style={{ fontSize: "12px", color: "#888", marginTop: "1px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {displayBusinessName}
                                </div>
                            )}
                        </div>
                        <span style={{
                            fontSize: "10px", color: "#555",
                            transform: showSettings ? "rotate(0deg)" : "rotate(180deg)",
                            transition: "transform 0.2s", display: "inline-block"
                        }}>▲</span>
                    </div>
                </div>
            </div>

            {/* مودال تأكيد تسجيل الخروج */}
            {showLogOutModal && (
                <LogOutModal
                    isOpen={showLogOutModal}
                    onClose={() => setShowLogOutModal(false)}
                    onConfirm={() => {
                        setShowLogOutModal(false);
                        navigate('/');
                        onLogout();
                    }}
                />
            )}

            {/* مودالات الصفحات الأخرى */}
            {showExport && <Export onClose={() => setShowExport(false)} />}
            {showPlans && <Plans onClose={() => setShowPlans(false)} />}
            {showAccSettings && <AccSetting onClose={() => setShowAccSettings(false)} />}
            
        </>
    );
}

export default Sidebar;