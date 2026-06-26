import { useState } from "react";
import { authAPI } from "../api";
import { CiMail, CiLock } from "react-icons/ci";
import "./SignUp.css"; 

function LogIn({ setLoggedIn, setAuthPage, setUserData }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const handleLogIn = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const result = await authAPI.login(email, password);
      console.log("تم تسجيل الدخول بنجاح:", result);
      localStorage.setItem('authToken', result.authToken);
      // Fetch user data
      const user = await authAPI.me();
      setUserData(user);
      setLoggedIn(true);

    } catch (err) {
      console.error(err.message);
      setError("حدث خطأ أثناء تسجيل الدخول: " + err.message);
    }
  };
    
  return (
    <div className="signup-container">
      <h1>تسجيل الدخول</h1>
      <p>ابدأ في إدارة أعمالك بسهولة وسرعة</p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleLogIn}>
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

        <button type="submit">تسجيل الدخول</button>
      </form>

      {/* زرار الانتقال لصفحة الإنشاء */}
      <button onClick={() => setAuthPage('signup')} style={{ marginTop: "20px" }}>
        ليس لديك حساب؟ إنشاء حساب
      </button>
    </div>
  );
}

export default LogIn;