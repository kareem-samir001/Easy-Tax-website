import Header from "../components/Header";
import Statics from "../components/statics";
import { useState } from "react";
function Expenses() {
    const [expenseTitle, setExpenseTitle] = useState('')
    const [expenseAmount, setExpenseAmount] = useState('')
    const [expenseType, setExpenseType] = useState('')
    const [expenseDate, setExpenseDate] = useState('')
    const [expenseFrequency, setExpenseFrequency] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [expenses, setExpenses] = useState(() => {
        const saved = localStorage.getItem('expenses')
        return saved ? JSON.parse(saved) : []
    })
    const addExpense = () => {
        if (!expenseTitle || !expenseAmount || !expenseType || !expenseDate || !expenseFrequency) {
            alert('يرجى ملء جميع الحقول')
            return
        }
        const newExpense = {
            title: expenseTitle,
            amount: Number(expenseAmount),
            type: expenseType,
            date: expenseDate,
            frequency: expenseFrequency
        }
        const updatedExpenses = [...expenses, newExpense]
        setExpenses(updatedExpenses)
        localStorage.setItem('expenses', JSON.stringify(updatedExpenses))
    }
    const deleteExpense = (index) => {
        const updatedExpenses = expenses.filter((_, i) => i !== index)
        setExpenses(updatedExpenses)
        localStorage.setItem('expenses', JSON.stringify(updatedExpenses))
    }
    return (<>
        {/* {Header} */}
        <Header title="المصروفات" />

        {/* Stats */}
        <div style={{ display: "flex", gap: "16px", justifyContent: "space-around", width: "94%", margin: "20px auto", borderRadius: "12px" }}>
            <Statics title=" مصروفات هذا الشهر" value={expenses.reduce((sum, expense) => sum + expense.amount, 0) + " جنيه"} />
            <Statics title="  ايرادات الشهر" />
            <Statics title=" صافي الربح بعد المصروفات" />
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
                <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: "6px" }}>
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

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ color: "#888", textAlign: "right" }}>متكرر؟</label>
                    <select name="expenseFreq" id="expenseFreq" value={expenseFrequency} onChange={e => setExpenseFrequency(e.target.value)} placeholder="تكرار المصروف" style={{ padding: "12px", borderRadius: "8px", border: "1px solid #333", backgroundColor: "#202020", color: "#888", height: "70px", fontSize: "17px" }}>
                        <option value="">اختر تكرار المصروف</option>
                        <option value="مرة واحدة">مرة واحدة</option>
                        <option value="أسبوعي">أسبوعي</option>
                        <option value="شهري">شهري</option>
                        <option value="سنوي">سنوي</option>
                    </select>
                </div>

                <button onClick={addExpense} style={{ gridColumn: "1 / -1", padding: "12px", borderRadius: "8px", border: "none", backgroundColor: "#22c97a", color: "#111", fontWeight: "600", height: "50px" }}>إضافة مصروف</button>
            </div>
            {/* Expenses List */}
            <div style={{ width: "70%", margin: "20px 20px", borderRadius: "12px", padding: "24px", backgroundColor: "#171717", border: "1px solid #333" }}>
                <h2 style={{ color: "white", textAlign: "right", fontSize: "20px" }}>المصروفات</h2>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {expenses.length === 0 ? (
                        <p style={{ color: "#555", textAlign: "center", marginTop: "40px" }}>لا توجد مصروفات بعد</p>
                    ) : (
                        expenses.map((expense, index) => (
                            <li key={index} style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "14px 0",
                                borderBottom: "1px solid #2a2a2a",
                                flexDirection: "row-reverse",
                            }}>
                                <button style={{ backgroundColor: "#e05555", color: "white", border: "none", padding: "8px 16px", borderRadius: "4px", fontSize: "20px" }} onClick={() => deleteExpense(index)}>
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