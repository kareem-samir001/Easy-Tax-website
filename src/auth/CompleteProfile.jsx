import { useState } from "react";
import { authAPI } from "../api";
import { CiUser } from "react-icons/ci";
import { BiBriefcase } from "react-icons/bi";
import toast from "react-hot-toast";
import "./SignUp.css";

// Derive a username suggestion from a full name: "Kareem Samir" → "kareemsamir"
function suggestUsername(name = "") {
    return name
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 20);
}

function CompleteProfile({ userData, setUserData }) {
    const [userName, setUserName] = useState(
        suggestUsername(userData?.name || userData?.fullName || "")
    );
    const [businessName, setBusinessName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!userName.trim()) {
            setError("يرجى إدخال اسم المستخدم");
            return;
        }
        if (!businessName.trim()) {
            setError("يرجى إدخال اسم العمل");
            return;
        }

        setIsLoading(true);
        try {
            console.log("📤 Calling updateMe with:", { userName: userName.trim(), businessName: businessName.trim() });
            await authAPI.updateMe({ userName: userName.trim(), businessName: businessName.trim() });
            console.log("✅ updateMe succeeded, refreshing user...");
            // Refresh userData so the sidebar picks up the new fields
            const res = await authAPI.me();
            const user = res?.user || res;
            console.log("👤 Updated user:", user);
            setUserData(user);
            toast.success("تم إكمال ملفك الشخصي!");
        } catch (err) {
            console.error("❌ CompleteProfile error:", err);
            setError("حدث خطأ أثناء الحفظ: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const displayPicture = userData?.picture || null;
    const displayName = userData?.name || userData?.fullName || "مستخدم جديد";

    return (
        <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "100vw", height: "100vh",
            background: "radial-gradient(ellipse at 60% 0%, #0d1f14 0%, #050505 70%)",
            fontFamily: "Cairo, sans-serif", direction: "rtl",
        }}>
            {/* Glow accents */}
            <div style={{
                position: "fixed", top: "-10%", right: "10%",
                width: "340px", height: "340px", borderRadius: "50%",
                background: "rgba(34,201,122,0.07)", filter: "blur(80px)",
                pointerEvents: "none"
            }} />

            <div style={{
                width: "100%", maxWidth: "440px",
                background: "#0e0e0e",
                border: "1px solid #1f1f1f",
                borderRadius: "20px",
                padding: "40px 36px",
                margin: "0 16px",
                boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
                position: "relative",
            }}>
                {/* Google avatar + name */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "28px" }}>
                    {displayPicture ? (
                        <img
                            src={displayPicture}
                            alt="avatar"
                            referrerPolicy="no-referrer"
                            style={{
                                width: "64px", height: "64px", borderRadius: "50%",
                                objectFit: "cover", border: "2px solid #22c97a55",
                                marginBottom: "12px"
                            }}
                        />
                    ) : (
                        <div style={{
                            width: "64px", height: "64px", borderRadius: "50%",
                            background: "linear-gradient(135deg, #22c97a22, #22c97a44)",
                            border: "2px solid #22c97a55",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "24px", fontWeight: "800", color: "#22c97a",
                            marginBottom: "12px"
                        }}>
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <p style={{ color: "#f2f2f2", fontSize: "16px", fontWeight: "700", margin: "0 0 4px" }}>
                        أهلاً، {displayName}! 👋
                    </p>
                    <p style={{ color: "#666", fontSize: "13px", margin: 0, textAlign: "center" }}>
                        أكمل ملفك الشخصي لبدء استخدام تجارة
                    </p>
                </div>

                {/* Divider */}
                <div style={{ height: "1px", background: "#1a1a1a", marginBottom: "24px" }} />

                {error && (
                    <p style={{ color: "#e05555", fontSize: "13px", margin: "0 0 14px", textAlign: "center" }}>
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Username */}
                    <div className="field-group">
                        <label htmlFor="cp-username">اسم المستخدم</label>
                        <div className="input-with-icon">
                            <input
                                type="text"
                                id="cp-username"
                                placeholder="@username"
                                value={userName}
                                onChange={(e) =>
                                    setUserName(e.target.value.toLowerCase().replace(/\s/g, ""))
                                }
                                required
                            />
                            <CiUser className="field-icon" />
                        </div>
                        <p style={{ color: "#555", fontSize: "11px", margin: "4px 0 0", textAlign: "right" }}>
                            يستخدم للوصول إلى حسابك — لا يمكن تغييره لاحقاً
                        </p>
                    </div>

                    {/* Business name */}
                    <div className="field-group" style={{ marginTop: "16px" }}>
                        <label htmlFor="cp-business">اسم العمل</label>
                        <div className="input-with-icon">
                            <input
                                type="text"
                                id="cp-business"
                                placeholder="اسم متجرك أو عملك"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                required
                            />
                            <BiBriefcase className="field-icon" />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="login-submit"
                        disabled={isLoading}
                        style={{ marginTop: "24px" }}
                    >
                        {isLoading ? "جاري الحفظ..." : "ابدأ الاستخدام →"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CompleteProfile;
