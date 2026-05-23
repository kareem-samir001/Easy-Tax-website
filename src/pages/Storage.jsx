import { useState } from "react";
import Statics from "../components/statics";
import Header from "../components/Header";

const buttonColor = "#22c97a"

const inputStyle = {
    backgroundColor: "#0d0d0d",
    border: "1px solid #2a2a2a",
    padding: "10px 12px",
    borderRadius: "8px",
    color: "white",
    font: "14px cairo, sans-serif",
    width: "100%",
    boxSizing: "border-box",
    outline: "none"
}

const generalStyles = {
    border: "none",
    borderBottom: "1px solid #1f1f1f",
    padding: "14px 16px",
    color: "#ccc",
    fontSize: "14px",
    fontFamily: "cairo, sans-serif",
    textAlign: "right"
}

const thStyles = {
    ...generalStyles,
    backgroundColor: "#111",
    color: "#888",
    fontSize: "17px",
    fontWeight: "600",
    letterSpacing: "0.5px"
}

function Storage() {
    const [products, setProducts] = useState(() => {
        const saved = localStorage.getItem('products')
        return saved ? JSON.parse(saved) : []
    })
    const [name, setName] = useState('')
    const [quantity, setQuantity] = useState('')
    const [buyingPrice, setBuyingPrice] = useState('')
    const [sellingPrice, setSellingPrice] = useState('')
    const [unit, setUnit] = useState('')
    const [minimumQuantity, setMinimumQuantity] = useState('')
    const [showModal, setShowModal] = useState(false)

    const addProduct = () => {
        if (!name || !quantity || !buyingPrice || !sellingPrice || !unit || !minimumQuantity) {
            alert('يرجى ملء جميع الحقول')
            return
        }
        const newProduct = {
            name, quantity: Number(quantity),
            buyingPrice: Number(buyingPrice),
            sellingPrice: Number(sellingPrice),
            minimumQuantity: Number(minimumQuantity),
            productTotalPrice: Number(quantity) * Number(buyingPrice),
            status: Number(quantity) < Number(minimumQuantity) ? 'ناقص' : 'كاف',
            unit
        }
        const newProducts = [...products, newProduct]
        setProducts(newProducts)
        localStorage.setItem('products', JSON.stringify(newProducts))
        setName(''); setQuantity(''); setBuyingPrice('')
        setSellingPrice(''); setUnit(''); setMinimumQuantity('')
        setShowModal(false)
    }

    const totalValue = products.reduce((t, p) => t + p.productTotalPrice, 0)
    const lowProducts = products.filter(p => p.status === 'ناقص').length

    const deleteItem = (index) => {
        const updatedProducts = products.filter((_, i) => i !== index)
        setProducts(updatedProducts)
        localStorage.setItem('products', JSON.stringify(updatedProducts))
    }
    const modifyItem = (index) => {
        const p = products[index]
        setName(p.name);
        setQuantity(p.quantity);
        setBuyingPrice(p.buyingPrice); 
        setSellingPrice(p.sellingPrice);
        setUnit(p.unit); 
        setMinimumQuantity(p.minimumQuantity);
        setShowModal(true)
    }
    return (
        <>
            {/* {Header} */}
            <Header title="المخزن" buttonText="+ إضافة منتج" onButtonClick={() => setShowModal(true)} />

            {/* Stats */}
            <div style={{ display: "flex", gap: "16px", justifyContent: "space-around", width: "94%", margin: "20px auto", borderRadius: "12px" }}>
                <Statics title="إجمالي المنتجات" value={products.length} />
                <Statics title="إجمالي قيمة المخزن" value={totalValue.toLocaleString() + " جنيه"} />
                <Statics title="منتجات قليلة" value={lowProducts} />
            </div>

            {/* Table */}
            <div style={{ padding: "0 28px" }}>
                <table style={{ width: "97%", borderCollapse: "collapse", backgroundColor: "#0f0f0f", borderRadius: "12px", overflow: "hidden", margin: "0 auto" }}>
                    <thead>
                        <tr>
                            {["اسم المنتج", "الكمية", "سعر الشراء", "سعر البيع", "الوحدة", "الحد الأدنى", "الإجمالي", "الحالة"].map(h => (
                                <th key={h} style={thStyles}>{h}</th>
                            ))}
                            <th style={thStyles}></th>
                        </tr>

                    </thead>
                    <tbody>
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan="8" style={{ textAlign: "center", padding: "60px", color: "#5a5a5a", fontFamily: "cairo, sans-serif", fontSize: "18px" }}>
                                    لا توجد منتجات بعد — أضف منتجك الأول!
                                </td>
                            </tr>
                        ) : products.map((p, i) => (
                            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#0f0f0f" : "#111" }}>
                                <td style={generalStyles}>{p.name}</td>
                                <td style={generalStyles}>{p.quantity} {p.unit}</td>
                                <td style={generalStyles}>{p.buyingPrice}ج / {p.unit}</td>
                                <td style={generalStyles}>{p.sellingPrice}ج / {p.unit}</td>
                                <td style={generalStyles}>{p.unit}</td>
                                <td style={generalStyles}>{p.minimumQuantity} {p.unit}</td>
                                <td style={generalStyles}>{p.productTotalPrice.toLocaleString()}ج / {p.unit}</td>
                                <td style={generalStyles}>
                                    <span style={{
                                        backgroundColor: p.status === 'ناقص' ? '#3a1a1a' : '#0f2a1a',
                                        color: p.status === 'ناقص' ? '#ff6b6b' : '#22c97a',
                                        padding: "4px 12px", borderRadius: "20px", fontSize: "12px"
                                    }}>{p.status}</span>
                                </td>
                                <td style={generalStyles}>
                                    <button style={{
                                        backgroundColor: "#b1f6c1", color: "black", border: "none",
                                        padding: "8px 16px", borderRadius: "4px", fontSize: "15px", cursor: "pointer",marginLeft:"20px"
                                    }} onClick={() => modifyItem(i)}>
                                        تعديل
                                    </button>
                                    <button style={{
                                        backgroundColor: "#e05555", color: "white", border: "none",
                                        padding: "8px 16px", borderRadius: "4px", fontSize: "15px", cursor: "pointer"
                                    }} onClick={() => deleteItem(i)}>
                                        حذف
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{
                        borderRadius: '12px', backgroundColor: "#111", padding: "28px",
                        width: "460px", maxWidth: "90vw", border: "1px solid #222",
                        display: "grid", gap: "14px", gridTemplateColumns: "1fr 1fr"
                    }}>
                        <h3 style={{ color: "white", gridColumn: "1 / -1", textAlign: "right", margin: 0, fontFamily: "cairo, sans-serif" }}>إضافة منتج جديد</h3>

                        {[
                            { label: "اسم المنتج", val: name, set: setName, type: "text", ph: "مثال: أرز، سكر..." },
                            { label: "الكمية الحالية", val: quantity, set: setQuantity, type: "number", ph: "0" },
                            { label: "سعر الشراء (جنيه)", val: buyingPrice, set: setBuyingPrice, type: "number", ph: "0" },
                            { label: "سعر البيع (جنيه)", val: sellingPrice, set: setSellingPrice, type: "number", ph: "0" },
                            { label: "الوحدة", val: unit, set: setUnit, type: "text", ph: "كيلو، قطعة..." },
                            { label: "الحد الأدنى للمخزن", val: minimumQuantity, set: setMinimumQuantity, type: "number", ph: "10" },
                        ].map(({ label, val, set, type, ph }) => (
                            <div key={label} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <label style={{ color: "#888", fontSize: "11px", textAlign: "right", fontFamily: "cairo, sans-serif" }}>{label}</label>
                                <input type={type} style={inputStyle} placeholder={ph} value={val} onChange={(e) => set(e.target.value)} />
                            </div>
                        ))}

                        <div style={{ gridColumn: "1 / -1", display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "4px" }}>
                            <button style={{
                                backgroundColor: "#1e1e1e", color: "#aaa", padding: "10px 20px",
                                border: "1px solid #333", borderRadius: "8px", cursor: "pointer", fontFamily: "cairo, sans-serif"
                            }} onClick={() => setShowModal(false)}>إلغاء</button>
                            <button style={{
                                backgroundColor: buttonColor, color: "#000", padding: "10px 24px",
                                border: "none", borderRadius: "8px", cursor: "pointer", fontFamily: "cairo, sans-serif", fontWeight: "700"
                            }} onClick={addProduct}>إضافة المنتج</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Storage