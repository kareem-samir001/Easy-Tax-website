import { useState } from "react";
import { authAPI } from "../api";
import { CiUser, CiMail, CiLock } from "react-icons/ci";
import "./SignUp.css";

function SignUp({ setLoggedIn, setAuthPage, setUserData }) {

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [businessName, setBusinessName] = useState("");
    const [error, setError] = useState("");
 
    // Function to handle sign up with email and password
    const handleSignUp = async (e) => {
        e.preventDefault();
        setError("");

        try {
            // Note: Xano's default signup endpoint usually accepts 'name', 'email', 'password'.
            // We pass fullName as name. If businessName is needed, it might require a separate API or customizing Xano endpoint.
            const result = await authAPI.signup(fullName, email, password);
            console.log("تم إنشاء الحساب بنجاح:", result);
            localStorage.setItem('authToken', result.authToken);
            
            const user = await authAPI.me();
            setUserData(user);
            setLoggedIn(true);

        } catch (err) {
            console.error(err.message);
            setError("حدث خطأ أثناء إنشاء الحساب: " + err.message);
        }
    };

    return (
        <div className="signup-container">
            <h1>إنشاء حساب</h1>
            <p>ابدأ في إدارة أعمالك بسهولة وسرعة</p>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <form onSubmit={handleSignUp}>
                <div>
                    <label htmlFor="fullName">الاسم الكامل</label>
                    <div className="input-with-icon">
                        <CiUser />
                        <input
                            type="text"
                            id="fullName"
                            placeholder="اسمك الكامل"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="email">البريد الإلكتروني</label>
                    <div className="input-with-icon">
                        <CiMail />
                        <input
                            type="email"
                            id="email"
                            placeholder="example@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="password">كلمة المرور</label>
                    <div className="input-with-icon">
                        <CiLock />
                        <input
                            type="password"
                            id="password"
                            placeholder="كلمة المرور"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="businessName">اسم العمل</label>
                    <div className="input-with-icon">
                        <CiUser />
                        <input
                            type="text"
                            id="businessName"
                            placeholder="اسم عملك"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <button type="submit">إنشاء حساب</button>
            </form>

            {/* زرار الانتقال لصفحة اللوج إن */}
            <button onClick={() => setAuthPage('login')} style={{ marginTop: "20px" }}>
                لديك حساب؟ تسجيل الدخول
            </button>
        </div>
    );
}

export default SignUp;