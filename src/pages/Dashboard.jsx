import { useContext, useMemo } from 'react';
import './Dashboard.css';
import { MdShoppingCart, MdArrowBack } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { TijaraContext } from '../context/TijaraContext';

const Dashboard = () => {
  const currentDate = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const { state } = useContext(TijaraContext);
  const { products, sales, isLoading, error, debts } = state;

  const { todayRevenue, todayProfit, storeValue, lowStockProducts, salesLog, topProducts, totalDebts } = useMemo(() => {
    if (!products || !sales || !Array.isArray(sales)) {
      return { todayRevenue: 0, todayProfit: 0, storeValue: 0, lowStockProducts: [], salesLog: [], topProducts: [], totalDebts: 0 };
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const todaySales = sales.filter(s => s && (
      s.date === todayStr ||
      (s.created_at && new Date(s.created_at).toISOString().split('T')[0] === todayStr)
    ));

    const todayRevenue = todaySales.reduce((sum, s) => sum + (s.revenue || 0), 0);
    const todayProfit = todaySales.reduce((sum, s) => sum + (s.profit || 0), 0);

    const storeValue = products.reduce((sum, p) => sum + ((p.quantity || 0) * (p.buyingPrice || 0)), 0);
    const lowStockProducts = products.filter(p => (p.quantity || 0) < (p.minimumQuantity || 0));

    // ── أكثر المنتجات مبيعاً اليوم ──
    const byProduct = {};
    todaySales.forEach(s => {
      const pId = s.productId || s.product_id || 'unknown';
      const pName = s.productName || s.product_name || 'منتج';
      const qty = s.quantitySold || s.quantity_sold || 0;
      const rev = s.revenue || 0;
      const pft = s.profit || 0;
      if (!byProduct[pId]) byProduct[pId] = { name: pName, qty: 0, revenue: 0, profit: 0 };
      byProduct[pId].qty += qty;
      byProduct[pId].revenue += rev;
      byProduct[pId].profit += pft;
    });
    const topProducts = Object.values(byProduct)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // ── سجل المبيعات (آخر 7 أيام) ──
    const salesByDate = sales.reduce((acc, sale) => {
      if (!sale) return acc;
      const d = sale.date || (sale.created_at ? new Date(sale.created_at).toISOString().split('T')[0] : 'Unknown');
      if (!acc[d]) acc[d] = { revenue: 0, cost: 0, profit: 0 };
      acc[d].revenue += (sale.revenue || 0);
      acc[d].cost += (sale.quantitySold || 0) * (sale.buyingPrice || 0);
      acc[d].profit += (sale.profit || 0);
      return acc;
    }, {});

    const sortedDates = Object.keys(salesByDate).sort((a, b) => new Date(b) - new Date(a));

    const salesLog = sortedDates.map(date => {
      const data = salesByDate[date];
      const margin = data.revenue > 0 ? Math.round((data.profit / data.revenue) * 100) : 0;
      const formattedDate = new Date(date).toLocaleDateString('ar-EG', { month: 'long', day: 'numeric' });
      const shortDate = new Date(date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
      return {
        date: formattedDate,
        shortDate,
        rawRevenue: data.revenue,
        rawCost: data.cost,
        revenue: `${data.revenue} ج`,
        cost: `${data.cost} ج`,
        profit: `${data.profit} ج`,
        margin: `${margin}%`,
        status: margin > 25 ? 'green' : (margin > 0 ? 'yellow' : 'red')
      };
    }).slice(0, 7);

    const totalDebts = (debts || []).reduce(
      (sum, d) => (d.isPaid ? sum : sum + (d.amount || 0)),
      0,
    );

    return { todayRevenue, todayProfit, storeValue, lowStockProducts, salesLog, topProducts, totalDebts };
  }, [products, sales, debts]);

  if (isLoading) {
    return (
      <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <div style={{ color: '#22c97a', fontSize: '24px', fontFamily: 'cairo, sans-serif' }}>جاري التحميل...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <div style={{ color: '#ef4444', fontSize: '20px', fontFamily: 'cairo, sans-serif' }}>حدث خطأ: {error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">الرئيسية</h1>
        <div className="dashboard-date">{currentDate}</div>
      </div>

      {/* Summary Cards */}
      <div className="cards-grid">
        <div className="summary-card green-border">
          <div className="card-header">
            <span className="card-title">إيراد اليوم</span>
            <span className="card-title" style={{ fontSize: '10px' }}>جنيــه *</span>
          </div>
          <h2 className="card-value">{todayRevenue} <span style={{ fontSize: '14px', color: '#666', fontWeight: 'normal' }}>جنيه</span></h2>
          <p className="card-subtitle">{todayRevenue === 0 ? 'لم تدخل مبيعات بعد' : 'مبيعات اليوم'}</p>
        </div>

        <div className="summary-card green-border">
          <div className="card-header">
            <span className="card-title">ربح اليوم</span>
            <span className="card-title" style={{ fontSize: '10px' }}>جنيــه *</span>
          </div>
          <h2 className="card-value">{todayProfit} <span style={{ fontSize: '14px', color: '#666', fontWeight: 'normal' }}>جنيه</span></h2>
          <p className="card-subtitle">{todayProfit > 0 ? 'أرباح ممتازة!' : '--'}</p>
        </div>

        <div className="summary-card yellow-border">
          <div className="card-header">
            <span className="card-title">قيمة المخزن</span>
          </div>
          <h2 className="card-value">{(storeValue || 0).toLocaleString()} <span style={{ fontSize: '14px', color: '#666', fontWeight: 'normal' }}>جنيه</span></h2>
          <p className="card-subtitle">{(products || []).length} منتج في المخزن</p>
        </div>

        <div className="summary-card red-border">
          <div className="card-header">
            <span className="card-title">ديون مستحقة للتجار</span>
          </div>
          <h2 className="card-value red-text">- {(totalDebts || 0).toLocaleString()} <span style={{ fontSize: '14px', color: '#666', fontWeight: 'normal' }}>جنيه</span></h2>
          <p className="card-subtitle" style={{ color: totalDebts > 0 ? '#eab308' : '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {totalDebts > 0 ? (
              <Link to="/debts" style={{ color: 'inherit', textDecoration: 'underline' }}>عرض الديون ←</Link>
            ) : (
              'ليس لديك ديون حاليا'
            )}
          </p>
        </div>
      </div>

      {/* Banners */}
      <div className="banners-section">
        {(lowStockProducts || []).length > 0 && (
          <div className="banner yellow">
            <span>⚠️ مخزون قليل: {lowStockProducts.map(p => p.name).join(' — ')}</span>
          </div>
        )}
        {totalDebts > 0 && (
          <div className="banner red">
            <span>🔴 يوجد ديون مستحقة للتجار — <Link to="/debts" className="banner-link" style={{ color: '#ef4444' }}>اضغط هنا للتفاصيل</Link></span>
          </div>
        )}
      </div>

      {/* Middle Section: Charts & Top Products */}
      <div className="middle-section">

        {/* أكثر المنتجات مبيعاً اليوم */}
        <div className="panel">
          <h3 className="panel-title">أكثر المنتجات مبيعاً اليوم</h3>
          {topProducts.length === 0 ? (
            <div className="empty-state">
              <MdShoppingCart />
              <span>لا توجد مبيعات اليوم بعد</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              {topProducts.map((p, idx) => (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', borderRadius: '8px',
                  background: '#1a1a1a', border: '1px solid #222'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                      background: idx === 0 ? '#22c97a22' : '#ffffff0a',
                      color: idx === 0 ? '#22c97a' : '#555',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: '800'
                    }}>{idx + 1}</span>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#f2f2f2', fontSize: '13px', fontWeight: '600', fontFamily: 'cairo, sans-serif' }}>
                        {p.name}
                      </div>
                      <div style={{ color: '#555', fontSize: '11px', fontFamily: 'cairo, sans-serif' }}>
                        {p.qty} وحدة مباعة
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ color: '#22c97a', fontSize: '13px', fontWeight: '700', fontFamily: 'cairo, sans-serif' }}>
                      {(p.revenue || 0).toLocaleString()} ج
                    </div>
                    <div style={{ color: '#555', fontSize: '11px', fontFamily: 'cairo, sans-serif' }}>
                      ربح: {(p.profit || 0).toLocaleString()} ج
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* مبيعات آخر 7 أيام */}
        <div className="panel">
          <h3 className="panel-title">مبيعات آخر 7 أيام</h3>
          {salesLog.length === 0 ? (
            <div className="empty-state">
              <span>لا توجد بيانات بعد</span>
            </div>
          ) : (() => {
            const chartData = [...salesLog].reverse();
            const maxRev = Math.max(...chartData.map(d => d.rawRevenue || 0), 1);
            return (
              <div className="chart-container">
                <div className="chart-bars">
                  {chartData.map((day, index) => (
                    <div key={index} className="chart-bar-group">
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '80px' }}>
                        <div
                          className="bar-line dark"
                          style={{ height: `${Math.max(4, ((day.rawCost || 0) / maxRev) * 80)}px`, transition: 'height 0.4s ease' }}
                        />
                        <div
                          className="bar-line"
                          style={{ height: `${Math.max(4, ((day.rawRevenue || 0) / maxRev) * 80)}px`, transition: 'height 0.4s ease' }}
                        />
                      </div>
                      <span className="bar-label">{day.shortDate}</span>
                    </div>
                  ))}
                </div>
                <div className="chart-legend">
                  <div className="legend-item">
                    <div className="legend-dot dark"></div>
                    <span>التكلفة</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-dot green"></div>
                    <span>الإيراد</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Bottom Section: Sales Log Table */}
      <div className="panel">
        <div className="table-header-row">
          <h3 className="panel-title" style={{ margin: 0 }}>سجل المبيعات — آخر 7 أيام</h3>
          <Link to="/report" className="table-link">
             <MdArrowBack style={{ verticalAlign: 'middle', marginLeft: '4px' }} /> تقرير اليوم 
          </Link>
        </div>
        
        <table className="sales-table">
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>الإيراد</th>
              <th>التكلفة</th>
              <th>الربح</th>
              <th>الهامش</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            {(salesLog || []).length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>لا توجد مبيعات في هذه الفترة</td>
              </tr>
            ) : (
              salesLog.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.date}</td>
                  <td>{row.revenue}</td>
                  <td className="value-red">{row.cost}</td>
                  <td className="value-green">{row.profit}</td>
                  <td>
                    <span className={`margin-badge ${row.margin === '20%' ? 'yellow' : ''}`}>
                      {row.margin}
                    </span>
                  </td>
                  <td>
                    <div className={`status-dot ${row.status}`}></div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;