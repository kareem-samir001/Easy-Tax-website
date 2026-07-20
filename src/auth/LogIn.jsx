import { useState } from "react";
import { authAPI } from "../api";
import { CiMail, CiLock } from "react-icons/ci";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { useGoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import "../auth/SignUp.css";

function LogIn({ setLoggedIn, setAuthPage, setUserData }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const result = await authAPI.login(email, password);
            localStorage.setItem("authToken", result.authToken);

            const res = await authAPI.me();
            const user = res?.user || res;
            setUserData(user);
            setLoggedIn(true);
        } catch (err) {
            console.error(err.message);
            setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
        } finally {
            setIsLoading(false);
        }
    };


    const handleGoogleSuccess = async (tokenResponse) => {
        setError("");
        setIsLoading(true);
        try {
            // ✅ Send the access_token to Xano — Xano verifies it via Google's userinfo endpoint
            const result = await authAPI.googleOAuth(tokenResponse.access_token);
            localStorage.setItem("authToken", result.authToken);

            const res = await authAPI.me();
            const user = res?.user || res;
            setUserData(user);
            setLoggedIn(true);
            toast.success("تم تسجيل الدخول بنجاح!");
        } catch (err) {
            console.error("Google OAuth error:", err);
            setError("فشل تسجيل الدخول بجوجل: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const googleLogin = useGoogleLogin({
        onSuccess: handleGoogleSuccess,
        onError: () => setError("فشل تسجيل الدخول بجوجل. حاول مرة أخرى."),
        scope: "openid email profile",
    });

    return (
        <div className="login-page">
            {/* اللوحة اليمنى: فورم الدخول */}
            <div className="login-form-panel">
                <div className="login-form-wrapper">
                    <div className="login-logo">
                        <img src="/Logo.png" alt="Tijara Logo" className="login-logo-image" />
                    </div>

                    <h1 className="login-headline" style={{ fontFamily: "Cairo, sans-serif" }}>
                        مخزنك تحت السيطرة،<br />
                        <span className="headline-accent" style={{ fontFamily: "Cairo, sans-serif" }}>من أول دقيقة.</span>
                    </h1>

                    <p className="login-subtext" style={{ fontFamily: "Cairo, sans-serif" }}>
                        سجّل دخولك وابدأ في متابعة مبيعاتك ومخزونك ومصروفاتك في مكان واحد.
                    </p>

                    <div className="social-buttons-row">
                        <button
                            type="button"
                            className="social-button google-button"
                            onClick={() => googleLogin()}
                        >
                            <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                            </svg>
                            المتابعة بحساب جوجل
                        </button>
                    </div>

                    <div className="divider-row">
                        <span className="divider-line" />
                        <span className="divider-label">أو</span>
                        <span className="divider-line" />
                    </div>

                    {error && <p className="login-error">{error}</p>}

                    <form onSubmit={handleLogin}>
                        <div className="field-group">
                            <label htmlFor="email">البريد الإلكتروني</label>
                            <div className="input-with-icon">
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="example@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <CiMail className="field-icon" />
                            </div>
                        </div>

                        <div className="field-group">
                            <label htmlFor="password">كلمة المرور</label>
                            <div className="input-with-icon">
                                <button
                                    type="button"
                                    className="eye-toggle"
                                    onClick={() => setShowPassword((v) => !v)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                                </button>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <CiLock className="field-icon" />
                            </div>
                        </div>

                        <button type="submit" className="login-submit" disabled={isLoading}>
                            {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                        </button>
                    </form>

                    <button className="signup-link" onClick={() => setAuthPage("signup")}>
                        ليس لديك حساب؟ <span>إنشاء حساب</span>
                    </button>
                </div>
            </div>

            {/* اللوحة اليسرى: معاينة الداشبورد */}
            <div className="container">
                <div className="login-preview-panel">
                    <div className="preview-glow glow-1" />
                    <div className="preview-glow glow-2" />
                    <div className="preview-glow glow-3" />
                    <div className="preview-arc" />

                    <div className="preview-card">
                        <div className="preview-stats-row">
                            <div className="preview-stat-box">
                                <span className="preview-stat-label">طلبات اليوم</span>
                                <span className="preview-stat-value">482</span>
                            </div>
                            <div className="preview-stat-box">
                                <span className="preview-stat-label">إجمالي المخزون</span>
                                <span className="preview-stat-value">2,745</span>
                            </div>

                            <div className="preview-list">
                                <div className="preview-list-row">
                                    <span className="preview-list-label">إيراد اليوم</span>
                                    <span className="preview-list-value green">245,000 ج</span>
                                </div>
                                <div className="preview-list-row">
                                    <span className="preview-list-label">نسبة الربح</span>
                                    <span className="preview-list-value green">96.7%</span>
                                </div>
                                <div className="preview-list-row">
                                    <span className="preview-list-label">منتجات قليلة</span>
                                    <span className="preview-list-value orange">2 منتج</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LogIn;