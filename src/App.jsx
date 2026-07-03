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

import { TijaraProvider } from './context/TijaraContext'
import { Toaster } from 'react-hot-toast'

function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [authPage, setAuthPage] = useState('signup')
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const res = await authAPI.me();
          console.log('me() response:', res); 
          const user = res?.user || res;
          setUserData(user);
          setLoggedIn(true);
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem('authToken');
          setUserData(null);
          setLoggedIn(false);
        }
      } else {
        setUserData(null);
        setLoggedIn(false);
      }
    };
    checkAuth();
  }, [])

  if (!loggedIn) {
    if (authPage === 'signup') {
      return <SignUp setLoggedIn={setLoggedIn} setAuthPage={setAuthPage} setUserData={setUserData} />
    } else {
      return <LogIn setLoggedIn={setLoggedIn} setAuthPage={setAuthPage} setUserData={setUserData} />
    }
  }

  return (
    <TijaraProvider>
      <Toaster position="bottom-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <div style={{ display: 'flex', direction: 'rtl', width: '100%', height: '100vh', backgroundColor: "#161616" }}>
              <Sidebar userData={userData} onLogout={() => {
                localStorage.removeItem('authToken');
                setUserData(null);
                setLoggedIn(false);
              }} />
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
          </Route>
        </Routes>
      </BrowserRouter>
    </TijaraProvider>
  )
}

export default App