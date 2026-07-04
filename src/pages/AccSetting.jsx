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

const inputStyle = {
    width: "100%", background: "#111", border: "1px solid #2a2a2a",
    borderRadius: "10px", padding: "11px 14px", color: "#f2f2f2",
    fontFamily: "cairo, sans-serif", fontSize: "14px",
    boxSizing: "border-box", outline: "none", textAlign: "right",
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

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await authAPI.me();
                console.log("me() response:", res);
                const userData = res?.user || res;
                setUser(userData);

                // 🖊️ تعبئة الحقول من البيانات الراجعة (لو مش موجودة بتفضل فاضية للمستخدم يملاها)
                setOwnerName(userData?.name || userData?.fullName || userData?.email || "");
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
            console.log("سيتم حفظ:", { ownerName, businessName, phone, city, businessType });
            toast("محتاجين نضيف endpoint للحفظ في Xano أولاً");
        } catch (error) {
            console.error(error);
            toast.error("حصل خطأ أثناء الحفظ");
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

                {/* رقم الموبايل + المنطقة/المدينة — الترتيب هنا مطابق للتصميم (الموبايل يمين، المدينة شمال) */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <Field label="رقم الموبايل" htmlFor="phone">
                        <input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
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

                <Field label="نوع البيزنس" htmlFor="businessType">
                    <input
                        id="businessType"
                        type="text"
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                        autoComplete="off"
                        style={inputStyle}
                    />
                </Field>

                <div style={{ height: "1px", background: "#2a2a2a", margin: "12px 0 16px" }} />

                <div style={{ color: "#f2f2f2", fontSize: "13px", fontWeight: "700", marginBottom: "12px", textAlign: "right" }}>
                    تغيير كلمة المرور
                </div>

                {/* كلمة المرور الحالية + الجديدة — الحالية يمين، الجديدة شمال، مطابق للتصميم */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "8px" }}>
                    <Field label="كلمة المرور الحالية" htmlFor="currentPassword">
                        <input
                            id="currentPassword"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            autoComplete="off"
                            style={inputStyle}
                        />
                    </Field>

                    <Field label="كلمة المرور الجديدة" htmlFor="newPassword">
                        <input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            autoComplete="off"
                            style={inputStyle}
                        />
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