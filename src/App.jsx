import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Sales from './pages/Sales'
import Storage from './pages/Storage'
import Expenses from './pages/Expenses'

function App() {
  const [activePage, setActivePage] = useState('Storage')

  return (
    <div style={{ display: 'flex', direction: 'rtl', width: '100%', height: '100vh', backgroundColor: "#161616", }}>
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      <div style={{ padding: '0px', flex: 1 }}>
        {activePage === 'Storage' && <Storage />}
        {activePage === 'Expenses' && <Expenses />}
        {activePage === 'Sales' && <Sales />}
      </div>
    </div>
  )
}

export default App