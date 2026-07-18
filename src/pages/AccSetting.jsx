import { useState, useEffect } from "react";
import { authAPI } from "../api";
import toast from "react-hot-toast";

const CITIES = [
    "القاهرة", "الجيزة", "القليوبية", "الإسكندرية", "البحيرة",
    "كفر الشيخ", "الدقهلية", "دمياط", "الشرقية", "المنوفية",
    "الغربية", "بورسعيد", "الإسماعيلية", "السويس",
    "شمال سيناء", "جنوب سيناء", "بني سويف", "الفيوم",
    "المنيا", "أسيوط", "سوهاج", "قنا", "الأقصر", "أسوان",
    "البحر الأحمر", "الوادي الجديد", "مطروح",
];

function Field({ label, htmlFor, children }) {
    return (
        <div style={{ marginBottom: "16px" }}>
            <label
                htmlFor={htmlFor}
                style={{
                    display: "block", color: "#f2f2f2", fontSize: "13px",
                    fontWeight: "500", marginBottom: "8px", textAlign: "right"
                }}
            >
                {label}
            </label>
            {children}
        </div>
    );
}

function EyeIcon({ visible }) {
    return visible ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.94 10.94 0 0112 20c-7 0-11-8-11-8a21.8 21.8 0 015.06-6.06M9.9 4.24A10.4 10.4 0 0112 4c7 0 11 8 11 8a21.8 21.8 0 01-2.16 3.19M14.12 14.12a3 3 0 11-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    );
}

const inputStyle = {
    width: "100%", background: "#111", border: "1px solid #2a2a2a",
    borderRadius: "10px", padding: "11px 14px", color: "#f2f2f2",
    fontFamily: "cairo, sans-serif", fontSize: "14px",
    boxSizing: "border-box", outline: "none", textAlign: "right",
};

const eyeButtonStyle = {
    position: "absolute", left: "10px", top: "50%",
    transform: "translateY(-50%)", background: "transparent",
    border: "none", cursor: "pointer", padding: 0,
    display: "flex", alignItems: "center",
};

function AccSetting({ onClose }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // بيانات الفورم
    const [ownerName, setOwnerName] = useState("");
    const [businessName, setBusinessName] = useState("");
    const [phone, setPhone] = useState("");
    const [city, setCity] = useState("");
    const [businessType, setBusinessType] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    // إظهار/إخفاء كلمة المرور
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await authAPI.me();
                console.log("me() response:", res);
                const userData = res?.user || res;
                setUser(userData);

                // 🖊️ تعبئة الحقول من البيانات الراجعة (لو مش موجودة بتفضل فاضية للمستخدم يملاها)
                setOwnerName(res.fullName );
                setBusinessName(userData?.businessName || "");
                setPhone(userData?.phone || "");
                setCity(userData?.city || "");
                setBusinessType(userData?.businessType || "");
            } catch (error) {
                console.error("Auth check failed:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, []);

    const memberSince = user?.created_at
        ? new Date(user.created_at).toLocaleDateString("ar-EG", { month: "long", year: "numeric" })
        : "—";

    const displayName = ownerName || "المستخدم";


    const handleSave = async () => {
        setIsSaving(true);
        try {
            // 1. Save profile fields
            await authAPI.updateMe({
                fullName: ownerName,
                businessName,
                city,
            });

            // 2. Change password only if user filled in both fields
            if (currentPassword && newPassword) {
                await authAPI.changePassword(currentPassword, newPassword);
                setCurrentPassword("");
                setNewPassword("");
            }

            toast.success("✅ تم حفظ التغييرات بنجاح");
        } catch (error) {
            console.error(error);
            const isNotFound = error.message?.toLowerCase().includes("locate") ||
                error.message?.includes("404") ||
                error.message?.toLowerCase().includes("not found");
            if (isNotFound) {
                toast.error("⚙️ يجب إنشاء endpoint مخصص في Xano أولاً — راجع التعليمات");
            } else {
                toast.error("❌ حصل خطأ أثناء الحفظ: " + error.message);
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <div
                onClick={onClose}
                style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 99999 }}
            />

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

                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "8px", marginBottom: "20px" }}>
                    <span style={{ fontSize: "18px" }}>⚙️</span>
                    <h2 style={{ color: "#f2f2f2", fontSize: "17px", fontWeight: "700", margin: 0 }}>
                        إعدادات الحساب
                    </h2>
                </div>

                {/* بطاقة الملخص */}
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "#1c1c1c", border: "1px solid #262626",
                    borderRadius: "14px", padding: "16px", marginBottom: "20px"
                }}>
                    <div style={{ textAlign: "right" }}>
                        <div style={{ color: "#f2f2f2", fontSize: "15px", fontWeight: "700" }}>
                            {isLoading ? "جاري التحميل..." : displayName}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#22c97a", fontSize: "12px", fontWeight: "700", marginTop: "4px" }}>
                            Premium ✨
                        </div>
                        <div style={{ color: "#666", fontSize: "11px", marginTop: "6px" }}>
                            عضو منذ {memberSince}
                        </div>
                    </div>

                </div>

                <Field label="اسم صاحب البيزنس" htmlFor="ownerName">
                    <input
                        id="ownerName"
                        type="text"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        autoComplete="off"
                        style={inputStyle}
                    />
                </Field>

                {/* رقم الموبايل + المنطقة/المدينة — الترتيب هنا مطابق للتصميم (الموبايل يمين، المدينة شمال) */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <Field label="اسم المحل / البيزنس" htmlFor="businessName">
                        <input
                            id="businessName"
                            type="text"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            autoComplete="off"
                            style={inputStyle}
                        />
                    </Field>

                    <Field label="المنطقة / المدينة" htmlFor="city">
                        <select
                            id="city"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            style={inputStyle}
                        >
                            <option value="">اختر المدينة</option>
                            {CITIES.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </Field>
                </div>

                <div style={{ height: "1px", background: "#2a2a2a", margin: "12px 0 16px" }} />

                <div style={{ color: "#f2f2f2", fontSize: "13px", fontWeight: "700", marginBottom: "12px", textAlign: "right" }}>
                    تغيير كلمة المرور
                </div>

                {/* كلمة المرور الحالية + الجديدة — الحالية يمين، الجديدة شمال، مطابق للتصميم */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "8px" }}>
                    <Field label="كلمة المرور الحالية" htmlFor="currentPassword">
                        <div style={{ position: "relative" }}>
                            <input
                                id="currentPassword"
                                type={showCurrentPassword ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                autoComplete="off"
                                style={{ ...inputStyle, paddingLeft: "40px" }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword((v) => !v)}
                                style={eyeButtonStyle}
                                aria-label={showCurrentPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                            >
                                <EyeIcon visible={showCurrentPassword} />
                            </button>
                        </div>
                    </Field>

                    <Field label="كلمة المرور الجديدة" htmlFor="newPassword">
                        <div style={{ position: "relative" }}>
                            <input
                                id="newPassword"
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                autoComplete="off"
                                style={{ ...inputStyle, paddingLeft: "40px" }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword((v) => !v)}
                                style={eyeButtonStyle}
                                aria-label={showNewPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                            >
                                <EyeIcon visible={showNewPassword} />
                            </button>
                        </div>
                    </Field>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1, background: "#222", color: "#ccc",
                            border: "1px solid #2a2a2a", borderRadius: "10px",
                            padding: "12px", fontFamily: "cairo, sans-serif",
                            fontSize: "14px", fontWeight: "700", cursor: "pointer"
                        }}
                    >
                        إلغاء
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        style={{
                            flex: 2, background: isSaving ? "#3a3a3a" : "#28d085",
                            color: isSaving ? "#888" : "#06170f", border: "none",
                            borderRadius: "10px", padding: "12px", fontFamily: "cairo, sans-serif",
                            fontSize: "14px", fontWeight: "700",
                            cursor: isSaving ? "not-allowed" : "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px"
                        }}
                    >
                        {isSaving ? "جاري الحفظ..." : <>حفظ التغييرات 💾</>}
                    </button>
                </div>

            </div>
        </>
    );
}

export default AccSetting;