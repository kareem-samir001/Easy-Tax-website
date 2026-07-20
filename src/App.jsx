import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { authAPI } from './api'
import Sidebar from './components/Sidebar'
import Sales from './pages/Sales'
import Storage from './pages/Storage'
import Expenses from './pages/Expenses'
import Dashboard from './pages/Dashboard'
import SignUp from './auth/SignUp'
import LogIn from './auth/LogIn'
import Suppliers from './pages/Suppliers'
import Debts from './pages/Debts'
import Report from './pages/Report'
import ProfitLoss from './pages/ProfitLoss'

import { TijaraProvider } from './context/TijaraContext'
import { Toaster } from 'react-hot-toast'
import CompleteProfile from './auth/CompleteProfile'

function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [authPage, setAuthPage] = useState('signup')
  const [userData, setUserData] = useState(null)

  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const res = await authAPI.me();
          const user = res?.user || res;
          setUserData(user);
          setLoggedIn(true);
        } catch (error) {
          console.error("Auth check failed:", error);
          const isRateLimit = error.message?.includes("Whoa") || error.message?.includes("429") || error.message?.includes("rate limit");
          if (!isRateLimit) {
            // Only log out if the token is genuinely invalid (401/403), not a temporary throttle
            localStorage.removeItem('authToken');
            setUserData(null);
            setLoggedIn(false);
          } else {
            // Rate limit: token is fine, just retry next refresh
            setLoggedIn(false);
          }
        }
      } else {
        setLoggedIn(false);
      }
      setIsCheckingAuth(false);
    };
    checkAuth();
  }, [])

  if (isCheckingAuth) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#0e0e0e'
      }}>
        <div style={{
          width: '36px', height: '36px', border: '3px solid #22c97a33',
          borderTop: '3px solid #22c97a', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!loggedIn) {
    if (authPage === 'signup') {
      return <SignUp setLoggedIn={setLoggedIn} setAuthPage={setAuthPage} setUserData={setUserData} />
    } else {
      return <LogIn setLoggedIn={setLoggedIn} setAuthPage={setAuthPage} setUserData={setUserData} />
    }
  }

  // Safety guard: if loggedIn is true but userData is somehow null, reset to login
  if (loggedIn && !userData) {
    setLoggedIn(false);
    return null;
  }

  // Show onboarding if the user logged in via Google and hasn't set userName / businessName yet
  // Uses .trim() to treat empty strings the same as null (Xano may return "" for unset fields)
  const hasUserName = !!(userData?.userName?.trim() || userData?.user_name?.trim());
  const hasBusinessName = !!(userData?.businessName?.trim() || userData?.business_name?.trim());
  const needsOnboarding = loggedIn && (!hasUserName || !hasBusinessName);

  if (needsOnboarding) {
    return <CompleteProfile userData={userData} setUserData={setUserData} />
  }

  return (
    <TijaraProvider>
      <Toaster position="bottom-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <div style={{ display: 'flex', direction: 'rtl', width: '100%', height: '100vh', backgroundColor: "#161616" }}>
              <div className="no-print">
                <Sidebar userData={userData} onLogout={() => {
                  localStorage.removeItem('authToken');
                  setUserData(null);
                  setLoggedIn(false);
                }} />
              </div>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <Outlet />
              </div>
            </div>
          }>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="storage" element={<Storage />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="sales" element={<Sales />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="debts" element={<Debts />} />
            <Route path="report" element={<Report />} />
            <Route path="profit-loss" element={<ProfitLoss />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TijaraProvider>
  )
}

export default App