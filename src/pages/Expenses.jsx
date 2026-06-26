import Header from "../components/Header";
import Statics from "../components/statics";
import { useState, useMemo } from "react";
import { useTijara } from "../context/TijaraContext";

function Expenses() {
    const [expenseTitle, setExpenseTitle] = useState('')
    const [expenseAmount, setExpenseAmount] = useState('')
    const [expenseType, setExpenseType] = useState('')
    const [expenseDate, setExpenseDate] = useState('')

    const { state, addExpense: contextAddExpense, deleteExpense: contextDeleteExpense } = useTijara();
    const { expenses, sales, isLoading, error } = state;

    const monthlyRevenue = useMemo(() => {
        if (!sales) return 0;
        const currentMonth = new Date().toISOString().slice(0, 7);
        return sales.reduce((sum, sale) => {
            const saleDate = sale.date || (sale.created_at ? new Date(sale.created_at).toISOString().split('T')[0] : '');
            if (saleDate.startsWith(currentMonth)) {
                return sum + (sale.revenue || 0);
            }
            return sum;
        }, 0);
    }, [sales]);

    // function to add new expense to Xano
    const handleAddExpense = async () => {
        if (!expenseTitle || !expenseAmount || !expenseType || !expenseDate) {
            alert('يرجى ملء جميع الحقول')
            return
        }

        const newExpense = {
            title: expenseTitle,
            amount: Number(expenseAmount),
            type: expenseType,
            date: expenseDate
        }
        
        await contextAddExpense(newExpense);

        setExpenseTitle(''); setExpenseAmount(''); setExpenseType('');
        setExpenseDate('');
    }

    // function to delete expense from Xano
    const handleDeleteExpense = async (id) => {
        await contextDeleteExpense(id);
    }

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%' }}>
                <div style={{ color: '#22c97a', fontSize: '24px', fontFamily: 'cairo, sans-serif' }}>جاري التحميل...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%' }}>
                <div style={{ color: '#ef4444', fontSize: '20px', fontFamily: 'cairo, sans-serif' }}>حدث خطأ: {error}</div>
            </div>
        );
    }

    return (<>
        {/* {Header} */}
        <Header title="المصروفات" />

        {/* Stats */}
        <div style={{ display: "flex", gap: "16px", justifyContent: "space-around", width: "94%", margin: "20px auto", borderRadius: "12px" }}>
            <Statics title=" مصروفات هذا الشهر" value={(expenses || []).reduce((sum, expense) => sum + expense.amount, 0) + " جنيه"} valueColor={"white"} />
            <Statics title="  ايرادات الشهر" value={monthlyRevenue.toLocaleString() + " جنيه"} valueColor={"white"} />
            <Statics title=" صافي الربح بعد المصروفات" value={(monthlyRevenue - (expenses || []).reduce((sum, expense) => sum + expense.amount, 0)).toLocaleString() + " جنيه"} valueColor={"white"} />
        </div>
        {/* form */}
        <div style={{
            display: "flex",
            gap: "0px",
            width: "97%",
            margin: "20px auto",
            flexDirection: "row",
        }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", width: "70%", margin: "20px 20px", borderRadius: "12px", padding: "24px", backgroundColor: "#171717", border: "1px solid #333", height: "470px" }}>

                <h2 style={{
                    color: "white",
                    textAlign: "right",
                    fontSize: "20px",
                }}>إضافة مصروف</h2>
                <div style={{ gridColumn: "1 / 1", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ color: "#888", textAlign: "right" }}>وصف المصروف</label>
                    <input value={expenseTitle} onChange={e => setExpenseTitle(e.target.value)} placeholder="عنوان المصروف" style={{ padding: "12px", borderRadius: "8px", border: "1px solid #333", backgroundColor: "#202020", color: "#888", height: "45px", fontSize: "17px" }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ color: "#888", textAlign: "right" }}>المبلغ (جنيه)</label>
                    <input value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} placeholder="المبلغ" type="number" style={{ padding: "12px", borderRadius: "8px", border: "1px solid #333", backgroundColor: "#202020", color: "#888", height: "45px", fontSize: "17px" }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ color: "#888", textAlign: "right" }}>نوع المصروف</label>
                    <select name="expenseType" id="expenseType" value={expenseType} onChange={e => setExpenseType(e.target.value)} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #333", backgroundColor: "#202020", color: "#888", height: "70px", fontSize: "17px" }}>
                        <option value="">اختر نوع المصروف</option>
                        <option value="إيجار"> إيجار</option>
                        <option value="كهرباء">كهرباء</option>
                        <option value="ماء">ماء</option>
                        <option value="مرتبات">مرتبات</option>
                        <option value="نقل و شحن">نقل و شحن</option>
                        <option value="صيانة">صيانة</option>
                        <option value="أخرى">أخرى</option>
                    </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ color: "#888", textAlign: "right" }}>تاريخ المصروف</label>
                    <input value={expenseDate} onChange={e => setExpenseDate(e.target.value)} type="date" style={{ padding: "12px", borderRadius: "8px", border: "1px solid #333", backgroundColor: "#202020", color: "#888", height: "45px", fontSize: "20px" }} />
                </div>

                <button onClick={handleAddExpense} style={{ gridColumn: "1 / -1", padding: "12px", borderRadius: "8px", border: "none", backgroundColor: "#22c97a", color: "#111", fontWeight: "600", height: "50px", fontSize: "20px" }}>إضافة مصروف</button>
            </div>
            {/* Expenses List */}
            <div style={{ width: "70%", margin: "20px 20px", borderRadius: "12px", padding: "24px", backgroundColor: "#171717", border: "1px solid #333" }}>
                <h2 style={{ color: "white", textAlign: "right", fontSize: "20px" }}>المصروفات</h2>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {(!expenses || expenses.length === 0) ? (
                        <p style={{ color: "#555", textAlign: "center", marginTop: "40px" }}>لا توجد مصروفات بعد</p>
                    ) : (
                        expenses.map((expense) => (
                            <li key={expense.id} style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "14px 0",
                                borderBottom: "1px solid #2a2a2a",
                                flexDirection: "row-reverse",
                            }}>
                                <button style={{ backgroundColor: "#e05555", color: "white", border: "none", padding: "8px 16px", borderRadius: "4px", fontSize: "20px" }} onClick={() => handleDeleteExpense(expense.id)}>
                                    حذف
                                </button>
                                <span style={{ color: "#e05555", fontWeight: "600", fontSize: "16px" }}>
                                    -{expense.amount.toLocaleString()} ج
                                </span>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ color: "white", fontWeight: "600", fontSize: "15px" }}>{expense.title}</div>
                                    <div style={{ color: "#666", fontSize: "12px", marginTop: "4px" }}>{expense.type} · {expense.date}</div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>

    </>

    )
}
export default Expenses