import { createPortal } from "react-dom";

function Plans({ onClose }) {
    const features = [
        ["منتجات غير محدودة", "نظام الديون والآجل"],
        ["تقارير مفصلة + طباعة", "سجل الموردين والشحنات"],
        ["تنبيهات وإشعارات فورية", "دعم فني أولوية"],
    ]

    const invoices = [
        { date: "فاتورة 21 يونيو 2026", plan: "باقة Premium الشهرية", amount: "99" },
        { date: "فاتورة 21 مايو 2026", plan: "باقة Premium الشهرية", amount: "99" },
        { date: "فاتورة 21 أبريل 2026", plan: "باقة Premium الشهرية", amount: "99" },
    ]

    return createPortal(
        <>
            {/* Overlay */}
            <div onClick={onClose} style={{
                position: "fixed", inset: 0,
                background: "rgba(0,0,0,0.75)", zIndex: 99999
            }} />

            {/* Modal */}
            <div style={{
                position: "fixed", top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                background: "#161616", border: "1px solid #2a2a2a",
                borderRadius: "20px", padding: "24px",
                width: "460px", maxWidth: "92vw",
                maxHeight: "88vh", overflowY: "auto",
                zIndex: 100000, direction: "rtl",
                fontFamily: "cairo, sans-serif",
                boxShadow: "0 24px 60px rgba(0,0,0,0.6)"
            }}>

                
                <div style={{ display: "flex", alignItems: "center", justifyContent: "right", gap: "8px", marginBottom: "20px" }}>
                    <span style={{ fontSize: "18px" }}>💎</span>
                    <h2 style={{ color: "#f2f2f2", fontSize: "17px", fontWeight: "700", margin: 0 }}>
                        باقتي وفواتيري
                    </h2>
                </div>

                {/* Plan Card */}
                <div style={{
                    background: "#1a241f", border: "1px solid #22c97a22", // تعديل لون الخلفية والبوردر ليميل للأخضر الخفيف كالصورة
                    borderRadius: "14px", padding: "18px", marginBottom: "16px"
                }}>
                    {/* Plan name + badge - تعديل مكان الشارة لتصبح على اليمين والنص يسار */}
                    <div style={{ display: "flex", alignItems: "center", flexDirection: "row-reverse", justifyContent: "space-between", marginBottom: "12px" }}>
                        <span style={{
                            background: "#22c97a", color: "#000", // تعديل الألوان لتطابق الصورة (الخلفية خضراء مصمتة والنص أسود)
                            borderRadius: "6px",
                            fontSize: "11px", fontWeight: "700", padding: "3px 10px"
                        }}>نشطة</span>
                        <span style={{ color: "#f2f2f2", fontSize: "15px", fontWeight: "700" }}>
                            ✨ باقة Premium
                        </span>
                    </div>

                    {/* Price - تعديل المحاذاة لتصبح في السنتر */}
                    <div style={{ textAlign: "right", marginBottom: "10px" }}>
                        <span style={{ color: "#22c97a", fontSize: "32px", fontWeight: "800" }}>99</span>
                        <span style={{ color: "#aaa", fontSize: "13px", marginRight: "4px" }}>جنيه / شهر</span>
                    </div>

                    {/* Progress bar */}
                    <div style={{
                        height: "4px", background: "#2a2a2a",
                        borderRadius: "4px", marginBottom: "10px", overflow: "hidden"
                    }}>
                        <div style={{
                            width: "64%", height: "100%",
                            background: "#22c97a", borderRadius: "4px"
                        }} />
                    </div>

                 
                    <div style={{ display: "flex", flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "#22c97a", fontSize: "12px", fontWeight: "600" }}>
                            باقي 19 يوم للتجديد
                        </span>
                        <span style={{ color: "#666", fontSize: "11px" }}>
                            آخر دفعة: 21 يونيو 2026
                        </span>
                    </div>
                </div>

                {/* Features */}
                <div style={{ marginBottom: "16px" }}>
                    <p style={{ color: "#888", fontSize: "12px", textAlign: "right", marginBottom: "12px" }}>
                        ما بتستمتع به دلوقتي:
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                        {features.flat().map((f, i) => (
                            <div key={i} style={{
                                background: "#1e1e1e", border: "1px solid #2a2a2a",
                                borderRadius: "8px", padding: "10px 12px",
                                display: "flex", alignItems: "center", flexDirection: "row-reverse", // لجعل علامة الصح يساراً والنص يميناً
                                justifyContent: "space-between",
                                gap: "6px"
                            }}>
                                <span style={{ color: "#f2f2f2", fontSize: "12px" }}>{f}</span>
                                <span style={{ color: "#22c97a", fontSize: "13px", fontWeight: "bold" }}>✓</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Invoices */}
                <div style={{ marginBottom: "20px" }}>
                    <p style={{ color: "#888", fontSize: "12px", textAlign: "right", marginBottom: "12px" }}>
                        سجل الفواتير:
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {invoices.map((inv, i) => (
                            <div key={i} style={{
                                background: "#1e1e1e", border: "1px solid #2a2a2a",
                                borderRadius: "10px", padding: "12px 14px",
                                display: "flex", alignItems: "center", flexDirection: "row", // لقلب محاذاة الفاتورة بالكامل (الداتا يمين، الأزرار يسار)
                                justifyContent: "space-between"
                            }}>
                                {/* جهة اليمين (بيانات الفاتورة) */}
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ color: "#f2f2f2", fontSize: "13px", fontWeight: "600" }}>
                                        {inv.date}
                                    </div>
                                    <div style={{ color: "#555", fontSize: "11px", marginTop: "2px" }}>
                                        {inv.plan}
                                    </div>
                                </div>

                                {/* جهة اليسار (المبلغ، شارة مدفوع، زر التحميل) */}
                                <div style={{ display: "flex", alignItems: "center", flexDirection: "row", gap: "10px" }}>
                                    <span style={{ color: "#f2f2f2", fontSize: "13px", fontWeight: "700" }}>
                                        {inv.amount} ج
                                    </span>
                                    <span style={{
                                        background: "#22c97a22", color: "#22c97a",
                                        border: "1px solid #22c97a33", borderRadius: "20px",
                                        fontSize: "11px", fontWeight: "700", padding: "2px 10px"
                                    }}>مدفوع</span>
                                    <button style={{
                                        background: "#2a2a2a", border: "none",
                                        color: "#4ea8f5", borderRadius: "6px", width: "28px", height: "28px",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        cursor: "pointer", fontSize: "14px"
                                    }}>⬇</button> {/* تم تعديل الأيقونة لتطابق السهم الأزرق المتجه لأسفل */}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                
                <div style={{ display: "flex", alignItems: "center", flexDirection: "row-reverse", justifyContent: "space-between" }}>
                    <button style={{
                        background: "none", border: "none",
                        color: "#e05555", cursor: "pointer",
                        fontFamily: "cairo, sans-serif", fontSize: "13px", fontWeight: "600"
                    }}>إلغاء الاشتراك</button>
                    
                    <button
                        onClick={onClose}
                        style={{
                            background: "#2a2a2a", color: "#f2f2f2",
                            border: "none", borderRadius: "10px",
                            padding: "10px 20px", cursor: "pointer",
                            fontFamily: "cairo, sans-serif", fontSize: "13px", fontWeight: "600"
                        }}
                    >إغلاق</button>
                </div>

            </div>
        </>,
        document.body
    )
}

export default Plans;